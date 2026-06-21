import type {
  PredictResponse,
  ModelMetrics,
  StatsResponse,
  HistoryItem,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // ignore parse failure, fall back to default message
    }
    throw new ApiError(detail, res.status);
  }
  return res.json();
}

export function predict(text: string): Promise<PredictResponse> {
  return request<PredictResponse>("/predict", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function getModelMetrics(): Promise<ModelMetrics> {
  return request<ModelMetrics>("/model-metrics");
}

export function getStats(): Promise<StatsResponse> {
  return request<StatsResponse>("/stats");
}

export function getHistory(limit = 8): Promise<HistoryItem[]> {
  return request<HistoryItem[]>(`/history?limit=${limit}`);
}
