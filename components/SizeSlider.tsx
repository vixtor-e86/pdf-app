import React, { useRef } from "react";
import {
  PanResponder,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { cardShadow, font, radius } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";
import { formatBytes } from "../utils/format";

export function SizeSlider({
  minBytes,
  maxBytes,
  currentBytes,
  onChange,
}: {
  minBytes: number;
  maxBytes: number;
  currentBytes: number;
  onChange: (bytes: number) => void;
}) {
  const { theme } = useTheme();
  const trackWidthRef = useRef<number>(260);

  // Calculate percentage (0 to 1)
  const clamped = Math.max(minBytes, Math.min(maxBytes, currentBytes));
  const percent =
    maxBytes > minBytes ? (clamped - minBytes) / (maxBytes - minBytes) : 0;

  // Handle touch on mobile / web via pan responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handleTouch(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        handleTouch(evt.nativeEvent.locationX);
      },
    })
  ).current;

  const handleTouch = (touchX: number) => {
    const width = trackWidthRef.current || 260;
    const ratio = Math.max(0, Math.min(1, touchX / width));
    const newBytes = Math.round(minBytes + ratio * (maxBytes - minBytes));
    onChange(newBytes);
  };

  return (
    <View style={{ gap: 12 }}>
      {/* Current Selection Value Display Card */}
      <View
        className="p-3.5 flex-row items-center justify-between"
        style={{
          backgroundColor: theme.primarySoft,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: theme.primaryBorder,
        }}
      >
        <View style={{ gap: 2 }}>
          <Text
            style={{
              color: theme.textMuted,
              fontFamily: font.family.medium,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Target Output Size
          </Text>
          <Text
            style={{
              color: theme.primary,
              fontFamily: font.family.bold,
              fontSize: 22,
            }}
          >
            {formatBytes(clamped)}
          </Text>
        </View>

        <View
          className="px-3 py-1.5"
          style={{
            backgroundColor: theme.card,
            borderRadius: radius.pill,
            ...cardShadow,
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontFamily: font.family.semibold,
              fontSize: font.size.xs,
            }}
          >
            {maxBytes > 0
              ? `-${Math.max(0, Math.round(((maxBytes - clamped) / maxBytes) * 100))}% reduction`
              : "0%"}
          </Text>
        </View>
      </View>

      {/* Web native slider for buttery smooth web performance */}
      {Platform.OS === "web" ? (
        <View style={{ paddingVertical: 10 }}>
          <input
            type="range"
            min={minBytes}
            max={maxBytes}
            step={Math.max(1024, Math.round((maxBytes - minBytes) / 100))}
            value={clamped}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{
              width: "100%",
              accentColor: theme.primary,
              cursor: "pointer",
              height: 8,
              borderRadius: 999,
            }}
          />
        </View>
      ) : (
        /* React Native Touch Track & Thumb for iOS & Android */
        <View
          {...panResponder.panHandlers}
          onLayout={(e) => {
            trackWidthRef.current = e.nativeEvent.layout.width;
          }}
          className="justify-center"
          style={{ height: 44, paddingVertical: 12 }}
        >
          {/* Inactive Track */}
          <View
            style={{
              height: 8,
              borderRadius: radius.pill,
              backgroundColor: theme.cardAlt,
              overflow: "hidden",
            }}
          >
            {/* Active Filled Track */}
            <View
              style={{
                height: "100%",
                width: `${percent * 100}%`,
                backgroundColor: theme.primary,
                borderRadius: radius.pill,
              }}
            />
          </View>

          {/* Floating Thumb */}
          <View
            style={{
              position: "absolute",
              left: `${Math.max(0, Math.min(94, percent * 100))}%`,
              width: 28,
              height: 28,
              borderRadius: radius.pill,
              backgroundColor: "#FFFFFF",
              borderWidth: 3,
              borderColor: theme.primary,
              ...cardShadow,
            }}
          />
        </View>
      )}

      {/* Min and Max Range Indicators */}
      <View className="flex-row items-center justify-between px-1">
        <Text
          style={{
            color: theme.textMuted,
            fontFamily: font.family.medium,
            fontSize: font.size.xs,
          }}
        >
          Min: {formatBytes(minBytes)}
        </Text>
        <Text
          style={{
            color: theme.textMuted,
            fontFamily: font.family.medium,
            fontSize: font.size.xs,
          }}
        >
          Original: {formatBytes(maxBytes)}
        </Text>
      </View>

      {/* Quick Glide Chips (25%, 50%, 75%, Max) */}
      <View className="flex-row items-center justify-between pt-1" style={{ gap: 8 }}>
        {[
          { label: "Max Saving", pct: 0.15 },
          { label: "50%", pct: 0.5 },
          { label: "75%", pct: 0.75 },
          { label: "Light", pct: 0.9 },
        ].map((btn) => {
          const target = Math.round(minBytes + btn.pct * (maxBytes - minBytes));
          const isActive = Math.abs(clamped - target) < (maxBytes - minBytes) * 0.08;

          return (
            <Pressable
              key={btn.label}
              onPress={() => onChange(target)}
              className="flex-1 items-center justify-center py-2"
              style={{
                backgroundColor: isActive ? theme.primarySoft : theme.cardAlt,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: isActive ? theme.primary : theme.border,
              }}
            >
              <Text
                style={{
                  color: isActive ? theme.primary : theme.text,
                  fontFamily: font.family.semibold,
                  fontSize: 11,
                }}
              >
                {btn.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
