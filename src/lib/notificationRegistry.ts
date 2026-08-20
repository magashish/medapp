import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "medapp.scheduleNotificationIds";

async function readMap(): Promise<Record<string, string[]>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function writeMap(map: Record<string, string[]>): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export async function getNotificationIds(scheduleId: number): Promise<string[]> {
  const map = await readMap();
  return map[scheduleId] ?? [];
}

export async function setNotificationIds(scheduleId: number, ids: string[]): Promise<void> {
  const map = await readMap();
  map[scheduleId] = ids;
  await writeMap(map);
}

export async function clearNotificationIds(scheduleId: number): Promise<void> {
  const map = await readMap();
  delete map[scheduleId];
  await writeMap(map);
}
