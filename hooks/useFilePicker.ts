import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { PickedFile } from "../types";

type Kind = "image" | "pdf" | "any";

/**
 * Universal file picker hook with appending support for multi-file operations (like PDF merge).
 */
export function useFilePicker(kind: Kind, multiple = false) {
  const [files, setFiles] = useState<PickedFile[]>([]);

  const pick = useCallback(
    async (append = multiple) => {
      try {
        if (kind === "image") {
          const res = await ImagePicker.launchImageLibraryAsync({
            quality: 1,
            allowsMultipleSelection: multiple,
          });
          if (res.canceled) return;
          const picked: PickedFile[] = res.assets.map((a) => ({
            uri: a.uri,
            name: a.fileName ?? `image_${Date.now()}.jpg`,
            size: a.fileSize,
            mimeType: a.mimeType,
            isImage: true,
          }));
          setFiles((prev) => (append ? [...prev, ...picked] : picked));
          return;
        }

        const res = await DocumentPicker.getDocumentAsync({
          type:
            kind === "pdf"
              ? "application/pdf"
              : ["application/pdf", "image/*", "*/*"],
          multiple,
          copyToCacheDirectory: true,
        });

        if (res.canceled) return;

        const picked: PickedFile[] = res.assets.map((a) => ({
          uri: a.uri,
          name: a.name,
          size: a.size,
          mimeType: a.mimeType,
          isImage:
            a.mimeType?.startsWith("image/") ||
            /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(a.name),
        }));

        setFiles((prev) => (append ? [...prev, ...picked] : picked));
      } catch (err: any) {
        console.warn("File picker canceled or error:", err?.message);
      }
    },
    [kind, multiple]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addFiles = useCallback((newFiles: PickedFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  return {
    files,
    file: files[0] ?? null,
    pick,
    removeFile,
    addFiles,
    clear: () => setFiles([]),
    setFiles,
  };
}
