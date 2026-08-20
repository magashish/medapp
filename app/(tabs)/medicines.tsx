import React, { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { LowStockBanner } from "@/components/LowStockBanner";
import { useProfiles } from "@/state/ProfileContext";
import { useI18n } from "@/i18n/context";
import { listMedicines } from "@/db/queries";
import { removeMedicineWithSchedules } from "@/lib/medicineActions";
import type { MedicineWithSchedules } from "@/db/types";
import { formatTime } from "@/lib/date";
import { isLowStock, isOutOfStock } from "@/lib/stock";
import { colors, radius, shadow, spacing, type } from "@/theme";

export default function Medicines() {
  const router = useRouter();
  const { activeProfile } = useProfiles();
  const { t } = useI18n();
  const [medicines, setMedicines] = useState<MedicineWithSchedules[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!activeProfile) return;
    setLoading(true);
    setMedicines(await listMedicines(activeProfile.id));
    setLoading(false);
  }, [activeProfile]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleDelete = (medicineId: number, name: string) => {
    Alert.alert(t("deleteMedicineConfirm"), name, [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          await removeMedicineWithSchedules(medicineId);
          load();
        },
      },
    ]);
  };

  return (
    <Screen>
      <ProfileHeader />
      <LowStockBanner medicines={medicines} />

      {!loading && medicines.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="medkit-outline" size={48} color={colors.textFaint} />
          <Text style={[type.body, { color: colors.textMuted, textAlign: "center" }]}>
            {t("noMedicinesYet")}
          </Text>
        </View>
      ) : (
        medicines.map((m) => (
          <View key={m.id} style={[styles.card, shadow.card]}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={type.h3}>
                  {m.name}
                  {m.strength ? ` · ${m.strength}` : ""}
                </Text>
                {m.instructions ? (
                  <Text style={[type.small, { color: colors.textMuted }]}>{m.instructions}</Text>
                ) : null}
              </View>
              <Pressable onPress={() => handleDelete(m.id, m.name)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </Pressable>
            </View>

            <View style={styles.timesRow}>
              {m.schedules.map((s) => (
                <Badge key={s.id} label={formatTime(s.time_of_day)} tone="primary" />
              ))}
            </View>

            <View style={styles.stockRow}>
              <Text style={[type.small, { color: colors.textMuted }]}>
                {m.quantity_remaining} {t("remaining")} · {m.dose_amount} {t("perDose")}
              </Text>
              {isOutOfStock(m) ? (
                <Badge label={t("outOfStock")} tone="danger" />
              ) : isLowStock(m) ? (
                <Badge label={t("lowStock")} tone="warning" />
              ) : null}
            </View>
          </View>
        ))
      )}

      <Button
        label={t("addMedicine")}
        icon="add-circle"
        size="lg"
        fullWidth
        onPress={() => router.push("/medicine/add")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.huge,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.dangerLight,
  },
  timesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  stockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
