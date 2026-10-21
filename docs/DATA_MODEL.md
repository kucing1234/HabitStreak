# Task 1 — Model the HabitStreak Data

Tujuan: menentukan data apa yang diperlukan aplikasi HabitStreak.

## 1. Resource aplikasi

| Resource | Dipakai di | Keterangan |
|---|---|---|
| **Habit** | Beranda, Kebiasaan, Statistik | Daftar kebiasaan yang diambil dari REST API |
| User | Login, Register, Profil | Disimpan lokal di SecureStore (bukan dari API) |

## 2–3. Field dan tipe data (resource Habit)

| Field (API) | Tipe | Dipakai untuk |
|---|---|---|
| `id` | number | identitas unik, kunci daftar |
| `name` | string | nama kebiasaan |
| `description` | string | keterangan singkat di kartu kebiasaan |
| `icon` | string | nama ikon Ionicons (mis. `"book"`) |
| `color` | string | warna ikon, hex 6 digit (mis. `"#1d4ed8"`) |
| `streak` | number | jumlah hari berturut-turut |
| `status` | string (`active` / `inactive`) | hanya `active` yang ditampilkan |

## 4. JSON structure (`api/habits.json`)

```json
{
  "id": 1,
  "name": "Membaca",
  "description": "Baca buku minimal 15 menit setiap hari.",
  "icon": "book",
  "color": "#1d4ed8",
  "streak": 12,
  "status": "active"
}
```

## 5. Data model aplikasi (`src/models/habit.ts`)

Hasil mapping dari field API. Hanya field yang dibutuhkan UI.

| Field model | Tipe | Asal |
|---|---|---|
| `id` | string | `String(id)` |
| `nama` | string | `name` |
| `deskripsi` | string | `description` |
| `icon` | IconName | `icon` (jika tidak dikenal -> ikon cadangan) |
| `warna` | string | `color` (jika bukan hex valid -> warna utama) |
| `latar` | string | `color` + transparansi 15% |
| `streak` | number | `streak` |
| `aktif` | boolean | `status === "active"` |

Data `inactive` dan item yang formatnya rusak dibuang saat mapping.
