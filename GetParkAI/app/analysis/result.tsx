import React from 'react';
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
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';

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

const mapLines = [
  { type: 'green', top: '25%', left: '10%', width: 80, height: 4 },
  { type: 'green', top: '50%', left: '55%', width: 70, height: 4 },
  { type: 'warning', top: '35%', left: '30%', width: 60, height: 4 },
  { type: 'warning', top: '60%', left: '15%', width: 50, height: 4 },
];

export default function AnalysisResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {/* Top Info Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.topBarInfo}>
          <View style={styles.topBarChip}>
            <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.topBarChipText}>Kadıköy, İstanbul</Text>
          </View>
          <View style={styles.topBarChip}>
            <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.topBarChipText}>Bugün 10:24</Text>
          </View>
          <View style={[styles.topBarChip, styles.topBarChipSuccess]}>
            <Ionicons name="checkmark-circle" size={12} color={Colors.secondary} />
            <Text style={[styles.topBarChipText, { color: Colors.secondary }]}>Tamamlandı</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>

        {/* Score Section */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreLeft}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreNum}>72</Text>
              <Text style={styles.scoreDenom}>/100</Text>
            </View>
          </View>
          <View style={styles.scoreRight}>
            <Text style={styles.scoreTitle}>Park Uygunluk Skoru</Text>
            <View style={styles.scoreLevelRow}>
              <View style={styles.scoreLevelDot} />
              <Text style={styles.scoreLevelText}>Orta Seviye Uygunluk</Text>
            </View>
            <Text style={styles.scoreDesc}>Bölgede iyileştirme alanları mevcut.{'\n'}Belirli riskler yakından izlenmeli.</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="car" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>128</Text>
            <Text style={styles.statLabel}>Araç Sayısı</Text>
            <Text style={styles.statSub}>Tespit edilen araç</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.warningLight }]}>
              <Ionicons name="warning" size={18} color={Colors.warning} />
            </View>
            <Text style={[styles.statValue, { color: Colors.warning }]}>Orta</Text>
            <Text style={styles.statLabel}>Risk Seviyesi</Text>
            <Text style={styles.statSub}>İyileştirme gerekli</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.dangerLight }]}>
              <Ionicons name="alert" size={18} color={Colors.danger} />
            </View>
            <Text style={[styles.statValue, { color: Colors.danger }]}>Yüksek</Text>
            <Text style={styles.statLabel}>Kaldırım İhlali Riski</Text>
            <Text style={styles.statSub}>Dikkat gerektirir</Text>
          </View>
        </View>

        {/* Map */}
        <View style={styles.mapCard}>
          <View style={styles.mapBg}>
            {/* Streets */}
            <View style={[styles.street, { top: '20%', left: 0, right: 0, height: 3 }]} />
            <View style={[styles.street, { top: '55%', left: 0, right: 0, height: 3 }]} />
            <View style={[styles.street, { top: '80%', left: 0, right: 0, height: 3 }]} />
            <View style={[styles.street, { left: '35%', top: 0, bottom: 0, width: 3 }]} />
            <View style={[styles.street, { left: '75%', top: 0, bottom: 0, width: 3 }]} />

            {/* Green park lines */}
            <View style={[styles.parkLine, { top: '15%', left: '5%', width: 80, backgroundColor: Colors.secondary + 'AA' }]} />
            <View style={[styles.parkLine, { top: '48%', left: '40%', width: 70, backgroundColor: Colors.secondary + 'AA' }]} />

            {/* Warning lines */}
            <View style={[styles.parkLine, { top: '30%', left: '20%', width: 55, backgroundColor: Colors.warning + 'AA' }]} />

            {/* Risk zones */}
            <View style={[styles.riskZone, { top: '25%', left: '25%' }]} />
            <View style={[styles.riskZone, { top: '55%', left: '42%' }]} />

            {/* P markers */}
            {[{ top: '10%', left: '5%', n: 18 }, { top: '35%', left: '5%', n: 12 }, { top: '45%', left: '35%', n: 24 }, { top: '70%', left: '42%', n: 9 }, { top: '50%', left: '70%', n: 15 }].map((m, i) => (
              <View key={i} style={[styles.pMarker, { top: m.top, left: m.left }]}>
                <Text style={styles.pMarkerIcon}>P</Text>
                <Text style={styles.pMarkerNum}>{m.n}</Text>
              </View>
            ))}

            {/* Street labels */}
            <Text style={[styles.streetLabel, { top: '4%', left: '30%' }]}>Bağdat Cd.</Text>
            <Text style={[styles.streetLabel, { top: '4%', right: '5%' }]}>Söğütlüçeşme Cd.</Text>
            <Text style={[styles.streetLabel, { bottom: '12%', left: '15%' }]}>Moda Cd.</Text>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            {[
              { color: Colors.secondary, label: 'Düzenli Park' },
              { color: Colors.warning, label: 'Riskli Alan' },
              { color: Colors.danger, label: 'Kaldırım İhlali Riski' },
              { color: Colors.primary, label: 'Park Kümesi' },
            ].map((l, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                <Text style={styles.legendText}>{l.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Findings + Actions */}
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

        {/* Bottom Buttons */}
        <View style={styles.bottomBtns}>
          <TouchableOpacity style={styles.downloadBtn} onPress={() => router.push('/(tabs)/raporlar')}>
            <Ionicons name="download-outline" size={18} color={Colors.primary} />
            <Text style={styles.downloadBtnText}>Rapor İndir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.newAnalysisBtn} onPress={() => router.push('/analysis/start')}>
            <Ionicons name="add-circle-outline" size={18} color={Colors.white} />
            <Text style={styles.newAnalysisBtnText}>Yeni Analiz</Text>
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
  topBarChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.gray100, borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 4 },
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
  statValue: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 10, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  statSub: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },

  mapCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapBg: { height: 200, backgroundColor: '#E8EEF8', position: 'relative', overflow: 'hidden' },
  street: { position: 'absolute', backgroundColor: 'rgba(200,215,240,0.6)' },
  parkLine: { position: 'absolute', height: 6, borderRadius: 3 },
  riskZone: { position: 'absolute', width: 60, height: 30, borderRadius: 6, borderWidth: 2, borderColor: Colors.danger, borderStyle: 'dashed', backgroundColor: Colors.danger + '15' },
  pMarker: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 2 },
  pMarkerIcon: { width: 20, height: 20, borderRadius: 4, backgroundColor: Colors.primary, color: Colors.white, fontWeight: '800', fontSize: 11, textAlign: 'center', lineHeight: 20 },
  pMarkerNum: { fontSize: 10, color: Colors.text, fontWeight: '700' },
  streetLabel: { position: 'absolute', fontSize: 9, color: Colors.textSecondary },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: Spacing.md },
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
