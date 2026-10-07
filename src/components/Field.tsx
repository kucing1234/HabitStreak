import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { C, MIN_TOUCH } from "../theme";

type Props = Omit<TextInputProps, "style" | "secureTextEntry"> & {
  label: string;
  error?: string;
  password?: boolean;
};

export default function Field({ label, error, password, ...rest }: Props) {
  const [tampil, setTampil] = useState(false);

  return (
    <View style={s.wrap}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.kotak, !!error && s.kotakError]}>
        <TextInput
          {...rest}
          accessibilityLabel={label}
          secureTextEntry={!!password && !tampil}
          placeholderTextColor="#94a3b8"
          style={s.input}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              tampil ? "Sembunyikan password" : "Tampilkan password"
            }
            style={s.mata}
            onPress={() => setTampil((v) => !v)}
          >
            <Ionicons
              name={tampil ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={C.teksLembut}
            />
          </Pressable>
        )}
      </View>
      {!!error && (
        <Text accessibilityLiveRegion="polite" style={s.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 16 },
  label: { fontSize: 14, fontWeight: "700", color: C.teks, marginBottom: 6 },
  kotak: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 54,
    backgroundColor: C.kartu,
    borderWidth: 2,
    borderColor: C.garis,
    borderRadius: 14,
    paddingLeft: 14,
  },
  kotakError: { borderColor: C.merah, backgroundColor: C.merahMuda },
  input: { flex: 1, fontSize: 16, color: C.teks, paddingVertical: 12 },
  mata: {
    width: MIN_TOUCH,
    height: MIN_TOUCH,
    alignItems: "center",
    justifyContent: "center",
  },
  error: { fontSize: 13, fontWeight: "600", color: C.merah, marginTop: 6 },
});