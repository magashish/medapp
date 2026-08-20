// In-memory fallback used only on web, where expo-sqlite's OPFS worker isn't
// available in this dev environment. Native builds use sqliteQueries.ts.
import type { DoseLog, DoseStatus, Medicine, MedicineWithSchedules, Profile, Relation, Schedule } from "./types";

let nextProfileId = 1;
let nextMedicineId = 1;
let nextScheduleId = 1;
let nextDoseLogId = 1;

const profiles: Profile[] = [];
const medicines: Medicine[] = [];
const schedules: Schedule[] = [];
const doseLogs: DoseLog[] = [];

const now = () => new Date().toISOString();

export async function listProfiles(): Promise<Profile[]> {
  return [...profiles].sort((a, b) => a.id - b.id);
}

export async function getProfile(id: number): Promise<Profile | null> {
  return profiles.find((p) => p.id === id) ?? null;
}

export async function createProfile(input: { name: string; relation: Relation; color: string }): Promise<Profile> {
  const profile: Profile = { id: nextProfileId++, name: input.name, relation: input.relation, color: input.color, created_at: now() };
  profiles.push(profile);
  return profile;
}

export async function deleteProfile(id: number): Promise<void> {
  const idx = profiles.findIndex((p) => p.id === id);
  if (idx >= 0) profiles.splice(idx, 1);
  const medIds = medicines.filter((m) => m.profile_id === id).map((m) => m.id);
  for (const medId of medIds) await deleteMedicineHard(medId);
}

async function deleteMedicineHard(id: number): Promise<void> {
  const idx = medicines.findIndex((m) => m.id === id);
  if (idx >= 0) medicines.splice(idx, 1);
  const schedIds = schedules.filter((s) => s.medicine_id === id).map((s) => s.id);
  for (const schedId of schedIds) {
    const sIdx = schedules.findIndex((s) => s.id === schedId);
    if (sIdx >= 0) schedules.splice(sIdx, 1);
    for (let i = doseLogs.length - 1; i >= 0; i--) {
      if (doseLogs[i].schedule_id === schedId) doseLogs.splice(i, 1);
    }
  }
}

export async function listMedicines(profileId: number): Promise<MedicineWithSchedules[]> {
  const rows = medicines
    .filter((m) => m.profile_id === profileId && m.active === 1)
    .sort((a, b) => a.name.localeCompare(b.name));
  const result: MedicineWithSchedules[] = [];
  for (const m of rows) {
    result.push({ ...m, schedules: await listSchedules(m.id) });
  }
  return result;
}

export async function getMedicine(id: number): Promise<Medicine | null> {
  return medicines.find((m) => m.id === id) ?? null;
}

export async function createMedicine(input: {
  profileId: number;
  name: string;
  strength: string;
  instructions: string;
  quantityRemaining: number;
  refillThreshold: number;
  doseAmount: number;
}): Promise<Medicine> {
  const medicine: Medicine = {
    id: nextMedicineId++,
    profile_id: input.profileId,
    name: input.name,
    strength: input.strength || null,
    instructions: input.instructions || null,
    quantity_remaining: input.quantityRemaining,
    refill_threshold: input.refillThreshold,
    dose_amount: input.doseAmount,
    active: 1,
    created_at: now(),
  };
  medicines.push(medicine);
  return medicine;
}

export async function deleteMedicine(id: number): Promise<void> {
  const medicine = medicines.find((m) => m.id === id);
  if (medicine) medicine.active = 0;
}

export async function adjustMedicineQuantity(id: number, delta: number): Promise<void> {
  const medicine = medicines.find((m) => m.id === id);
  if (!medicine) return;
  medicine.quantity_remaining = Math.max(0, medicine.quantity_remaining + delta);
}

export async function listSchedules(medicineId: number): Promise<Schedule[]> {
  return schedules
    .filter((s) => s.medicine_id === medicineId)
    .sort((a, b) => a.time_of_day.localeCompare(b.time_of_day));
}

export async function listSchedulesForProfile(profileId: number): Promise<(Schedule & { medicine: Medicine })[]> {
  const activeMedIds = new Set(
    medicines.filter((m) => m.profile_id === profileId && m.active === 1).map((m) => m.id)
  );
  const out: (Schedule & { medicine: Medicine })[] = [];
  for (const s of schedules) {
    if (!activeMedIds.has(s.medicine_id)) continue;
    const medicine = await getMedicine(s.medicine_id);
    if (medicine) out.push({ ...s, medicine });
  }
  return out;
}

export async function createSchedule(input: { medicineId: number; timeOfDay: string; daysOfWeek: string }): Promise<Schedule> {
  const schedule: Schedule = {
    id: nextScheduleId++,
    medicine_id: input.medicineId,
    time_of_day: input.timeOfDay,
    days_of_week: input.daysOfWeek,
    notification_id: null,
    created_at: now(),
  };
  schedules.push(schedule);
  return schedule;
}

export async function setScheduleNotificationId(scheduleId: number, notificationId: string | null): Promise<void> {
  const schedule = schedules.find((s) => s.id === scheduleId);
  if (schedule) schedule.notification_id = notificationId;
}

export async function getDoseLog(scheduleId: number, doseDate: string): Promise<DoseLog | null> {
  return doseLogs.find((d) => d.schedule_id === scheduleId && d.dose_date === doseDate) ?? null;
}

export async function logDose(input: {
  scheduleId: number;
  medicineId: number;
  profileId: number;
  doseDate: string;
  timeOfDay: string;
  status: DoseStatus;
}): Promise<void> {
  const existing = await getDoseLog(input.scheduleId, input.doseDate);

  if (existing) {
    if (existing.status === input.status) return;
    const prevStatus = existing.status;
    existing.status = input.status;
    existing.logged_at = now();
    const medicine = await getMedicine(input.medicineId);
    if (medicine) {
      if (prevStatus === "taken" && input.status === "skipped") await adjustMedicineQuantity(input.medicineId, medicine.dose_amount);
      else if (prevStatus === "skipped" && input.status === "taken") await adjustMedicineQuantity(input.medicineId, -medicine.dose_amount);
    }
    return;
  }

  doseLogs.push({
    id: nextDoseLogId++,
    schedule_id: input.scheduleId,
    medicine_id: input.medicineId,
    profile_id: input.profileId,
    dose_date: input.doseDate,
    time_of_day: input.timeOfDay,
    status: input.status,
    logged_at: now(),
  });

  if (input.status === "taken") {
    const medicine = await getMedicine(input.medicineId);
    if (medicine) await adjustMedicineQuantity(input.medicineId, -medicine.dose_amount);
  }
}

export async function listDoseLogsSince(profileId: number, sinceDate: string): Promise<DoseLog[]> {
  return doseLogs
    .filter((d) => d.profile_id === profileId && d.dose_date >= sinceDate)
    .sort((a, b) => (a.dose_date === b.dose_date ? b.time_of_day.localeCompare(a.time_of_day) : b.dose_date.localeCompare(a.dose_date)));
}
