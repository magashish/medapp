import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, type } from "@/theme";

export type BadgeTone = "success" | "danger" | "warning" | "muted" | "primary";

const TONES: Record<BadgeTone, { bg: string; fg: string }> = {
  success: { bg: colors.successLight, fg: colors.success },
  danger: { bg: colors.dangerLight, fg: colors.danger },
  warning: { bg: colors.warningLight, fg: colors.warning },
  muted: { bg: colors.border, fg: colors.textMuted },
  primary: { bg: colors.primaryLight, fg: colors.primaryDark },
};

export function Badge({ label, tone = "muted" }: { label: string; tone?: BadgeTone }) {
  const t = TONES[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }]}>
      <Text style={[type.caption, { color: t.fg, textTransform: "uppercase", letterSpacing: 0.3 }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
});
