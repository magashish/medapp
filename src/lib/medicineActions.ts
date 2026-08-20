import {
  createMedicine,
  createSchedule,
  deleteMedicine,
  listSchedules,
  setScheduleNotificationId,
} from "@/db/queries";
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
  const medicine = await createMedicine({
    profileId: input.profileId,
    name: input.name,
    strength: input.strength,
    instructions: input.instructions,
    quantityRemaining: input.quantityRemaining,
    refillThreshold: input.refillThreshold,
    doseAmount: input.doseAmount,
  });

  for (const time of input.times) {
    const schedule = await createSchedule({
      medicineId: medicine.id,
      timeOfDay: time,
      daysOfWeek: input.daysOfWeek,
    });
    try {
      const notificationId = await scheduleNotificationsForSchedule(schedule, medicine);
      await setScheduleNotificationId(schedule.id, notificationId);
    } catch {
      // Notifications are best-effort; the dose still shows up in-app.
    }
  }
}

export async function removeMedicineWithSchedules(medicineId: number): Promise<void> {
  const schedules = await listSchedules(medicineId);
  for (const schedule of schedules) {
    await cancelScheduleNotifications(schedule).catch(() => {});
  }
  await deleteMedicine(medicineId);
}
