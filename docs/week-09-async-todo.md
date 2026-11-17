# Week 9 (Sprint 07) — Asynchronous API Request: Todo List

Materi: multi-threading & komputasi asinkron di React Native (`async/await`, `Promise`, `useEffect`,
tri-state loading/error/success). Penugasan (slide "Detail Penugasan Praktik: Todo List Async"):
bangun Todo List dengan operasi **GET, POST, PATCH** ke REST API, lengkap dengan loading & error handling.

> Kode week 9 ada di folder `src/todos/`. Satu-satunya perubahan di luar folder itu: tab **Todo** di
> `src/screens/HomeScreen.tsx`. Tidak ada dependency baru.
> Pekan sebelumnya: [week 7 — device sensor](week-07-device-sensor.md).

## Struktur kode

| File | Tugas |
|---|---|
| `src/todos/todoApi.ts` | Request `fetch` ke JSONPlaceholder: `fetchTodos` (GET), `addTodo` (POST), `patchTodo` (PATCH) + timeout, cek status, validasi & mapping data |
| `src/todos/useTodos.ts` | State asinkron: `todos`, `loading`, `refreshing`, `masalah`, `menambah`, `sibuk` + aksi `tambah`, `ubahStatus`, `refresh`, `muatUlang` |
| `src/todos/TodoScreen.tsx` | Tampilan: form tambah, daftar centang, tombol Refresh, loading / error / kosong |

Alur data: `fetch (async)` → `await res.json()` → `useState` → `FlatList/daftar` di UI.

## Pemetaan 6 fitur wajib

| # | Fitur | Di mana |
|---|---|---|
| 01 | **Tampilkan data API** — `fetch()` + `async/await` saat komponen dimuat | `useEffect` di `useTodos` → `fetchTodos()` → `GET /todos?_limit=10` |
| 02 | **Loading indicator** — `<ActivityIndicator />` saat menunggu respons | `StateView jenis="loading"` (muat awal), spinner di tombol **Refresh**, **Tambah**, dan di baris tugas yang sedang di-PATCH |
| 03 | **Menambahkan todo** — form input + `POST` | `Field` "Tugas baru" + tombol **Tambah** → `addTodo()` → `POST /todos`; tugas muncul di paling atas dengan chip "Baru" |
| 04 | **Ubah status tugas** — centang/toggle lewat `PATCH` | Ketuk baris tugas → `patchTodo()` → `PATCH /todos/:id`; status di UI mengikuti respons server |
| 05 | **Error handling** — `try/catch` + pesan umpan balik | `try/catch` di `useTodos`; gagal muat awal → `StateView` error + **Coba Lagi**; gagal refresh/POST/PATCH → `Alert` |
| 06 | **Refresh data** — tombol reload | Tombol **Refresh** di kepala layar → ambil ulang `GET /todos?_limit=10` |

Pesan error memakai `klasifikasiError` dari week 6, jadi offline / timeout / 4xx / 5xx / format data
masing-masing punya pesan yang jelas.

## Pemetaan materi slide → kode

| Materi slide | Di kode |
|---|---|
| Async/await & `try/catch` (slide 7) | semua fungsi di `todoApi.ts` dan `useTodos.ts` |
| API request: fetch → `.json()` → state → render (slide 8) | `fetchTodos` → `setTodos` → `TodoScreen` |
| Tri-state loading / error / success + conditional rendering (slide 9) | `loading`, `masalah`, `todos` di `useTodos`; percabangan di `TodoScreen` |
| `useEffect` async: fungsi async **di dalam** effect, dependency array, cleanup `AbortController` (slide 10) | `useEffect(…, [percobaan])` di `useTodos`: `ambil()` dideklarasikan di dalam effect, `ctrl.abort()` di cleanup |
| Serial vs paralel, `Promise.all` / `allSettled` (slide 11) | Tidak dipakai: ketiga request di sini saling bebas dan dipicu aksi pengguna, bukan sekaligus |

## Catatan penting

- **Expo SDK 57 → 58.** Expo Go terbaru di iPhone hanya mendukung SDK 58 (iOS tidak bisa memasang Expo Go lama),
  jadi dependency dinaikkan: `expo ~58.0.25`, `react-native 0.88.1`, `react 19.3.0`, dan paket `expo-*` yang
  mengikutinya. Kode aplikasi tidak perlu diubah. Setelah ini wajib `npm install` (atau `npm ci`) ulang.
- **API simulasi.** JSONPlaceholder menjawab POST/PATCH dengan 200/201 OK tetapi **tidak menyimpan** datanya.
  Karena itu: (1) hasil POST langsung ditaruh di daftar dari respons server, bukan GET ulang (GET ulang akan
  menghilangkannya); (2) tombol **Refresh** mengembalikan daftar ke data asli server, jadi tugas baru dan
  perubahan status hilang. Ini perilaku JSONPlaceholder, bukan bug.
