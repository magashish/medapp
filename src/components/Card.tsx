import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, shadow, spacing } from "@/theme";

export function Card({
  children,
  style,
  flat,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  flat?: boolean;
}) {
  return <View style={[styles.card, !flat && shadow.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
});
