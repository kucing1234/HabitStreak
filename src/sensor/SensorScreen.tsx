// WEEK 7 — Layar Sensor: Task 01 (baca + permission), Task 02 (tampilkan
// real-time), Task 03 (interaksi goyang). Dipasang sebagai tab di HomeScreen.
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C, MIN_TOUCH, bayangan } from "../theme";
import SensorChart, { WARNA_SUMBU } from "./SensorChart";
import { AMBANG_GOYANG_G, format } from "./shake";
import { useAccelerometer } from "./useAccelerometer";

type Props = {
  /** Lebar area konten (px) — dipakai untuk menggambar grafik. */
  lebar: number;
  /** Skala font dari HomeScreen (responsive). */
  fs: (n: number) => number;
  /** Kembali ke Beranda (dipakai saat izin ditolak). */
  onKembali: () => void;
};

const SUMBU = [
  { k: "x", judul: "X", arah: "Kiri – Kanan" },
  { k: "y", judul: "Y", arah: "Atas – Bawah" },
  { k: "z", judul: "Z", arah: "Depan – Belakang" },
] as const;

export default function SensorScreen({ lebar, fs, onKembali }: Props) {
  const s = useAccelerometer();
  const aktif = s.status === "aktif";

  return (
    <View style={styles.wadah}>
      {/* JUDUL */}
      <View style={styles.baris}>
        <View style={styles.ikonKotak}>
          <Ionicons name="walk" size={fs(26)} color="#ffffff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            accessibilityRole="header"
            style={[styles.judul, { fontSize: fs(20) }]}
          >
            Accelerometer
          </Text>
          <Text style={[styles.sub, { fontSize: fs(13) }]}>
            Data sensor pergerakan dalam real-time.
          </Text>
        </View>
      </View>

      <Chip status={s.status} fs={fs} />

      {/* IZIN (permission request) */}
      {s.status === "perlu-izin" && (
        <Panel
          ikon="shield-checkmark"
          judul="Izinkan Akses Sensor?"
          pesan="HabitStreak ingin mengakses sensor gerak (accelerometer) untuk membaca pergerakan perangkat. Data hanya dipakai di layar ini dan tidak dikirim ke mana pun."
          fs={fs}
        >
          <Tombol
            label="Izinkan"
            hint="Meminta izin akses sensor gerak"
            onPress={s.mintaIzin}
            fs={fs}
          />
          <Tombol
            label="Tolak"
            hint="Tidak memberi izin akses sensor"
            onPress={s.tolakIzin}
            sekunder
            fs={fs}
          />
        </Panel>
      )}

      {/* IZIN DITOLAK */}
      {s.status === "ditolak" && (
        <Panel
          ikon="close-circle"
          judul="Akses Sensor Ditolak"
          pesan="Aplikasi tidak dapat membaca sensor gerak. Anda dapat mengubah izin melalui pengaturan perangkat."
          bahaya
          fs={fs}
        >
          {s.bisaMinta ? (
            <Tombol
              label="Izinkan Lagi"
              hint="Meminta izin akses sensor sekali lagi"
              onPress={s.mintaIzin}
              fs={fs}
            />
          ) : (
            <Tombol
              label="Buka Pengaturan"
              hint="Membuka pengaturan aplikasi untuk mengubah izin"
              onPress={s.bukaPengaturan}
              fs={fs}
            />
          )}
          <Tombol
            label="Kembali"
            hint="Kembali ke Beranda"
            onPress={onKembali}
            sekunder
            fs={fs}
          />
        </Panel>
      )}

      {/* SENSOR TIDAK ADA */}
      {s.status === "tidak-tersedia" && (
        <Panel
          ikon="hardware-chip"
          judul="Sensor Tidak Tersedia"
          pesan="Perangkat ini tidak memiliki accelerometer atau sensornya tidak aktif. Coba jalankan di HP asli (Expo Go), bukan emulator atau web."
          bahaya
          fs={fs}
        >
          <Tombol
            label="Kembali"
            hint="Kembali ke Beranda"
            onPress={onKembali}
            sekunder
            fs={fs}
          />
        </Panel>
      )}

      {/* DATA SENSOR */}
      {(aktif || s.status === "dijeda") && (
        <>
          {/* Task 03: status interaksi goyang */}
          <View
            accessible
            accessibilityRole={s.goyang ? "alert" : undefined}
            accessibilityLiveRegion="polite"
            accessibilityLabel={
              s.goyang ? "Goyang terdeteksi! Getaran aktif." : "Siap mendeteksi goyangan."
            }
            style={[styles.status, s.goyang ? styles.statusGoyang : styles.statusSiap]}
          >
            <Ionicons
              name={s.goyang ? "phone-portrait" : "radio-button-on"}
              size={fs(22)}
              color={s.goyang ? C.merah : C.hijau}
            />
            <Text
              style={[
                styles.statusTeks,
                { fontSize: fs(16), color: s.goyang ? C.merah : C.hijau },
              ]}
            >
              {s.goyang ? "Goyang Terdeteksi!" : "Siap mendeteksi…"}
            </Text>
          </View>

          {/* Task 02: nilai X, Y, Z */}
          <View style={styles.kartuBaris}>
            {SUMBU.map((a) => (
              <View
                key={a.k}
                accessible
                accessibilityLabel={`Sumbu ${a.judul}, ${a.arah}, ${format(s.terakhir[a.k])} meter per detik kuadrat`}
                style={[styles.kartuNilai, { backgroundColor: WARNA_SUMBU[a.k].latar }]}
              >
                <Text style={[styles.sumbu, { fontSize: fs(18), color: WARNA_SUMBU[a.k].teks }]}>
                  {a.judul}
                </Text>
                <Text style={[styles.nilai, { fontSize: fs(22), color: WARNA_SUMBU[a.k].teks }]}>
                  {format(s.terakhir[a.k])}
                </Text>
                <Text style={[styles.satuan, { fontSize: fs(12) }]}>m/s²</Text>
              </View>
            ))}
          </View>

          <View style={styles.kartu}>
            <Text style={[styles.kartuJudul, { fontSize: fs(15) }]}>
              Grafik Perubahan Nilai
            </Text>
            <SensorChart riwayat={s.riwayat} lebar={Math.max(lebar - 32, 120)} />
          </View>

          <Text style={[styles.catatan, { fontSize: fs(13) }]}>
            Goyangkan perangkat untuk mencoba. Goyangan terdeteksi jika
            percepatan melewati {AMBANG_GOYANG_G} g.{"\n"}
            Goyangan terdeteksi: {s.jumlahGoyang}×
          </Text>

          <Tombol
            label={aktif ? "Hentikan Sensor" : "Mulai Sensor"}
            hint={aktif ? "Menghentikan pembacaan sensor" : "Memulai pembacaan sensor"}
            onPress={aktif ? s.jeda : s.mulai}
            sekunder={aktif}
            fs={fs}
          />
        </>
      )}
    </View>
  );
}

