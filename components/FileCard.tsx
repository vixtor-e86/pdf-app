import { FileText, Image as ImageIcon, X } from "lucide-react-native";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { cardShadow, font, radius } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";
import { PickedFile } from "../types";
import { formatBytes } from "../utils/format";

export function FileCard({
  file,
  onRemove,
}: {
  file: PickedFile;
  onRemove?: () => void;
}) {
  const { theme } = useTheme();
  const hasRealImageThumb =
    file.isImage &&
    file.uri &&
    (file.uri.startsWith("file:") ||
      file.uri.startsWith("content:") ||
      file.uri.startsWith("data:") ||
      file.uri.startsWith("blob:") ||
      file.uri.startsWith("http"));

  return (
    <View
      className="flex-row items-center p-3"
      style={{
        backgroundColor: theme.card,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: theme.border,
        gap: 12,
        overflow: "hidden",
        ...cardShadow,
      }}
    >
      {/* File type thumbnail icon / real image preview */}
      {hasRealImageThumb ? (
        <View
          style={{
            width: 44,
            height: 48,
            borderRadius: radius.sm,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Image
            source={{ uri: file.uri }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>
      ) : (
        <View
          className="items-center justify-center"
          style={{
            width: 44,
            height: 48,
            borderRadius: radius.sm,
            backgroundColor: theme.primarySoft,
            borderWidth: 1,
            borderColor: theme.primaryBorder,
          }}
        >
          {file.isImage ? (
            <ImageIcon size={20} color={theme.primary} />
          ) : (
            <FileText size={20} color={theme.primary} />
          )}
          <Text
            numberOfLines={1}
            style={{
              color: theme.primary,
              fontFamily: font.family.bold,
              fontSize: 9,
              marginTop: 2,
              includeFontPadding: false,
            }}
          >
            {file.isImage ? "IMG" : "PDF"}
          </Text>
        </View>
      )}

      {/* File name & size (Guaranteed to fit inside box without overflowing) */}
      <View className="flex-1" style={{ gap: 2, minWidth: 0, overflow: "hidden" }}>
        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          style={{
            color: theme.text,
            fontFamily: font.family.semibold,
            fontSize: font.size.sm,
          }}
        >
          {file.name}
        </Text>
        <Text
          style={{
            color: theme.textMuted,
            fontFamily: font.family.regular,
            fontSize: font.size.xs,
          }}
        >
          {formatBytes(file.size)}
        </Text>
      </View>

      {/* Classic Remove 'X' button (no harsh black box) */}
      {onRemove && (
        <Pressable
          onPress={onRemove}
          hitSlop={10}
          className="items-center justify-center"
          style={{
            width: 28,
            height: 28,
            borderRadius: radius.pill,
            backgroundColor: theme.cardAlt,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <X size={14} color={theme.textMuted} strokeWidth={2.2} />
        </Pressable>
      )}
    </View>
  );
}
