import { AlertCircle, CheckCircle2, FileText, Info, WifiOff, X } from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { cardShadow, font, radius } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";
import { PressScale } from "./PressScale";
import { PrimaryButton } from "./PrimaryButton";

export type NotificationModalProps = {
  visible: boolean;
  title: string;
  message: string;
  fileName?: string;
  type?: "success" | "info" | "warn" | "error";
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
};

export function NotificationModal({
  visible,
  title,
  message,
  fileName,
  type = "success",
  actionLabel = "Done",
  onAction,
  onClose,
}: NotificationModalProps) {
  const { theme } = useTheme();

  if (!visible) return null;

  const iconColor =
    type === "success"
      ? theme.success
      : type === "error"
      ? theme.error
      : type === "warn"
      ? "#D9A441"
      : theme.primary;

  const iconBg =
    type === "success"
      ? theme.successSoft
      : type === "error"
      ? theme.errorSoft
      : type === "warn"
      ? "#F7EEDD"
      : theme.primarySoft;

  const isNetworkIssue =
    title.toLowerCase().includes("internet") ||
    title.toLowerCase().includes("network") ||
    message.toLowerCase().includes("internet");

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 items-center justify-center px-6"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.45)",
        }}
      >
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          onPress={onClose}
        />

        <MotiView
          from={{ opacity: 0, scale: 0.92, translateY: 10 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 250 } as any}
          style={{
            width: "100%",
            maxWidth: 380,
            backgroundColor: theme.card,
            borderRadius: radius.xxl,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 24,
            gap: 18,
            ...cardShadow,
          }}
        >
          {/* Top Row: Icon & Close */}
          <View className="flex-row items-center justify-between">
            <View
              className="items-center justify-center"
              style={{
                width: 48,
                height: 48,
                borderRadius: radius.pill,
                backgroundColor: iconBg,
              }}
            >
              {isNetworkIssue ? (
                <WifiOff size={26} color={iconColor} strokeWidth={2.2} />
              ) : type === "success" ? (
                <CheckCircle2 size={26} color={iconColor} strokeWidth={2.4} />
              ) : type === "error" ? (
                <AlertCircle size={26} color={iconColor} strokeWidth={2.4} />
              ) : (
                <Info size={26} color={iconColor} strokeWidth={2.4} />
              )}
            </View>

            <PressScale onPress={onClose} scaleTo={0.9}>
              <View
                className="items-center justify-center"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: radius.pill,
                  backgroundColor: theme.cardAlt,
                }}
              >
                <X size={16} color={theme.textMuted} />
              </View>
            </PressScale>
          </View>

          {/* Texts */}
          <View style={{ gap: 6 }}>
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
                color: theme.textMuted,
                fontFamily: font.family.regular,
                fontSize: font.size.sm,
                lineHeight: 20,
              }}
            >
              {message}
            </Text>
          </View>

          {/* File Tag if provided */}
          {fileName && (
            <View
              className="flex-row items-center p-3"
              style={{
                backgroundColor: theme.cardAlt,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: theme.border,
                gap: 10,
              }}
            >
              <FileText size={18} color={theme.primary} />
              <Text
                numberOfLines={1}
                className="flex-1"
                style={{
                  color: theme.text,
                  fontFamily: font.family.semibold,
                  fontSize: font.size.xs,
                }}
              >
                {fileName}
              </Text>
            </View>
          )}

          {/* Action Button */}
          <View style={{ marginTop: 4 }}>
            <PrimaryButton
              label={actionLabel}
              onPress={() => {
                if (onAction) {
                  onAction();
                } else {
                  onClose();
                }
              }}
            />
          </View>
        </MotiView>
      </View>
    </Modal>
  );
}