/* ---------- komponen kecil ---------- */

function Chip({ status, fs }: { status: string; fs: (n: number) => number }) {
  const peta: Record<string, { teks: string; ikon: "ellipse" | "pause-circle" | "help-circle"; warna: string; latar: string }> = {
    memeriksa: { teks: "Memeriksa sensor…", ikon: "help-circle", warna: C.teksLembut, latar: C.garis },
    aktif: { teks: "Sensor Aktif", ikon: "ellipse", warna: C.hijau, latar: C.hijauMuda },
    dijeda: { teks: "Sensor Dijeda", ikon: "pause-circle", warna: "#92400e", latar: "#fef3c7" },
    "perlu-izin": { teks: "Menunggu Izin", ikon: "help-circle", warna: "#92400e", latar: "#fef3c7" },
    ditolak: { teks: "Izin Ditolak", ikon: "help-circle", warna: C.merah, latar: C.merahMuda },
    "tidak-tersedia": { teks: "Tidak Tersedia", ikon: "help-circle", warna: C.merah, latar: C.merahMuda },
  };
  const p = peta[status] ?? peta.memeriksa;
  return (
    <View
      accessible
      accessibilityLabel={`Status sensor: ${p.teks}`}
      style={[styles.chip, { backgroundColor: p.latar }]}
    >
      <Ionicons name={p.ikon} size={fs(14)} color={p.warna} />
      <Text style={[styles.chipTeks, { fontSize: fs(13), color: p.warna }]}>
        {p.teks}
      </Text>
    </View>
  );
}

