import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getTodayDoses, type TodayDose } from "@/lib/today";
import { logDose } from "@/db/queries";
import { todayDateString } from "@/lib/date";
import type { DoseStatus } from "@/db/types";

export function useTodayDoses(profileId: number | null) {
  const [doses, setDoses] = useState<TodayDose[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (profileId === null) {
      setDoses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const rows = await getTodayDoses(profileId);
    setDoses(rows);
    setLoading(false);
  }, [profileId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const mark = useCallback(
    async (dose: TodayDose, status: DoseStatus) => {
      if (profileId === null) return;
      await logDose({
        scheduleId: dose.scheduleId,
        medicineId: dose.medicine.id,
        profileId,
        doseDate: todayDateString(),
        timeOfDay: dose.timeOfDay,
        status,
      });
      await refresh();
    },
    [profileId, refresh]
  );

  return { doses, loading, refresh, mark };
}
