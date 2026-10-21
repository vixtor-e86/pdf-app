import { FileText, Plus } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import { cardShadow, font, radius } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";
import { PickedFile } from "../types";
import { FileCard } from "./FileCard";
import { PressScale } from "./PressScale";

export function UploadArea({
  file,
  label = "Tap or click here to choose a file.",
  hint = "File size limit: 50MB · PDF, JPG, PNG",
  onPick,
  onRemove,
}: {
  file: PickedFile | null;
  label?: string;
  hint?: string;
  onPick: () => void;
  onRemove?: () => void;
}) {
  const { theme } = useTheme();

  if (file) {
    return <FileCard file={file} onRemove={onRemove ?? onPick} />;
  }

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
            width: 74,
            height: 74,
            borderRadius: radius.lg,
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: theme.border,
            ...cardShadow,
          }}
        >
          <View
            style={{
              width: 34,
              height: 42,
              borderWidth: 2,
              borderColor: theme.primary,
              borderRadius: 6,
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 4,
            }}
          >
            <Text
              style={{
                color: theme.primary,
                fontFamily: font.family.bold,
                fontSize: 10,
                letterSpacing: 0.5,
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
          className="flex-row items-center px-5 py-2.5 mt-1"
          style={{
            backgroundColor: theme.primary,
            borderRadius: radius.pill,
            gap: 6,
            ...cardShadow,
          }}
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={3} />
          <Text
            style={{
              color: "#FFFFFF",
              fontFamily: font.family.semibold,
              fontSize: font.size.sm,
            }}
          >
            Choose
          </Text>
        </View>
      </View>
    </PressScale>
  );
}