function Panel({
  ikon,
  judul,
  pesan,
  bahaya,
  fs,
  children,
}: {
  ikon: React.ComponentProps<typeof Ionicons>["name"];
  judul: string;
  pesan: string;
  bahaya?: boolean;
  fs: (n: number) => number;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.panel}>
      <View
        accessible
        accessibilityRole={bahaya ? "alert" : undefined}
        accessibilityLabel={`${judul}. ${pesan}`}
        style={styles.panelAtas}
      >
        <View
          style={[
            styles.panelIkon,
            { backgroundColor: bahaya ? C.merahMuda : C.primerMuda },
          ]}
        >
          <Ionicons name={ikon} size={fs(34)} color={bahaya ? C.merah : C.primer} />
        </View>
        <Text style={[styles.panelJudul, { fontSize: fs(18) }]}>{judul}</Text>
        <Text style={[styles.panelPesan, { fontSize: fs(14) }]}>{pesan}</Text>
      </View>
      <View style={styles.panelTombol}>{children}</View>
    </View>
  );
}

function Tombol({
  label,
  hint,
  onPress,
  sekunder,
  fs,
}: {
  label: string;
  hint: string;
  onPress: () => void;
  sekunder?: boolean;
  fs: (n: number) => number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tombol,
        sekunder ? styles.tombolSekunder : styles.tombolUtama,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text
        style={[
          styles.tombolTeks,
          { fontSize: fs(16), color: sekunder ? C.primer : "#ffffff" },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wadah: { paddingTop: 16, paddingBottom: 24, gap: 14 },
  baris: { flexDirection: "row", alignItems: "center", gap: 12 },
  ikonKotak: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.primer,
    alignItems: "center",
    justifyContent: "center",
  },
  judul: { fontWeight: "800", color: C.teks },
  sub: { color: C.teksLembut, marginTop: 2 },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipTeks: { fontWeight: "700" },

  status: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: MIN_TOUCH,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  statusSiap: { backgroundColor: C.hijauMuda, borderColor: "#86efac" },
  statusGoyang: { backgroundColor: C.merahMuda, borderColor: "#fca5a5" },
  statusTeks: { fontWeight: "800" },

  kartuBaris: { flexDirection: "row", gap: 10 },
  kartuNilai: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 16,
  },
  sumbu: { fontWeight: "800" },
  nilai: { fontWeight: "800", marginTop: 2 },
  satuan: { color: C.teksLembut, marginTop: 2 },

  kartu: {
    backgroundColor: C.kartu,
    borderRadius: 18,
    padding: 16,
    gap: 8,
    ...bayangan,
  },
  kartuJudul: { fontWeight: "800", color: C.teks },
  catatan: { color: C.teksLembut, lineHeight: 20, textAlign: "center" },

  panel: {
    backgroundColor: C.kartu,
    borderRadius: 18,
    padding: 20,
    gap: 16,
    ...bayangan,
  },
  panelAtas: { alignItems: "center", gap: 8 },
  panelIkon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  panelJudul: { fontWeight: "800", color: C.teks, textAlign: "center" },
  panelPesan: { color: C.teksLembut, textAlign: "center", lineHeight: 20 },
  panelTombol: { gap: 10 },

  tombol: {
    minHeight: MIN_TOUCH,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  tombolUtama: { backgroundColor: C.primer },
  tombolSekunder: { backgroundColor: C.primerMuda },
  tombolTeks: { fontWeight: "700" },
});
