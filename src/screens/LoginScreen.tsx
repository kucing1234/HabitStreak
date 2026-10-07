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
import { User, login } from "../auth";
import Field from "../components/Field";
import { C, bayangan } from "../theme";

type Props = { onLogin: (user: User) => void; onGoRegister: () => void };

export default function LoginScreen({ onLogin, onGoRegister }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errEmail, setErrEmail] = useState("");
  const [errPassword, setErrPassword] = useState("");
  const [errForm, setErrForm] = useState("");
  const [loading, setLoading] = useState(false);

  const kirim = async () => {
    // Validasi: input kosong -> pesan validasi
    const e1 = email.trim() ? "" : "Email wajib diisi.";
    const e2 = password ? "" : "Password wajib diisi.";
    setErrEmail(e1);
    setErrPassword(e2);
    setErrForm("");
    if (e1 || e2) return;

    setLoading(true);
    const hasil = await login(email, password);
    setLoading(false);

    if (hasil.ok) onLogin(hasil.user);
    else setErrForm(hasil.error); // credential salah -> login ditolak + pesan error
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
          <View style={s.logoBulat}>
            <Ionicons name="flame" size={40} color="#b45309" />
          </View>
          <Text accessibilityRole="header" style={s.logo}>
            HabitStreak
          </Text>
          <Text accessibilityRole="header" style={s.judul}>
            Masuk ke Akun
          </Text>
          <Text style={s.sub}>Lanjutkan streak kebiasaanmu hari ini.</Text>

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
            label="Email"
            placeholder="nama@email.com"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setErrEmail("");
              setErrForm("");
            }}
            error={errEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
          />
          <Field
            label="Password"
            placeholder="Masukkan password"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setErrPassword("");
              setErrForm("");
            }}
            error={errPassword}
            password
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={kirim}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Masuk"
            accessibilityState={{ disabled: loading, busy: loading }}
            disabled={loading}
            style={({ pressed }) => [
              s.tombol,
              (pressed || loading) && s.tombolDitekan,
            ]}
            onPress={kirim}
          >
            <Text style={s.tombolTeks}>{loading ? "Memproses…" : "Masuk"}</Text>
          </Pressable>

          <View style={s.baris}>
            <Text style={s.teksBiasa}>Belum punya akun? </Text>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Daftar akun baru"
              style={s.linkWrap}
              onPress={onGoRegister}
            >
              <Text style={s.link}>Daftar</Text>
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
  logoBulat: {
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "800",
    color: C.primerGelap,
    marginTop: 12,
  },
  judul: { fontSize: 28, fontWeight: "800", color: C.teks, marginTop: 24 },
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