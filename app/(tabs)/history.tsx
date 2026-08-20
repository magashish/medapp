import React, { useMemo } from "react";
import { Share, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { useProfiles } from "@/state/ProfileContext";
import { useI18n } from "@/i18n/context";
import { useDoseHistory } from "@/hooks/useDoseHistory";
import { formatDoseDate, formatTime } from "@/lib/date";
import { colors, radius, spacing, type } from "@/theme";

export default function History() {
  const { activeProfile } = useProfiles();
  const { t } = useI18n();
  const { entries, loading, adherence, takenCount, total } = useDoseHistory(activeProfile?.id ?? null, 30);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof entries>();
    for (const e of entries) {
      const list = map.get(e.dose_date) ?? [];
      list.push(e);
      map.set(e.dose_date, list);
    }
    return Array.from(map.entries());
  }, [entries]);

  const handleShare = async () => {
    if (!activeProfile) return;
    const lines = [
      `${activeProfile.name} — ${t("doseHistory")} (${t("last30Days")})`,
      adherence !== null ? `${t("adherence")}: ${adherence}% (${takenCount}/${total})` : "",
      "",
      ...grouped
        .slice(0, 14)
        .map(
          ([date, items]) =>
            `${formatDoseDate(date)}: ` +
            items
              .map((i) => `${i.medicine?.name ?? "?"} ${formatTime(i.time_of_day)} - ${t(i.status)}`)
              .join(", ")
        ),
      "",
      "— via MedSathi",
    ].filter(Boolean);
    await Share.share({ message: lines.join("\n") });
  };

  return (
    <Screen>
      <ProfileHeader />

      <Card>
        <View style={styles.statRow}>
          <View>
            <Text style={[type.small, { color: colors.textMuted }]}>
              {t("adherence")} · {t("last30Days")}
            </Text>
            <Text style={[type.display, { color: colors.primary }]}>
              {adherence === null ? "—" : `${adherence}%`}
            </Text>
            {total > 0 ? (
              <Text style={[type.small, { color: colors.textMuted }]}>
                {takenCount}/{total} {t("doses")}
              </Text>
            ) : null}
          </View>
          <View style={styles.ringWrap}>
            <Ionicons name="pulse" size={32} color={colors.primary} />
          </View>
        </View>
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
                <Text style={[type.body, { flex: 1 }]}>
                  {entry.medicine?.name ?? "—"} · {formatTime(entry.time_of_day)}
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

const styles = StyleSheet.create({
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ringWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
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
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
