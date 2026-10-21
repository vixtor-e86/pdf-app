import "../global.css"; // NativeWind
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { LogBox, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { ThemeProvider, useTheme } from "../theme/ThemeContext";
import { MotionSplashScreen } from "../components/MotionSplashScreen";

// Prevent native splash screen from auto-hiding prematurely
SplashScreen.preventAutoHideAsync().catch(() => {});

// Suppress known development warnings from interrupting the UI
LogBox.ignoreLogs([
  "SafeAreaView has been deprecated",
  "Cannot connect to Expo CLI",
]);

function Shell() {
  const { theme, isDark } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }} />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [showMotionSplash, setShowMotionSplash] = useState(true);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Shell />
          {showMotionSplash && (
            <MotionSplashScreen
              isAppReady={Boolean(fontsLoaded)}
              onAnimationComplete={() => setShowMotionSplash(false)}
            />
          )}
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
