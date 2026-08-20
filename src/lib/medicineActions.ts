import { createMedicineWithSchedules, deleteMedicine } from "@/db/queries";
import type { MedicineWithSchedules } from "@/db/types";
import { cancelScheduleNotifications, scheduleNotificationsForSchedule } from "./notifications";

export async function addMedicineWithSchedules(input: {
  profileId: number;
  name: string;
  strength: string;
  instructions: string;
  quantityRemaining: number;
  refillThreshold: number;
  doseAmount: number;
  times: string[];
  daysOfWeek: string;
}): Promise<void> {
  const medicine = await createMedicineWithSchedules(input);

  for (const schedule of medicine.schedules) {
    try {
      await scheduleNotificationsForSchedule(schedule, medicine);
    } catch {
      // Notifications are best-effort; the dose still shows up in-app and via server push.
    }
  }
}

export async function removeMedicineWithSchedules(medicine: MedicineWithSchedules): Promise<void> {
  for (const schedule of medicine.schedules) {
    await cancelScheduleNotifications(schedule.id).catch(() => {});
  }
  await deleteMedicine(medicine.id);
}
