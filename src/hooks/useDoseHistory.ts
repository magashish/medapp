import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { listDoseLogsSince, getMedicine } from "@/db/queries";
import type { DoseLog, Medicine } from "@/db/types";
import { dateStringDaysAgo } from "@/lib/date";

export type HistoryEntry = DoseLog & { medicine: Medicine | null };

export function useDoseHistory(profileId: number | null, days = 30) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (profileId === null) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const logs = await listDoseLogsSince(profileId, dateStringDaysAgo(days));
    const medicineCache = new Map<number, Medicine | null>();
    const out: HistoryEntry[] = [];
    for (const log of logs) {
      if (!medicineCache.has(log.medicine_id)) {
        medicineCache.set(log.medicine_id, await getMedicine(log.medicine_id));
      }
      out.push({ ...log, medicine: medicineCache.get(log.medicine_id) ?? null });
    }
    setEntries(out);
    setLoading(false);
  }, [profileId, days]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const takenCount = entries.filter((e) => e.status === "taken").length;
  const total = entries.length;
  const adherence = total === 0 ? null : Math.round((takenCount / total) * 100);

  return { entries, loading, adherence, takenCount, total, refresh: load };
}
