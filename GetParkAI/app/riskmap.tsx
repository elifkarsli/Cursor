import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import AppHeader from '../../components/AppHeader';

const riskPoints = [
  { id: 1, name: 'Taksim Meydanı', location: 'Beyoğlu, İstanbul', risk: 'Yüksek Risk', score: 92, color: Colors.danger },
  { id: 2, name: 'Kadıköy Çarşı', location: 'Kadıköy, İstanbul', risk: 'Yüksek Risk', score: 88, color: Colors.danger },
  { id: 3, name: 'Mecidiyeköy Cad.', location: 'Şişli, İstanbul', risk: 'Orta Risk', score: 74, color: Colors.warning },
  { id: 4, name: 'Üsküdar Sahil', location: 'Üsküdar, İstanbul', risk: 'Orta Risk', score: 68, color: Colors.warning },
  { id: 5, name: 'Zeytinburnu Merkez', location: 'Zeytinburnu, İstanbul', risk: 'Orta Risk', score: 64, color: Colors.warning },
];

const mapMarkers = [
  { top: '15%', left: '55%', type: 'red', label: 'Şişli' },
  { top: '10%', left: '65%', type: 'orange', label: 'Beşiktaş' },
  { top: '20%', left: '60%', type: 'red', label: 'Beyoğlu' },
  { top: '30%', left: '75%', type: 'orange', label: 'Üsküdar' },
  { top: '42%', left: '62%', type: 'red', label: 'Kadıköy' },
  { top: '8%', left: '42%', type: 'green', label: 'Eyüpsultan' },
  { top: '22%', left: '35%', type: 'green', label: 'Fatih' },
  { top: '50%', left: '25%', type: 'red', label: 'Zeytinburnu' },
  { top: '52%', left: '40%', type: 'red', label: 'Bakırköy' },
  { top: '8%', left: '72%', type: 'orange', label: 'Sarıyer' },
  { top: '35%', left: '88%', type: 'orange', label: 'Ümraniye' },
  { top: '50%', left: '88%', type: 'orange', label: 'Ataşehir' },
];

const heatColors = [
  { top: '20%', left: '55%', size: 80, color: Colors.danger + '40' },
  { top: '32%', left: '60%', size: 60, color: Colors.warning + '30' },
  { top: '10%', left: '42%', size: 50, color: Colors.secondary + '30' },
  { top: '45%', left: '30%', size: 70, color: Colors.danger + '35' },
];

export default function RiskMapScreen() {
  const router = useRouter();
  const [mapType, setMapType] = useState<'Isı Haritası' | 'Normal'>('Isı Haritası');

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
            { icon: 'warning', label: 'En Yüksek Riskli Bölgeler', value: '5', color: Colors.purple, bg: Colors.purpleLight },
            { icon: 'bar-chart', label: 'Toplam İncelenen Nokta', value: '2.384', change: '%%18,6 ↑', color: Colors.primary, bg: Colors.primaryLight },
            { icon: 'checkmark-circle', label: 'Ortalama Uygunluk', value: '72 /100', change: '%%6,3 ↑', color: Colors.secondary, bg: Colors.secondaryLight },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon as any} size={18} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              {s.change && <Text style={[styles.statChange, { color: s.color }]}>{s.change}</Text>}
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
            {/* Istanbul silhouette areas */}
            <View style={styles.bogazici} />
            <View style={styles.europeSide} />
            <View style={styles.asiaSide} />

            {/* Heat blobs */}
            {heatColors.map((h, i) => (
              <View key={i} style={[styles.heatBlob, {
                top: h.top, left: h.left,
                width: h.size, height: h.size,
                borderRadius: h.size / 2,
                backgroundColor: h.color,
              }]} />
            ))}

            {/* District markers */}
            {mapMarkers.map((m, i) => (
              <View key={i} style={[styles.markerContainer, { top: m.top, left: m.left }]}>
                <View style={[styles.marker, {
                  backgroundColor: m.type === 'red' ? Colors.danger : m.type === 'orange' ? Colors.warning : Colors.secondary
                }]}>
                  <Ionicons name="location" size={10} color={Colors.white} />
                </View>
                <Text style={styles.markerLabel}>{m.label}</Text>
              </View>
            ))}

            {/* İstanbul text */}
            <Text style={styles.cityLabel}>İstanbul</Text>

            {/* Map Controls */}
            <View style={styles.mapControls}>
              <TouchableOpacity style={styles.mapBtn}><Text style={styles.mapBtnText}>+</Text></TouchableOpacity>
              <TouchableOpacity style={styles.mapBtn}><Text style={styles.mapBtnText}>−</Text></TouchableOpacity>
            </View>
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

          {riskPoints.map((point, i) => (
            <TouchableOpacity key={point.id} style={[styles.riskRow, i < riskPoints.length - 1 && styles.riskRowBorder]} onPress={() => router.push('/analysis/detail')}>
              <Text style={styles.riskNum}>{point.id}</Text>
              <View style={styles.riskInfo}>
                <Text style={styles.riskName}>{point.name}</Text>
                <Text style={styles.riskLocation}>{point.location}</Text>
              </View>
              <View style={[styles.riskBadge, { backgroundColor: point.color + '20' }]}>
                <Text style={[styles.riskBadgeText, { color: point.color }]}>{point.risk}</Text>
              </View>
              <Text style={[styles.riskScore, { color: point.color }]}>{point.score}<Text style={styles.riskScoreSub}>/100</Text></Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
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
