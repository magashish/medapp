import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { ProfileHeader } from "@/components/ProfileHeader";
import { DoseCard } from "@/components/DoseCard";
import { LowStockBanner } from "@/components/LowStockBanner";
import { QuickActions } from "@/components/QuickActions";
import { useProfiles } from "@/state/ProfileContext";
import { useAuth } from "@/state/AuthContext";
import { useI18n } from "@/i18n/context";
import { useTodayDoses } from "@/hooks/useTodayDoses";
import { listMedicines } from "@/db/queries";
import type { Medicine } from "@/db/types";
import { colors, spacing, type } from "@/theme";

function greetingKey(hour: number): "goodMorning" | "goodAfternoon" | "goodEvening" {
  if (hour < 12) return "goodMorning";
  if (hour < 17) return "goodAfternoon";
  return "goodEvening";
}

export default function Today() {
  const { activeProfile } = useProfiles();
  const { user } = useAuth();
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

  const now = new Date();
  const todayLabel = now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  const firstName = user?.name?.split(" ")[0];

  return (
    <Screen>
      <View>
        <Text style={[type.h1]}>
          {t(greetingKey(now.getHours()))}
          {firstName ? `, ${firstName}` : ""} 👋
        </Text>
        <Text style={[type.small, { color: colors.textMuted, marginTop: spacing.xs }]}>{todayLabel}</Text>
      </View>

      <ProfileHeader />
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
        doses.map((dose, i) => (
          <DoseCard key={dose.scheduleId} dose={dose} index={i} onMark={(status) => mark(dose, status)} />
        ))
      )}

      <QuickActions />
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
