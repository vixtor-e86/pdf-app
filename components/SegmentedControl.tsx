import React from "react";
import { Pressable, Text, View } from "react-native";
import { font, radius } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";

export function SegmentedControl({
  options,
  selected,
  onSelect,
}: {
  options: { key: string; label: string }[];
  selected: string;
  onSelect: (key: string) => void;
}) {
  const { theme } = useTheme();

  return (
    <View
      className="flex-row p-1"
      style={{
        backgroundColor: theme.cardAlt,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      {options.map((opt) => {
        const active = selected === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onSelect(opt.key)}
            className="flex-1 items-center justify-center py-2.5"
            style={{
              borderRadius: radius.pill,
              backgroundColor: active ? theme.primary : "transparent",
            }}
          >
            <Text
              style={{
                color: active ? "#FFFFFF" : theme.textMuted,
                fontFamily: active ? font.family.semibold : font.family.medium,
                fontSize: font.size.sm,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
