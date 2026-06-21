from typing import List, Optional
from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    text: str = Field(..., max_length=20000, description="Headline or article text to analyze")


class WordWeight(BaseModel):
    word: str
    weight: float


class PredictResponse(BaseModel):
    request_id: str
    label: str
    confidence: float
    top_fake_words: List[WordWeight]
    top_real_words: List[WordWeight]
    explanation: str
    warning: Optional[str] = None
    word_count: int
    matched_vocabulary_terms: int


class StatsResponse(BaseModel):
    total_predictions: int
    fake_count: int
    real_count: int
    fake_pct: float
    real_pct: float
    average_confidence: float


class HistoryItem(BaseModel):
    request_id: str
    input_preview: str
    label: str
    confidence: float
    created_at: str
