import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { radius } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";

// Smooth animated progress bar; pass a 0..1 value.
export function ProgressBar({ progress }: { progress: number }) {
  const { theme } = useTheme();
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, { duration: 220 });
  }, [progress]);

  const fill = useAnimatedStyle(() => ({ width: `${width.value * 100}%` }));

  return (
    <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: theme.cardAlt, overflow: "hidden" }}>
      <Animated.View style={[{ height: "100%", borderRadius: radius.pill, backgroundColor: theme.primary }, fill]} />
    </View>
  );
}
