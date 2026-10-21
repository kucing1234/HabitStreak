// TASK 1 — Model the HabitStreak Data
// Resource: Habit. Lihat docs/DATA_MODEL.md untuk penjelasan lengkap.
import type { Ionicons } from "@expo/vector-icons";

export type IconName = keyof typeof Ionicons.glyphMap;

/** Bentuk data MENTAH dari REST API (api/habits.json). */
export type HabitStatus = "active" | "inactive";
export type HabitDto = {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string; // hex 6 digit, mis. "#1d4ed8"
  streak: number;
  status: HabitStatus;
};

/** Data model yang dipakai UI (hanya field yang dibutuhkan aplikasi). */
export type Habit = {
  id: string;
  nama: string;
  deskripsi: string;
  icon: IconName;
  warna: string;
  latar: string;
  streak: number;
  aktif: boolean;
};
