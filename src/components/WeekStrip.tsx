import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { DoseLog } from "@/db/types";
import { useI18n } from "@/i18n/context";
import { colors, radius, spacing, type } from "@/theme";

type DayState = "taken" | "missed" | "pending" | "future";

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export function WeekStrip({ entries }: { entries: DoseLog[] }) {
  const { t } = useI18n();

  const days = useMemo(() => {
    const today = new Date();
    const todayIso = isoDate(today);
    // Monday-start week containing today.
    const mondayOffset = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = isoDate(d);
      const dayEntries = entries.filter((e) => e.dose_date === iso);

      let state: DayState;
      if (iso > todayIso) state = "future";
      else if (dayEntries.length === 0) state = "pending";
      else if (dayEntries.some((e) => e.status === "skipped")) state = "missed";
      else state = "taken";

      return { key: DAY_KEYS[i], iso, state, isToday: iso === todayIso };
    });
  }, [entries]);

  return (
    <View style={styles.row}>
      {days.map((day) => (
        <View key={day.iso} style={styles.col}>
          <Text style={[type.caption, { color: colors.textFaint, textTransform: "none" }]}>
            {t(day.key).slice(0, 1)}
          </Text>
          <View
            style={[
              styles.dot,
              day.state === "taken" && styles.dotTaken,
              day.state === "missed" && styles.dotMissed,
              day.isToday && styles.dotToday,
            ]}
          >
            {day.state === "taken" ? (
              <Ionicons name="checkmark" size={14} color={colors.white} />
            ) : day.state === "missed" ? (
              <Ionicons name="close" size={14} color={colors.white} />
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  col: {
    alignItems: "center",
    gap: spacing.xs,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  dotTaken: {
    backgroundColor: colors.success,
  },
  dotMissed: {
    backgroundColor: colors.danger,
  },
  dotToday: {
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
});
