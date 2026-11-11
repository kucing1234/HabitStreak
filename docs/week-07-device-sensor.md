# Week 7 (Sprint 06) — From API to Device Sensor

Sebelumnya data datang dari **server** (REST API). Sekarang data datang dari **sensor perangkat**:

`Sensor API (expo-sensors)` → `Listener` → `Sensor data (x, y, z)` → `Process (threshold)` → `State` → `UI`

> Kode week 7 semuanya ada di folder `src/sensor/`. Satu-satunya perubahan di luar folder itu:
> tab **Sensor** di `src/screens/HomeScreen.tsx`, plugin di `app.json`, dan dependency
> `expo-sensors` + `react-native-svg` (grafik).
> Pekan sebelumnya: [week 6 — error handling](week-06-error-handling.md).

## Struktur kode

| File | Tugas |
|---|---|
| `src/sensor/shake.ts` | Logika murni: konversi g → m/s², magnitude, ambang goyangan, riwayat grafik |
| `src/sensor/useAccelerometer.ts` | Cek sensor, izin, listener, console log, deteksi goyang, getaran, cleanup |
| `src/sensor/SensorChart.tsx` | Grafik X/Y/Z real-time (react-native-svg) |
| `src/sensor/SensorScreen.tsx` | Tampilan: dialog izin, kartu X/Y/Z, grafik, status goyang |

## Pemetaan tugas

### Task 01 — Connect PresidentKu to Sensor

| Yang harus dikerjakan | Di mana |
|---|---|
| Halaman/fitur baca accelerometer | tab **Sensor** (`SensorScreen`) |
| Library `expo-sensors` | `Accelerometer.addListener` di `useAccelerometer` |
| Tangani permission | `getPermissionsAsync` → dialog "Izinkan Akses Sensor?" → `requestPermissionsAsync`; ditolak → "Buka Pengaturan" / "Kembali" |
| Nilai X, Y, Z di console | `console.log("Accelerometer: x=…, y=…, z=…")` (2× per detik) |
| Nilai X, Y, Z di UI | kartu X, Y, Z (m/s²) |

### Task 02 — Display Sensor Data

| Yang harus dikerjakan | Di mana |
|---|---|
| Nilai real-time di halaman | `setUpdateInterval(100)` → state `terakhir` |
| Grafik perubahan nilai | `SensorChart` (40 sampel terakhir ≈ 4 detik) |
| Listener dibersihkan | `subscription.remove()` saat tab ditutup / sensor dihentikan |

### Task 03 — Sensor Interaction

| Yang harus dikerjakan | Di mana |
|---|---|
| Deteksi gerakan (threshold) | `adalahGoyangan()` → magnitude > **1,5 g** |
| Getaran | `Vibration.vibrate(500)` sekali per goyangan |
| Status di UI | banner "Goyang Terdeteksi!" / "Siap mendeteksi…" + penghitung |

## Catatan penting

- `expo-sensors` melaporkan **g** (1 g = 9,81 m/s²). UI menampilkan m/s² seperti di slide; ambang goyang dihitung dalam g.
  Saat diam, magnitude ≈ 1 g (gravitasi), jadi ambang 1,5 g hanya terlewati saat digoyang.
- **Permission:** Android tidak meminta izin runtime untuk accelerometer (status langsung `granted`). iOS memakai
  `NSMotionUsageDescription` yang diisi lewat plugin `expo-sensors` di `app.json`. Dialog penjelasan di aplikasi tetap
  ditampilkan bila izin belum diberikan.
- Sensor **berhenti otomatis** saat pindah tab atau aplikasi ke background (hemat baterai).
- Sensor tidak ada di emulator/web → tampil "Sensor Tidak Tersedia".
- Beda dengan contoh slide: `Alert.alert` tiap goyangan tidak dipakai (mengganggu; status UI + getaran sudah cukup),
  dan console log dibatasi 2× per detik (bukan 10×).

## Cara menguji (Expo Go, HP asli)

1. `npm install`, lalu `npx expo start`, scan QR dengan Expo Go.
2. Login → buka tab **Sensor**.
3. Dialog izin muncul (jika perlu) → **Izinkan** → chip "Sensor Aktif".
4. Letakkan HP di meja: nilai Y/Z ≈ 9,81 atau salah satu sumbu ≈ 9,81 (tergantung posisi), grafik datar.
5. **Goyangkan HP:** nilai & grafik melonjak, HP bergetar, banner "Goyang Terdeteksi!" muncul ~1,5 detik.
6. Lihat terminal Expo: baris `Accelerometer: x=…, y=…, z=…` muncul terus.
7. Tombol **Hentikan Sensor** → chip "Sensor Dijeda", nilai berhenti. **Mulai Sensor** → lanjut.
8. Pindah ke tab lain lalu kembali → sensor mulai lagi dari awal.

## Checklist demo (slide 13)

- [ ] Aplikasi berjalan normal
- [ ] Permission ditangani (Izinkan / Tolak / Buka Pengaturan)
- [ ] Sensor berhasil diakses ("Sensor Aktif")
- [ ] Perangkat digerakkan (shake/move)
- [ ] Nilai sensor berubah
- [ ] Data tampil di UI

## Jawaban pertanyaan demo

1. **Sensor apa yang digunakan?** Accelerometer (`expo-sensors`).
2. **Apa fungsinya?** Mengukur percepatan/pergerakan perangkat pada sumbu X, Y, Z — dipakai untuk mendeteksi goyangan.
3. **Dari mana data sensor diperoleh?** Dari sensor fisik di perangkat, lewat Sensor API → sistem operasi → library `expo-sensors` (bukan dari server).
4. **Apa fungsi Sensor API?** Perantara (hardware abstraction) agar aplikasi membaca sensor lewat interface yang sederhana dan aman, tanpa mengakses hardware langsung.
5. **Jika permission ditolak?** Aplikasi tidak membaca sensor, menampilkan penjelasan, dan menawarkan "Izinkan Lagi" / "Buka Pengaturan" / "Kembali" — tidak crash.
6. **Mengapa nilai sensor berubah real-time?** Sensor mengirim pembacaan baru tiap ±100 ms sesuai kondisi fisik perangkat; listener menerimanya dan UI di-render ulang.

## Review checklist (slide 14)

- [x] Device sensor & Sensor API dipahami — lihat bagian "Catatan penting"
- [x] Accelerometer dipahami (`shake.ts`); gyroscope: sensor rotasi (rad/s) di `expo-sensors` dengan pola kode yang sama
- [x] Permission dipahami
- [x] Sensor data dibaca, diproses (magnitude, threshold), ditampilkan di UI, dan berubah real-time
