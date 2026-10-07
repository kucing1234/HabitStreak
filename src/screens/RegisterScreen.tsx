import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  register,
  validasiEmail,
  validasiNama,
  validasiPassword,
} from "../auth";
import Field from "../components/Field";
import { C, bayangan } from "../theme";

type Props = { onRegistered: (user: User) => void; onGoLogin: () => void };

export default function RegisterScreen({ onRegistered, onGoLogin }: Props) {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [err, setErr] = useState({
    nama: "",
    email: "",
    password: "",
    konfirmasi: "",
  });
  const [errForm, setErrForm] = useState("");
  const [loading, setLoading] = useState(false);

  const hapusErr = (k: keyof typeof err) => {
    setErr((p) => ({ ...p, [k]: "" }));
    setErrForm("");
  };

  const kirim = async () => {
    const baru = {
      nama: validasiNama(nama),
      email: validasiEmail(email),
      password: validasiPassword(password),
      konfirmasi: !konfirmasi
        ? "Konfirmasi password wajib diisi."
        : konfirmasi !== password
          ? "Konfirmasi password tidak sama."
          : "",
    };
    setErr(baru);
    setErrForm("");
    if (Object.values(baru).some(Boolean)) return;

    setLoading(true);
    const hasil = await register(nama, email, password);
    setLoading(false);

    if (hasil.ok) onRegistered(hasil.user);
    else setErrForm(hasil.error);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={s.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.isi}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text accessibilityRole="header" style={s.logo}>
            HabitStreak
          </Text>
          <Text accessibilityRole="header" style={s.judul}>
            Buat Akun Baru
          </Text>
          <Text style={s.sub}>
            Daftar untuk mulai membangun kebiasaan baik.
          </Text>

          {!!errForm && (
            <View
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
              style={s.alert}
            >
              <Ionicons name="alert-circle" size={20} color={C.merah} />
              <Text style={s.alertTeks}>{errForm}</Text>
            </View>
          )}

          <Field
            label="Nama Lengkap"
            placeholder="Nama lengkap"
            value={nama}
            onChangeText={(t) => {
              setNama(t);
              hapusErr("nama");
            }}
            error={err.nama}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
          />
          <Field
            label="Email"
            placeholder="nama@email.com"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              hapusErr("email");
            }}
            error={err.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
          />
          <Field
            label="Password"
            placeholder="Minimal 6 karakter"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              hapusErr("password");
            }}
            error={err.password}
            password
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <Field
            label="Konfirmasi Password"
            placeholder="Ulangi password"
            value={konfirmasi}
            onChangeText={(t) => {
              setKonfirmasi(t);
              hapusErr("konfirmasi");
            }}
            error={err.konfirmasi}
            password
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={kirim}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Daftar"
            accessibilityState={{ disabled: loading, busy: loading }}
            disabled={loading}
            style={({ pressed }) => [
              s.tombol,
              (pressed || loading) && s.tombolDitekan,
            ]}
            onPress={kirim}
          >
            <Text style={s.tombolTeks}>
              {loading ? "Memproses…" : "Daftar"}
            </Text>
          </Pressable>

          <View style={s.baris}>
            <Text style={s.teksBiasa}>Sudah punya akun? </Text>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Masuk ke akun"
              style={s.linkWrap}
              onPress={onGoLogin}
            >
              <Text style={s.link}>Masuk</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.latar },
  isi: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    maxWidth: 520,
    width: "100%",
    alignSelf: "center",
  },
  logo: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "800",
    color: C.primerGelap,
  },
  judul: { fontSize: 28, fontWeight: "800", color: C.teks, marginTop: 20 },
  sub: { fontSize: 15, color: C.teksLembut, marginTop: 4 },
  alert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.merahMuda,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  alertTeks: { flex: 1, color: C.merah, fontWeight: "600", fontSize: 14 },
  tombol: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    backgroundColor: C.primer,
    borderRadius: 16,
    marginTop: 24,
    ...bayangan,
  },
  tombolDitekan: { backgroundColor: C.primerGelap },
  tombolTeks: { color: "#fff", fontSize: 16, fontWeight: "700" },
  baris: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  teksBiasa: { color: C.teksLembut, fontSize: 14 },
  linkWrap: { minHeight: 48, justifyContent: "center" },
  link: { color: C.primer, fontWeight: "700", fontSize: 14 },
});