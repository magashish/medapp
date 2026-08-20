export type Relation = "self" | "parent" | "spouse" | "child" | "other";

export type Profile = {
  id: number;
  name: string;
  relation: Relation;
  color: string;
  created_at: string;
};

export type Medicine = {
  id: number;
  profile_id: number;
  name: string;
  strength: string | null;
  instructions: string | null;
  quantity_remaining: number;
  refill_threshold: number;
  dose_amount: number;
  active: number;
  created_at: string;
};

export type Schedule = {
  id: number;
  medicine_id: number;
  time_of_day: string;
  days_of_week: string;
  notification_id: string | null;
  created_at: string;
};

export type DoseStatus = "taken" | "skipped";

export type DoseLog = {
  id: number;
  schedule_id: number;
  medicine_id: number;
  profile_id: number;
  dose_date: string;
  time_of_day: string;
  status: DoseStatus;
  logged_at: string;
};

export type MedicineWithSchedules = Medicine & { schedules: Schedule[] };
