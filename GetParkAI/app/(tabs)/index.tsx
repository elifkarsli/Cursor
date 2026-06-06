import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import AppHeader from '../../components/AppHeader';

const { width } = Dimensions.get('window');

const stats = [
  { icon: 'bar-chart', label: 'Toplam Analiz', value: '1.248', change: '+%18,6 artış', sub: '(son 30 gün)', color: Colors.primary, bg: Colors.primaryLight },
  { icon: 'checkmark-circle', label: 'Park Uygunluğu', value: '72/100', change: '+%6,3 artış', sub: '(son 30 gün)', color: Colors.secondary, bg: Colors.secondaryLight },
  { icon: 'warning', label: 'Yüksek Riskli Alanlar', value: '156', change: '+%9,1 artış', sub: '(son 30 gün)', color: Colors.purple, bg: Colors.purpleLight },
];

const scoreItems = [
  { label: 'Park Uygunluğu', value: 78, color: Colors.secondary },
  { label: 'Trafik Etkisi', value: 68, color: Colors.primary },
  { label: 'Kentsel Risk', value: 60, color: Colors.warning },
];

const mapPins = [
  { lat: 40.9907, lng: 29.0277, type: 'green' },
  { lat: 40.9885, lng: 29.0335, type: 'green' },
  { lat: 40.9935, lng: 29.024, type: 'warning' },
  { lat: 40.986, lng: 29.038, type: 'green' },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <AppHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <LinearGradient colors={['#1A56FF', '#0D40CC']} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.heroTag}>
            <Ionicons name="sparkles" size={12} color={Colors.primary} />
            <Text style={styles.heroTagText}>AI ile Akıllı Şehir Yönetimi</Text>
          </View>
          <Text style={styles.heroTitle}>AI destekli, KVKK{'\n'}uyumlu kentsel{'\n'}park analizi</Text>
          <Text style={styles.heroDesc}>
            Veriye dayalı içgörülerle park uygunluğunu anlayın, trafik etkisini yönetin ve riskleri önceden tespit edin.
          </Text>
          <View style={styles.heroBtns}>
            <TouchableOpacity style={styles.heroBtn} onPress={() => router.push('/analysis/start')}>
              <Ionicons name="cloud-upload-outline" size={16} color={Colors.primary} />
              <Text style={styles.heroBtnText}>Görsel Yükle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.heroBtn, styles.heroBtnOutline]} onPress={() => router.push('/analysis/start')}>
              <Ionicons name="location-outline" size={16} color={Colors.white} />
              <Text style={[styles.heroBtnText, { color: Colors.white }]}>Haritada Başla</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroCityIllustration}>
            <View style={styles.cityBuilding1} />
            <View style={styles.cityBuilding2} />
            <View style={styles.cityBuilding3} />
            <View style={styles.cityPPin}>
              <Text style={styles.cityPText}>P</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={[styles.statChange, { color: s.color }]}>{s.change}</Text>
              <Text style={styles.statSub}>{s.sub}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Map + Score Row */}
        <View style={styles.row}>
          {/* Live Map */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Canlı Harita Görünümü</Text>
              <TouchableOpacity style={styles.liveIndicator} onPress={() => router.push('/riskmap')}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Risk Haritası →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.mapContainer}>
              <View style={styles.mapBg}>
                <MapView
                  provider={PROVIDER_DEFAULT}
                  style={StyleSheet.absoluteFill}
                  initialRegion={{
                    latitude: 40.9907,
                    longitude: 29.0297,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                  }}
                  pointerEvents="none"
                >
                  {mapPins.map((pin, i) => (
                    <Marker
                      key={i}
                      coordinate={{ latitude: pin.lat, longitude: pin.lng }}
                      pinColor={pin.type === 'green' ? Colors.secondary : Colors.warning}
                    />
                  ))}
                </MapView>
                <Text style={styles.mapLocation}>Kadıköy, İstanbul</Text>
              </View>
              <View style={styles.mapLegend}>
                {[
                  { color: Colors.secondary, label: 'Yüksek Uygunluk' },
                  { color: Colors.warning, label: 'Orta Uygunluk' },
                  { color: Colors.danger, label: 'Düşük Uygunluk' },
                ].map((l, i) => (
                  <View key={i} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                    <Text style={styles.legendText}>{l.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Score */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Genel Uygunluk Skoru</Text>
              <TouchableOpacity>
                <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.scoreCircleLarge}>
              <Text style={styles.scoreNum}>72</Text>
              <Text style={styles.scoreDenom}>/100</Text>
            </View>
            <View style={styles.scoreBars}>
              {scoreItems.map((item, i) => (
                <View key={i} style={styles.scoreBarItem}>
                  <View style={styles.scoreBarHeader}>
                    <Text style={styles.scoreBarLabel}>{item.label}</Text>
                    <Text style={[styles.scoreBarValue, { color: item.color }]}>{item.value}</Text>
                  </View>
                  <View style={styles.scoreBarBg}>
                    <View style={[styles.scoreBarFill, { width: `${item.value}%`, backgroundColor: item.color }]} />
                  </View>
                </View>
              ))}
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Tüm kriterleri gör →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* KVKK compact button */}
        <TouchableOpacity style={styles.kvkkBtn} onPress={() => router.push('/kvkk')}>
          <View style={styles.kvkkBtnIcon}>
            <Ionicons name="shield-checkmark" size={18} color={Colors.secondary} />
          </View>
          <View style={styles.kvkkBtnTextWrap}>
            <Text style={styles.kvkkBtnTitle}>KVKK Uyumu & Gizlilik</Text>
            <Text style={styles.kvkkBtnSub}>Veri işleme politikamızı görüntüle</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 24 },

  hero: {
    margin: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    overflow: 'hidden',
    minHeight: 220,
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: Spacing.md,
  },
  heroTagText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.white, lineHeight: 32, marginBottom: Spacing.sm },
  heroDesc: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', lineHeight: 20, marginBottom: Spacing.lg },
  heroBtns: { flexDirection: 'row', gap: Spacing.sm },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
  },
  heroBtnOutline: { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  heroBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },
  heroCityIllustration: { position: 'absolute', right: 12, bottom: 12, flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  cityBuilding1: { width: 24, height: 60, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4 },
  cityBuilding2: { width: 32, height: 80, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4 },
  cityBuilding3: { width: 20, height: 50, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 4 },
  cityPPin: {
    position: 'absolute', top: -20, right: 8,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  cityPText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md },

  statsRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  statValue: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  statChange: { fontSize: FontSize.xs, fontWeight: '600' },
  statSub: { fontSize: 10, color: Colors.textMuted },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4 },

  row: { flexDirection: 'column', gap: Spacing.md, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  cardTitle: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.text, flex: 1 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.secondary },
  liveText: { fontSize: 10, color: Colors.secondary, fontWeight: '600' },

  mapContainer: {},
  mapBg: {
    height: 170,
    backgroundColor: '#E8F4F8',
    borderRadius: BorderRadius.sm,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 8,
  },
  mapLocation: { position: 'absolute', top: 6, left: 8, fontSize: 10, color: Colors.textSecondary, backgroundColor: Colors.white, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  mapPin: { position: 'absolute', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  mapPinText: { color: Colors.white, fontSize: 9, fontWeight: '800' },
  mapSelected: { position: 'absolute', top: '30%', left: '30%', width: 60, height: 60, borderRadius: 8, backgroundColor: 'rgba(26,86,255,0.15)', borderWidth: 2, borderColor: Colors.primary, borderStyle: 'dashed' },
  mapLegend: { gap: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: Colors.textSecondary },

  scoreCircleLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: Spacing.sm,
  },
  scoreNum: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
  scoreDenom: { fontSize: 10, color: Colors.textSecondary, marginTop: -4 },
  scoreBars: { gap: 8, marginBottom: Spacing.sm },
  scoreBarItem: {},
  scoreBarHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  scoreBarLabel: { fontSize: 10, color: Colors.textSecondary },
  scoreBarValue: { fontSize: 10, fontWeight: '700' },
  scoreBarBg: { height: 4, backgroundColor: Colors.gray100, borderRadius: 2 },
  scoreBarFill: { height: 4, borderRadius: 2 },
  seeAll: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },

  kvkkBtn: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  kvkkBtnIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.secondaryLight, alignItems: 'center', justifyContent: 'center' },
  kvkkBtnTextWrap: { flex: 1 },
  kvkkBtnTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  kvkkBtnSub: { fontSize: FontSize.xs, color: Colors.textSecondary },
});
