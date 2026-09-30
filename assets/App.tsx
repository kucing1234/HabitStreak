import { StatusBar } from 'expo-status-bar';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Habit = {
  id: string;
  nama: string;
  ikon: string;
  streak: number;
};

type NavItem = {
  label: string;
  ikon: string;
  aktif?: boolean;
};

const HABITS: Habit[] = [
  { id: '1', nama: 'Membaca', ikon: '📖', streak: 12 },
  { id: '2', nama: 'Olahraga', ikon: '🏃', streak: 7 },
  { id: '3', nama: 'Minum Air', ikon: '💧', streak: 21 },
];

const NAV: NavItem[] = [
  { label: 'Beranda', ikon: '🏠', aktif: true },
  { label: 'Kebiasaan', ikon: '✅' },
  { label: 'Statistik', ikon: '📊' },
  { label: 'Profil', ikon: '👤' },
];

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* 1. HEADER */}
      <View style={styles.header}>
        <Text style={styles.logo}>HABITSTREAK</Text>
        <View style={styles.streakBadge}>
          <Text style={styles.streakBadgeText}>🔥 6 hari</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* 4. IMAGE / VISUAL */}
        <Image source={require('./assets/hero.png')} style={styles.hero} resizeMode="cover" />

        {/* 2. JUDUL */}
        <Text style={styles.judul}>Bangun Kebiasaan,{'\n'}Jaga Streak-mu</Text>

        {/* 3. INFORMASI UTAMA */}
        <Text style={styles.deskripsi}>
          Catat kebiasaan harian, lihat progres streak, dan tetap konsisten menjalankan
          kebiasaan baikmu setiap hari.
        </Text>

        {/* 5. BUTTON / ACTION */}
        <Pressable
          style={({ pressed }) => [styles.tombol, pressed && styles.tombolDitekan]}
          onPress={() => console.log('Mulai ditekan')}
        >
          <Text style={styles.tombolText}>Mulai Sekarang →</Text>
        </Pressable>

        {/* 6. CONTENT SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionJudul}>Kebiasaan Hari Ini</Text>
          <Pressable onPress={() => console.log('Lihat semua')}>
            <Text style={styles.lihatSemua}>Lihat Semua →</Text>
          </Pressable>
        </View>

        <View style={styles.baris}>
          {HABITS.map((h) => (
            <Pressable key={h.id} style={styles.kartu} onPress={() => console.log(h.nama)}>
              <Text style={styles.kartuIkon}>{h.ikon}</Text>
              <Text style={styles.kartuNama}>{h.nama}</Text>
              <Text style={styles.kartuStreak}>🔥 {h.streak} hari</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* NAVIGATION */}
      <View style={styles.nav}>
        {NAV.map((n) => (
          <Pressable key={n.label} style={styles.navItem}>
            <Text style={styles.navIkon}>{n.ikon}</Text>
            <Text style={[styles.navLabel, n.aktif && styles.navLabelAktif]}>{n.label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logo: { fontSize: 18, fontWeight: '800', color: '#1e3a8a', letterSpacing: 0.5 },
  streakBadge: {
    backgroundColor: '#fff4e5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  streakBadgeText: { fontWeight: '700', color: '#c2410c' },

  content: { paddingHorizontal: 20, paddingBottom: 24 },
  hero: { width: '100%', aspectRatio: 1000 / 560, borderRadius: 16 },

  judul: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginTop: 20 },
  deskripsi: { fontSize: 15, lineHeight: 22, color: '#475569', marginTop: 8 },

  tombol: {
    backgroundColor: '#fbbf24',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  tombolDitekan: { backgroundColor: '#f59e0b' },
  tombolText: { fontSize: 16, fontWeight: '700', color: '#1f2937' },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 12,
  },
  sectionJudul: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  lihatSemua: { fontSize: 14, fontWeight: '600', color: '#2563eb' },

  baris: { flexDirection: 'row', gap: 10 },
  kartu: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  kartuIkon: { fontSize: 30 },
  kartuNama: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginTop: 6 },
  kartuStreak: { fontSize: 12, color: '#c2410c', marginTop: 2 },

  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  navItem: { alignItems: 'center', flex: 1 },
  navIkon: { fontSize: 20 },
  navLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
  navLabelAktif: { color: '#2563eb', fontWeight: '700' },
});
