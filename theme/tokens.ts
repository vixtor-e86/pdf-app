// Single source of truth for the app's look & feel.
// Inspired by the modern PDFlex design system: vibrant coral accents, soft cards,
// crisp typography, and 100% local offline-first assets.

export const palette = {
  light: {
    bg: "#F7F8FA",
    card: "#FFFFFF",
    cardAlt: "#F1F3F6",
    text: "#16181E",
    textMuted: "#717886",
    primary: "#FF554D",
    primaryDark: "#E5463E",
    primarySoft: "#FFF0EF",
    primaryBorder: "#FFC5C1",
    darkPill: "#16181E",
    success: "#34B37E",
    successSoft: "#E8F8F1",
    error: "#FF4D4F",
    errorSoft: "#FFEAE8",
    border: "#ECEFF3",
    borderDashed: "#FFAEAA",
  },
  dark: {
    bg: "#101216",
    card: "#191C22",
    cardAlt: "#22262E",
    text: "#F3F5F8",
    textMuted: "#8E95A3",
    primary: "#FF665E",
    primaryDark: "#FF554D",
    primarySoft: "#2E1A19",
    primaryBorder: "#5A2B29",
    darkPill: "#FFFFFF",
    success: "#40C48B",
    successSoft: "#153327",
    error: "#FF6B6B",
    errorSoft: "#361D1D",
    border: "#262B34",
    borderDashed: "#5C2F2D",
  },
};

export type Palette = typeof palette.light;

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  pill: 999,
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const font = {
  size: {
    xs: 12,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    title: 26,
    hero: 30,
  },
  family: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semibold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
  },
};

export const softShadow = {
  shadowColor: "#000000",
  shadowOpacity: 0.04,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
};

export const cardShadow = {
  shadowColor: "#000000",
  shadowOpacity: 0.06,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 8 },
  elevation: 3,
};
