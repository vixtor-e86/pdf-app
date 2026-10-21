import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { radius, softShadow } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";

// Soft pulsing skeleton used while the AI is "thinking".
export function ShimmerCard() {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 750 }), -1, true);
  }, []);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View className="p-5" style={{ backgroundColor: theme.card, borderRadius: radius.xl, gap: 12, ...softShadow }}>
      <Animated.View style={[{ height: 16, width: "55%", borderRadius: radius.sm, backgroundColor: theme.cardAlt }, pulse]} />
      <Animated.View style={[{ height: 12, width: "100%", borderRadius: radius.sm, backgroundColor: theme.cardAlt }, pulse]} />
      <Animated.View style={[{ height: 12, width: "82%", borderRadius: radius.sm, backgroundColor: theme.cardAlt }, pulse]} />
    </View>
  );
}
