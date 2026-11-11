// WEEK 7 — logika murni (tanpa React) untuk memproses data accelerometer.
// Pipeline: RAW DATA (g) -> PROCESS (magnitude, threshold) -> MEANINGFUL DATA.

/** Percepatan gravitasi standar. expo-sensors melaporkan nilai dalam satuan g. */
export const GRAVITASI = 9.80665; // m/s² per 1 g

/** Interval pembacaan sensor (ms). */
export const INTERVAL_MS = 100;

/** Ambang goyangan. Diam ≈ 1 g (gravitasi), digoyang > 1,5 g. */
export const AMBANG_GOYANG_G = 1.5;

/** Status "Goyang Terdeteksi" bertahan sebentar agar sempat terbaca di UI. */
export const TAHAN_GOYANG_MS = 1500;

/** Jumlah sampel yang disimpan untuk grafik (≈ 4 detik). */
export const JUMLAH_RIWAYAT = 40;

export type Sampel = { x: number; y: number; z: number };

/** Panjang vektor percepatan (g): √(x² + y² + z²). */
export const magnitudeG = ({ x, y, z }: Sampel) =>
  Math.sqrt(x * x + y * y + z * z);

/** Apakah sampel ini melewati ambang goyangan? */
export const adalahGoyangan = (s: Sampel) => magnitudeG(s) > AMBANG_GOYANG_G;

/** Ubah g -> m/s² (satuan yang ditampilkan di UI). */
export const keMs2 = (s: Sampel): Sampel => ({
  x: s.x * GRAVITASI,
  y: s.y * GRAVITASI,
  z: s.z * GRAVITASI,
});

/** Format angka sensor: 2 desimal, tanpa "-0.00". */
export const format = (n: number) => (Math.abs(n) < 0.005 ? 0 : n).toFixed(2);

/** Tambah sampel ke riwayat, simpan hanya yang terbaru. */
export const tambahRiwayat = (riwayat: Sampel[], s: Sampel): Sampel[] => {
  const baru = [...riwayat, s];
  return baru.length > JUMLAH_RIWAYAT
    ? baru.slice(baru.length - JUMLAH_RIWAYAT)
    : baru;
};
