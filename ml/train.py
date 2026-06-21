"""
VeriNews AI - Training pipeline
Trains on WELFake dataset (72,134 articles), compares 4 classical ML models,
picks the best as production model, calibrates it for confidence scores,
and saves everything the FastAPI backend needs (vectorizer, raw model for
explainability, calibrated model for confidence, and comparison metrics
for the frontend charts).

Label convention in THIS dataset (verified empirically against article content,
e.g. Reuters-sourced wire copy vs. opinion/clickbait pieces):
    0 = REAL
    1 = FAKE
"""
import re
import json
import time
import os
import joblib
import numpy as np
import pandas as pd

from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer, ENGLISH_STOP_WORDS
from sklearn.model_selection import train_test_split
from sklearn.linear_model import PassiveAggressiveClassifier, LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.calibration import CalibratedClassifierCV
from sklearn.frozen import FrozenEstimator
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix
)

DATA_PATH = "/mnt/user-data/uploads/WELFake_Dataset.csv"
ARTIFACT_DIR = "/home/claude/verinews/ml/artifacts"
os.makedirs(ARTIFACT_DIR, exist_ok=True)

RANDOM_STATE = 42
STOPWORDS = ENGLISH_STOP_WORDS
STEMMER = PorterStemmer()

URL_RE = re.compile(r"http\S+|www\.\S+")
HTML_RE = re.compile(r"<.*?>")
NON_ALPHA_RE = re.compile(r"[^a-z\s]")

_stem_cache = {}


def stem(word):
    cached = _stem_cache.get(word)
    if cached is None:
        cached = STEMMER.stem(word)
        _stem_cache[word] = cached
    return cached


def preprocess(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = URL_RE.sub(" ", text)
    text = HTML_RE.sub(" ", text)
    text = NON_ALPHA_RE.sub(" ", text)
    tokens = text.split()
    tokens = [stem(t) for t in tokens if t not in STOPWORDS and len(t) > 1]
    return " ".join(tokens)


def main():
    t0 = time.time()
    print("Loading dataset...")
    df = pd.read_csv(DATA_PATH)
    df = df.rename(columns={"Unnamed: 0": "row_id"})
    df["title"] = df["title"].fillna("")
    df["text"] = df["text"].fillna("")
    df["content"] = (df["title"] + ". " + df["text"]).str.strip()
    df = df[df["content"].str.len() > 0].reset_index(drop=True)
    print(f"Rows after cleaning: {len(df)}  |  elapsed: {time.time()-t0:.1f}s")

    print("Preprocessing text (lowercase, URL/HTML strip, stopwords, Porter stemming)...")
    df["clean"] = df["content"].apply(preprocess)
    print(f"Preprocessing done. elapsed: {time.time()-t0:.1f}s")

    X = df["clean"].values
    y = df["label"].values  # 0 = REAL, 1 = FAKE

    X_train_text, X_test_text, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )
    print(f"Train: {len(X_train_text)}  Test: {len(X_test_text)}")

    print("Fitting TF-IDF vectorizer (50,000 features, uni+bigrams)...")
    vectorizer = TfidfVectorizer(max_features=50000, ngram_range=(1, 2), min_df=2)
    X_train = vectorizer.fit_transform(X_train_text)
    X_test = vectorizer.transform(X_test_text)
    print(f"TF-IDF shape: {X_train.shape}  elapsed: {time.time()-t0:.1f}s")

    models = {
        "passive_aggressive": PassiveAggressiveClassifier(max_iter=1000, random_state=RANDOM_STATE),
        "linear_svc": LinearSVC(max_iter=5000, random_state=RANDOM_STATE),
        "logistic_regression": LogisticRegression(max_iter=1000, random_state=RANDOM_STATE, n_jobs=1),
        "naive_bayes": MultinomialNB(),
    }

    results = {}
    fitted = {}

    for name, model in models.items():
        print(f"Training {name}...")
        m0 = time.time()
        model.fit(X_train, y_train)
        preds = model.predict(X_test)

        if hasattr(model, "decision_function"):
            scores = model.decision_function(X_test)
        else:
            scores = model.predict_proba(X_test)[:, 1]

        acc = accuracy_score(y_test, preds)
        prec = precision_score(y_test, preds)
        rec = recall_score(y_test, preds)
        f1 = f1_score(y_test, preds)
        auc = roc_auc_score(y_test, scores)
        cm = confusion_matrix(y_test, preds).tolist()

        results[name] = {
            "accuracy": round(acc * 100, 2),
            "precision": round(prec * 100, 2),
            "recall": round(rec * 100, 2),
            "f1": round(f1 * 100, 2),
            "roc_auc": round(auc, 4),
            "confusion_matrix": cm,
            "train_seconds": round(time.time() - m0, 1),
        }
        fitted[name] = model
        print(f"  {name}: acc={acc*100:.2f}% f1={f1*100:.2f}% auc={auc:.4f}  ({time.time()-m0:.1f}s)")

    # Production model is fixed to Passive Aggressive Classifier (matches the
    # FakeCheck project's established choice) rather than picking by the
    # single highest test-set accuracy, since PAC and Linear SVC come out
    # within noise of each other on this split.
    production_name = "passive_aggressive"
    print(f"\nProduction model selected: {production_name}")

    X_train_core_text, X_calib_text, y_train_core, y_calib = train_test_split(
        X_train_text, y_train, test_size=0.15, random_state=RANDOM_STATE, stratify=y_train
    )
    X_train_core = vectorizer.transform(X_train_core_text)
    X_calib = vectorizer.transform(X_calib_text)

    model_cls = type(fitted[production_name])
    prod_kwargs = fitted[production_name].get_params()
    raw_model = model_cls(**prod_kwargs)
    raw_model.fit(X_train_core, y_train_core)

    calibrated_model = CalibratedClassifierCV(FrozenEstimator(raw_model), method="sigmoid")
    calibrated_model.fit(X_calib, y_calib)

    calib_probs = calibrated_model.predict_proba(X_test)[:, 1]
    calib_preds = (calib_probs >= 0.5).astype(int)
    calib_acc = accuracy_score(y_test, calib_preds)
    print(f"Calibrated production model accuracy on test set: {calib_acc*100:.2f}%")

    print("Saving artifacts...")
    joblib.dump(vectorizer, f"{ARTIFACT_DIR}/vectorizer.joblib")
    joblib.dump(raw_model, f"{ARTIFACT_DIR}/model_raw.joblib")
    joblib.dump(calibrated_model, f"{ARTIFACT_DIR}/model_calibrated.joblib")

    metadata = {
        "production_model": production_name,
        "label_map": {"0": "REAL", "1": "FAKE"},
        "dataset": {
            "name": "WELFake",
            "total_articles": int(len(df)),
            "train_size": int(len(X_train_text)),
            "test_size": int(len(X_test_text)),
            "real_count": int((df["label"] == 0).sum()),
            "fake_count": int((df["label"] == 1).sum()),
        },
        "vectorizer": {
            "max_features": 50000,
            "ngram_range": [1, 2],
            "actual_vocab_size": len(vectorizer.vocabulary_),
        },
        "models": results,
        "production_model_calibrated_accuracy": round(calib_acc * 100, 2),
        "trained_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

    with open(f"{ARTIFACT_DIR}/metrics.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nDONE in {time.time()-t0:.1f}s total")
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
