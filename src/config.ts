// Alamat REST API (server di folder /server, jalankan: npm run server).
//
// Urutan pemilihan alamat:
//   1. EXPO_PUBLIC_API_URL di file .env (jika ada)        -> selalu dipakai
//   2. Otomatis: alamat laptop yang menjalankan Expo + port 3000
//      (Expo Go sudah tahu alamat laptop dari QR code, jadi IP Wi-Fi yang
//      berubah-ubah tidak perlu diketik manual)
//   3. http://localhost:3000 (emulator / web)
import Constants from "expo-constants";

const hostLaptop = Constants.expoConfig?.hostUri?.split(":")[0];
const ALAMAT_OTOMATIS = hostLaptop
  ? `http://${hostLaptop}:3000`
  : "http://localhost:3000";

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || ALAMAT_OTOMATIS
).replace(/\/+$/, "");

// HTTPS: token & password hanya boleh dikirim lewat koneksi terenkripsi.
// HTTP hanya diizinkan saat development (__DEV__), mis. server lokal.
export const API_AMAN = API_URL.startsWith("https://");

export const API_TIMEOUT_MS = 10000;