- **POST selalu mengembalikan `id: 201`.** Tiap tugas diberi `kunci` unik di aplikasi agar `key` list tidak bentrok.
- **Tugas buatan sendiri tidak di-PATCH ke server**, karena id 201 tidak ada di server simulasi (PATCH ke id itu
  ditolak). Status tugas "Baru" diubah di aplikasi saja; tugas dari GET tetap lewat PATCH sungguhan.
- **Token tidak dikirim ke JSONPlaceholder.** Layar ini sengaja tidak memakai `apiFetch` (week 5) yang memasang
  Bearer token milik pengguna; token tidak boleh dikirim ke server pihak ketiga.
- Timeout request: `API_TIMEOUT_MS` (10 detik, dari `src/config.ts`). Request yang masih berjalan dibatalkan
  saat tab ditutup atau data diambil ulang.
- Aplikasi tetap responsif selama request: `await` hanya menunda fungsi async itu sendiri; UI thread tidak diblokir
  (event loop menjalankan kode lain sambil menunggu jaringan).

## Cara menguji (Expo Go, HP asli, perlu internet)

1. `npm install`, lalu `npx expo start`, scan QR dengan Expo Go.
2. Login → buka tab **Todo**.

| No | Uji | Yang harus terjadi |
|---|---|---|
| 1 | Buka tab Todo | Spinner "Memuat data…", lalu 10 tugas muncul (fitur 01 & 02) |
| 2 | Ketik "Belajar async" → **Tambah** | Tombol berubah "Menyimpan…" + spinner, tugas muncul paling atas dengan chip "Baru", kolom input kosong (fitur 03) |
| 3 | Tekan **Tambah** dengan kolom kosong | Pesan "Tugas tidak boleh kosong." (tidak ada request) |
| 4 | Ketuk salah satu tugas dari daftar | Spinner kecil sebentar, lalu tercentang & tercoret; ketuk lagi → kembali (fitur 04) |
| 5 | Tekan **Refresh** | Spinner di tombol, daftar kembali ke data awal server (fitur 06) |
| 6 | Aktifkan **mode pesawat**, buka ulang aplikasi → tab Todo | "Tidak ada koneksi internet" + tombol **Coba Lagi** (fitur 05) |
| 7 | Mode pesawat dinyalakan setelah daftar tampil, lalu **Tambah**, ketuk tugas, atau **Refresh** | `Alert` berisi pesan error; daftar & status tidak berubah (fitur 05) |
| 8 | Matikan mode pesawat → **Coba Lagi** | Data termuat |

## Checklist demo

- [ ] Data tugas tampil dari API saat tab dibuka (GET)
- [ ] Loading indicator tampil saat menunggu
- [ ] Tugas baru bisa ditambahkan (POST)
- [ ] Status tugas bisa diubah (PATCH)
- [ ] Error ditangani dengan pesan jelas (try/catch + Alert / StateView)
- [ ] Tombol Refresh mengambil ulang data
- [ ] Diuji di smartphone fisik lewat Expo Go

## Jawaban pertanyaan

1. **Bagaimana aplikasi tetap berjalan ketika sedang mengambil data dari internet?**
   `fetch` bersifat asinkron: permintaan diserahkan ke Web API/native networking, sedangkan call stack JavaScript
   bebas menjalankan kode lain. Saat respons datang, callback/continuation masuk antrean (Promise → microtask)
   dan event loop mengeksekusinya. Selama menunggu, UI tetap dirender dan bisa disentuh.
2. **Apa bedanya `async/await` dan `.then().catch()`?** Hasilnya sama (keduanya Promise), tetapi `async/await`
   dibaca linier seperti kode sinkron dan error ditangani dengan `try/catch`.
3. **Mengapa fungsi di dalam `useEffect` tidak boleh langsung `async`?** Callback `useEffect` harus mengembalikan
   fungsi cleanup (atau tidak sama sekali), sedangkan fungsi `async` selalu mengembalikan Promise. Jadi fungsi async
   dideklarasikan di dalamnya lalu dipanggil.
4. **Mengapa ada cleanup `ctrl.abort()`?** Agar request yang masih berjalan dibatalkan saat layar ditutup atau
   diganti request baru, sehingga tidak ada `setState` pada layar yang sudah hilang (memory leak).
5. **Mengapa dependency array `[percobaan]`?** Effect berjalan sekali saat dimuat dan hanya diulang saat
   `percobaan` naik (Refresh / Coba Lagi). Tanpa array, `setTodos` memicu render → effect → request → loop tak berujung.
