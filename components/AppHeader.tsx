import { Moon, Sun } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { font, radius } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";

// Top app brand header matching the PDFlex layout:
// Custom vector brand logo on left + 100% offline & dark mode controls on right.
export function AppHeader({ onThemeToggle }: { onThemeToggle?: () => void }) {
  const { theme, isDark, toggleDark } = useTheme();

  return (
    <View className="px-6 pt-3 pb-3 flex-row items-center justify-between">
      {/* Brand logo & name */}
      <View className="flex-row items-center" style={{ gap: 10 }}>
        <View
          className="items-center justify-center"
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: theme.primary,
          }}
        >
          {/* Custom stylized document fold mark */}
          <View
            style={{
              width: 18,
              height: 22,
              borderWidth: 2,
              borderColor: "#FFFFFF",
              borderRadius: 4,
              borderTopRightRadius: 8,
              position: "relative",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 6,
                height: 6,
                backgroundColor: "#FFFFFF",
                borderBottomLeftRadius: 3,
              }}
            />
          </View>
        </View>

        <View className="flex-row items-center">
          <Text
            style={{
              color: theme.text,
              fontFamily: font.family.bold,
              fontSize: 22,
              letterSpacing: -0.5,
            }}
          >
            My{" "}
          </Text>
          <Text
            style={{
              color: theme.primary,
              fontFamily: font.family.bold,
              fontSize: 22,
              letterSpacing: -0.5,
            }}
          >
            PDF App
          </Text>
        </View>
      </View>

      {/* Right side: dark mode toggle */}
      <View className="flex-row items-center" style={{ gap: 8 }}>
        <Pressable
          onPress={onThemeToggle ?? toggleDark}
          hitSlop={10}
          className="items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: radius.pill,
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          {isDark ? (
            <Sun size={17} color={theme.primary} />
          ) : (
            <Moon size={17} color={theme.text} />
          )}
        </Pressable>
      </View>
    </View>
  );
}
