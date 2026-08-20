import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { TodayDose } from "@/lib/today";
import type { DoseStatus } from "@/db/types";
import { Badge, type BadgeTone } from "./Badge";
import { formatTime } from "@/lib/date";
import { useI18n } from "@/i18n/context";
import { colors, radius, shadow, spacing, type } from "@/theme";

const STATUS_TONE: Record<TodayDose["status"], BadgeTone> = {
  taken: "success",
  skipped: "muted",
  missed: "danger",
  upcoming: "primary",
};

export function DoseCard({
  dose,
  onMark,
}: {
  dose: TodayDose;
  onMark: (status: DoseStatus) => void;
}) {
  const { t } = useI18n();
  const isTaken = dose.status === "taken";
  const isSkipped = dose.status === "skipped";

  const press = (status: DoseStatus) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onMark(status);
  };

  return (
    <View style={[styles.card, shadow.card, dose.status === "missed" && styles.missedCard]}>
      <View style={styles.top}>
        <View style={styles.timeWrap}>
          <Ionicons name="time" size={16} color={colors.textMuted} />
          <Text style={[type.smallMedium, { color: colors.textMuted }]}>{formatTime(dose.timeOfDay)}</Text>
        </View>
        <Badge label={t(dose.status)} tone={STATUS_TONE[dose.status]} />
      </View>

      <Text style={type.h3}>
        {dose.medicine.name}
        {dose.medicine.strength ? ` · ${dose.medicine.strength}` : ""}
      </Text>
      {dose.medicine.instructions ? (
        <Text style={[type.small, { color: colors.textMuted }]}>{dose.medicine.instructions}</Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          onPress={() => press("taken")}
          style={[styles.actionBtn, isTaken ? styles.takenActive : styles.actionIdle]}
        >
          <Ionicons name="checkmark-circle" size={20} color={isTaken ? colors.white : colors.success} />
          <Text style={[type.smallMedium, { color: isTaken ? colors.white : colors.success }]}>
            {t("markTaken")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => press("skipped")}
          style={[styles.actionBtn, isSkipped ? styles.skipActive : styles.actionIdle]}
        >
          <Ionicons name="close-circle" size={20} color={isSkipped ? colors.white : colors.textMuted} />
          <Text style={[type.smallMedium, { color: isSkipped ? colors.white : colors.textMuted }]}>
            {t("skip")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  missedCard: {
    borderColor: colors.danger,
    borderWidth: 1.5,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  actionIdle: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  takenActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  skipActive: {
    backgroundColor: colors.textMuted,
    borderColor: colors.textMuted,
  },
});
