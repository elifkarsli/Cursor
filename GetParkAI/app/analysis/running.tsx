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
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import AppHeader from '../../components/AppHeader';

const steps = [
  { id: 1, label: 'Görsel alındı', time: '10:24', status: 'done' },
  { id: 2, label: 'Anonimleştirme', time: '10:24', status: 'done' },
  { id: 3, label: 'Araç tespiti', time: '10:25', status: 'active', desc: 'Araçlar tespit ediliyor ve sınıflandırılıyor...' },
  { id: 4, label: 'Risk skorlama', time: '', status: 'pending' },
  { id: 5, label: 'Rapor oluşturma', time: '', status: 'pending' },
];

export default function AnalysisRunningScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [progress] = useState(68);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;

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

  return (
    <View style={styles.root}>
      <AppHeader showBack onBack={() => router.back()} />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>

        {/* Title */}
        <View style={styles.titleSection}>
          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={16} color={Colors.primary} />
            <Text style={styles.backLinkText}>Analizler</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Analiz sürüyor</Text>
          <Text style={styles.pageSubtitle}>Seçilen bölge için analiz işlemi devam ediyor.</Text>
        </View>

        {/* Map + Info */}
        <View style={styles.mapInfoCard}>
          <View style={styles.mapSection}>
            <View style={styles.mapBg}>
              <View style={styles.mapStreetH1} />
              <View style={styles.mapStreetH2} />
              <View style={styles.mapStreetV1} />
              <View style={styles.mapStreetV2} />
              <Animated.View style={[styles.analysisArea, { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.analysisDot}>
                  <Text style={styles.analysisDotText}>P</Text>
                </View>
              </Animated.View>
              <View style={styles.mapLocationBadge}>
                <Ionicons name="location" size={12} color={Colors.primary} />
                <Text style={styles.mapLocationText}>Kadıköy, İstanbul</Text>
              </View>
              <Text style={styles.mapStreetName1}>Bağdat Cd.</Text>
              <Text style={styles.mapStreetName2}>Söğütlüçeşme Cd.</Text>
              <Text style={styles.mapStreetName3}>Moda Cd.</Text>
              <Text style={styles.mapStreetName4}>Rıhtım Cd.</Text>
            </View>
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
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercent}>{progress}%</Text>
              <Text style={styles.progressLabel}>Tamamlandı</Text>
            </View>
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>Analiz devam ediyor...</Text>
            <View style={styles.etaRow}>
              <Ionicons name="time-outline" size={14} color={Colors.secondary} />
              <Text style={styles.etaLabel}>Tahmini kalan süre</Text>
            </View>
            <Text style={styles.etaTime}>1 dk 35 sn</Text>
            <Text style={styles.etaNote}>Bu süre, bölgedeki veri yoğunluğuna bağlı olarak değişebilir.</Text>
          </View>
        </View>

        {/* Steps */}
        <View style={styles.stepsCard}>
          <View style={styles.stepsHeader}>
            <Text style={styles.stepsTitle}>Canlı Aktivite</Text>
            <View style={styles.stepsBadge}>
              <Text style={styles.stepsBadgeText}>3 / 5 adım tamamlandı</Text>
            </View>
          </View>
          {steps.map((step, i) => (
            <View key={step.id} style={styles.stepItem}>
              <View style={styles.stepLeft}>
                <View style={[styles.stepIconCircle,
                  step.status === 'done' && styles.stepIconDone,
                  step.status === 'active' && styles.stepIconActive,
                  step.status === 'pending' && styles.stepIconPending,
                ]}>
                  {step.status === 'done' && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                  {step.status === 'active' && <Animated.View style={[styles.activeDot, { opacity: dotAnim }]} />}
                  {step.status === 'pending' && <Ionicons name="time-outline" size={14} color={Colors.textMuted} />}
                </View>
                {i < steps.length - 1 && (
                  <View style={[styles.stepLine, step.status === 'done' && styles.stepLineDone]} />
                )}
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepRow}>
                  <Text style={[styles.stepLabel,
                    step.status === 'active' && styles.stepLabelActive,
                    step.status === 'pending' && styles.stepLabelPending,
                  ]}>{step.label}</Text>
                  {step.time ? (
                    <Text style={[styles.stepTime, step.status === 'active' && styles.stepTimeActive]}>{step.time}</Text>
                  ) : (
                    <Text style={styles.stepPending}>Beklemede</Text>
                  )}
                </View>
                {step.desc && <Text style={styles.stepDesc}>{step.desc}</Text>}
              </View>
            </View>
          ))}
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark" size={18} color={Colors.secondary} />
          <View>
            <Text style={styles.privacyNoteTitle}>Gizliliğiniz bizim için önceliktir</Text>
            <Text style={styles.privacyNoteDesc}>Ham görseller geçici olarak işlenir ve kalıcı olarak saklanmaz.{'\n'}Tüm veriler KVKK kapsamında korunmaktadır.</Text>
          </View>
        </View>

        {/* View Result Button (demo) */}
        <TouchableOpacity style={styles.resultBtn} onPress={() => router.push('/analysis/result')}>
          <Ionicons name="eye" size={18} color={Colors.white} />
          <Text style={styles.resultBtnText}>Sonuçları Görüntüle (Demo)</Text>
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
  mapSection: { flex: 1.2 },
  mapBg: { flex: 1, backgroundColor: '#D8E8F0', position: 'relative', overflow: 'hidden' },
  mapStreetH1: { position: 'absolute', top: '25%', left: 0, right: 0, height: 2, backgroundColor: 'rgba(100,130,180,0.3)' },
  mapStreetH2: { position: 'absolute', top: '70%', left: 0, right: 0, height: 2, backgroundColor: 'rgba(100,130,180,0.3)' },
  mapStreetV1: { position: 'absolute', left: '30%', top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(100,130,180,0.3)' },
  mapStreetV2: { position: 'absolute', left: '75%', top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(100,130,180,0.3)' },
  analysisArea: {
    position: 'absolute', top: '20%', left: '15%',
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 2, borderColor: Colors.primary, borderStyle: 'dashed',
    backgroundColor: 'rgba(26,86,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  analysisDot: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  analysisDotText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.xl },
  mapLocationBadge: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.white, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  mapLocationText: { fontSize: 10, color: Colors.text, fontWeight: '600' },
  mapStreetName1: { position: 'absolute', top: 16, right: 8, fontSize: 9, color: Colors.textSecondary },
  mapStreetName2: { position: 'absolute', bottom: 60, right: 4, fontSize: 9, color: Colors.textSecondary },
  mapStreetName3: { position: 'absolute', bottom: 8, left: '30%', fontSize: 9, color: Colors.textSecondary },
  mapStreetName4: { position: 'absolute', bottom: 30, left: 4, fontSize: 9, color: Colors.textSecondary },

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
    borderColor: Colors.secondary,
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
