import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getHistory } from "@/db/queries";
import type { DoseLog } from "@/db/types";

export function useDoseHistory(profileId: number | null, days = 30) {
  const [entries, setEntries] = useState<DoseLog[]>([]);
  const [takenCount, setTakenCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [adherence, setAdherence] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (profileId === null) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await getHistory(profileId, days);
    setEntries(data.entries);
    setTakenCount(data.taken);
    setTotal(data.total);
    setAdherence(data.percent);
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

  return { entries, loading, adherence, takenCount, total, refresh: load };
}
