import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { setUnauthorizedHandler } from "./src/api/client";
import { User, getSession, logout } from "./src/auth";
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import { C } from "./src/theme";

type Layar = "login" | "register";

export default function App() {
  const [user, setUser] = useState<User | null>(null); // authentication state
  const [siap, setSiap] = useState(false);
  const [layar, setLayar] = useState<Layar>("login");

  const keluar = useCallback(async () => {
    await logout(); // hapus token + session dari secure storage
    setUser(null); // authentication state: unauthenticated
    setLayar("login");
  }, []);

  // Token ditolak server (401: kedaluwarsa / tidak valid) -> session dibersihkan
  // dan aplikasi kembali ke halaman login.
  useEffect(() => {
    setUnauthorizedHandler(keluar);
    return () => setUnauthorizedHandler(null);
  }, [keluar]);

  // Saat aplikasi dibuka: baca token dari secure storage, validasi ke server
  useEffect(() => {
    getSession().then((u) => {
      setUser(u);
      setSiap(true);
    });
  }, []);

  if (!siap) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: C.latar,
        }}
      >
        <StatusBar style="dark" />
        <ActivityIndicator
          size="large"
          color={C.primer}
          accessibilityLabel="Memuat"
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      {user ? (
        <HomeScreen user={user} onLogout={keluar} />
      ) : layar === "login" ? (
        <LoginScreen
          onLogin={setUser}
          onGoRegister={() => setLayar("register")}
        />
      ) : (
        <RegisterScreen
          onRegistered={setUser}
          onGoLogin={() => setLayar("login")}
        />
      )}
    </SafeAreaProvider>
  );
}