// WEEK 9 — Layar Todo List Async. Dipasang sebagai tab "Todo" di HomeScreen.
//
//   01 Tampilkan data API   -> GET  /todos?_limit=10 (useTodos, async/await + useEffect)
//   02 Loading indicator    -> <ActivityIndicator /> (StateView + tombol)
//   03 Menambahkan todo     -> form input + POST /todos
//   04 Ubah status tugas    -> centang + PATCH /todos/:id
//   05 Error handling       -> try/catch + Alert (di useTodos) + StateView error
//   06 Refresh data         -> tombol Refresh -> GET ulang
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Field from "../components/Field";
import StateView from "../components/StateView";
import { C, MIN_TOUCH, bayangan } from "../theme";
import { useTodos } from "./useTodos";

const MAX_JUDUL = 100;

type Props = {
  /** Skala font dari HomeScreen (responsive). */
  fs: (n: number) => number;
};

export default function TodoScreen({ fs }: Props) {
  const t = useTodos();
  const [judul, setJudul] = useState("");
  const [errJudul, setErrJudul] = useState("");

  const kirim = async () => {
    const bersih = judul.trim();
    if (!bersih) {
      setErrJudul("Tugas tidak boleh kosong.");
      return;
    }
    setErrJudul("");
    const ok = await t.tambah(bersih);
    if (ok) setJudul(""); // kosongkan form hanya jika POST berhasil
  };

  const selesai = t.todos.filter((x) => x.selesai).length;

  return (
    <View style={styles.wadah}>
      {/* JUDUL + REFRESH */}
      <View style={styles.baris}>
        <View style={styles.ikonKotak}>
          <Ionicons name="checkbox" size={fs(26)} color="#ffffff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={[styles.judul, { fontSize: fs(20) }]}>
            Todo List
          </Text>
          <Text style={[styles.sub, { fontSize: fs(13) }]}>
            {t.loading || t.masalah
              ? "Data dari REST API"
              : `${selesai} dari ${t.todos.length} tugas selesai`}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Refresh daftar tugas"
          accessibilityHint="Mengambil ulang daftar tugas terbaru dari server"
          accessibilityState={{ disabled: t.loading || t.refreshing, busy: t.refreshing }}
          disabled={t.loading || t.refreshing}
          style={({ pressed }) => [
            styles.tombolRefresh,
            (pressed || t.loading || t.refreshing) && styles.tombolRefreshAktif,
          ]}
          onPress={t.refresh}
        >
          {t.refreshing ? (
            <ActivityIndicator size="small" color={C.primer} />
          ) : (
            <Ionicons name="refresh" size={fs(20)} color={C.primer} />
          )}
          <Text style={[styles.refreshTeks, { fontSize: fs(14) }]}>Refresh</Text>
        </Pressable>
      </View>

      {/* FORM TAMBAH (POST) */}
      <View style={styles.form}>
        <Field
          label="Tugas baru"
          placeholder="Tambah tugas baru…"
          value={judul}
          onChangeText={(x) => {
            setJudul(x);
            setErrJudul("");
          }}
          error={errJudul}
          maxLength={MAX_JUDUL}
          editable={!t.menambah}
          returnKeyType="done"
          onSubmitEditing={kirim}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tambah tugas"
          accessibilityState={{ disabled: t.menambah, busy: t.menambah }}
          disabled={t.menambah}
          style={({ pressed }) => [styles.tombolTambah, (pressed || t.menambah) && styles.tombolTambahAktif]}
          onPress={kirim}
        >
          {t.menambah ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name="add" size={fs(22)} color="#ffffff" />
          )}
          <Text style={[styles.tombolTeks, { fontSize: fs(16) }]}>
            {t.menambah ? "Menyimpan…" : "Tambah"}
          </Text>
        </Pressable>
      </View>

      {/* DAFTAR: loading / error / kosong / sukses */}
      {t.loading ? (
        <StateView jenis="loading" fs={fs} />
      ) : t.masalah ? (
        <StateView
          jenis={t.masalah.jenis}
          judul={t.masalah.judul}
          pesan={t.masalah.pesan}
          onCobaLagi={t.muatUlang}
          fs={fs}
        />
      ) : t.todos.length === 0 ? (
        <StateView
          jenis="empty"
          judul="Belum ada tugas"
          pesan="Tambahkan tugas pertamamu lewat form di atas."
          fs={fs}
        />
      ) : (
        <View style={styles.daftar}>
          {t.todos.map((x) => {
            const sibuk = t.sibuk.includes(x.kunci);
            return (
              <Pressable
                key={x.kunci}
                accessibilityRole="checkbox"
                accessibilityLabel={x.judul}
                accessibilityHint="Ketuk dua kali untuk menandai selesai atau belum"
                accessibilityState={{ checked: x.selesai, busy: sibuk, disabled: sibuk }}
                disabled={sibuk}
                style={[styles.item, x.selesai && styles.itemSelesai]}
                onPress={() => t.ubahStatus(x)}
              >
                <View style={styles.ikonStatus}>
                  {sibuk ? (
                    <ActivityIndicator size="small" color={C.primer} />
                  ) : (
                    <Ionicons
                      name={x.selesai ? "checkmark-circle" : "ellipse-outline"}
                      size={fs(28)}
                      color={x.selesai ? C.hijau : "#94a3b8"}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.itemTeks,
                    { fontSize: fs(15) },
                    x.selesai && styles.itemTeksSelesai,
                  ]}
                >
                  {x.judul}
                </Text>
                {x.lokal && (
                  <View style={styles.chipBaru}>
                    <Text style={styles.chipBaruTeks}>Baru</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      )}

      <Text style={[styles.catatan, { fontSize: fs(12) }]}>
        API simulasi (JSONPlaceholder): tugas baru dan perubahan status tidak disimpan permanen
        di server, jadi kembali seperti semula setelah Refresh.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wadah: { paddingTop: 12, paddingBottom: 8 },

  baris: { flexDirection: "row", alignItems: "center", gap: 12 },
  ikonKotak: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.primer,
    alignItems: "center",
    justifyContent: "center",
  },
  judul: { fontWeight: "800", color: C.teks },
  sub: { color: C.teksLembut, marginTop: 1 },

  tombolRefresh: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: MIN_TOUCH,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: C.kartu,
    borderWidth: 2,
    borderColor: C.primerMuda,
  },
  tombolRefreshAktif: { backgroundColor: C.primerMuda },
  refreshTeks: { fontWeight: "700", color: C.primer },

  form: { marginTop: 4 },
  tombolTambah: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: C.primer,
    marginTop: 12,
    ...bayangan,
  },
  tombolTambahAktif: { backgroundColor: C.primerGelap },
  tombolTeks: { fontWeight: "700", color: "#ffffff" },

  daftar: { gap: 10, marginTop: 16 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 60,
    backgroundColor: C.kartu,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...bayangan,
  },
  itemSelesai: { backgroundColor: C.hijauMuda, borderColor: C.hijau },
  ikonStatus: { width: 30, alignItems: "center", justifyContent: "center" },
  itemTeks: { flex: 1, fontWeight: "600", color: C.teks },
  itemTeksSelesai: { textDecorationLine: "line-through", color: C.teksLembut },
  chipBaru: {
    backgroundColor: C.primerMuda,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipBaruTeks: { fontSize: 11, fontWeight: "700", color: C.primer },

  catatan: { color: C.teksLembut, lineHeight: 18, marginTop: 16 },
});
