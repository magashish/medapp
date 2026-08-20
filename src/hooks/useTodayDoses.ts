import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getTodayDoses, logDose, type TodayDose } from "@/db/queries";
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
      await logDose(dose.scheduleId, status);
      await refresh();
    },
    [refresh]
  );

  return { doses, loading, refresh, mark };
}
