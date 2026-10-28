# Sprint 05 — Error Handling & Offline HabitStreak

Request API selalu melewati alur: **REQUEST → CHECK RESULT → DATA / FEEDBACK / RETRY**.

| State | Kapan muncul | Di mana |
|---|---|---|
| Loading | request pertama berjalan | `StateView` jenis `loading` |
| Retry | pengguna menekan "Coba Lagi" | `StateView` jenis `retry` ("Mencoba lagi…") |
| Success | status 2xx | daftar kebiasaan (data hanya tampil saat sukses) |
| Error 4xx | 401, 403, 404, dst. | `errorDariStatus()` di `src/api/errors.ts` |
| Error 5xx | 500, 502, 503, dst. | `errorDariStatus()` |
| Timeout | server > 10 detik | `AbortController` di `useHabits` → "Waktu permintaan habis" |
| Offline | request gagal & perangkat tanpa internet | `cekOnline()` di `src/api/network.ts` |
| Empty | sukses tapi daftar kosong | `StateView` jenis `empty` |

## Pemetaan Final Checklist

| Checklist | Di mana |
|---|---|
| HTTP 2xx / 4xx / 5xx dipahami | `errorDariStatus()`, `apiFetch` (cek `response.ok`) |
| HTTP error handling | `klasifikasiError()` |
| Network error handling | request gagal total → offline / "Tidak dapat terhubung ke server" |
| Loading / Success / Error / Empty state | `StateView` + `HomeScreen` |
| Timeout handling | `useHabits` (10 detik) |
| Retry mechanism | tombol "Coba Lagi" → `muatUlang()` |
| Offline handling + feedback | `expo-network` → "Tidak ada koneksi internet. Periksa koneksi Anda dan coba lagi." |
| Retry setelah online | tekan "Coba Lagi" setelah internet menyala |

## Cara menguji (Expo Go)

Hentikan server lama dengan `Ctrl+C` sebelum menjalankan server dengan simulasi.
Server mencetak satu baris untuk setiap permintaan yang masuk, jadi terlihat apakah request dari HP sampai.

| Test | Langkah | Hasil yang benar |
|---|---|---|
| Successful request | `npm run server`, login | Daftar kebiasaan tampil |
| HTTP error 5xx | `$env:DEBUG_STATUS="500"; npm run server`, tarik layar untuk refresh | "Terjadi kesalahan pada server" + tombol Coba Lagi, tanpa data |
| HTTP error 4xx | `$env:DEBUG_STATUS="404"; npm run server` | "Data tidak ditemukan" |
| Timeout | `$env:DEBUG_DELAY_MS="15000"; npm run server` | Setelah 10 detik: "Waktu permintaan habis" |
| Network error | hentikan server, tekan Coba Lagi | "Tidak dapat terhubung ke server" |
| Offline | aktifkan **mode pesawat** di HP, tekan Coba Lagi | "Tidak ada koneksi internet" |
| Retry setelah online | matikan mode pesawat, tekan Coba Lagi | Data berhasil dimuat |
| Empty | ubah semua `"status"` di `api/habits.json` jadi `"inactive"` | "Belum ada data" |

Setelah tes, tutup terminal server, buka terminal baru, lalu jalankan `npm run server` biasa.
Kembalikan `api/habits.json` ke semula.

Tes otomatis server: `npm run test:api` (22 kasus).

Untuk uji offline gunakan **mode pesawat**. Jika hanya Wi-Fi yang dimatikan tetapi data seluler aktif,
HP masih dianggap online, sehingga pesannya "Tidak dapat terhubung ke server".