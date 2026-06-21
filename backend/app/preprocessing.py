"""
Preprocessing must exactly mirror ml/train.py so inference matches training.
Pure-Python Porter stemmer (NLTK) + sklearn's built-in stopword list, so no
NLTK corpus download is required at runtime - keeps the backend deployable
without network access to NLTK's data servers.
"""
import re
from nltk.stem import PorterStemmer
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

STOPWORDS = ENGLISH_STOP_WORDS
STEMMER = PorterStemmer()

URL_RE = re.compile(r"http\S+|www\.\S+")
HTML_RE = re.compile(r"<.*?>")
NON_ALPHA_RE = re.compile(r"[^a-z\s]")

_stem_cache: dict[str, str] = {}


def stem(word: str) -> str:
    cached = _stem_cache.get(word)
    if cached is None:
        cached = STEMMER.stem(word)
        _stem_cache[word] = cached
    return cached


def preprocess(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = URL_RE.sub(" ", text)
    text = HTML_RE.sub(" ", text)
    text = NON_ALPHA_RE.sub(" ", text)
    tokens = text.split()
    tokens = [stem(t) for t in tokens if t not in STOPWORDS and len(t) > 1]
    return " ".join(tokens)


def preprocess_with_origin_map(text: str) -> tuple[str, dict[str, str]]:
    """Same cleaning as preprocess(), but also returns a stem -> original
    surface word mapping (first occurrence wins) so the API can display
    human-readable words instead of raw stems in the UI."""
    if not isinstance(text, str):
        return "", {}
    lowered = text.lower()
    lowered = URL_RE.sub(" ", lowered)
    lowered = HTML_RE.sub(" ", lowered)
    stripped = NON_ALPHA_RE.sub(" ", lowered)
    raw_tokens = stripped.split()

    origin_map: dict[str, str] = {}
    stemmed_tokens = []
    for t in raw_tokens:
        if t in STOPWORDS or len(t) <= 1:
            continue
        s = stem(t)
        stemmed_tokens.append(s)
        origin_map.setdefault(s, t)
    return " ".join(stemmed_tokens), origin_map


def raw_word_count(text: str) -> int:
    if not isinstance(text, str):
        return 0
    return len(text.split())
