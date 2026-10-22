import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { cardShadow, font, radius } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";
import { PressScale } from "./PressScale";

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
}) {
  const { theme } = useTheme();
  const off = disabled || loading;

  const getBgColor = () => {
    if (off) return theme.cardAlt;
    if (variant === "secondary") return theme.card;
    if (variant === "outline") return "transparent";
    return theme.primary;
  };

  const getTextColor = () => {
    if (off) return theme.textMuted;
    if (variant === "secondary") return theme.text;
    if (variant === "outline") return theme.primary;
    return "#FFFFFF";
  };

  return (
    <PressScale onPress={onPress} disabled={off} scaleTo={0.98}>
      <View
        className="items-center justify-center flex-row"
        style={{
          height: 56,
          borderRadius: radius.lg,
          backgroundColor: getBgColor(),
          borderWidth: variant === "outline" ? 1.5 : 0,
          borderColor: theme.primary,
          gap: 8,
          ...(!off && variant === "primary" ? cardShadow : {}),
        }}
      >
        {loading ? (
          <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : theme.primary} />
        ) : (
          <Text
            numberOfLines={1}
            style={{
              color: getTextColor(),
              fontFamily: font.family.bold,
              fontSize: font.size.base,
              letterSpacing: 0.2,
              includeFontPadding: false,
              paddingHorizontal: 6,
            }}
          >
            {label}
          </Text>
        )}
      </View>
    </PressScale>
  );
}
