import { useEffect, useState } from "react";
import { InfoError, klasifikasiError } from "../api/errors";
import { fetchHabits } from "../api/habits";
import { API_TIMEOUT_MS } from "../config";
import { Habit } from "../models/habit";

/**
 * State data API (Sprint 05):
 *   loading      -> request pertama sedang berjalan
 *   mencobaLagi  -> loading karena pengguna menekan "Coba Lagi"
 *   habits       -> success state (hanya terisi jika request berhasil)
 *   masalah      -> error state: offline / timeout / 4xx / 5xx / jaringan
 *   empty state  -> habits kosong tanpa masalah (ditentukan di screen)
 */
export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [mencobaLagi, setMencobaLagi] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [masalah, setMasalah] = useState<InfoError | null>(null);
  const [percobaan, setPercobaan] = useState(0); // naik 1 = ambil ulang

  // REQUEST -> CHECK RESULT -> DATA / FEEDBACK. Parse & mapping ada di fetchHabits.
  useEffect(() => {
    let batal = false;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), API_TIMEOUT_MS); // timeout

    fetchHabits(ctrl.signal)
      .then((data) => {
        if (!batal) setHabits(data); // success: data hanya diisi saat berhasil
      })
      .catch(async (e) => {
        const info = await klasifikasiError(e); // pesan error yang jelas
        if (!batal) {
          setHabits([]); // request gagal -> jangan tampilkan data lama
          setMasalah(info);
        }
      })
      .finally(() => {
        clearTimeout(timer);
        if (!batal) {
          setLoading(false);
          setMencobaLagi(false);
          setRefreshing(false);
        }
      });

    return () => {
      batal = true;
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [percobaan]);

  /** Retry mechanism: tombol "Coba Lagi" -> kirim request ulang. */
  const muatUlang = () => {
    setLoading(true);
    setMencobaLagi(true);
    setMasalah(null);
    setPercobaan((n) => n + 1);
  };

  /** Pull-to-refresh. */
  const refresh = () => {
    setRefreshing(true);
    setMasalah(null);
    setPercobaan((n) => n + 1);
  };

  return { habits, loading, mencobaLagi, refreshing, masalah, muatUlang, refresh };
}