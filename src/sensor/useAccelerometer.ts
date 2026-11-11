// WEEK 7 — Task 01 (baca sensor + permission) & Task 03 (interaksi goyang).
// Alur: SENSOR API -> LISTENER -> SENSOR DATA -> PROCESS -> STATE -> UI
import { Accelerometer } from "expo-sensors";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking, Vibration } from "react-native";
import {
  INTERVAL_MS,
  Sampel,
  TAHAN_GOYANG_MS,
  adalahGoyangan,
  format,
  keMs2,
  tambahRiwayat,
} from "./shake";

export type StatusSensor =
  | "memeriksa" // cek ketersediaan sensor & izin
  | "tidak-tersedia" // perangkat/emulator tanpa accelerometer
  | "perlu-izin" // izin belum diminta
  | "ditolak" // izin ditolak pengguna
  | "aktif" // listener berjalan
  | "dijeda"; // listener dihentikan (tombol / aplikasi di background)

const NOL: Sampel = { x: 0, y: 0, z: 0 };

type Subscription = ReturnType<typeof Accelerometer.addListener>;

export function useAccelerometer() {
  const [status, setStatus] = useState<StatusSensor>("memeriksa");
  const [bisaMinta, setBisaMinta] = useState(true); // canAskAgain
  const [terakhir, setTerakhir] = useState<Sampel>(NOL); // m/s²
  const [riwayat, setRiwayat] = useState<Sampel[]>([]); // m/s²
  const [goyang, setGoyang] = useState(false);
  const [jumlahGoyang, setJumlahGoyang] = useState(0);

  const langganan = useRef<Subscription | null>(null);
  const riwayatRef = useRef<Sampel[]>([]);
  const goyangRef = useRef(false);
  const timerGoyang = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hitung = useRef(0);
  const otomatisDijeda = useRef(false);

  const hentikan = useCallback(() => {
    langganan.current?.remove(); // cleanup listener
    langganan.current = null;
  }, []);

  const mulai = useCallback(() => {
    if (langganan.current) return;
    Accelerometer.setUpdateInterval(INTERVAL_MS);
    langganan.current = Accelerometer.addListener(({ x, y, z }) => {
      const mentah: Sampel = { x, y, z }; // satuan g
      const nilai = keMs2(mentah); // satuan m/s²

      // Task 01: tampilkan nilai di console (dibatasi 2x per detik)
      hitung.current += 1;
      if (hitung.current % 5 === 0) {
        console.log(
          `Accelerometer: x=${format(nilai.x)}, y=${format(nilai.y)}, z=${format(nilai.z)}`,
        );
      }

      // Task 02: simpan untuk kartu nilai + grafik
      riwayatRef.current = tambahRiwayat(riwayatRef.current, nilai);
      setTerakhir(nilai);
      setRiwayat(riwayatRef.current);

      // Task 03: threshold -> getaran + status UI
      if (adalahGoyangan(mentah)) {
        if (!goyangRef.current) {
          goyangRef.current = true;
          setGoyang(true);
          setJumlahGoyang((n) => n + 1);
          Vibration.vibrate(500);
          console.log("Accelerometer: gerakan terdeteksi (goyang)");
        }
        if (timerGoyang.current) clearTimeout(timerGoyang.current);
        timerGoyang.current = setTimeout(() => {
          goyangRef.current = false;
          setGoyang(false);
        }, TAHAN_GOYANG_MS);
      }
    });
    setStatus("aktif");
  }, []);

  const jeda = useCallback(() => {
    hentikan();
    setStatus("dijeda");
  }, [hentikan]);

  const mintaIzin = useCallback(async () => {
    const hasil = await Accelerometer.requestPermissionsAsync();
    setBisaMinta(hasil.canAskAgain);
    if (hasil.granted) mulai();
    else setStatus("ditolak");
  }, [mulai]);

  /** Pengguna menolak dialog penjelasan izin di aplikasi. */
  const tolakIzin = useCallback(() => {
    setStatus("ditolak");
  }, []);

  /** Izin ditolak permanen -> arahkan ke pengaturan sistem. */
  const bukaPengaturan = useCallback(() => {
    Linking.openSettings();
  }, []);

  // Saat layar dibuka: cek sensor -> cek izin -> mulai membaca
  useEffect(() => {
    let batal = false;
    (async () => {
      const tersedia = await Accelerometer.isAvailableAsync();
      if (batal) return;
      if (!tersedia) {
        setStatus("tidak-tersedia");
        return;
      }
      const izin = await Accelerometer.getPermissionsAsync();
      if (batal) return;
      setBisaMinta(izin.canAskAgain);
      if (izin.granted) mulai();
      else if (izin.canAskAgain) setStatus("perlu-izin");
      else setStatus("ditolak");
    })();

    return () => {
      batal = true;
      hentikan();
      if (timerGoyang.current) clearTimeout(timerGoyang.current);
      Vibration.cancel();
    };
  }, [mulai, hentikan]);

  // Hemat baterai: hentikan sensor saat aplikasi ke background
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s !== "active" && langganan.current) {
        otomatisDijeda.current = true;
        jeda();
      } else if (s === "active" && otomatisDijeda.current) {
        otomatisDijeda.current = false;
        mulai();
      }
    });
    return () => sub.remove();
  }, [jeda, mulai]);

  return {
    status,
    bisaMinta,
    terakhir,
    riwayat,
    goyang,
    jumlahGoyang,
    mulai,
    jeda,
    mintaIzin,
    tolakIzin,
    bukaPengaturan,
  };
}
