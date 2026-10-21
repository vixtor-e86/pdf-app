import AsyncStorage from "@react-native-async-storage/async-storage";

export type ProcessedFileRecord = {
  id: string;
  name: string;
  kind: "pdf" | "image" | "text";
  action: "compressed" | "merged" | "converted" | "extracted";
  sizeBytes: number;
  originalSizeBytes?: number;
  savedBytes?: number;
  uri: string;
  timestamp: number;
};

const STORAGE_KEY = "@my_pdf_app_processed_files_v1";

/**
 * Loads the user's processed files history from local storage.
 */
export async function getProcessedFiles(): Promise<ProcessedFileRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Could not load processed files history:", err);
    return [];
  }
}

/**
 * Adds a new processed file to history and persists it.
 */
export async function addProcessedFile(
  item: Omit<ProcessedFileRecord, "id" | "timestamp">
): Promise<ProcessedFileRecord[]> {
  try {
    const existing = await getProcessedFiles();
    const newRecord: ProcessedFileRecord = {
      ...item,
      id: `proc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };
    // Keep most recent first, max 40 items
    const updated = [newRecord, ...existing.filter((f) => f.name !== item.name)].slice(0, 40);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn("Could not save to processed files history:", err);
    return [];
  }
}

/**
 * Removes a file record from history.
 */
export async function removeProcessedFile(id: string): Promise<ProcessedFileRecord[]> {
  try {
    const existing = await getProcessedFiles();
    const updated = existing.filter((f) => f.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn("Could not remove from processed files history:", err);
    return [];
  }
}

/**
 * Clears all history.
 */
export async function clearProcessedFiles(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("Could not clear processed files history:", err);
  }
}
