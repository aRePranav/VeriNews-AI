import os

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .database import init_db, insert_prediction, get_stats, get_recent
from .ml_service import get_model_service
from .schemas import PredictRequest, PredictResponse, StatsResponse, HistoryItem

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="VeriNews AI API",
    description="Real-time fake news detection — TF-IDF + Passive Aggressive Classifier trained on WELFake (72,134 articles).",
    version="1.0.0",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = os.environ.get("VERINEWS_ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()
    get_model_service()  # warm the model into memory once, not per-request


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/model-metrics")
def model_metrics():
    return get_model_service().get_metrics()


@app.post("/predict", response_model=PredictResponse)
@limiter.limit("15/minute")
def predict(request: Request, payload: PredictRequest):
    text = (payload.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Please enter some text to analyze.")
    if len(text) > 20000:
        raise HTTPException(status_code=400, detail="Input is too long (max 20,000 characters).")

    service = get_model_service()
    result = service.predict_and_explain(text)
    insert_prediction(result, text)
    return result


@app.get("/stats", response_model=StatsResponse)
def stats():
    return get_stats()


@app.get("/history", response_model=list[HistoryItem])
def history(limit: int = 10):
    return get_recent(limit)
