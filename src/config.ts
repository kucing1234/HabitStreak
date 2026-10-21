// Alamat REST API. Bisa diganti tanpa mengubah kode lewat
// EXPO_PUBLIC_API_URL (mis. di file .env).
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  "https://raw.githubusercontent.com/kucing1234/HabitStreak/main/api/habits.json";

export const API_TIMEOUT_MS = 10000;
