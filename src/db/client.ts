import * as SQLite from "expo-sqlite";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  relation TEXT NOT NULL DEFAULT 'self',
  color TEXT NOT NULL DEFAULT '#0F7A4F',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS medicines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  strength TEXT,
  instructions TEXT,
  quantity_remaining REAL NOT NULL DEFAULT 0,
  refill_threshold REAL NOT NULL DEFAULT 5,
  dose_amount REAL NOT NULL DEFAULT 1,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  time_of_day TEXT NOT NULL,
  days_of_week TEXT NOT NULL DEFAULT '0,1,2,3,4,5,6',
  notification_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dose_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  schedule_id INTEGER NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dose_date TEXT NOT NULL,
  time_of_day TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('taken', 'skipped')),
  logged_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(schedule_id, dose_date)
);

CREATE INDEX IF NOT EXISTS idx_medicines_profile ON medicines(profile_id);
CREATE INDEX IF NOT EXISTS idx_schedules_medicine ON schedules(medicine_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_profile_date ON dose_logs(profile_id, dose_date);
`;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("medapp.db").then(async (db) => {
      await db.execAsync(SCHEMA);
      return db;
    });
  }
  return dbPromise;
}
