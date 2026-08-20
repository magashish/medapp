import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { ProfileHeader } from "@/components/ProfileHeader";
import { DoseCard } from "@/components/DoseCard";
import { LowStockBanner } from "@/components/LowStockBanner";
import { useProfiles } from "@/state/ProfileContext";
import { useI18n } from "@/i18n/context";
import { useTodayDoses } from "@/hooks/useTodayDoses";
import { listMedicines } from "@/db/queries";
import type { Medicine } from "@/db/types";
import { colors, spacing, type } from "@/theme";

export default function Today() {
  const { activeProfile } = useProfiles();
  const { t } = useI18n();
  const { doses, loading, mark } = useTodayDoses(activeProfile?.id ?? null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const loadMedicines = useCallback(async () => {
    if (!activeProfile) return;
    setMedicines(await listMedicines(activeProfile.id));
  }, [activeProfile]);

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  useFocusEffect(
    useCallback(() => {
      loadMedicines();
    }, [loadMedicines])
  );

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <Screen>
      <ProfileHeader subtitle={todayLabel} />
      <LowStockBanner medicines={medicines} />

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : doses.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="checkmark-done-circle-outline" size={48} color={colors.textFaint} />
          <Text style={[type.body, { color: colors.textMuted, textAlign: "center" }]}>
            {t("noDosesToday")}
          </Text>
        </View>
      ) : (
        doses.map((dose) => (
          <DoseCard key={dose.scheduleId} dose={dose} onMark={(status) => mark(dose, status)} />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.huge,
  },
});
