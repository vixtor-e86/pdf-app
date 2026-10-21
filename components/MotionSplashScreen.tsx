import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from "expo-splash-screen";
import { Sparkles, Zap } from "lucide-react-native";

interface MotionSplashScreenProps {
  isAppReady: boolean;
  onAnimationComplete?: () => void;
}

const { width, height } = Dimensions.get("window");

export const MotionSplashScreen: React.FC<MotionSplashScreenProps> = ({
  isAppReady,
  onAnimationComplete,
}) => {
  // Animation state values
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoBob = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.8)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const screenScale = useRef(new Animated.Value(1)).current;

  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);

  useEffect(() => {
    // Hide the static native splash screen as soon as our React motion graphics splash mounts
    SplashScreen.hideAsync().catch(() => {});

    // 1. Entrance animation sequence
    Animated.parallel([
      // Logo bounce scale-in
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
      // Logo fade-in
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Text slide-up & fade-in
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 700,
        delay: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 700,
        delay: 250,
        useNativeDriver: true,
      }),
      // Progress bar fill
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 1800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }),
    ]).start();

    // 2. Ambient glowing breathing loop
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1.25,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.85,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    glowLoop.start();

    // 3. Subtle floating bob loop
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoBob, {
          toValue: -8,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(logoBob, {
          toValue: 4,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    bobLoop.start();

    // Allow the motion graphics intro to play for at least 1.9 seconds
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1900);

    return () => {
      clearTimeout(timer);
      glowLoop.stop();
      bobLoop.stop();
    };
  }, []);

  // 4. Exit transition when both the app is ready and min animation duration elapsed
  useEffect(() => {
    if (minTimeElapsed && isAppReady && !animationFinished) {
      Animated.parallel([
        // Smooth cinematic zoom out & fade
        Animated.timing(screenOpacity, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(screenScale, {
          toValue: 1.08,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setAnimationFinished(true);
        onAnimationComplete?.();
      });
    }
  }, [minTimeElapsed, isAppReady, animationFinished]);

  if (animationFinished) {
    return null;
  }

  const progressBarInterpolation = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View
      pointerEvents={minTimeElapsed && isAppReady ? "none" : "auto"}
      style={[
        styles.container,
        {
          opacity: screenOpacity,
          transform: [{ scale: screenScale }],
        },
      ]}
    >
      {/* Background Dark Obsidian Base */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["#05060A", "#0B0F19", "#030407"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      {/* Pulsing Cyan Radial Glow behind icon */}
      <Animated.View
        style={[
          styles.ambientGlowCyan,
          {
            transform: [{ scale: glowPulse }],
          },
        ]}
      />

      {/* Pulsing Indigo Radial Glow */}
      <Animated.View
        style={[
          styles.ambientGlowIndigo,
          {
            transform: [{ scale: glowPulse }],
          },
        ]}
      />

      {/* Centered Floating Content */}
      <View style={styles.content}>
        {/* Animated App Icon - Floating Transparent Neon Document */}
        <Animated.View
          style={[
            styles.iconWrapper,
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { translateY: logoBob },
              ],
            },
          ]}
        >
          <Image
            source={require("../assets/splash-icon.png")}
            style={styles.iconImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Animated Title & Subtitle Badge with Vector Icon */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.appName}>MY PDF APP</Text>
          <View style={styles.tagBadge}>
            <Zap size={11} color="#38BDF8" style={styles.badgeIcon} />
            <Text style={styles.tagText}>ALL-IN-ONE DOCUMENT ENGINE</Text>
          </View>
        </Animated.View>

        {/* Modern Shimmer Progress Bar */}
        <Animated.View
          style={[
            styles.progressContainer,
            {
              opacity: textOpacity,
            },
          ]}
        >
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: progressBarInterpolation },
              ]}
            >
              <LinearGradient
                colors={["#38BDF8", "#818CF8", "#A855F7"]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>
          <Text style={styles.loadingStatus}>INITIALIZING WORKSPACE...</Text>
        </Animated.View>
      </View>

      {/* Subtle Bottom Credit with Vector Icon */}
      <View style={styles.footer}>
        <Sparkles size={11} color="#475569" style={styles.footerIcon} />
        <Text style={styles.footerText}>Offline First • AI Powered</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#05060A",
  },
  ambientGlowCyan: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    top: height / 2 - 190,
    alignSelf: "center",
  },
  ambientGlowIndigo: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(129, 140, 248, 0.10)",
    top: height / 2 - 130,
    alignSelf: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    marginBottom: 20,
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 20,
  },
  iconImage: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center",
  },
  appName: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 3,
    textAlign: "center",
    marginBottom: 8,
  },
  tagBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
  },
  badgeIcon: {
    marginRight: 6,
  },
  tagText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#38BDF8",
    letterSpacing: 1.2,
  },
  progressContainer: {
    marginTop: 48,
    alignItems: "center",
    width: 200,
  },
  progressBarTrack: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  loadingStatus: {
    marginTop: 10,
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "#64748B",
    letterSpacing: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 36,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  footerIcon: {
    marginRight: 6,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#475569",
    letterSpacing: 0.8,
  },
});
