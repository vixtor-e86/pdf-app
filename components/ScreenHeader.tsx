import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { font, radius } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";

// Consistent header for sub-screens: optional back button, title, subtitle.
export function ScreenHeader({ title, subtitle, back = true }: { title: string; subtitle?: string; back?: boolean }) {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <MotiView
      from={{ opacity: 0, translateY: -8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 350 } as any}
      className="px-6 pt-3 pb-4 flex-row items-center"
      style={{ gap: 14 }}
    >
      {back && (
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="items-center justify-center"
          style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
        >
          <ChevronLeft size={22} color={theme.text} />
        </Pressable>
      )}
      <View className="flex-1">
        <Text style={{ color: theme.text, fontFamily: font.family.bold, fontSize: font.size.xl }}>{title}</Text>
        {subtitle && (
          <Text style={{ color: theme.textMuted, fontFamily: font.family.regular, fontSize: font.size.sm, marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
    </MotiView>
  );
}
