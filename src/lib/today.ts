import { getDoseLog, listSchedulesForProfile } from "@/db/queries";
import type { Medicine } from "@/db/types";
import { timeToMinutes, todayDateString } from "./date";

export type TodayDoseStatus = "taken" | "skipped" | "upcoming" | "missed";

export type TodayDose = {
  scheduleId: number;
  medicine: Medicine;
  timeOfDay: string;
  status: TodayDoseStatus;
};

const GRACE_MINUTES = 90;

export async function getTodayDoses(profileId: number, now = new Date()): Promise<TodayDose[]> {
  const schedules = await listSchedulesForProfile(profileId);
  const today = todayDateString(now);
  const dow = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const doses: TodayDose[] = [];
  for (const s of schedules) {
    const days = s.days_of_week.split(",").map(Number);
    if (!days.includes(dow)) continue;
    const log = await getDoseLog(s.id, today);
    let status: TodayDoseStatus;
    if (log) {
      status = log.status;
    } else if (nowMinutes - timeToMinutes(s.time_of_day) > GRACE_MINUTES) {
      status = "missed";
    } else {
      status = "upcoming";
    }
    doses.push({ scheduleId: s.id, medicine: s.medicine, timeOfDay: s.time_of_day, status });
  }
  doses.sort((a, b) => a.timeOfDay.localeCompare(b.timeOfDay));
  return doses;
}
