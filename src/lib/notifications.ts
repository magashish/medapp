import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Medicine, Schedule } from "@/db/types";
import { getNotificationIds, setNotificationIds, clearNotificationIds } from "./notificationRegistry";

export const DOSE_CATEGORY = "dose-reminder";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationSetup(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  let granted = settings.granted;
  if (!granted) {
    const req = await Notifications.requestPermissionsAsync();
    granted = req.granted;
  }

  await Notifications.setNotificationCategoryAsync(DOSE_CATEGORY, [
    {
      identifier: "TAKEN",
      buttonTitle: "Taken",
      options: { opensAppToForeground: false },
    },
    {
      identifier: "SKIP",
      buttonTitle: "Skip",
      options: { opensAppToForeground: false },
    },
  ]);

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("dose-reminders", {
      name: "Dose reminders",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return granted;
}

export async function cancelScheduleNotifications(scheduleId: number): Promise<void> {
  const ids = await getNotificationIds(scheduleId);
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})));
  await clearNotificationIds(scheduleId);
}

export async function scheduleNotificationsForSchedule(schedule: Schedule, medicine: Medicine): Promise<void> {
  await cancelScheduleNotifications(schedule.id);

  const [hour, minute] = schedule.time_of_day.split(":").map(Number);
  const days = schedule.days_of_week.split(",").map(Number);
  const ids: string[] = [];

  for (const dow of days) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time for ${medicine.name}${medicine.strength ? " " + medicine.strength : ""}`,
        body: medicine.instructions || "Tap to open MedMate and mark this dose.",
        sound: "default",
        categoryIdentifier: DOSE_CATEGORY,
        data: {
          scheduleId: schedule.id,
          timeOfDay: schedule.time_of_day,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: dow + 1,
        hour,
        minute,
      },
    });
    ids.push(id);
  }

  await setNotificationIds(schedule.id, ids);
}
