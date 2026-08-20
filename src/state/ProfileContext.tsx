import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { listProfiles } from "@/db/queries";
import type { Profile } from "@/db/types";
import { useAuth } from "./AuthContext";

const ACTIVE_PROFILE_KEY = "medapp.activeProfileId";

type Ctx = {
  profiles: Profile[];
  activeProfile: Profile | null;
  setActiveProfileId: (id: number) => void;
  refreshProfiles: () => Promise<void>;
  loading: boolean;
};

const ProfileContext = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfiles = useCallback(async () => {
    if (!user) {
      setProfiles([]);
      return;
    }
    const rows = await listProfiles();
    setProfiles(rows);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setProfiles([]);
      setActiveId(null);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      await refreshProfiles();
      const stored = await AsyncStorage.getItem(ACTIVE_PROFILE_KEY);
      if (stored) setActiveId(Number(stored));
      setLoading(false);
    })();
  }, [user, authLoading, refreshProfiles]);

  useEffect(() => {
    if (loading) return;
    if (activeId === null && profiles.length > 0) {
      setActiveId(profiles[0].id);
    }
    if (activeId !== null && !profiles.some((p) => p.id === activeId)) {
      setActiveId(profiles.length > 0 ? profiles[0].id : null);
    }
  }, [profiles, activeId, loading]);

  const setActiveProfileId = useCallback((id: number) => {
    setActiveId(id);
    AsyncStorage.setItem(ACTIVE_PROFILE_KEY, String(id)).catch(() => {});
  }, []);

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeId) ?? null,
    [profiles, activeId]
  );

  const value = useMemo(
    () => ({ profiles, activeProfile, setActiveProfileId, refreshProfiles, loading }),
    [profiles, activeProfile, setActiveProfileId, refreshProfiles, loading]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfiles(): Ctx {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfiles must be used within ProfileProvider");
  return ctx;
}
