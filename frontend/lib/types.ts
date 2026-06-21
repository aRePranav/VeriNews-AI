export interface WordWeight {
  word: string;
  weight: number;
}

export interface PredictResponse {
  request_id: string;
  label: "FAKE" | "REAL";
  confidence: number;
  top_fake_words: WordWeight[];
  top_real_words: WordWeight[];
  explanation: string;
  warning: string | null;
  word_count: number;
  matched_vocabulary_terms: number;
}

export interface ModelMetric {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  confusion_matrix: number[][];
  train_seconds: number;
}

export interface ModelMetrics {
  production_model: string;
  label_map: Record<string, string>;
  dataset: {
    name: string;
    total_articles: number;
    train_size: number;
    test_size: number;
    real_count: number;
    fake_count: number;
  };
  vectorizer: {
    max_features: number;
    ngram_range: [number, number];
    actual_vocab_size: number;
  };
  models: Record<string, ModelMetric>;
  production_model_calibrated_accuracy: number;
  trained_at: string;
}

export interface StatsResponse {
  total_predictions: number;
  fake_count: number;
  real_count: number;
  fake_pct: number;
  real_pct: number;
  average_confidence: number;
}

export interface HistoryItem {
  request_id: string;
  input_preview: string;
  label: "FAKE" | "REAL";
  confidence: number;
  created_at: string;
}
