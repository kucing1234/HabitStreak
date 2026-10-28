// SPRINT 05 — Error handling: ubah error mentah menjadi pesan yang jelas.
//
//   2xx           -> sukses (data ditampilkan)
//   4xx           -> client error  (404 tidak ditemukan, 403 ditolak, ...)
//   5xx           -> server error  (500, 502, 503, ...)
//   timeout       -> server terlalu lama merespons
//   request gagal -> offline (tidak ada internet) / server tidak terjangkau
import { ApiError } from "./client";
import { cekOnline } from "./network";

export type JenisError =
  | "offline"
  | "timeout"
  | "client"
  | "server"
  | "jaringan"
  | "format"
  | "aman";

export type InfoError = {
  jenis: JenisError;
  judul: string;
  pesan: string;
};

const NAMA_STATUS: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  408: "Request Timeout",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

const kode = (status: number) =>
  NAMA_STATUS[status] ? `${status} ${NAMA_STATUS[status]}` : `${status}`;

/** Klasifikasi error HTTP berdasarkan status code. */
export function errorDariStatus(status: number): InfoError {
  if (status === 401)
    return {
      jenis: "client",
      judul: "Sesi berakhir",
      pesan: "Silakan login kembali.",
    };
  if (status === 403)
    return {
      jenis: "client",
      judul: "Akses ditolak",
      pesan: `Anda tidak memiliki izin untuk data ini. (${kode(status)})`,
    };
  if (status === 404)
    return {
      jenis: "client",
      judul: "Data tidak ditemukan",
      pesan: `Data yang Anda cari tidak tersedia. (${kode(status)})`,
    };
  if (status >= 400 && status < 500)
    return {
      jenis: "client",
      judul: "Permintaan tidak dapat diproses",
      pesan: `Terjadi kesalahan pada permintaan. Silakan coba lagi. (${kode(status)})`,
    };
  return {
    jenis: "server",
    judul: "Terjadi kesalahan pada server",
    pesan: `Server sedang mengalami gangguan. Silakan coba lagi nanti. (${kode(status)})`,
  };
}

/** Error apa pun (HTTP, timeout, jaringan, format) -> pesan untuk pengguna. */
export async function klasifikasiError(e: unknown): Promise<InfoError> {
  if (e instanceof ApiError) {
    if (e.message === "INSECURE")
      return {
        jenis: "aman",
        judul: "Koneksi tidak aman",
        pesan: "Aplikasi hanya boleh memakai HTTPS.",
      };
    return errorDariStatus(e.status);
  }

  // Timeout: request dibatalkan oleh AbortController.
  // Di HP, fetch bawaan Expo melempar Error biasa (bukan "AbortError") dengan
  // pesan seperti "FetchRequestCanceledException", jadi pesan ikut diperiksa.
  // (Pembatalan karena layar ditutup/refresh sudah diabaikan di useHabits.)
  if (e instanceof Error && (e.name === "AbortError" || /cancel|abort/i.test(e.message)))
    return {
      jenis: "timeout",
      judul: "Waktu permintaan habis",
      pesan: "Server terlalu lama merespons. Silakan coba lagi.",
    };

  if (e instanceof Error && e.message === "FORMAT")
    return {
      jenis: "format",
      judul: "Format data tidak sesuai",
      pesan: "Data dari server tidak dapat dibaca. Silakan coba lagi nanti.",
    };

  // Request gagal total (tidak ada respons): offline atau server tidak terjangkau
  if (!(await cekOnline()))
    return {
      jenis: "offline",
      judul: "Tidak ada koneksi internet",
      pesan: "Periksa koneksi Anda dan coba lagi.",
    };
  return {
    jenis: "jaringan",
    judul: "Tidak dapat terhubung ke server",
    pesan: "Server tidak dapat dijangkau. Periksa koneksi lalu coba lagi.",
  };
}