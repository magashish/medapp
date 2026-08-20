import { apiFetch } from "@/api/client";
import type { DoseLog, DoseStatus, Medicine, MedicineWithSchedules, Profile, Relation } from "./types";

export type TodayDose = {
  scheduleId: number;
  timeOfDay: string;
  status: "taken" | "skipped" | "upcoming" | "missed";
  medicine: Pick<Medicine, "id" | "name" | "strength" | "instructions">;
};

type ApiTodayDose = {
  schedule_id: number;
  medicine_id: number;
  medicine_name: string;
  medicine_strength: string | null;
  medicine_instructions: string | null;
  time_of_day: string;
  status: TodayDose["status"];
};

export async function listProfiles(): Promise<Profile[]> {
  const { family_members } = await apiFetch<{ family_members: Profile[] }>("/family-members");
  return family_members;
}

export async function createProfile(input: { name: string; relation: Relation; color: string }): Promise<Profile> {
  const { family_member } = await apiFetch<{ family_member: Profile }>("/family-members", {
    method: "POST",
    body: input,
  });
  return family_member;
}

export async function listMedicines(profileId: number): Promise<MedicineWithSchedules[]> {
  const { medicines } = await apiFetch<{ medicines: MedicineWithSchedules[] }>(
    `/family-members/${profileId}/medicines`
  );
  return medicines;
}

export async function createMedicineWithSchedules(input: {
  profileId: number;
  name: string;
  strength: string;
  instructions: string;
  quantityRemaining: number;
  refillThreshold: number;
  doseAmount: number;
  times: string[];
  daysOfWeek: string;
}): Promise<MedicineWithSchedules> {
  const { medicine } = await apiFetch<{ medicine: MedicineWithSchedules }>(
    `/family-members/${input.profileId}/medicines`,
    {
      method: "POST",
      body: {
        name: input.name,
        strength: input.strength,
        instructions: input.instructions,
        quantity_remaining: input.quantityRemaining,
        refill_threshold: input.refillThreshold,
        dose_amount: input.doseAmount,
        schedules: input.times.map((time_of_day) => ({
          time_of_day,
          days_of_week: input.daysOfWeek,
        })),
      },
    }
  );
  return medicine;
}

export async function deleteMedicine(medicineId: number): Promise<void> {
  await apiFetch(`/medicines/${medicineId}`, { method: "DELETE" });
}

export async function getTodayDoses(profileId: number): Promise<TodayDose[]> {
  const { doses } = await apiFetch<{ doses: ApiTodayDose[] }>(`/family-members/${profileId}/today`);
  return doses.map((d) => ({
    scheduleId: d.schedule_id,
    timeOfDay: d.time_of_day,
    status: d.status,
    medicine: {
      id: d.medicine_id,
      name: d.medicine_name,
      strength: d.medicine_strength,
      instructions: d.medicine_instructions,
    },
  }));
}

export async function logDose(scheduleId: number, status: DoseStatus): Promise<void> {
  await apiFetch(`/schedules/${scheduleId}/log`, { method: "POST", body: { status } });
}

export async function getHistory(
  profileId: number,
  days: number
): Promise<{ entries: DoseLog[]; taken: number; total: number; percent: number | null }> {
  const data = await apiFetch<{
    dose_logs: DoseLog[];
    adherence: { taken: number; total: number; percent: number | null };
  }>(`/family-members/${profileId}/history?days=${days}`);

  return { entries: data.dose_logs, ...data.adherence };
}

export async function inviteCaregiver(
  profileId: number,
  email: string
): Promise<{ status: "linked" | "pending"; message: string }> {
  return apiFetch(`/family-members/${profileId}/invites`, {
    method: "POST",
    body: { email },
  });
}

export type FamilyMemberUser = { id: number; name: string; email: string; role: "owner" | "caregiver" };

export async function listMembers(profileId: number): Promise<FamilyMemberUser[]> {
  const { members } = await apiFetch<{ members: FamilyMemberUser[] }>(`/family-members/${profileId}/members`);
  return members;
}

export async function registerDeviceToken(expoPushToken: string, platform: string): Promise<void> {
  await apiFetch("/device-tokens", {
    method: "POST",
    body: { expo_push_token: expoPushToken, platform },
  });
}
