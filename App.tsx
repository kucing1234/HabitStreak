import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Habit = {
  id: string;
  nama: string;
  icon: IconName;
  warna: string;
  latar: string;
  streak: number;
};

type NavItem = { label: string; icon: IconName; iconAktif: IconName };

const HABITS: Habit[] = [
  { id: '1', nama: 'Membaca', icon: 'book', warna: '#1d4ed8', latar: '#dbeafe', streak: 12 },
  { id: '2', nama: 'Olahraga', icon: 'barbell', warna: '#c2410c', latar: '#ffedd5', streak: 7 },
  { id: '3', nama: 'Minum Air', icon: 'water', warna: '#0e7490', latar: '#cffafe', streak: 21 },
];

const NAV: NavItem[] = [
  { label: 'Beranda', icon: 'home-outline', iconAktif: 'home' },
  { label: 'Kebiasaan', icon: 'checkmark-done-outline', iconAktif: 'checkmark-done' },
  { label: 'Statistik', icon: 'stats-chart-outline', iconAktif: 'stats-chart' },
  { label: 'Profil', icon: 'person-outline', iconAktif: 'person' },
];

const C = {
  primer: '#4f46e5',
  primerGelap: '#3730a3',
  primerMuda: '#eef2ff',
  teks: '#0f172a',
  teksLembut: '#475569',
  latar: '#f8fafc',
  kartu: '#ffffff',
  garis: '#e2e8f0',
  hijau: '#15803d',
  hijauMuda: '#dcfce7',
  kuning: '#fbbf24',
};

const MIN_TOUCH = 48;

