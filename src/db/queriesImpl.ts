import { getDb } from "./client";
import type { DoseLog, DoseStatus, Medicine, MedicineWithSchedules, Profile, Relation, Schedule } from "./types";

export async function listProfiles(): Promise<Profile[]> {
  const db = await getDb();
  return db.getAllAsync<Profile>("SELECT * FROM profiles ORDER BY id ASC");
}

export async function getProfile(id: number): Promise<Profile | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Profile>("SELECT * FROM profiles WHERE id = ?", [id]);
  return row ?? null;
}

export async function createProfile(input: { name: string; relation: Relation; color: string }): Promise<Profile> {
  const db = await getDb();
  const result = await db.runAsync(
    "INSERT INTO profiles (name, relation, color) VALUES (?, ?, ?)",
    [input.name, input.relation, input.color]
  );
  return (await getProfile(result.lastInsertRowId))!;
}

export async function deleteProfile(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM profiles WHERE id = ?", [id]);
}

export async function listMedicines(profileId: number): Promise<MedicineWithSchedules[]> {
  const db = await getDb();
  const medicines = await db.getAllAsync<Medicine>(
    "SELECT * FROM medicines WHERE profile_id = ? AND active = 1 ORDER BY name ASC",
    [profileId]
  );
  const result: MedicineWithSchedules[] = [];
  for (const m of medicines) {
    const schedules = await listSchedules(m.id);
    result.push({ ...m, schedules });
  }
  return result;
}

export async function getMedicine(id: number): Promise<Medicine | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Medicine>("SELECT * FROM medicines WHERE id = ?", [id]);
  return row ?? null;
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
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO medicines (profile_id, name, strength, instructions, quantity_remaining, refill_threshold, dose_amount)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.profileId,
      input.name,
      input.strength,
      input.instructions,
      input.quantityRemaining,
      input.refillThreshold,
      input.doseAmount,
    ]
  );
  return (await getMedicine(result.lastInsertRowId))!;
}

export async function deleteMedicine(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync("UPDATE medicines SET active = 0 WHERE id = ?", [id]);
}

export async function adjustMedicineQuantity(id: number, delta: number): Promise<void> {
  const db = await getDb();
  const medicine = await getMedicine(id);
  if (!medicine) return;
  const next = Math.max(0, medicine.quantity_remaining + delta);
  await db.runAsync("UPDATE medicines SET quantity_remaining = ? WHERE id = ?", [next, id]);
}

export async function listSchedules(medicineId: number): Promise<Schedule[]> {
  const db = await getDb();
  return db.getAllAsync<Schedule>(
    "SELECT * FROM schedules WHERE medicine_id = ? ORDER BY time_of_day ASC",
    [medicineId]
  );
}

export async function listSchedulesForProfile(profileId: number): Promise<(Schedule & { medicine: Medicine })[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Schedule>(
    `SELECT s.* FROM schedules s
     JOIN medicines m ON m.id = s.medicine_id
     WHERE m.profile_id = ? AND m.active = 1`,
    [profileId]
  );
  const out: (Schedule & { medicine: Medicine })[] = [];
  for (const s of rows) {
    const medicine = await getMedicine(s.medicine_id);
    if (medicine) out.push({ ...s, medicine });
  }
  return out;
}

export async function createSchedule(input: {
  medicineId: number;
  timeOfDay: string;
  daysOfWeek: string;
}): Promise<Schedule> {
  const db = await getDb();
  const result = await db.runAsync(
    "INSERT INTO schedules (medicine_id, time_of_day, days_of_week) VALUES (?, ?, ?)",
    [input.medicineId, input.timeOfDay, input.daysOfWeek]
  );
  const row = await db.getFirstAsync<Schedule>("SELECT * FROM schedules WHERE id = ?", [result.lastInsertRowId]);
  return row!;
}

export async function setScheduleNotificationId(scheduleId: number, notificationId: string | null): Promise<void> {
  const db = await getDb();
  await db.runAsync("UPDATE schedules SET notification_id = ? WHERE id = ?", [notificationId, scheduleId]);
}

export async function getDoseLog(scheduleId: number, doseDate: string): Promise<DoseLog | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<DoseLog>(
    "SELECT * FROM dose_logs WHERE schedule_id = ? AND dose_date = ?",
    [scheduleId, doseDate]
  );
  return row ?? null;
}

export async function logDose(input: {
  scheduleId: number;
  medicineId: number;
  profileId: number;
  doseDate: string;
  timeOfDay: string;
  status: DoseStatus;
}): Promise<void> {
  const db = await getDb();
  const existing = await getDoseLog(input.scheduleId, input.doseDate);

  if (existing) {
    if (existing.status === input.status) return;
    await db.runAsync("UPDATE dose_logs SET status = ?, logged_at = datetime('now') WHERE id = ?", [
      input.status,
      existing.id,
    ]);
    if (existing.status === "taken" && input.status === "skipped") {
      const medicine = await getMedicine(input.medicineId);
      if (medicine) await adjustMedicineQuantity(input.medicineId, medicine.dose_amount);
    } else if (existing.status === "skipped" && input.status === "taken") {
      const medicine = await getMedicine(input.medicineId);
      if (medicine) await adjustMedicineQuantity(input.medicineId, -medicine.dose_amount);
    }
    return;
  }

  await db.runAsync(
    `INSERT INTO dose_logs (schedule_id, medicine_id, profile_id, dose_date, time_of_day, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [input.scheduleId, input.medicineId, input.profileId, input.doseDate, input.timeOfDay, input.status]
  );

  if (input.status === "taken") {
    const medicine = await getMedicine(input.medicineId);
    if (medicine) await adjustMedicineQuantity(input.medicineId, -medicine.dose_amount);
  }
}

export async function listDoseLogsSince(profileId: number, sinceDate: string): Promise<DoseLog[]> {
  const db = await getDb();
  return db.getAllAsync<DoseLog>(
    "SELECT * FROM dose_logs WHERE profile_id = ? AND dose_date >= ? ORDER BY dose_date DESC, time_of_day DESC",
    [profileId, sinceDate]
  );
}
