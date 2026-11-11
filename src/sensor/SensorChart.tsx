// WEEK 7 — Task 02: grafik perubahan nilai accelerometer (X, Y, Z) real-time.
import { StyleSheet, Text, View } from "react-native";
import Svg, { Line, Polyline, Text as SvgText } from "react-native-svg";
import { C } from "../theme";
import { JUMLAH_RIWAYAT, Sampel, format } from "./shake";

export const WARNA_SUMBU = {
  x: { teks: "#b91c1c", latar: "#fee2e2", dash: undefined },
  y: { teks: "#15803d", latar: "#dcfce7", dash: "8,4" },
  z: { teks: "#1d4ed8", latar: "#dbeafe", dash: "2,4" },
} as const;

const BATAS = 20; // sumbu Y grafik: -20 .. 20 m/s²
const GARIS = [-20, -10, 0, 10, 20];

type Props = { riwayat: Sampel[]; lebar: number; tinggi?: number };

export default function SensorChart({ riwayat, lebar, tinggi = 170 }: Props) {
  const kiri = 30;
  const w = Math.max(lebar - kiri - 6, 40);
  const h = tinggi - 12;
  const langkah = w / (JUMLAH_RIWAYAT - 1);

  const y = (v: number) => {
    const t = Math.max(-BATAS, Math.min(BATAS, v));
    return 6 + ((BATAS - t) / (2 * BATAS)) * h;
  };
  // Sampel terbaru selalu di sisi kanan grafik
  const titik = (sumbu: keyof Sampel) =>
    riwayat
      .map((s, i) => {
        const px = kiri + w - (riwayat.length - 1 - i) * langkah;
        return `${px.toFixed(1)},${y(s[sumbu]).toFixed(1)}`;
      })
      .join(" ");

  const t = riwayat[riwayat.length - 1];
  const label = t
    ? `Grafik perubahan nilai accelerometer. Nilai terakhir: X ${format(t.x)}, Y ${format(t.y)}, Z ${format(t.z)} meter per detik kuadrat.`
    : "Grafik perubahan nilai accelerometer. Belum ada data.";

  return (
    <View>
      <View accessible accessibilityRole="image" accessibilityLabel={label}>
        <Svg width={lebar} height={tinggi}>
          {GARIS.map((g) => (
            <Line
              key={`l${g}`}
              x1={kiri}
              x2={kiri + w}
              y1={y(g)}
              y2={y(g)}
              stroke={g === 0 ? "#94a3b8" : C.garis}
              strokeWidth={g === 0 ? 1.5 : 1}
            />
          ))}
          {GARIS.map((g) => (
            <SvgText
              key={`t${g}`}
              x={kiri - 5}
              y={y(g) + 4}
              fontSize={10}
              fill={C.teksLembut}
              textAnchor="end"
            >
              {g}
            </SvgText>
          ))}
          {riwayat.length > 1 &&
            (["x", "y", "z"] as const).map((k) => (
              <Polyline
                key={k}
                points={titik(k)}
                fill="none"
                stroke={WARNA_SUMBU[k].teks}
                strokeWidth={2.5}
                strokeDasharray={WARNA_SUMBU[k].dash}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
        </Svg>
      </View>

      {/* Legenda: bentuk garis + huruf, bukan hanya warna */}
      <View style={styles.legenda} accessibilityElementsHidden>
        {(["x", "y", "z"] as const).map((k) => (
          <View key={k} style={styles.legendaItem}>
            <Svg width={26} height={8}>
              <Line
                x1={0}
                x2={26}
                y1={4}
                y2={4}
                stroke={WARNA_SUMBU[k].teks}
                strokeWidth={3}
                strokeDasharray={WARNA_SUMBU[k].dash}
              />
            </Svg>
            <Text style={styles.legendaTeks}>{k.toUpperCase()}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legenda: { flexDirection: "row", justifyContent: "center", gap: 20 },
  legendaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendaTeks: { fontSize: 13, fontWeight: "700", color: C.teks },
});
