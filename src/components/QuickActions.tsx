import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useI18n } from "@/i18n/context";
import { colors, radius, spacing, type } from "@/theme";

const ACTIONS = [
  { key: "addMedicine" as const, icon: "add-circle" as const, tint: 0, href: "/medicine/add" as const },
  { key: "medicines" as const, icon: "medkit" as const, tint: 1, href: "/(tabs)/medicines" as const },
  { key: "history" as const, icon: "bar-chart" as const, tint: 2, href: "/(tabs)/history" as const },
  { key: "yourFamily" as const, icon: "people" as const, tint: 3, href: "/(tabs)/settings" as const },
];

export function QuickActions() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <View>
      <Text style={[type.smallMedium, { color: colors.textMuted, marginBottom: spacing.sm }]}>
        {t("quickActions")}
      </Text>
      <View style={styles.grid}>
        {ACTIONS.map((action) => {
          const tint = colors.scheduleTints[action.tint];
          return (
            <Pressable key={action.key} style={styles.tile} onPress={() => router.push(action.href)}>
              <View style={[styles.iconWrap, { backgroundColor: tint.bg }]}>
                <Ionicons name={action.icon} size={22} color={tint.fg} />
              </View>
              <Text style={[type.caption, styles.label]} numberOfLines={1}>
                {t(action.key)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tile: {
    alignItems: "center",
    gap: spacing.xs,
    width: "23%",
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: colors.textMuted,
    textTransform: "none",
    textAlign: "center",
  },
});
