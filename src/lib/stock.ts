import type { Medicine } from "@/db/types";

export function isOutOfStock(medicine: Medicine): boolean {
  return medicine.quantity_remaining <= 0;
}

export function isLowStock(medicine: Medicine): boolean {
  return medicine.quantity_remaining > 0 && medicine.quantity_remaining <= medicine.refill_threshold;
}
