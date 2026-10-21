import {
  Check,
  CheckCircle2,
  Download,
  FileText,
  Image as ImageIcon,
  Lock,
  Pencil,
  Share2,
  X,
} from "lucide-react-native";
import { MotiView } from "moti";
import React, { useEffect, useRef, useState } from "react";
import { Image, Keyboard, Pressable, Text, TextInput, View } from "react-native";
import { cardShadow, font, radius } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";
import { PrimaryButton } from "./PrimaryButton";

function splitFileName(full: string): { base: string; ext: string } {
  if (!full) return { base: "", ext: "" };
  const lastDot = full.lastIndexOf(".");
  if (lastDot > 0 && lastDot < full.length - 1) {
    return {
      base: full.substring(0, lastDot),
      ext: full.substring(lastDot + 1),
    };
  }
  return { base: full, ext: "" };
}

export function ResultCard({
  title,
  rows,
  thumbnailUri,
  isImage,
  fileName,
  onSave,
  onShare,
  onReset,
  children,
}: {
  title: string;
  rows: { label: string; value: string; highlight?: boolean }[];
  thumbnailUri?: string;
  isImage?: boolean;
  fileName?: string;
  onSave?: (fileName?: string) => void;
  onShare?: (fileName?: string) => void;
  onReset?: () => void;
  children?: React.ReactNode;
}) {
  const { theme } = useTheme();

  const initialParts = splitFileName(fileName || "");
  const [currentBaseName, setCurrentBaseName] = useState(initialParts.base);
  const [lockedExt, setLockedExt] = useState(initialParts.ext);
  const [editValue, setEditValue] = useState(initialParts.base);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (fileName) {
      const parts = splitFileName(fileName);
      setCurrentBaseName(parts.base);
      setLockedExt(parts.ext);
      setEditValue(parts.base);
      setIsEditing(false);
    }
  }, [fileName]);

  const currentFullName = lockedExt
    ? `${currentBaseName}.${lockedExt}`
    : currentBaseName;

  const handleCommitRename = () => {
    const trimmed = editValue.trim();
    // Strip any dot or extension if the user typed one in the input box
    const cleanBase =
      trimmed.replace(/\.[^/.]+$/, "").trim() || currentBaseName || "file";

    setCurrentBaseName(cleanBase);
    setEditValue(cleanBase);
    setIsEditing(false);
    Keyboard.dismiss();
  };

  const handleCancelRename = () => {
    setEditValue(currentBaseName);
    setIsEditing(false);
    Keyboard.dismiss();
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 350 } as any}
    >
      <View
        className="p-5"
        style={{
          backgroundColor: theme.card,
          borderRadius: radius.xxl,
          borderWidth: 1,
          borderColor: theme.border,
          gap: 16,
          ...cardShadow,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <View
            className="items-center justify-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.pill,
              backgroundColor: theme.successSoft,
            }}
          >
            <CheckCircle2 size={24} color={theme.success} strokeWidth={2.4} />
          </View>
          <View className="flex-1">
            <Text
              style={{
                color: theme.text,
                fontFamily: font.family.bold,
                fontSize: font.size.lg,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                color: theme.success,
                fontFamily: font.family.medium,
                fontSize: font.size.xs,
              }}
            >
              Ready to download & share
            </Text>
          </View>
        </View>

        {/* Thumbnail Preview when job finishes */}
        {thumbnailUri ? (
          <View
            className="items-center justify-center p-3"
            style={{
              backgroundColor: theme.cardAlt,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: theme.border,
              overflow: "hidden",
            }}
          >
            {isImage &&
            !thumbnailUri.endsWith(".pdf") &&
            (thumbnailUri.startsWith("file:") ||
              thumbnailUri.startsWith("content:") ||
              thumbnailUri.startsWith("data:") ||
              thumbnailUri.startsWith("blob:") ||
              thumbnailUri.startsWith("http")) ? (
              <Image
                source={{ uri: thumbnailUri }}
                style={{ width: "100%", height: 150, borderRadius: radius.md }}
                resizeMode="contain"
              />
            ) : (
              <View
                className="items-center justify-center py-4 px-3"
                style={{
                  width: "100%",
                  borderRadius: radius.md,
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                  gap: 6,
                }}
              >
                <View
                  className="items-center justify-center"
                  style={{
                    width: 52,
                    height: 60,
                    borderRadius: radius.md,
                    backgroundColor: theme.primarySoft,
                    borderWidth: 1.5,
                    borderColor: theme.primaryBorder,
                  }}
                >
                  <FileText size={26} color={theme.primary} />
                  <Text
                    style={{
                      color: theme.primary,
                      fontFamily: font.family.bold,
                      fontSize: 9,
                      marginTop: 2,
                    }}
                  >
                    PDF
                  </Text>
                </View>
                {currentFullName && (
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="middle"
                    style={{
                      color: theme.text,
                      fontFamily: font.family.semibold,
                      fontSize: font.size.xs,
                      maxWidth: "92%",
                    }}
                  >
                    {currentFullName}
                  </Text>
                )}
              </View>
            )}
          </View>
        ) : null}

        {/* Editable File Name Bar with Locked Extension */}
        <View
          style={{
            backgroundColor: theme.cardAlt,
            borderRadius: radius.lg,
            borderWidth: 1.5,
            borderColor: isEditing ? theme.primary : theme.border,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          {isEditing ? (
            <View className="flex-row items-center" style={{ gap: 8 }}>
              {/* Input container with locked extension pill */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: theme.card,
                  borderRadius: radius.md,
                  borderWidth: 1.5,
                  borderColor: theme.primary,
                  paddingHorizontal: 8,
                }}
              >
                <TextInput
                  ref={inputRef}
                  value={editValue}
                  onChangeText={setEditValue}
                  autoFocus
                  selectTextOnFocus
                  returnKeyType="done"
                  onSubmitEditing={handleCommitRename}
                  placeholder="Enter file name"
                  placeholderTextColor={theme.textMuted}
                  style={{
                    flex: 1,
                    color: theme.text,
                    fontFamily: font.family.semibold,
                    fontSize: font.size.sm,
                    paddingVertical: 6,
                  }}
                />

                {lockedExt ? (
                  <View
                    className="flex-row items-center px-2 py-1 ml-1"
                    style={{
                      backgroundColor: theme.cardAlt,
                      borderRadius: radius.sm,
                      borderWidth: 1,
                      borderColor: theme.border,
                      gap: 3,
                    }}
                  >
                    <Lock size={10} color={theme.textMuted} />
                    <Text
                      style={{
                        color: theme.primary,
                        fontFamily: font.family.bold,
                        fontSize: 11,
                      }}
                    >
                      .{lockedExt.toLowerCase()}
                    </Text>
                  </View>
                ) : null}
              </View>

              <Pressable
                onPress={handleCommitRename}
                style={{
                  backgroundColor: theme.successSoft,
                  padding: 8,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: theme.success,
                }}
                hitSlop={8}
              >
                <Check size={16} color={theme.success} strokeWidth={2.6} />
              </Pressable>
              <Pressable
                onPress={handleCancelRename}
                style={{
                  backgroundColor: theme.card,
                  padding: 8,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
                hitSlop={8}
              >
                <X size={16} color={theme.textMuted} strokeWidth={2} />
              </Pressable>
            </View>
          ) : (
            <View
              className="flex-row items-center justify-between"
              style={{ gap: 10 }}
            >
              <View
                className="flex-row items-center flex-1"
                style={{ gap: 10, minWidth: 0 }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: radius.md,
                    backgroundColor: theme.primarySoft,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isImage ? (
                    <ImageIcon size={16} color={theme.primary} />
                  ) : (
                    <FileText size={16} color={theme.primary} />
                  )}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      color: theme.textMuted,
                      fontFamily: font.family.medium,
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Output File Name (Extension Locked)
                  </Text>
                  <View className="flex-row items-center" style={{ gap: 4 }}>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="middle"
                      style={{
                        color: theme.text,
                        fontFamily: font.family.semibold,
                        fontSize: font.size.sm,
                        flexShrink: 1,
                      }}
                    >
                      {currentBaseName || "Processed File"}
                    </Text>
                    {lockedExt ? (
                      <View
                        className="flex-row items-center px-1.5 py-0.5"
                        style={{
                          backgroundColor: theme.card,
                          borderRadius: radius.sm,
                          borderWidth: 1,
                          borderColor: theme.border,
                          gap: 3,
                        }}
                      >
                        <Lock size={9} color={theme.textMuted} />
                        <Text
                          style={{
                            color: theme.primary,
                            fontFamily: font.family.bold,
                            fontSize: 10,
                          }}
                        >
                          .{lockedExt.toLowerCase()}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>

              <Pressable
                onPress={() => {
                  setEditValue(currentBaseName);
                  setIsEditing(true);
                }}
                className="items-center justify-center flex-row"
                style={{
                  backgroundColor: theme.card,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: theme.border,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  gap: 5,
                }}
                hitSlop={8}
              >
                <Pencil size={13} color={theme.primary} />
                <Text
                  style={{
                    color: theme.primary,
                    fontFamily: font.family.semibold,
                    fontSize: font.size.xs,
                  }}
                >
                  Rename
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Comparison Rows with Safe Text Constraints & Dynamically Updated Name */}
        <View
          className="p-3.5"
          style={{
            backgroundColor: theme.cardAlt,
            borderRadius: radius.lg,
            gap: 10,
            overflow: "hidden",
          }}
        >
          {rows.map((r) => {
            const isFileNameRow =
              r.value === fileName ||
              r.label.toLowerCase().includes("document") ||
              r.label.toLowerCase().includes("name");
            const displayVal =
              isFileNameRow && currentFullName ? currentFullName : r.value;

            return (
              <View
                key={r.label}
                className="flex-row items-center justify-between"
                style={{ gap: 12, minWidth: 0, overflow: "hidden" }}
              >
                <Text
                  style={{
                    color: theme.textMuted,
                    fontFamily: font.family.regular,
                    fontSize: font.size.sm,
                    flexShrink: 0,
                  }}
                >
                  {r.label}
                </Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={{
                    color: r.highlight ? theme.success : theme.text,
                    fontFamily: font.family.bold,
                    fontSize: font.size.sm,
                    textAlign: "right",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {displayVal}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View className="flex-row" style={{ gap: 10 }}>
          {onSave && (
            <View className="flex-1">
              <PrimaryButton
                label="Save to Device"
                onPress={() => onSave(currentFullName || fileName)}
              />
            </View>
          )}
          {onShare && (
            <View style={{ width: 110 }}>
              <PrimaryButton
                label="Share"
                variant="outline"
                onPress={() => onShare(currentFullName || fileName)}
              />
            </View>
          )}
        </View>

        {children}

        {onReset && (
          <Text
            onPress={onReset}
            style={{
              color: theme.textMuted,
              fontFamily: font.family.medium,
              fontSize: font.size.sm,
              textAlign: "center",
              paddingTop: 2,
            }}
          >
            Process another file
          </Text>
        )}
      </View>
    </MotiView>
  );
}
