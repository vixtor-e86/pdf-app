import React from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Subtle press-scale used by all tappable cards and buttons.
export function PressScale({
  children, onPress, style, disabled, scaleTo = 0.97,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  scaleTo?: number;
}) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(scaleTo, { duration: 110 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 180 }))}
      style={[style, animated]}
    >
      {children}
    </AnimatedPressable>
  );
}
