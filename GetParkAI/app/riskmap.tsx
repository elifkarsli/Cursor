import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/Colors';
import AppHeader from '../components/AppHeader';
import { useLocation } from '../hooks/useLocation';
import { fetchMapSpots, MapSpot } from '../lib/api';

const riskColor = (level: string) =>
  level === 'high' ? Colors.danger : level === 'medium' ? Colors.warning : Colors.secondary;

const riskLabel = (level: string) =>
  level === 'high' ? 'Yüksek Risk' : level === 'medium' ? 'Orta Risk' : 'Düşük Risk';

export default function RiskMapScreen() {
  const router = useRouter();
  const { coords } = useLocation();
  const [mapType] = useState<'Isı Haritası' | 'Normal'>('Isı Haritası');
  const [spots, setSpots] = useState<MapSpot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchMapSpots(coords.latitude, coords.longitude, 50000)
      .then((data) => mounted && setSpots(data))
      .catch(() => mounted && setSpots([]))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [coords.latitude, coords.longitude]);

  const sorted = [...spots].sort((a, b) => b.urban_index - a.urban_index);
  const highCount = spots.filter((s) => s.risk_level === 'high').length;
  const avgIndex = spots.length
    ? Math.round(spots.reduce((sum, s) => sum + s.urban_index, 0) / spots.length)
    : 0;

  return (
    <View style={styles.root}>
      <AppHeader
        rightElement={
          <TouchableOpacity style={styles.downloadBtn}>
            <Ionicons name="download-outline" size={16} color={Colors.primary} />
            <Text style={styles.downloadBtnText}>Raporu İndir</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Title + Filters */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={18} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Kentsel Risk Haritası</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {[
              { label: 'İlçe', value: 'Tümü' },
              { label: 'Tarih', value: 'Son 30 gün' },
              { label: 'Risk Düzeyi', value: 'Tümü' },
            ].map((f, i) => (
              <TouchableOpacity key={i} style={styles.filterChip}>
                <Text style={styles.filterLabel}>{f.label}</Text>
                <Text style={styles.filterValue}>{f.value}</Text>
                <Ionicons name="chevron-down" size={12} color={Colors.primary} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.filterBtn}>
              <Ionicons name="funnel" size={14} color={Colors.white} />
              <Text style={styles.filterBtnText}>Filtrele</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { icon: 'warning', label: 'Yüksek Riskli Nokta', value: String(highCount), color: Colors.purple, bg: Colors.purpleLight },
            { icon: 'bar-chart', label: 'Toplam Park Noktası', value: String(spots.length), color: Colors.primary, bg: Colors.primaryLight },
            { icon: 'checkmark-circle', label: 'Ortalama Uygunluk', value: spots.length ? `${avgIndex}/100` : '—', color: Colors.secondary, bg: Colors.secondaryLight },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon as any} size={18} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Istanbul Map */}
        <View style={styles.mapCard}>
          {/* Map type selector */}
          <TouchableOpacity style={styles.mapTypeBtn}>
            <Ionicons name="flame" size={14} color={Colors.danger} />
            <Text style={styles.mapTypeBtnText}>{mapType}</Text>
            <Ionicons name="chevron-down" size={12} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.mapBg}>
            <MapView
              provider={PROVIDER_DEFAULT}
              style={StyleSheet.absoluteFill}
              region={{
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.35,
                longitudeDelta: 0.35,
              }}
              showsUserLocation
            >
              {spots.map((s) => (
                <Marker
                  key={s.id}
                  coordinate={{ latitude: s.latitude, longitude: s.longitude }}
                  title={riskLabel(s.risk_level)}
                  description={`Uygunluk: ${s.urban_index}/100`}
                  pinColor={riskColor(s.risk_level)}
                />
              ))}
            </MapView>
            {!loading && spots.length === 0 && (
              <View style={styles.mapEmpty} pointerEvents="none">
                <Ionicons name="map-outline" size={20} color={Colors.textMuted} />
                <Text style={styles.mapEmptyText}>Henüz kayıtlı park noktası yok</Text>
              </View>
            )}
          </View>

          {/* Legend */}
          <View style={styles.mapLegend}>
            {[
              { color: Colors.secondary, label: 'Düşük' },
              { color: Colors.warning, label: 'Orta' },
              { color: Colors.danger, label: 'Yüksek' },
            ].map((l, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                <Text style={styles.legendText}>{l.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Risk Points List */}
        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <View style={styles.listTitleRow}>
              <Text style={styles.listTitle}>En Riskli Noktalar</Text>
              <TouchableOpacity>
                <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Tümünü Gör →</Text>
            </TouchableOpacity>
          </View>

          {sorted.length === 0 ? (
            <View style={styles.listEmpty}>
              <Text style={styles.listEmptyText}>
                {loading ? 'Yükleniyor...' : 'Henüz kayıtlı park noktası yok. Veri ekledikçe burada listelenecek.'}
              </Text>
            </View>
          ) : (
            sorted.map((point, i) => {
              const c = riskColor(point.risk_level);
              return (
                <TouchableOpacity key={point.id} style={[styles.riskRow, i < sorted.length - 1 && styles.riskRowBorder]} onPress={() => router.push('/analysis/detail')}>
                  <Text style={styles.riskNum}>{i + 1}</Text>
                  <View style={styles.riskInfo}>
                    <Text style={styles.riskName}>Park Noktası</Text>
                    <Text style={styles.riskLocation}>{point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}</Text>
                  </View>
                  <View style={[styles.riskBadge, { backgroundColor: c + '20' }]}>
                    <Text style={[styles.riskBadgeText, { color: c }]}>{riskLabel(point.risk_level)}</Text>
                  </View>
                  <Text style={[styles.riskScore, { color: c }]}>{point.urban_index}<Text style={styles.riskScoreSub}>/100</Text></Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 24 },

  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  downloadBtnText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },

  titleSection: { gap: Spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  backBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.gray100, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },

  filters: { flexDirection: 'row', gap: Spacing.sm, paddingRight: Spacing.lg },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterLabel: { fontSize: 10, color: Colors.textMuted },
  filterValue: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  filterBtnText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.white },

  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: '800' },
  statChange: { fontSize: FontSize.xs, fontWeight: '700' },
  statLabel: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },

  mapCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    position: 'absolute',
    top: 8, left: 8,
    zIndex: 10,
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  mapTypeBtnText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text },
  mapBg: { height: 260, backgroundColor: '#C8DFF0', position: 'relative', overflow: 'hidden' },
  bogazici: { position: 'absolute', top: '30%', left: '45%', right: '45%', bottom: 0, backgroundColor: '#A8C8E0' },
  europeSide: { position: 'absolute', top: 0, left: 0, right: '45%', bottom: 0, backgroundColor: '#D8EAF5' },
  asiaSide: { position: 'absolute', top: 0, left: '55%', right: 0, bottom: 0, backgroundColor: '#D8EAF5' },
  heatBlob: { position: 'absolute' },
  markerContainer: { position: 'absolute', alignItems: 'center' },
  marker: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.white },
  markerLabel: { fontSize: 8, color: Colors.text, fontWeight: '600', marginTop: 1, backgroundColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 2, borderRadius: 2 },
  cityLabel: { position: 'absolute', top: '45%', left: '42%', fontSize: FontSize.lg, fontWeight: '700', color: Colors.text + '60' },
  mapControls: { position: 'absolute', right: 10, bottom: 10, gap: 4 },
  mapBtn: { width: 30, height: 30, backgroundColor: Colors.white, borderRadius: 6, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  mapBtnText: { fontSize: 16, color: Colors.text, lineHeight: 20 },
  mapEmpty: { position: 'absolute', bottom: 12, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.94)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  mapEmptyText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  listEmpty: { padding: Spacing.lg, alignItems: 'center' },
  listEmptyText: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  mapLegend: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },

  listCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  listTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  listTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },

  riskRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  riskRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  riskNum: { width: 20, fontSize: FontSize.md, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  riskInfo: { flex: 1 },
  riskName: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  riskLocation: { fontSize: FontSize.xs, color: Colors.textSecondary },
  riskBadge: { borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 3 },
  riskBadgeText: { fontSize: 10, fontWeight: '700' },
  riskScore: { fontSize: FontSize.md, fontWeight: '800' },
  riskScoreSub: { fontSize: 10, color: Colors.textMuted, fontWeight: '400' },
});
