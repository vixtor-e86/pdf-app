import * as Haptics from "expo-haptics";
import { useCallback, useRef, useState } from "react";
import { Platform } from "react-native";

export type TaskStatus = "idle" | "processing" | "success" | "error";

// Generic runner for mock async work: drives status + smooth fake progress,
// fires a light haptic on success, and produces friendly error text.
export function useMockTask<T extends (...args: any[]) => Promise<any>>(task: T) {
  type R = Awaited<ReturnType<T>>;
  type A = Parameters<T>;

  const [status, setStatus] = useState<TaskStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<R | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const run = useCallback(
    async (...args: A) => {
      setStatus("processing");
      setError(null);
      setResult(null);
      setProgress(0);
      // Ease toward 92% so the bar always feels alive; completes when the task resolves.
      timer.current = setInterval(
        () => setProgress((p) => Math.min(p + Math.random() * 0.1, 0.92)),
        140
      );
      try {
        const res = await task(...args);
        if (timer.current) clearInterval(timer.current);
        setProgress(1);
        setResult(res);
        setStatus("success");
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        return res;
      } catch (err: any) {
        if (timer.current) clearInterval(timer.current);
        setStatus("error");
        setError(
          err?.message ||
            "That didn't work this time. Please check the file and try again."
        );
        throw err;
      }
    },
    [task]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);

  return { status, progress, result, error, run, reset };
}
