import React, { useMemo, useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { ProgressRing } from "@/components/ProgressRing";
import { WeekStrip } from "@/components/WeekStrip";
import { useProfiles } from "@/state/ProfileContext";
import { useI18n } from "@/i18n/context";
import { useDoseHistory } from "@/hooks/useDoseHistory";
import { formatDoseDate, formatTime } from "@/lib/date";
import { colors, radius, spacing, type } from "@/theme";

type Period = "week" | "month";

export default function History() {
  const { activeProfile } = useProfiles();
  const { t } = useI18n();
  const [period, setPeriod] = useState<Period>("month");
  const { entries, loading, adherence, takenCount, total } = useDoseHistory(
    activeProfile?.id ?? null,
    period === "week" ? 7 : 30
  );

  const grouped = useMemo(() => {
    const map = new Map<string, typeof entries>();
    for (const e of entries) {
      const list = map.get(e.dose_date) ?? [];
      list.push(e);
      map.set(e.dose_date, list);
    }
    return Array.from(map.entries());
  }, [entries]);

  const encouragement =
    adherence === null ? null : adherence >= 80 ? t("greatJob") : adherence >= 50 ? t("keepGoing") : t("needsAttention");

  const handleShare = async () => {
    if (!activeProfile) return;
    const periodLabel = period === "week" ? t("thisWeek") : t("last30Days");
    const lines = [
      `${activeProfile.name} — ${t("doseHistory")} (${periodLabel})`,
      adherence !== null ? `${t("adherence")}: ${adherence}% (${takenCount}/${total})` : "",
      "",
      ...grouped
        .slice(0, 14)
        .map(
          ([date, items]) =>
            `${formatDoseDate(date)}: ` +
            items
              .map((i) => `${i.medicine_name ?? "?"} ${formatTime(i.time_of_day)} - ${t(i.status)}`)
              .join(", ")
        ),
      "",
      "— via MedMate",
    ].filter(Boolean);
    await Share.share({ message: lines.join("\n") });
  };

  return (
    <Screen>
      <ProfileHeader />

      <Card>
        <View style={styles.periodRow}>
          <Text style={[type.smallMedium, { color: colors.textMuted }]}>{t("adherence")}</Text>
          <View style={styles.periodToggle}>
            <PeriodButton label={t("thisWeek")} active={period === "week"} onPress={() => setPeriod("week")} />
            <PeriodButton label={t("thisMonth")} active={period === "month"} onPress={() => setPeriod("month")} />
          </View>
        </View>

        <View style={styles.ringRow}>
          <ProgressRing percent={adherence ?? 0} size={116} strokeWidth={11}>
            <Text style={[type.h1, { color: colors.primary }]}>{adherence === null ? "—" : `${adherence}%`}</Text>
            {encouragement ? (
              <Text style={[type.caption, { color: colors.textMuted, textTransform: "none" }]}>
                {encouragement}
              </Text>
            ) : null}
          </ProgressRing>
          <View style={{ flex: 1 }}>
            {total > 0 ? (
              <Text style={[type.body, { color: colors.textMuted }]}>
                {takenCount}/{total} {t("dosesTaken")}
              </Text>
            ) : null}
          </View>
        </View>

        <WeekStrip entries={entries} />
      </Card>

      <Button
        label={t("shareReport")}
        icon="share-social"
        variant="secondary"
        fullWidth
        onPress={handleShare}
        disabled={total === 0}
      />

      {!loading && grouped.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={48} color={colors.textFaint} />
          <Text style={[type.body, { color: colors.textMuted, textAlign: "center" }]}>{t("noHistory")}</Text>
        </View>
      ) : (
        grouped.map(([date, items]) => (
          <View key={date} style={styles.dayGroup}>
            <Text style={[type.smallMedium, { color: colors.textMuted }]}>{formatDoseDate(date)}</Text>
            {items.map((entry) => (
              <View key={entry.id} style={styles.entryRow}>
                <Ionicons
                  name={entry.status === "taken" ? "checkmark-circle" : "close-circle"}
                  size={20}
                  color={entry.status === "taken" ? colors.success : colors.textFaint}
                />
                <Text style={[type.body, { flex: 1 }]}>
                  {entry.medicine_name ?? "—"} · {formatTime(entry.time_of_day)}
                </Text>
                <Badge label={t(entry.status)} tone={entry.status === "taken" ? "success" : "muted"} />
              </View>
            ))}
          </View>
        ))
      )}
    </Screen>
  );
}

function PeriodButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.periodBtn, active && styles.periodBtnActive]}>
      <Text style={[type.smallMedium, { color: active ? colors.white : colors.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  periodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  periodToggle: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: radius.full,
    padding: 3,
  },
  periodBtn: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
    borderRadius: radius.full,
  },
  periodBtnActive: {
    backgroundColor: colors.primary,
  },
  ringRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  empty: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.huge,
  },
  dayGroup: {
    gap: spacing.xs,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
