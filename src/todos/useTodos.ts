// WEEK 9 — State proses asinkron (tri-state) untuk Todo List.
//
//   loading   -> request pertama sedang berjalan        (spinner)
//   todos     -> success state                          (daftar tugas)
//   masalah   -> error state saat memuat data awal      (pesan + "Coba Lagi")
//   Alert     -> error saat refresh / POST / PATCH      (try/catch + Alert)
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { klasifikasiError } from "../api/errors";
import type { InfoError } from "../api/errors";
import { Todo, addTodo, fetchTodos, patchTodo } from "./todoApi";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [masalah, setMasalah] = useState<InfoError | null>(null);
  const [percobaan, setPercobaan] = useState(0); // naik 1 = ambil ulang
  const [menambah, setMenambah] = useState(false);
  const [sibuk, setSibuk] = useState<string[]>([]); // kunci todo yang sedang di-PATCH

  // "awal"    = memuat data pertama / "Coba Lagi" -> gagal = tampilkan StateView error
  // "refresh" = tombol Refresh (daftar lama sudah tampil) -> gagal = Alert saja
  const mode = useRef<"awal" | "refresh">("awal");

  const gagal = (info: InfoError) => Alert.alert(info.judul, info.pesan);

  // 1) GET saat komponen dimuat (dan setiap `percobaan` berubah).
  //    Fungsi async dideklarasikan DI DALAM useEffect (callback-nya tidak boleh async).
  useEffect(() => {
    let batal = false;
    const ctrl = new AbortController();

    const ambil = async () => {
      try {
        const data = await fetchTodos(ctrl.signal);
        if (batal) return;
        setTodos(data);
        setMasalah(null);
      } catch (e) {
        if (batal) return; // layar ditutup / request digantikan -> abaikan
        const info = await klasifikasiError(e);
        if (batal) return;
        if (mode.current === "refresh") gagal(info); // refresh gagal: daftar lama tetap tampil
        else setMasalah(info); // gagal memuat awal: tampilkan error + "Coba Lagi"
      } finally {
        if (!batal) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };
    ambil();

    // Cleanup: batalkan request yang masih berjalan (hindari memory leak)
    return () => {
      batal = true;
      ctrl.abort();
    };
  }, [percobaan]);

  /** Tombol "Coba Lagi" saat memuat data awal gagal. */
  const muatUlang = () => {
    mode.current = "awal";
    setLoading(true);
    setMasalah(null);
    setPercobaan((n) => n + 1);
  };

  /** 6) Tombol Refresh: ambil ulang daftar terbaru dari server. */
  const refresh = () => {
    if (loading || refreshing) return;
    if (masalah) return muatUlang(); // belum ada data -> ulangi pemuatan awal
    mode.current = "refresh";
    setRefreshing(true);
    setPercobaan((n) => n + 1);
  };

  /** 3) POST: kirim tugas baru, lalu tampilkan di daftar. Mengembalikan true jika berhasil. */
  const tambah = async (judul: string): Promise<boolean> => {
    if (menambah) return false;
    setMenambah(true);
    try {
      const baru = await addTodo(judul);
      // Server simulasi tidak menyimpan data, jadi item dari respons POST
      // ditaruh langsung di daftar (bukan GET ulang yang akan menghilangkannya).
      setTodos((prev) => [baru, ...prev]);
      return true;
    } catch (e) {
      gagal(await klasifikasiError(e));
      return false;
    } finally {
      setMenambah(false);
    }
  };

  /** 4) PATCH: ubah status selesai/belum lewat server. */
  const ubahStatus = async (todo: Todo) => {
    if (sibuk.includes(todo.kunci)) return;
    setSibuk((p) => [...p, todo.kunci]);
    try {
      const nilai = !todo.selesai;
      // Tugas buatan lokal tidak ada di server simulasi (PATCH /todos/201 ditolak),
      // jadi statusnya diubah di aplikasi saja.
      const hasil = todo.lokal ? nilai : await patchTodo(todo.id, nilai);
      setTodos((prev) =>
        prev.map((t) => (t.kunci === todo.kunci ? { ...t, selesai: hasil } : t)),
      );
    } catch (e) {
      gagal(await klasifikasiError(e)); // status tidak berubah
    } finally {
      setSibuk((p) => p.filter((k) => k !== todo.kunci));
    }
  };

  return { todos, loading, refreshing, masalah, menambah, sibuk, muatUlang, refresh, tambah, ubahStatus };
}
