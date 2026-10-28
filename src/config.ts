// Alamat REST API (server di folder /server, jalankan: npm run server).
// Ganti lewat EXPO_PUBLIC_API_URL (file .env), mis.:
//   - Expo Go di HP      : http://<IP-LAN-laptop>:3000   (lihat output `npm run server`)
//   - Emulator Android   : http://10.0.2.2:3000
//   - Produksi / HTTPS   : https://api.contoh.id
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.1.20:3000"
).replace(/\/+$/, "");

// HTTPS: token & password hanya boleh dikirim lewat koneksi terenkripsi.
// HTTP hanya diizinkan saat development (__DEV__), mis. server lokal.
export const API_AMAN = API_URL.startsWith("https://");

export const API_TIMEOUT_MS = 10000;

// LOG SEMENTARA (hapus setelah masalah koneksi selesai)
console.log("API_URL =", API_URL);