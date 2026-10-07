import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
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

  // Saat aplikasi dibuka: baca kembali session dari secure storage
  useEffect(() => {
    getSession().then((u) => {
      setUser(u);
      setSiap(true);
    });
  }, []);

  const keluar = async () => {
    await logout(); // hapus session dari secure storage
    setUser(null);
    setLayar("login");
  };

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