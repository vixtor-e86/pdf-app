import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";

const KEY = "gemini_api_key";

// Reads/writes the Gemini API key from .env or the OS secure enclave.
export function useApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(
    process.env.EXPO_PUBLIC_GEMINI_API_KEY &&
      process.env.EXPO_PUBLIC_GEMINI_API_KEY !== "your_gemini_api_key_here"
      ? process.env.EXPO_PUBLIC_GEMINI_API_KEY.trim()
      : null
  );

  useEffect(() => {
    // If env key exists and is non-empty, prioritize it
    const envKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (envKey && envKey !== "your_gemini_api_key_here" && envKey.trim().length > 0) {
      setApiKey(envKey.trim());
      return;
    }

    // Otherwise read from secure device storage
    SecureStore.getItemAsync(KEY)
      .then((saved) => {
        if (saved && saved.trim().length > 0) {
          setApiKey(saved.trim());
        }
      })
      .catch(() => {});
  }, []);

  const save = useCallback(async (k: string) => {
    const trimmed = k.trim();
    await SecureStore.setItemAsync(KEY, trimmed);
    setApiKey(trimmed);
  }, []);

  return { apiKey, save };
}
