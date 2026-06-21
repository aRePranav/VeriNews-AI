"""
Loads the trained TF-IDF vectorizer + Passive Aggressive Classifier
(raw, for coefficient-based explainability; calibrated, for confidence %)
once at process startup, and exposes a single predict_and_explain() call
used by the /predict endpoint.
"""
import json
import os
import uuid
from functools import lru_cache

import joblib
import numpy as np

from .preprocessing import preprocess_with_origin_map, raw_word_count

ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "artifacts")

# Words that, when they appear among the top FAKE-pushing tokens, let us
# write a more specific one-line explanation instead of a generic one.
SENSATIONAL_MARKERS = {
    "shock", "shocking", "fake", "truth", "secret", "hidden", "cover",
    "conspiraci", "miracl", "expos", "wake", "lie", "scam", "hoax",
    "breaking", "urgent", "warn", "banned", "censor", "leak",
}

SHORT_INPUT_WORD_THRESHOLD = 30


class ModelService:
    def __init__(self):
        self.vectorizer = joblib.load(os.path.join(ARTIFACT_DIR, "vectorizer.joblib"))
        self.raw_model = joblib.load(os.path.join(ARTIFACT_DIR, "model_raw.joblib"))
        self.calibrated_model = joblib.load(os.path.join(ARTIFACT_DIR, "model_calibrated.joblib"))
        with open(os.path.join(ARTIFACT_DIR, "metrics.json")) as f:
            self.metadata = json.load(f)
        self.feature_names = self.vectorizer.get_feature_names_out()
        self.coef = self.raw_model.coef_[0]

    def get_metrics(self) -> dict:
        return self.metadata

    def predict_and_explain(self, text: str, top_n: int = 8) -> dict:
        raw_wc = raw_word_count(text)
        clean, origin_map = preprocess_with_origin_map(text)
        clean_wc = len(clean.split()) if clean else 0

        vec = self.vectorizer.transform([clean])
        nonzero_count = vec.nnz

        prob_fake = float(self.calibrated_model.predict_proba(vec)[0][1])
        label = "FAKE" if prob_fake >= 0.5 else "REAL"
        confidence = prob_fake if label == "FAKE" else 1 - prob_fake

        # word-level contributions: tfidf_value * linear coefficient
        nz_idx = vec.nonzero()[1]
        contributions = [
            (self.feature_names[i], float(vec[0, i]) * float(self.coef[i]))
            for i in nz_idx
        ]
        contributions.sort(key=lambda x: x[1])

        real_words_raw = [c for c in contributions if c[1] < 0][:top_n]
        fake_words_raw = [c for c in contributions if c[1] > 0][-top_n:][::-1]

        def to_display(stem_feature: str) -> str:
            # feature may be a unigram "stem" or bigram "stem1 stem2"
            parts = stem_feature.split(" ")
            return " ".join(origin_map.get(p, p) for p in parts)

        def normalize(words):
            if not words:
                return []
            max_abs = max(abs(w) for _, w in words) or 1.0
            return [
                {"word": to_display(w), "weight": round(abs(val) / max_abs * 100, 1)}
                for w, val in words
            ]

        top_fake_words = normalize(fake_words_raw)
        top_real_words = normalize(real_words_raw)

        explanation = self._build_explanation(label, top_fake_words, top_real_words, raw_wc)

        warning = None
        if raw_wc == 0:
            warning = "Please enter some text to analyze."
        elif raw_wc < SHORT_INPUT_WORD_THRESHOLD:
            warning = (
                f"Short input ({raw_wc} words). This model was trained on full "
                "articles, so headline-only predictions are less reliable, paste "
                "the full article text for best accuracy."
            )

        return {
            "request_id": str(uuid.uuid4()),
            "label": label,
            "confidence": round(confidence * 100, 1),
            "top_fake_words": top_fake_words,
            "top_real_words": top_real_words,
            "explanation": explanation,
            "warning": warning,
            "word_count": raw_wc,
            "matched_vocabulary_terms": int(nonzero_count),
        }

    @staticmethod
    def _build_explanation(label, top_fake_words, top_real_words, raw_wc):
        if raw_wc == 0:
            return ""
        fake_terms = {w["word"] for w in top_fake_words[:5]}
        sensational_hit = any(
            any(marker in term for marker in SENSATIONAL_MARKERS) for term in fake_terms
        )
        if label == "FAKE":
            if sensational_hit:
                return (
                    "This article was flagged primarily due to emotionally charged "
                    "and sensational language commonly seen in unreliable sources."
                )
            return (
                "This article was flagged based on word patterns and phrasing "
                "statistically associated with unreliable or low-credibility sources "
                "in the training data."
            )
        return (
            "This article matches the objective, fact-based language patterns "
            "consistent with verified news reporting in the training data."
        )


@lru_cache(maxsize=1)
def get_model_service() -> "ModelService":
    return ModelService()
