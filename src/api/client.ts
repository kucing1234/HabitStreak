// SECURE API REQUEST — satu pintu untuk semua request ke API.
// "Interceptor" sederhana: token dibaca dari SecureStore dan dipasang otomatis
// sebagai header `Authorization: Bearer <token>` pada setiap request yang
// dilindungi, sehingga screen/hook tidak perlu mengurus token sendiri.
import { API_AMAN, API_TIMEOUT_MS, API_URL } from "../config";
import { getToken } from "./token";

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, kode: string) {
    super(kode);
    this.name = "ApiError";
    this.status = status;
  }
}

// Dipanggil saat server menolak token (401): App membersihkan session
// lalu kembali ke halaman login.
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

type Opsi = {
  method?: "GET" | "POST";
  body?: unknown;
  /** true = endpoint protected (pasang Bearer token). false = endpoint publik. */
  auth?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
};

export async function apiFetch<T>(path: string, opsi: Opsi = {}): Promise<T> {
  const { method = "GET", body, auth = true, signal, timeoutMs } = opsi;

  // HTTPS: di build produksi, jangan kirim password/token lewat HTTP.
  if (!__DEV__ && !API_AMAN) throw new ApiError(0, "INSECURE");

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = await getToken(); // 1. ambil token dari SecureStore
    if (!token) {
      onUnauthorized?.();
      throw new ApiError(401, "HTTP_401");
    }
    headers.Authorization = `Bearer ${token}`; // 2. Authorization header
  }

  // Timeout: pakai signal dari pemanggil, atau buat sendiri.
  const ctrl = signal ? null : new AbortController();
  const timer = ctrl
    ? setTimeout(() => ctrl.abort(), timeoutMs ?? API_TIMEOUT_MS)
    : null;

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: signal ?? ctrl?.signal,
    });

    if (response.status === 401 && auth) onUnauthorized?.(); // token ditolak
    if (!response.ok) throw new ApiError(response.status, `HTTP_${response.status}`);

    return (await response.json()) as T;
  } finally {
    if (timer) clearTimeout(timer);
  }
}