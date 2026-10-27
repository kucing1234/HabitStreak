// SPRINT 04 — Token-based authentication
//
// Alur:  LOGIN -> API -> ACCESS TOKEN (JWT) -> SECURE STORAGE -> AUTHENTICATED
//
//   1. Pengguna mengisi email + password
//   2. Aplikasi mengirim POST /login ke API (credential divalidasi SERVER)
//   3. Server membalas access_token (JWT) + data user
//   4. Token disimpan di SecureStore (terenkripsi)  -> src/api/token.ts
//   5. State authentication berubah (App: user != null)
//
// Password TIDAK PERNAH disimpan di perangkat; hanya token + data user.
// Token dipakai otomatis pada request protected lewat src/api/client.ts.
import { ApiError, apiFetch } from "./api/client";
import { SessionUser, clearSession, getStoredUser, saveSession } from "./api/token";

export type User = SessionUser;
export type Hasil = { ok: true; user: User } | { ok: false; error: string };

type AuthResponse = {
  access_token: string;
  user: { id: number; name: string; email: string };
};

const PESAN_GAGAL_LOGIN = "Email atau password salah."; // sengaja tidak spesifik
const PESAN_GAGAL_SIMPAN = "Terjadi kesalahan penyimpanan. Coba lagi.";
const PESAN_GAGAL_JARINGAN =
  "Tidak dapat terhubung ke server. Periksa koneksi internet.";

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

/* ---------- PESAN ERROR DARI API ---------- */

const pesanAuthError = (e: unknown) => {
  if (e instanceof ApiError) {
    if (e.status === 401) return PESAN_GAGAL_LOGIN;
    if (e.status === 409) return "Email sudah terdaftar. Silakan login.";
    if (e.status === 400) return "Data yang dikirim tidak valid.";
    if (e.message === "INSECURE")
      return "Koneksi tidak aman. Aplikasi hanya boleh memakai HTTPS.";
    if (e.status >= 500) return "Server bermasalah. Coba lagi nanti.";
  }
  if (e instanceof Error && e.name === "AbortError")
    return "Koneksi terlalu lama. Periksa internet lalu coba lagi.";
  return PESAN_GAGAL_JARINGAN;
};

/* ---------- SESSION ---------- */

/** Token retrieval + secure token storage + authentication state. */
async function mulaiSesi(res: AuthResponse): Promise<Hasil> {
  const valid =
    typeof res?.access_token === "string" &&
    res.access_token !== "" &&
    typeof res.user?.name === "string" &&
    typeof res.user?.email === "string";
  if (!valid) return { ok: false, error: PESAN_GAGAL_JARINGAN };

  const user: User = { nama: res.user.name, email: res.user.email };
  try {
    await saveSession(res.access_token, user); // -> SecureStore
  } catch {
    return { ok: false, error: PESAN_GAGAL_SIMPAN };
  }
  return { ok: true, user };
}

/**
 * Dipanggil saat aplikasi dibuka: baca kembali token dari SecureStore lalu
 * validasi ke server (GET /me). Token ditolak (401) -> session dibersihkan.
 * Jika server tidak terjangkau (offline), session tetap dipakai; token akan
 * divalidasi lagi pada request protected berikutnya.
 */
export async function getSession(): Promise<User | null> {
  try {
    const user = await getStoredUser();
    if (!user) {
      await clearSession(); // token tanpa data user = session rusak
      return null;
    }
    try {
      await apiFetch("/me", { timeoutMs: 5000 });
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        await clearSession();
        return null;
      }
      // masalah jaringan / server: jangan logout paksa
    }
    return user;
  } catch {
    return null;
  }
}

/** Logout: hapus token + session dari SecureStore. */
export async function logout(): Promise<void> {
  try {
    await clearSession();
  } catch {
    // abaikan; state aplikasi tetap dikembalikan ke unauthenticated
  }
}

/* ---------- REGISTER & LOGIN (lewat API) ---------- */

export async function register(
  nama: string,
  email: string,
  password: string,
): Promise<Hasil> {
  try {
    const res = await apiFetch<AuthResponse>("/register", {
      method: "POST",
      body: { name: nama.trim(), email: email.trim(), password },
      auth: false,
    });
    return await mulaiSesi(res);
  } catch (e) {
    return { ok: false, error: pesanAuthError(e) };
  }
}

export async function login(email: string, password: string): Promise<Hasil> {
  try {
    // Login request: kirim credential, server yang memvalidasi.
    const res = await apiFetch<AuthResponse>("/login", {
      method: "POST",
      body: { email: email.trim(), password },
      auth: false,
    });
    return await mulaiSesi(res);
  } catch (e) {
    return { ok: false, error: pesanAuthError(e) };
  }
}