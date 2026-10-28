// Tampilan state data API: loading, retry, error, offline, timeout, empty.
// Success state = daftar data yang ditampilkan oleh screen (bukan komponen ini).
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { JenisError } from "../api/errors";
import { C, MIN_TOUCH } from "../theme";

export type JenisState = "loading" | "retry" | "empty" | JenisError;

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const IKON: Record<JenisError | "empty", IconName> = {
  offline: "cloud-offline",
  timeout: "time",
  client: "alert-circle",
  server: "server",
  jaringan: "cloud-offline",
  format: "alert-circle",
  aman: "lock-closed",
  empty: "file-tray",
};

type Props = {
  jenis: JenisState;
  judul?: string;
  pesan?: string;
  /** Jika diisi, tombol "Coba Lagi" ditampilkan (retry mechanism). */
  onCobaLagi?: () => void;
  fs?: (n: number) => number;
};

export default function StateView({
  jenis,
  judul,
  pesan,
  onCobaLagi,
  fs = (n) => n,
}: Props) {
  if (jenis === "loading" || jenis === "retry") {
    const j = jenis === "retry" ? "Mencoba lagi…" : "Memuat data…";
    const p = jenis === "retry" ? "Mengambil data terbaru." : "Mohon tunggu sebentar.";
    return (
      <View
        accessible
        accessibilityLabel={`${j} ${p}`}
        accessibilityLiveRegion="polite"
        style={styles.kotak}
      >
        <ActivityIndicator size="large" color={C.primer} />
        <Text style={[styles.judul, { fontSize: fs(17) }]}>{j}</Text>
        <Text style={[styles.pesan, { fontSize: fs(14) }]}>{p}</Text>
      </View>
    );
  }

  const kosong = jenis === "empty";
  const warna = kosong ? C.primer : C.merah;
  const latar = kosong ? C.primerMuda : C.merahMuda;

  return (
    <View
      accessible
      accessibilityRole={kosong ? undefined : "alert"}
      accessibilityLiveRegion={kosong ? "polite" : "assertive"}
      accessibilityLabel={`${judul ?? ""}. ${pesan ?? ""}`}
      style={styles.kotak}
    >
      <View style={[styles.lingkaran, { backgroundColor: latar }]}>
        <Ionicons name={IKON[jenis]} size={fs(36)} color={warna} />
      </View>
      <Text style={[styles.judul, { fontSize: fs(17) }]}>
        {judul ?? (kosong ? "Belum ada data" : "Terjadi kesalahan")}
      </Text>
      <Text style={[styles.pesan, { fontSize: fs(14) }]}>
        {pesan ?? (kosong ? "Saat ini belum ada kebiasaan yang tersedia." : "")}
      </Text>

      {onCobaLagi && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Coba lagi"
          accessibilityHint="Mengambil ulang data kebiasaan dari server"
          style={({ pressed }) => [
            styles.tombol,
            { backgroundColor: pressed ? "#991b1b" : C.merah },
          ]}
          onPress={onCobaLagi}
        >
          <Ionicons name="refresh" size={fs(20)} color="#ffffff" />
          <Text style={[styles.tombolText, { fontSize: fs(16) }]}>Coba Lagi</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  kotak: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 12,
    gap: 10,
  },
  lingkaran: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  judul: { fontWeight: "800", color: C.teks, textAlign: "center", marginTop: 6 },
  pesan: { color: C.teksLembut, textAlign: "center", lineHeight: 20 },
  tombol: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: MIN_TOUCH,
    paddingHorizontal: 28,
    borderRadius: 14,
    marginTop: 10,
  },
  tombolText: { fontWeight: "700", color: "#ffffff" },
});