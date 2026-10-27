import { useEffect, useState } from "react";
import { fetchHabits } from "../api/habits";
import { API_TIMEOUT_MS } from "../config";
import { Habit } from "../models/habit";

const pesanError = (e: unknown) => {
  const m = e instanceof Error ? e.message : "";
  if (e instanceof Error && e.name === "AbortError")
    return "Koneksi terlalu lama. Periksa internet lalu coba lagi.";
  if (m === "HTTP_401" || m === "HTTP_403")
    return "Sesi berakhir. Silakan login kembali.";
  if (m === "INSECURE")
    return "Koneksi tidak aman. Aplikasi hanya boleh memakai HTTPS.";
  if (m.startsWith("HTTP_"))
    return `Server bermasalah (kode ${m.slice(5)}). Coba lagi nanti.`;
  if (m === "FORMAT") return "Format data dari server tidak sesuai.";
  return "Tidak dapat terhubung ke server. Periksa koneksi internet.";
};

/** State data API: data, loading, refreshing, error. */
export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [percobaan, setPercobaan] = useState(0); // naik 1 = ambil ulang

  // REQUEST -> PARSE -> MAPPING terjadi di fetchHabits; di sini hanya state.
  useEffect(() => {
    let batal = false;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), API_TIMEOUT_MS);

    fetchHabits(ctrl.signal)
      .then((data) => {
        if (!batal) setHabits(data);
      })
      .catch((e) => {
        if (!batal) setError(pesanError(e));
      })
      .finally(() => {
        clearTimeout(timer);
        if (!batal) {
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      batal = true;
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [percobaan]);

  const muatUlang = () => {
    setLoading(true);
    setError("");
    setPercobaan((n) => n + 1);
  };

  const refresh = () => {
    setRefreshing(true);
    setError("");
    setPercobaan((n) => n + 1);
  };

  return {
    habits,
    loading,
    refreshing,
    error,
    muatUlang,
    refresh,
  };
}