import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Medicine } from "@/db/types";
import { isLowStock, isOutOfStock } from "@/lib/stock";
import { useI18n } from "@/i18n/context";
import { colors, radius, spacing, type } from "@/theme";

export function LowStockBanner({ medicines }: { medicines: Medicine[] }) {
  const { t } = useI18n();
  const low = medicines.filter((m) => isLowStock(m) || isOutOfStock(m));
  if (low.length === 0) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="alert-circle" size={22} color={colors.warning} />
      <View style={{ flex: 1 }}>
        {low.map((m) => (
          <Text key={m.id} style={[type.smallMedium, { color: colors.warning }]}>
            {m.name} — {isOutOfStock(m) ? t("outOfStock") : t("lowStock")} ({m.quantity_remaining} {t("remaining")})
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.warningLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "#F3D9A6",
  },
});
