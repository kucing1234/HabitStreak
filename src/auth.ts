// TASK 2 — Secure the Local Data
//
// KLASIFIKASI DATA
// ┌───────────────────────────────┬───────────┬───────────────────────────┐
// │ Data                          │ Sensitif? │ Disimpan di               │
// ├───────────────────────────────┼───────────┼───────────────────────────┤
// │ Token session                 │ YA        │ SecureStore (terenkripsi) │
// │ Hash password + salt          │ YA        │ SecureStore (terenkripsi) │
// │ Nama & email akun             │ YA        │ SecureStore (terenkripsi) │
// │ Password asli (plaintext)     │ YA        │ TIDAK PERNAH disimpan     │
// │ Tema / bahasa / UI settings   │ TIDAK     │ AsyncStorage (biasa)      │
// └───────────────────────────────┴───────────┴───────────────────────────┘
//
// Catatan: SecureStore memakai Keychain (iOS) / Keystore (Android), jadi data
// terenkripsi di perangkat. SecureStore tidak tersedia di web, jalankan di Expo Go.

import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

export type User = { nama: string; email: string };
export type Hasil = { ok: true; user: User } | { ok: false; error: string };

type Akun = { nama: string; email: string; salt: string; hash: string };

// Key SecureStore hanya boleh berisi huruf, angka, ".", "-", "_"
const KEY_SESSION = "hs_session";
const PESAN_GAGAL_LOGIN = "Email atau password salah."; // sengaja tidak spesifik
const PESAN_GAGAL_SIMPAN = "Terjadi kesalahan penyimpanan. Coba lagi.";

const sha256 = (teks: string) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, teks);

const acak = async (byte = 16) => {
  const b = await Crypto.getRandomBytesAsync(byte);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
};

const normal = (email: string) => email.trim().toLowerCase();
const keyAkun = async (email: string) =>
  "hs_akun_" + (await sha256(normal(email)));

/* ---------- VALIDASI INPUT (mengembalikan '' jika valid) ---------- */

export const validasiNama = (nama: string) =>
  nama.trim() ? "" : "Nama lengkap wajib diisi.";

export const validasiEmail = (email: string) => {
  if (!email.trim()) return "Email wajib diisi.";
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Format email tidak valid.";
  return "";
};

export const validasiPassword = (password: string) => {
  if (!password) return "Password wajib diisi.";
  if (password.length < 6) return "Password minimal 6 karakter.";
  return "";
};

/* ---------- SESSION ---------- */

async function mulaiSesi(user: User): Promise<Hasil> {
  const token = (await acak(16)) + (await acak(16));
  await SecureStore.setItemAsync(
    KEY_SESSION,
    JSON.stringify({ token, email: user.email }),
  );
  return { ok: true, user };
}

/** Dipanggil saat aplikasi dibuka: baca kembali session dari secure storage. */
export async function getSession(): Promise<User | null> {
  try {
    const mentah = await SecureStore.getItemAsync(KEY_SESSION);
    if (!mentah) return null;
    const { token, email } = JSON.parse(mentah) as {
      token?: string;
      email?: string;
    };
    if (!token || !email) return null;
    const akunMentah = await SecureStore.getItemAsync(await keyAkun(email));
    if (!akunMentah) return null;
    const akun = JSON.parse(akunMentah) as Akun;
    return { nama: akun.nama, email: akun.email };
  } catch {
    return null;
  }
}

/** Logout: hapus session dari secure storage. */
export async function logout(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEY_SESSION);
  } catch {
    // abaikan; tidak ada data lain yang perlu dibersihkan
  }
}

/* ---------- REGISTER & LOGIN ---------- */

export async function register(
  nama: string,
  email: string,
  password: string,
): Promise<Hasil> {
  try {
    const key = await keyAkun(email);
    if (await SecureStore.getItemAsync(key)) {
      return { ok: false, error: "Email sudah terdaftar. Silakan login." };
    }
    const salt = await acak(16);
    const hash = await sha256(salt + password); // password asli tidak disimpan
    const akun: Akun = { nama: nama.trim(), email: normal(email), salt, hash };
    await SecureStore.setItemAsync(key, JSON.stringify(akun));
    return await mulaiSesi({ nama: akun.nama, email: akun.email });
  } catch {
    return { ok: false, error: PESAN_GAGAL_SIMPAN };
  }
}

export async function login(email: string, password: string): Promise<Hasil> {
  try {
    const mentah = await SecureStore.getItemAsync(await keyAkun(email));
    if (!mentah) return { ok: false, error: PESAN_GAGAL_LOGIN };
    const akun = JSON.parse(mentah) as Akun;
    const hash = await sha256(akun.salt + password);
    if (hash !== akun.hash) return { ok: false, error: PESAN_GAGAL_LOGIN };
    return await mulaiSesi({ nama: akun.nama, email: akun.email });
  } catch {
    return { ok: false, error: PESAN_GAGAL_SIMPAN };
  }
}