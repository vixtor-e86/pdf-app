import { ChevronRight } from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import { Text, View } from "react-native";
import { font, radius, softShadow } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";
import { PressScale } from "./PressScale";

// Large rounded card for a tool entry point (Home screen).
export function ToolCard({
  icon, title, description, onPress, delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
  delay?: number;
}) {
  const { theme } = useTheme();

  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 420, delay } as any} // gentle staggered slide-in
    >
      <PressScale onPress={onPress}>
        <View
          className="flex-row items-center p-5"
          style={{ backgroundColor: theme.card, borderRadius: radius.xl, gap: 16, ...softShadow }}
        >
          <View
            className="items-center justify-center"
            style={{ width: 52, height: 52, borderRadius: radius.md, backgroundColor: theme.primarySoft }}
          >
            {icon}
          </View>
          <View className="flex-1" style={{ gap: 3 }}>
            <Text style={{ color: theme.text, fontFamily: font.family.semibold, fontSize: font.size.lg }}>{title}</Text>
            <Text style={{ color: theme.textMuted, fontFamily: font.family.regular, fontSize: font.size.sm }}>
              {description}
            </Text>
          </View>
          <ChevronRight size={20} color={theme.textMuted} />
        </View>
      </PressScale>
    </MotiView>
  );
}
