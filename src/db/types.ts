export type Relation = "self" | "parent" | "spouse" | "child" | "other";

export type Profile = {
  id: number;
  name: string;
  relation: Relation;
  color: string;
  timezone: string;
  role: "owner" | "caregiver" | null;
};

export type Schedule = {
  id: number;
  medicine_id: number;
  time_of_day: string;
  days_of_week: string;
};

export type Medicine = {
  id: number;
  family_member_id: number;
  name: string;
  strength: string | null;
  instructions: string | null;
  quantity_remaining: number;
  refill_threshold: number;
  dose_amount: number;
};

export type MedicineWithSchedules = Medicine & { schedules: Schedule[] };

export type DoseStatus = "taken" | "skipped";

export type DoseLog = {
  id: number;
  schedule_id: number;
  medicine_id: number;
  medicine_name: string | null;
  medicine_strength: string | null;
  dose_date: string;
  time_of_day: string;
  status: DoseStatus;
  logged_at: string;
};
