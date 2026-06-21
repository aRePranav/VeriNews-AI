"use client";

import { useCallback, useState } from "react";
import { predict, ApiError } from "@/lib/api";
import type { PredictResponse } from "@/lib/types";

export function usePredict() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (text: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await predict(text);
      setResult(res);
      return res;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Couldn't reach the analysis service. Check that the backend is running.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { loading, result, error, run, reset };
}
