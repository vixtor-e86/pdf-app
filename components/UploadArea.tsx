import { Plus } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import { cardShadow, font, radius } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";
import { PickedFile } from "../types";
import { FileCard } from "./FileCard";
import { PressScale } from "./PressScale";

interface UploadAreaProps {
  onPick: () => void;
  onRemove?: () => void;
  file?: PickedFile | null;
  files?: PickedFile[];
  label?: string;
  hint?: string;
}

export function UploadArea({
  onPick,
  onRemove,
  file,
  files,
  label = "Tap or click here to choose a file.",
  hint = "File size limit: 50MB • PDF, JPG, PNG",
}: UploadAreaProps) {
  const { theme } = useTheme();

  // 1. If a single file is selected, show the FileCard with remove button
  if (file) {
    return <FileCard file={file} onRemove={onRemove ?? onPick} />;
  }

  // 2. If multiple files are selected, show list of FileCards
  if (files && files.length > 0) {
    return (
      <View style={{ gap: 10 }}>
        {files.map((f, idx) => (
          <FileCard key={idx} file={f} onRemove={onRemove ?? onPick} />
        ))}
      </View>
    );
  }

  // 3. Otherwise show the dashed upload area
  return (
    <PressScale onPress={onPick} scaleTo={0.99}>
      <View
        className="items-center justify-center p-8"
        style={{
          borderRadius: radius.xxl,
          borderWidth: 2,
          borderStyle: "dashed",
          borderColor: theme.borderDashed,
          backgroundColor: theme.primarySoft,
          minHeight: 220,
          gap: 12,
        }}
      >
        {/* White floating badge with red PDF icon */}
        <View
          className="items-center justify-center"
          style={{
            width: 76,
            height: 76,
            borderRadius: radius.lg,
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: theme.border,
            ...cardShadow,
          }}
        >
          <View
            style={{
              minWidth: 44,
              height: 48,
              borderWidth: 2,
              borderColor: theme.primary,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 6,
              backgroundColor: "rgba(239, 68, 68, 0.04)",
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: theme.primary,
                fontFamily: font.family.bold,
                fontSize: 12,
                includeFontPadding: false,
                textAlign: "center",
              }}
            >
              PDF
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <View className="items-center" style={{ gap: 4 }}>
          <Text
            style={{
              color: theme.text,
              fontFamily: font.family.bold,
              fontSize: font.size.base,
              textAlign: "center",
            }}
          >
            {label}
          </Text>
          {hint && (
            <Text
              style={{
                color: theme.textMuted,
                fontFamily: font.family.regular,
                fontSize: font.size.sm,
                textAlign: "center",
              }}
            >
              {hint}
            </Text>
          )}
        </View>

        {/* Coral "+ Choose" pill button */}
        <View
          className="flex-row items-center justify-center mt-1"
          style={{
            backgroundColor: theme.primary,
            borderRadius: radius.pill,
            paddingHorizontal: 22,
            paddingVertical: 10,
            minWidth: 116,
            gap: 6,
            ...cardShadow,
          }}
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={3} />
          <Text
            numberOfLines={1}
            style={{
              color: "#FFFFFF",
              fontFamily: font.family.semibold,
              fontSize: font.size.sm,
              includeFontPadding: false,
              paddingRight: 4,
            }}
          >
            Choose
          </Text>
        </View>
      </View>
    </PressScale>
  );
}
