// OFFLINE HANDLING — cek status koneksi perangkat (Wi-Fi / data seluler).
import * as Network from "expo-network";

/**
 * true  = perangkat punya koneksi internet.
 * false = perangkat offline (mode pesawat, Wi-Fi/data mati, tanpa internet).
 * Jika status tidak bisa dibaca, dianggap online (jangan menuduh offline tanpa bukti).
 */
export async function cekOnline(): Promise<boolean> {
  try {
    const s = await Network.getNetworkStateAsync();
    return !(s.isConnected === false || s.isInternetReachable === false);
  } catch {
    return true;
  }
}