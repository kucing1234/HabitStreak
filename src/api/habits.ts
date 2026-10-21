// TASK 2 — Connect to REST API: request -> JSON -> parse -> mapping -> state
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../config";
import { C } from "../theme";
import { Habit, HabitDto, IconName } from "../models/habit";

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Validasi tiap item agar data rusak tidak membuat aplikasi crash. */
const isHabitDto = (x: unknown): x is HabitDto => {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "number" &&
    typeof o.name === "string" &&
    o.name.trim() !== "" &&
    typeof o.streak === "number" &&
    (o.status === "active" || o.status === "inactive")
  );
};

/** Mapping: field API -> data model aplikasi. */
export const toHabit = (item: HabitDto): Habit => {
  const warna = HEX.test(item.color) ? item.color : C.primer;
  const icon: IconName =
    item.icon in Ionicons.glyphMap
      ? (item.icon as IconName)
      : "checkmark-circle-outline";
  return {
    id: String(item.id),
    nama: item.name.trim(),
    deskripsi: typeof item.description === "string" ? item.description : "",
    icon,
    warna,
    latar: warna + "26", // warna yang sama dengan transparansi ~15%
    streak: Math.max(0, Math.round(item.streak)),
    aktif: item.status === "active",
  };
};

export async function fetchHabits(signal?: AbortSignal): Promise<Habit[]> {
  // 1. REQUEST ke REST API
  const response = await fetch(API_URL, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) throw new Error(`HTTP_${response.status}`);

  // 2. PARSE JSON -> objek JavaScript
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error("FORMAT");

  // 3. MAPPING ke data model (hanya kebiasaan yang aktif)
  return data
    .filter(isHabitDto)
    .map(toHabit)
    .filter((h) => h.aktif);
}