export default function App() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isSmall = width < 360;
  const isLarge = width >= 600;
  const isWide = isLandscape || isLarge;
  const scale = isSmall ? 0.9 : isLarge ? 1.15 : 1;
  const fs = (n: number) => Math.round(n * scale);
  const pad = isLarge ? 32 : 20;

  // Ukuran gambar dihitung eksplisit agar selalu pas di layar (tidak terpotong)
  const lebarKonten = Math.min(width, 900);
  const kolom = lebarKonten - pad * 2;
  const heroW = isWide ? Math.floor((kolom - 20) / 2) : kolom;
  const heroH = Math.round((heroW * 560) / 1000);

  const [selesai, setSelesai] = useState<string[]>([]);
  const [tab, setTab] = useState('Beranda');

  const total = HABITS.length;
  const jumlah = selesai.length;
  const persen = Math.round((jumlah / total) * 100);

  const toggleHabit = (id: string) =>
    setSelesai((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={[styles.header, { paddingHorizontal: pad }]}>
        <View style={styles.headerKiri}>
          <Text style={[styles.sapaan, { fontSize: fs(13) }]}>Selamat datang 👋</Text>
          <Text accessibilityRole="header" style={[styles.logo, { fontSize: fs(22) }]}>
            HabitStreak
          </Text>
        </View>
        <View accessible accessibilityLabel="Streak saat ini 6 hari" style={styles.badge}>
          <Ionicons name="flame" size={fs(18)} color="#b45309" />
          <Text style={[styles.badgeText, { fontSize: fs(14) }]}>6 hari</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.content, { width: lebarKonten, paddingHorizontal: pad }]}>
          {/* HERO */}
          <View style={[styles.atas, isWide && styles.atasWide]}>
            <Image
              source={require('./assets/hero.png')}
              style={[styles.hero, { width: heroW, height: heroH }]}
              resizeMode="cover"
              accessible
              accessibilityRole="image"
              accessibilityLabel="Ilustrasi api streak dan tujuh hari kebiasaan, enam hari sudah selesai"
            />

            <View style={[styles.teks, isWide && styles.teksWide]}>
              <Text accessibilityRole="header" style={[styles.judul, { fontSize: fs(28) }]}>
                Bangun Kebiasaan,{'\n'}Jaga Streak-mu
              </Text>
              <Text style={[styles.deskripsi, { fontSize: fs(15), lineHeight: fs(22) }]}>
                Catat kebiasaan harian, lihat progres streak, dan tetap konsisten setiap hari.
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Mulai Sekarang"
                accessibilityHint="Membuka halaman untuk menambah kebiasaan pertamamu"
                style={({ pressed }) => [styles.tombol, pressed && styles.tombolDitekan]}
                onPress={() => console.log('Mulai ditekan')}
              >
                <Text style={[styles.tombolText, { fontSize: fs(16) }]}>Mulai Sekarang</Text>
                <Ionicons name="arrow-forward" size={fs(20)} color="#ffffff" />
              </Pressable>
            </View>
          </View>

          {/* PROGRES HARI INI */}
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={`Progres hari ini, ${jumlah} dari ${total} kebiasaan selesai`}
            accessibilityValue={{ min: 0, max: total, now: jumlah }}
            style={styles.progresKartu}
          >
            <View style={styles.progresAtas}>
              <Text style={[styles.progresJudul, { fontSize: fs(15) }]}>Progres Hari Ini</Text>
              <Text style={[styles.progresAngka, { fontSize: fs(15) }]}>
                {jumlah}/{total} selesai
              </Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${persen}%` }]} />
            </View>
          </View>

          {/* DAFTAR KEBIASAAN */}
          <View style={styles.sectionHeader}>
            <Text accessibilityRole="header" style={[styles.sectionJudul, { fontSize: fs(18) }]}>
              Kebiasaan Hari Ini
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Lihat semua kebiasaan"
              accessibilityHint="Membuka daftar lengkap kebiasaan"
              style={styles.lihatSemuaWrap}
              onPress={() => console.log('Lihat semua')}
            >
              <Text style={[styles.lihatSemua, { fontSize: fs(14) }]}>Lihat Semua</Text>
              <Ionicons name="chevron-forward" size={fs(16)} color={C.primer} />
            </Pressable>
          </View>

          <View style={styles.daftar}>
            {HABITS.map((h) => {
              const done = selesai.includes(h.id);
              return (
                <Pressable
                  key={h.id}
                  accessibilityRole="checkbox"
                  accessibilityLabel={`${h.nama}, streak ${h.streak} hari`}
                  accessibilityHint="Ketuk dua kali untuk menandai selesai atau belum"
                  accessibilityState={{ checked: done }}
                  style={[
                    styles.item,
                    { flexBasis: isWide ? '48%' : '100%' },
                    done && styles.itemSelesai,
                  ]}
                  onPress={() => toggleHabit(h.id)}
                >
                  <View style={[styles.ikonBulat, { backgroundColor: h.latar }]}>
                    <Ionicons name={h.icon} size={fs(22)} color={h.warna} />
                  </View>

                  <View style={styles.itemTeks}>
                    <Text style={[styles.itemNama, { fontSize: fs(16) }]}>{h.nama}</Text>
                    <Text style={[styles.itemInfo, { fontSize: fs(13) }]}>
                      {h.streak} hari streak · {done ? 'Selesai ✓' : 'Belum selesai'}
                    </Text>
                  </View>

                  <Ionicons
                    name={done ? 'checkmark-circle' : 'ellipse-outline'}
                    size={fs(28)}
                    color={done ? C.hijau : '#94a3b8'}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* NAVIGASI */}
      <View accessibilityRole="tablist" style={styles.nav}>
        {NAV.map((n) => {
          const aktif = tab === n.label;
          return (
            <Pressable
              key={n.label}
              accessibilityRole="tab"
              accessibilityLabel={n.label}
              accessibilityState={{ selected: aktif }}
              style={styles.navItem}
              onPress={() => setTab(n.label)}
            >
              <View style={[styles.navPil, aktif && styles.navPilAktif]}>
                <Ionicons
                  name={aktif ? n.iconAktif : n.icon}
                  size={22}
                  color={aktif ? C.primer : C.teksLembut}
                />
              </View>
              <Text
                maxFontSizeMultiplier={1.3}
                style={[styles.navLabel, aktif && styles.navLabelAktif]}
              >
                {n.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const bayangan = {
  shadowColor: '#0f172a',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 3,
} as const;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.latar },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 64,
    paddingVertical: 10,
  },
  headerKiri: { flexShrink: 1 },
  sapaan: { color: C.teksLembut },
  logo: { fontWeight: '800', color: C.primerGelap, letterSpacing: -0.3 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  badgeText: { fontWeight: '800', color: '#92400e' },

  content: { alignSelf: 'center', paddingBottom: 24 },

  atas: { flexDirection: 'column' },
  atasWide: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  hero: { borderRadius: 24 },
  teks: { marginTop: 20 },
  teksWide: { flex: 1, marginTop: 0 },

  judul: { fontWeight: '800', color: C.teks, letterSpacing: -0.5 },
  deskripsi: { color: C.teksLembut, marginTop: 8 },

  tombol: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primer,
    minHeight: 54,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 18,
    ...bayangan,
  },
  tombolDitekan: { backgroundColor: C.primerGelap },
  tombolText: { fontWeight: '700', color: '#ffffff' },

  progresKartu: {
    backgroundColor: C.kartu,
    borderRadius: 20,
    padding: 16,
    marginTop: 24,
    ...bayangan,
  },
  progresAtas: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progresJudul: { fontWeight: '700', color: C.teks },
  progresAngka: { fontWeight: '700', color: C.primer },
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: C.primerMuda,
    marginTop: 12,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 999, backgroundColor: C.primer },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 4,
  },
  sectionJudul: { fontWeight: '800', color: C.teks, flexShrink: 1 },
  lihatSemuaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: MIN_TOUCH,
    paddingLeft: 12,
  },
  lihatSemua: { fontWeight: '700', color: C.primer },

  daftar: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  item: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 72,
    backgroundColor: C.kartu,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 14,
    ...bayangan,
  },
  itemSelesai: { backgroundColor: C.hijauMuda, borderColor: C.hijau },
  ikonBulat: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTeks: { flex: 1 },
  itemNama: { fontWeight: '700', color: C.teks },
  itemInfo: { color: C.teksLembut, marginTop: 2 },

  nav: {
    flexDirection: 'row',
    backgroundColor: C.kartu,
    borderTopWidth: 1,
    borderTopColor: C.garis,
    paddingTop: 6,
    paddingBottom: 4,
  },
  navItem: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
  navPil: {
    width: 56,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navPilAktif: { backgroundColor: C.primerMuda },
  navLabel: { fontSize: 12, color: C.teksLembut, marginTop: 2 },
  navLabelAktif: { color: C.primer, fontWeight: '700' },
});
