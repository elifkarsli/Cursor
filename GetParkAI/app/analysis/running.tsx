import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import AppHeader from '../../components/AppHeader';
import { useParkingMap, riskPinColor } from '../../hooks/useParkingMap';

const stepDefs = [
  { id: 1, label: 'Görsel alındı', threshold: 8 },
  { id: 2, label: 'Anonimleştirme', threshold: 28 },
  { id: 3, label: 'Araç tespiti', threshold: 60, desc: 'Araçlar tespit ediliyor ve sınıflandırılıyor...' },
  { id: 4, label: 'Risk skorlama', threshold: 84 },
  { id: 5, label: 'Rapor oluşturma', threshold: 100 },
];

const TOTAL_SECONDS = 6;

export default function AnalysisRunningScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));
  const { coords, spots, loading: mapLoading, locationLabel, hasSpots, isReal } = useParkingMap(3000);
  const [progress, setProgress] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;
  const navigated = useRef(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Demo: progress 0 -> 100 otomatik akar ve sonuca yönlendirir
  useEffect(() => {
    const stepMs = 100;
    const inc = 100 / ((TOTAL_SECONDS * 1000) / stepMs);
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + inc);
        if (next >= 100 && !navigated.current) {
          navigated.current = true;
          clearInterval(interval);
          setTimeout(() => router.replace('/analysis/result'), 600);
        }
        return next;
      });
    }, stepMs);
    return () => clearInterval(interval);
  }, []);

  const pct = Math.round(progress);
  const completedCount = stepDefs.filter((s) => progress >= s.threshold).length;
  const etaSeconds = Math.max(0, Math.ceil(((100 - progress) / 100) * TOTAL_SECONDS));

  const stepStatus = (index: number): 'done' | 'active' | 'pending' => {
    if (progress >= stepDefs[index].threshold) return 'done';
    const firstNotDone = stepDefs.findIndex((s) => progress < s.threshold);
    return index === firstNotDone ? 'active' : 'pending';
  };

  return (
    <View style={styles.root}>
      <AppHeader showBack onBack={goBack} />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>

        {/* Title */}
        <View style={styles.titleSection}>
          <TouchableOpacity style={styles.backLink} onPress={goBack}>
            <Ionicons name="arrow-back" size={16} color={Colors.primary} />
            <Text style={styles.backLinkText}>Analizler</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{pct >= 100 ? 'Analiz tamamlandı' : 'Analiz sürüyor'}</Text>
          <Text style={styles.pageSubtitle}>Seçilen bölge için analiz işlemi devam ediyor.</Text>
        </View>

        {/* Map + Info */}
        <View style={styles.mapInfoCard}>
          <View style={styles.mapSection}>
            <MapView
              provider={PROVIDER_DEFAULT}
              style={StyleSheet.absoluteFill}
              region={{
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.012,
                longitudeDelta: 0.012,
              }}
              showsUserLocation={isReal}
              pointerEvents="none"
            >
              {spots.map((s) => (
                <Marker
                  key={s.id}
                  coordinate={{ latitude: s.latitude, longitude: s.longitude }}
                  pinColor={riskPinColor(s.risk_level)}
                />
              ))}
            </MapView>
            <View style={styles.mapLocationBadge}>
              <Ionicons name="location" size={12} color={Colors.primary} />
              <Text style={styles.mapLocationText}>{locationLabel}</Text>
            </View>
            {!mapLoading && !hasSpots && (
              <View style={styles.noDataBadge} pointerEvents="none">
                <Text style={styles.noDataText}>Park yeri verisi yok</Text>
              </View>
            )}
          </View>
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.infoText}>Bugün 10:24</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="layers-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.infoText}>Kentsel Park Analizi</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="scan-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.infoText}>1,2 km² alan</Text>
            </View>
            <View style={styles.privacyBadge}>
              <Ionicons name="lock-closed" size={12} color={Colors.secondary} />
              <View>
                <Text style={styles.privacyBadgeTitle}>Veriler gizli ve{'\n'}güvenlidir.</Text>
                <Text style={styles.privacyBadgeSub}>Kişisel veriler KVKK{'\n'}kapsamında korunmaktadır.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Circle */}
        <View style={styles.progressCard}>
          <View style={styles.progressCircleContainer}>
            <View style={[styles.progressCircle, pct >= 100 && { borderColor: Colors.secondary }]}>
              <Text style={styles.progressPercent}>{pct}%</Text>
              <Text style={styles.progressLabel}>Tamamlandı</Text>
            </View>
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>{pct >= 100 ? 'Analiz tamamlandı, yönlendiriliyor...' : 'Analiz devam ediyor...'}</Text>
            <View style={styles.etaRow}>
              <Ionicons name="time-outline" size={14} color={Colors.secondary} />
              <Text style={styles.etaLabel}>Tahmini kalan süre</Text>
            </View>
            <Text style={styles.etaTime}>{etaSeconds > 0 ? `${etaSeconds} sn` : 'Bitti'}</Text>
            <Text style={styles.etaNote}>Bu süre, bölgedeki veri yoğunluğuna bağlı olarak değişebilir.</Text>
          </View>
        </View>

        {/* Steps */}
        <View style={styles.stepsCard}>
          <View style={styles.stepsHeader}>
            <Text style={styles.stepsTitle}>Canlı Aktivite</Text>
            <View style={styles.stepsBadge}>
              <Text style={styles.stepsBadgeText}>{completedCount} / {stepDefs.length} adım tamamlandı</Text>
            </View>
          </View>
          {stepDefs.map((step, i) => {
            const status = stepStatus(i);
            return (
              <View key={step.id} style={styles.stepItem}>
                <View style={styles.stepLeft}>
                  <View style={[styles.stepIconCircle,
                    status === 'done' && styles.stepIconDone,
                    status === 'active' && styles.stepIconActive,
                    status === 'pending' && styles.stepIconPending,
                  ]}>
                    {status === 'done' && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                    {status === 'active' && <Animated.View style={[styles.activeDot, { opacity: dotAnim }]} />}
                    {status === 'pending' && <Ionicons name="time-outline" size={14} color={Colors.textMuted} />}
                  </View>
                  {i < stepDefs.length - 1 && (
                    <View style={[styles.stepLine, status === 'done' && styles.stepLineDone]} />
                  )}
                </View>
                <View style={styles.stepContent}>
                  <View style={styles.stepRow}>
                    <Text style={[styles.stepLabel,
                      status === 'active' && styles.stepLabelActive,
                      status === 'pending' && styles.stepLabelPending,
                    ]}>{step.label}</Text>
                    {status === 'pending' ? (
                      <Text style={styles.stepPending}>Beklemede</Text>
                    ) : (
                      <Text style={[styles.stepTime, status === 'active' && styles.stepTimeActive]}>
                        {status === 'done' ? '✓' : 'İşleniyor'}
                      </Text>
                    )}
                  </View>
                  {step.desc && status === 'active' && <Text style={styles.stepDesc}>{step.desc}</Text>}
                </View>
              </View>
            );
          })}
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark" size={18} color={Colors.secondary} />
          <View>
            <Text style={styles.privacyNoteTitle}>Gizliliğiniz bizim için önceliktir</Text>
            <Text style={styles.privacyNoteDesc}>Ham görseller geçici olarak işlenir ve kalıcı olarak saklanmaz.{'\n'}Tüm veriler KVKK kapsamında korunmaktadır.</Text>
          </View>
        </View>

        {/* View Result Button */}
        <TouchableOpacity style={styles.resultBtn} onPress={() => router.replace('/analysis/result')}>
          <Ionicons name="eye" size={18} color={Colors.white} />
          <Text style={styles.resultBtnText}>Sonuçları Görüntüle</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.md },

  titleSection: { gap: 6 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backLinkText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  pageTitle: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.text },
  pageSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary },

  mapInfoCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    height: 200,
  },
  mapSection: { flex: 1.2, position: 'relative' },
  mapLocationBadge: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.white, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  mapLocationText: { fontSize: 10, color: Colors.text, fontWeight: '600' },
  noDataBadge: { position: 'absolute', bottom: 8, left: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  noDataText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },

  infoSection: { flex: 0.9, padding: Spacing.md, gap: Spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: FontSize.xs, color: Colors.text },
  privacyBadge: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: Colors.secondaryLight, borderRadius: BorderRadius.sm, padding: 8, marginTop: 4,
  },
  privacyBadgeTitle: { fontSize: 10, fontWeight: '700', color: Colors.text },
  privacyBadgeSub: { fontSize: 10, color: Colors.textSecondary },

  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressCircleContainer: { alignItems: 'center', justifyContent: 'center' },
  progressCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  progressPercent: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
  progressLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  progressInfo: { flex: 1, gap: 6 },
  progressTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  etaLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  etaTime: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.secondary },
  etaNote: { fontSize: FontSize.xs, color: Colors.textMuted },

  stepsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  stepsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  stepsTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  stepsBadge: { backgroundColor: Colors.secondaryLight, borderRadius: BorderRadius.full, paddingHorizontal: 10, paddingVertical: 4 },
  stepsBadgeText: { fontSize: FontSize.xs, color: Colors.secondary, fontWeight: '600' },

  stepItem: { flexDirection: 'row', gap: Spacing.sm },
  stepLeft: { alignItems: 'center', width: 28 },
  stepIconCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepIconDone: { backgroundColor: Colors.secondary },
  stepIconActive: { backgroundColor: Colors.primary },
  stepIconPending: { backgroundColor: Colors.gray100 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.white },
  stepLine: { flex: 1, width: 2, backgroundColor: Colors.gray200, marginVertical: 2 },
  stepLineDone: { backgroundColor: Colors.secondary },
  stepContent: { flex: 1, paddingBottom: 8 },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  stepLabelActive: { color: Colors.primary },
  stepLabelPending: { color: Colors.textMuted },
  stepTime: { fontSize: FontSize.xs, color: Colors.textSecondary },
  stepTimeActive: { color: Colors.primary, fontWeight: '700' },
  stepPending: { fontSize: FontSize.xs, color: Colors.textMuted },
  stepDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },

  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.secondaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.secondary + '40',
  },
  privacyNoteTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  privacyNoteDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },

  resultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
  },
  resultBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
});
