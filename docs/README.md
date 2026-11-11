# Dokumentasi HabitStreak per Pekan

Satu repo, satu aplikasi. Tiap pekan punya dokumen sendiri dan (jika ada) folder kode sendiri.

| Pekan | Sprint | Topik | Dokumen | Kode utama |
|---|---|---|---|---|
| 2–3 | 01–02 | UI responsif, aksesibilitas, autentikasi | — | `src/screens/`, `src/auth.ts` |
| 4 | 03 | Data model & REST API | [week-04-data-model.md](week-04-data-model.md) | `src/models/`, `src/api/habits.ts` |
| 5 | 04 | Secure API (token) | — | `server/`, `src/api/client.ts`, `src/api/token.ts` |
| **6** | 05 | Error handling & offline | [week-06-error-handling.md](week-06-error-handling.md) | `src/api/errors.ts`, `src/api/network.ts`, `src/components/StateView.tsx` |
| **7** | 06 | Device sensor (accelerometer) | [week-07-device-sensor.md](week-07-device-sensor.md) | `src/sensor/` |

Git tag: `week-6` dan `week-7` menandai akhir pekan masing-masing
(`git checkout week-6` untuk melihat kondisi aplikasi di pekan itu).
