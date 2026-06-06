import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import { useParkingMap, riskPinColor, riskLabel } from '../../hooks/useParkingMap';
import { MapSpot } from '../../lib/api';
import { regionAroundPoint, regionFittingPoints, spotsMapPoints } from '../../lib/mapRegion';

const findings = [
  { icon: 'warning', label: 'Kaldırım İhlali', count: 3, color: Colors.danger },
  { icon: 'arrow-forward', label: 'Trafik Akışı Etkisi', count: 2, color: Colors.warning },
  { icon: 'ban', label: 'Yasak Park', count: 1, color: Colors.purple },
  { icon: 'checkmark-circle', label: 'Düzenli Park', count: 8, color: Colors.secondary },
];

const actions = [
  { icon: 'shield', label: 'Kaldırım Koruma', desc: 'Kaldırımların ihlalini önleyin', color: Colors.secondary },
  { icon: 'ban', label: 'Yasak Park Denetimi', desc: 'Yasak alanlarda sıkı denetim', color: Colors.purple },
  { icon: 'car', label: 'Trafik Akışını İyileştir', desc: 'Trafik Akışını optimize edin', color: Colors.warning },
  { icon: 'sparkles', label: 'Akıllı Denetim', desc: 'Yapay zeka ile sürekli izleme', color: Colors.primary },
];

const CLOSE_DELTA = 0.004;

function scoreLevel(score: number) {
  if (score >= 70) return { label: 'Yüksek Uygunluk', color: Colors.secondary };
  if (score >= 45) return { label: 'Orta Seviye Uygunluk', color: Colors.warning };
  return { label: 'Düşük Uygunluk', color: Colors.danger };
}

