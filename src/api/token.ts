// SECURE TOKEN STORAGE — access token & data sesi disimpan di SecureStore
// (Keychain iOS / Keystore Android), bukan di AsyncStorage atau state biasa.
import * as SecureStore from "expo-secure-store";

// Key SecureStore hanya boleh berisi huruf, angka, ".", "-", "_"
const KEY_TOKEN = "access_token";
const KEY_USER = "hs_user";

export type SessionUser = { nama: string; email: string };

export const getToken = () => SecureStore.getItemAsync(KEY_TOKEN);

export async function saveSession(token: string, user: SessionUser) {
  await SecureStore.setItemAsync(KEY_TOKEN, token);
  await SecureStore.setItemAsync(KEY_USER, JSON.stringify(user));
}

export async function getStoredUser(): Promise<SessionUser | null> {
  const mentah = await SecureStore.getItemAsync(KEY_USER);
  if (!mentah) return null;
  const u = JSON.parse(mentah) as Partial<SessionUser>;
  return typeof u.nama === "string" && typeof u.email === "string"
    ? { nama: u.nama, email: u.email }
    : null;
}

/** Hapus token + data sesi (dipakai saat logout atau token ditolak server). */
export async function clearSession() {
  await SecureStore.deleteItemAsync(KEY_TOKEN);
  await SecureStore.deleteItemAsync(KEY_USER);
}