export const colors = {
  primary: "#22A55E",
  primaryDark: "#178449",
  primaryLight: "#E3F6EA",
  accent: "#E8722C",
  accentLight: "#FCE9DA",
  danger: "#E5484D",
  dangerLight: "#FBE8E7",
  warning: "#D9A017",
  warningLight: "#FDF0DC",
  success: "#22A55E",
  successLight: "#E3F6EA",
  text: "#1A2E22",
  textMuted: "#66766C",
  textFaint: "#96A39B",
  border: "#E6ECE7",
  borderStrong: "#CFDACF",
  background: "#F6FAF7",
  card: "#FFFFFF",
  white: "#FFFFFF",
  overlay: "rgba(15, 30, 22, 0.45)",
  // Pastel accents used to color-code the "Today" schedule cards, cycling by index.
  scheduleTints: [
    { bg: "#EAF2FF", fg: "#3B7DDB" },
    { bg: "#FFF6DD", fg: "#C08A12" },
    { bg: "#F1EAFB", fg: "#8B5CF6" },
    { bg: "#F1F3F4", fg: "#5B6B60" },
  ],
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

const FONT_BOLD = "Inter_700Bold";
const FONT_SEMIBOLD = "Inter_600SemiBold";
const FONT_REGULAR = "Inter_400Regular";

export const type = {
  display: { fontSize: 32, lineHeight: 40, fontFamily: FONT_BOLD },
  h1: { fontSize: 26, lineHeight: 33, fontFamily: FONT_BOLD },
  h2: { fontSize: 21, lineHeight: 27, fontFamily: FONT_BOLD },
  h3: { fontSize: 18, lineHeight: 24, fontFamily: FONT_SEMIBOLD },
  body: { fontSize: 17, lineHeight: 24, fontFamily: FONT_REGULAR },
  bodyMedium: { fontSize: 17, lineHeight: 24, fontFamily: FONT_SEMIBOLD },
  small: { fontSize: 14, lineHeight: 20, fontFamily: FONT_REGULAR },
  smallMedium: { fontSize: 14, lineHeight: 20, fontFamily: FONT_SEMIBOLD },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: FONT_SEMIBOLD },
} as const;

export const shadow = {
  card: {
    shadowColor: "#0B2016",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  raised: {
    shadowColor: "#0B2016",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;
