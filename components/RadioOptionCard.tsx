import React from "react";
import { Text, View } from "react-native";
import { cardShadow, font, radius } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";
import { PressScale } from "./PressScale";

export type RadioOption = {
  key: string;
  title: string;
  desc: string;
  badge?: string;
};

export function RadioOptionCard({
  option,
  selected,
  onSelect,
}: {
  option: RadioOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const { theme } = useTheme();

  return (
    <PressScale onPress={onSelect} scaleTo={0.99}>
      <View
        className="flex-row items-center p-4"
        style={{
          borderRadius: radius.lg,
          backgroundColor: theme.card,
          borderWidth: selected ? 1.8 : 1,
          borderColor: selected ? theme.primary : theme.border,
          gap: 14,
          ...(selected ? cardShadow : {}),
        }}
      >
        {/* Custom Radio Button */}
        <View
          className="items-center justify-center"
          style={{
            width: 22,
            height: 22,
            borderRadius: radius.pill,
            borderWidth: 2,
            borderColor: selected ? theme.primary : "#C7CCD5",
            backgroundColor: "#FFFFFF",
          }}
        >
          {selected && (
            <View
              style={{
                width: 11,
                height: 11,
                borderRadius: radius.pill,
                backgroundColor: theme.primary,
              }}
            />
          )}
        </View>

        {/* Text info */}
        <View className="flex-1" style={{ gap: 2 }}>
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <Text
              style={{
                color: theme.text,
                fontFamily: font.family.bold,
                fontSize: font.size.base,
              }}
            >
              {option.title}
            </Text>
            {option.badge && (
              <View
                className="px-2 py-0.5"
                style={{
                  backgroundColor: theme.primarySoft,
                  borderRadius: radius.pill,
                }}
              >
                <Text
                  style={{
                    color: theme.primary,
                    fontFamily: font.family.medium,
                    fontSize: font.size.xs,
                  }}
                >
                  {option.badge}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={{
              color: theme.textMuted,
              fontFamily: font.family.regular,
              fontSize: font.size.sm,
            }}
          >
            {option.desc}
          </Text>
        </View>
      </View>
    </PressScale>
  );
}
