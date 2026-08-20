export const colors = {
  primary: "#0F7A4F",
  primaryDark: "#0B5C3B",
  primaryLight: "#E6F4EC",
  accent: "#E8722C",
  accentLight: "#FCE9DA",
  danger: "#DC2626",
  dangerLight: "#FBE8E7",
  warning: "#D97706",
  warningLight: "#FDF0DC",
  success: "#16A34A",
  successLight: "#E4F5E9",
  text: "#1A2E22",
  textMuted: "#5B6B60",
  textFaint: "#8A9A8F",
  border: "#E2E8E4",
  borderStrong: "#C7D3CA",
  background: "#F4F8F5",
  card: "#FFFFFF",
  white: "#FFFFFF",
  overlay: "rgba(15, 30, 22, 0.45)",
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  raised: {
    shadowColor: "#0B2016",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;