export default function AnalysisResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));
  const { coords, spots, loading: mapLoading, locationLabel, hasSpots, isReal } = useParkingMap(1200);

  const mapRef = useRef<MapView>(null);
  const [selectedSpot, setSelectedSpot] = useState<MapSpot | null>(null);
  const [region, setRegion] = useState<Region>(() =>
    regionAroundPoint(coords, CLOSE_DELTA),
  );

  const avgScore = useMemo(() => {
    if (!spots.length) return 0;
    return Math.round(spots.reduce((sum, s) => sum + s.urban_index, 0) / spots.length);
  }, [spots]);

  const highRiskCount = useMemo(
    () => spots.filter((s) => s.risk_level === 'high').length,
    [spots],
  );

  const dominantRisk = useMemo(() => {
    if (!spots.length) return 'medium';
    const counts = { high: 0, medium: 0, low: 0 };
    spots.forEach((s) => {
      if (s.risk_level === 'high') counts.high += 1;
      else if (s.risk_level === 'medium') counts.medium += 1;
      else counts.low += 1;
    });
    if (counts.high >= counts.medium && counts.high >= counts.low) return 'high';
    if (counts.medium >= counts.low) return 'medium';
    return 'low';
  }, [spots]);

  const level = scoreLevel(avgScore || 45);

  useEffect(() => {
    if (mapLoading) return;
    const next = hasSpots
      ? regionFittingPoints(spotsMapPoints(coords, spots), { minDelta: 0.003, maxDelta: 0.012 })
      : regionAroundPoint(coords, CLOSE_DELTA);
    setRegion(next);
    const timer = setTimeout(() => {
      if (!mapRef.current) return;
      if (hasSpots) {
        mapRef.current.fitToCoordinates(spotsMapPoints(coords, spots), {
          edgePadding: { top: 56, right: 48, bottom: 56, left: 48 },
          animated: true,
        });
      } else {
        mapRef.current.animateToRegion(next, 400);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [coords.latitude, coords.longitude, hasSpots, mapLoading, spots]);

  const focusSpot = (spot: MapSpot) => {
    setSelectedSpot(spot);
    mapRef.current?.animateToRegion(
      regionAroundPoint(
        { latitude: spot.latitude, longitude: spot.longitude },
        0.0025,
      ),
      350,
    );
  };

  const fitAllSpots = () => {
    if (!hasSpots) {
      mapRef.current?.animateToRegion(regionAroundPoint(coords, CLOSE_DELTA), 350);
      return;
    }
    mapRef.current?.fitToCoordinates(spotsMapPoints(coords, spots), {
      edgePadding: { top: 56, right: 48, bottom: 56, left: 48 },
      animated: true,
    });
    setSelectedSpot(null);
  };

  const zoomMap = (factor: number) => {
    const next: Region = {
      ...region,
      latitudeDelta: Math.max(0.0015, Math.min(0.08, region.latitudeDelta * factor)),
      longitudeDelta: Math.max(0.0015, Math.min(0.08, region.longitudeDelta * factor)),
    };
    setRegion(next);
    mapRef.current?.animateToRegion(next, 250);
  };

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={goBack}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.topBarInfo}>
          <View style={styles.topBarChip}>
            <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.topBarChipText} numberOfLines={1}>{locationLabel}</Text>
          </View>
          <View style={[styles.topBarChip, styles.topBarChipSuccess]}>
            <Ionicons name="checkmark-circle" size={12} color={Colors.secondary} />
            <Text style={[styles.topBarChipText, { color: Colors.secondary }]}>Tamamlandı</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.scoreCard}>
          <View style={styles.scoreLeft}>
            <View style={[styles.scoreCircle, { borderColor: level.color }]}>
              <Text style={styles.scoreNum}>{hasSpots ? avgScore : '—'}</Text>
              <Text style={styles.scoreDenom}>/100</Text>
            </View>
          </View>
          <View style={styles.scoreRight}>
            <Text style={styles.scoreTitle}>Bölge Park Uygunluk Skoru</Text>
            <View style={styles.scoreLevelRow}>
              <View style={[styles.scoreLevelDot, { backgroundColor: level.color }]} />
              <Text style={[styles.scoreLevelText, { color: level.color }]}>{level.label}</Text>
            </View>
            <Text style={styles.scoreDesc}>
              {hasSpots
                ? `Yakınınızda ${spots.length} park noktası tespit edildi.\nHaritada pinlere dokunarak inceleyin.`
                : 'Yakın çevrede henüz park noktası yok.\nFotoğraf yükleyerek sisteme ekleyebilirsiniz.'}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="pin" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{spots.length}</Text>
            <Text style={styles.statLabel}>Park Noktası</Text>
            <Text style={styles.statSub}>Yakın çevrede</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.warningLight }]}>
              <Ionicons name="warning" size={18} color={Colors.warning} />
            </View>
            <Text style={[styles.statValue, { color: Colors.warning }]}>
              {hasSpots ? riskLabel(dominantRisk) : '—'}
            </Text>
            <Text style={styles.statLabel}>Baskın Risk</Text>
            <Text style={styles.statSub}>Ortalama seviye</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.dangerLight }]}>
              <Ionicons name="alert" size={18} color={Colors.danger} />
            </View>
            <Text style={[styles.statValue, { color: Colors.danger }]}>{highRiskCount}</Text>
            <Text style={styles.statLabel}>Yüksek Riskli</Text>
            <Text style={styles.statSub}>Nokta sayısı</Text>
          </View>
        </View>

        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <View>
              <Text style={styles.mapTitle}>Yakın Park Yerleri</Text>
              <Text style={styles.mapSubtitle}>Yakınlaştırıp pinlere dokunarak detay görün</Text>
            </View>
            <TouchableOpacity style={styles.fitBtn} onPress={fitAllSpots}>
              <Ionicons name="scan-outline" size={14} color={Colors.primary} />
              <Text style={styles.fitBtnText}>Tümünü Göster</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapBg}>
            <MapView
              ref={mapRef}
              provider={PROVIDER_DEFAULT}
              style={StyleSheet.absoluteFill}
              region={region}
              onRegionChangeComplete={setRegion}
              showsUserLocation={isReal}
              scrollEnabled
              zoomEnabled
              rotateEnabled={false}
              pitchEnabled={false}
            >
              {spots.map((s) => (
                <Marker
                  key={s.id}
                  coordinate={{ latitude: s.latitude, longitude: s.longitude }}
                  pinColor={riskPinColor(s.risk_level)}
                  title={`Uygunluk ${s.urban_index}/100`}
                  description={riskLabel(s.risk_level)}
                  onPress={() => focusSpot(s)}
                />
              ))}
            </MapView>

            <View style={styles.mapControls}>
              <TouchableOpacity style={styles.mapCtrlBtn} onPress={() => zoomMap(0.55)}>
                <Ionicons name="add" size={18} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.mapCtrlBtn} onPress={() => zoomMap(1.6)}>
                <Ionicons name="remove" size={18} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.mapCtrlBtn} onPress={fitAllSpots}>
                <Ionicons name="locate" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {!mapLoading && !hasSpots && (
              <View style={styles.mapEmpty} pointerEvents="none">
                <Ionicons name="map-outline" size={18} color={Colors.textMuted} />
                <Text style={styles.mapEmptyText}>Henüz yakında park yeri yok</Text>
              </View>
            )}
          </View>

          {selectedSpot && (
            <View style={styles.selectedSpotCard}>
              <View style={styles.selectedSpotHeader}>
                <View style={[styles.selectedSpotDot, { backgroundColor: riskPinColor(selectedSpot.risk_level) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.selectedSpotTitle}>Seçili Park Yeri</Text>
                  <Text style={styles.selectedSpotCoords}>
                    {selectedSpot.latitude.toFixed(5)}, {selectedSpot.longitude.toFixed(5)}
                  </Text>
                </View>
                <Text style={[styles.selectedSpotScore, { color: riskPinColor(selectedSpot.risk_level) }]}>
                  {selectedSpot.urban_index}
                  <Text style={styles.selectedSpotScoreSub}>/100</Text>
                </Text>
              </View>
              <View style={styles.selectedSpotMeta}>
                <View style={[styles.riskBadge, { backgroundColor: riskPinColor(selectedSpot.risk_level) + '20' }]}>
                  <Text style={[styles.riskBadgeText, { color: riskPinColor(selectedSpot.risk_level) }]}>
                    {riskLabel(selectedSpot.risk_level)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/analysis/detail')}>
                  <Text style={styles.detailLink}>Detaylı İncele →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {hasSpots && (
            <View style={styles.spotList}>
              {spots.map((s, i) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.spotRow, i < spots.length - 1 && styles.spotRowBorder, selectedSpot?.id === s.id && styles.spotRowActive]}
                  onPress={() => focusSpot(s)}
                >
                  <View style={[styles.spotRowDot, { backgroundColor: riskPinColor(s.risk_level) }]} />
                  <View style={styles.spotRowInfo}>
                    <Text style={styles.spotRowTitle}>Park Yeri #{i + 1}</Text>
                    <Text style={styles.spotRowSub}>{riskLabel(s.risk_level)}</Text>
                  </View>
                  <Text style={[styles.spotRowScore, { color: riskPinColor(s.risk_level) }]}>
                    {s.urban_index}/100
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.legend}>
            {[
              { color: Colors.secondary, label: 'Düşük Risk' },
              { color: Colors.warning, label: 'Orta Risk' },
              { color: Colors.danger, label: 'Yüksek Risk' },
            ].map((l, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                <Text style={styles.legendText}>{l.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.findingsRow}>
          <View style={styles.findingsCard}>
            <Text style={styles.sectionTitle}>Tespit Edilen Bulgular</Text>
            {findings.map((f, i) => (
              <View key={i} style={styles.findingItem}>
                <View style={[styles.findingIcon, { backgroundColor: f.color + '20' }]}>
                  <Ionicons name={f.icon as any} size={14} color={f.color} />
                </View>
                <Text style={styles.findingLabel}>{f.label}</Text>
                <Text style={[styles.findingCount, { color: f.color }]}>{f.count}</Text>
              </View>
            ))}
          </View>
          <View style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>Önerilen Aksiyonlar</Text>
            <View style={styles.actionsGrid}>
              {actions.map((a, i) => (
                <View key={i} style={[styles.actionItem, { borderColor: a.color + '40', backgroundColor: a.color + '10' }]}>
                  <View style={[styles.actionIcon, { backgroundColor: a.color + '20' }]}>
                    <Ionicons name={a.icon as any} size={14} color={a.color} />
                  </View>
                  <Text style={styles.actionLabel}>{a.label}</Text>
                  <Text style={styles.actionDesc}>{a.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.bottomBtns}>
          <TouchableOpacity style={styles.downloadBtn} onPress={() => router.push('/riskmap')}>
            <Ionicons name="map-outline" size={18} color={Colors.primary} />
            <Text style={styles.downloadBtnText}>Risk Haritası</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.newAnalysisBtn} onPress={() => router.push('/analysis/upload')}>
            <Ionicons name="cloud-upload-outline" size={18} color={Colors.white} />
            <Text style={styles.newAnalysisBtnText}>Park Yeri Yükle</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: Colors.gray100 },
  topBarInfo: { flex: 1, flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  topBarChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.gray100, borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 4, maxWidth: '70%' },
  topBarChipSuccess: { backgroundColor: Colors.secondaryLight },
  topBarChipText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500' },

  scroll: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.md },

  scoreCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scoreLeft: {},
  scoreCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 5,
    borderColor: Colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  scoreNum: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.text },
  scoreDenom: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: -4 },
  scoreRight: { flex: 1 },
  scoreTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  scoreLevelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  scoreLevelDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.warning },
  scoreLevelText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.warning },
  scoreDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },

  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  statValue: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  statLabel: { fontSize: 10, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  statSub: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },

  mapCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  mapTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  mapSubtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  fitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  fitBtnText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary },
  mapBg: { height: 320, backgroundColor: '#E8EEF8', position: 'relative', overflow: 'hidden' },
  mapControls: { position: 'absolute', right: 10, top: 10, gap: 6, zIndex: 5 },
  mapCtrlBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 3,
  },
  mapEmpty: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mapEmptyText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },

  selectedSpotCard: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    gap: Spacing.sm,
    backgroundColor: Colors.gray50,
  },
  selectedSpotHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  selectedSpotDot: { width: 10, height: 10, borderRadius: 5 },
  selectedSpotTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  selectedSpotCoords: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  selectedSpotScore: { fontSize: FontSize.xl, fontWeight: '800' },
  selectedSpotScoreSub: { fontSize: 10, fontWeight: '500', color: Colors.textMuted },
  selectedSpotMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  riskBadge: { borderRadius: BorderRadius.full, paddingHorizontal: 10, paddingVertical: 4 },
  riskBadgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  detailLink: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary },

  spotList: { borderTopWidth: 1, borderTopColor: Colors.gray100 },
  spotRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: 12 },
  spotRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  spotRowActive: { backgroundColor: Colors.primaryLight },
  spotRowDot: { width: 8, height: 8, borderRadius: 4 },
  spotRowInfo: { flex: 1 },
  spotRowTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  spotRowSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  spotRowScore: { fontSize: FontSize.sm, fontWeight: '800' },

  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: Spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: Colors.textSecondary },

  findingsRow: { flexDirection: 'row', gap: Spacing.sm },
  findingsCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionsCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  findingItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  findingIcon: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  findingLabel: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary },
  findingCount: { fontSize: FontSize.md, fontWeight: '800' },

  actionsGrid: { gap: Spacing.xs },
  actionItem: { borderRadius: BorderRadius.sm, borderWidth: 1, padding: 8, gap: 2 },
  actionIcon: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  actionLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.text },
  actionDesc: { fontSize: 10, color: Colors.textSecondary },

  bottomBtns: { flexDirection: 'row', gap: Spacing.sm },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
  },
  downloadBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.primary },
  newAnalysisBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
  },
  newAnalysisBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
});
