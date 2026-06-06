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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import AppHeader from '../../components/AppHeader';

const detailMarkers = [
  { lat: 40.9930, lng: 29.0265, label: 'Araç #1-8', color: Colors.primary },
  { lat: 40.9885, lng: 29.0270, label: 'Araç #9-14', color: Colors.primary },
  { lat: 40.9935, lng: 29.0340, label: 'Araç #15-21', color: Colors.primary },
  { lat: 40.9875, lng: 29.0335, label: 'Araç #22-27', color: Colors.primary },
  { lat: 40.9905, lng: 29.0300, label: 'Riskli Bölge', color: Colors.danger },
  { lat: 40.9895, lng: 29.0285, label: 'Anonimleştirilen Bölge', color: Colors.purple },
];

type FilterTab = 'Tümü' | 'Araçlar' | 'Riskli Alanlar' | 'Anonimleştirilen Bölgeler';
const tabs: FilterTab[] = ['Tümü', 'Araçlar', 'Riskli Alanlar', 'Anonimleştirilen Bölgeler'];

const detailRows = [
  { icon: 'shield-checkmark', label: 'Genel Güven Skoru', value: '72 /100', color: Colors.secondary, hasInfo: true },
  { icon: 'location', label: 'Konum', value: 'Kadıköy, İstanbul ›', color: Colors.primary, isLink: true },
  { icon: 'warning', label: 'Risk Seviyesi', value: 'Yüksek', color: Colors.danger, isBadge: true },
  { icon: 'calendar', label: 'Tespit Tarihi', value: '10 Haziran 2025, 10:24', color: Colors.textSecondary },
  { icon: 'car', label: 'Tespit Edilen Araç', value: '27 adet', color: Colors.textSecondary },
  { icon: 'shield', label: 'Anonimleştirilen Bölgeler', value: '3 bölge', color: Colors.textSecondary },
];

export default function DetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));
  const [activeTab, setActiveTab] = useState<FilterTab>('Tümü');

  return (
    <View style={styles.root}>
      <AppHeader showBack onBack={goBack} title="Detaylı Tespit İncelemesi" />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              {tab === 'Araçlar' && <Ionicons name="car" size={13} color={activeTab === tab ? Colors.white : Colors.textSecondary} />}
              {tab === 'Riskli Alanlar' && <Ionicons name="warning" size={13} color={activeTab === tab ? Colors.white : Colors.textSecondary} />}
              {tab === 'Anonimleştirilen Bölgeler' && <Ionicons name="scan" size={13} color={activeTab === tab ? Colors.white : Colors.textSecondary} />}
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Map */}
        <View style={styles.mapCard}>
          <View style={styles.mapBg}>
            <MapView
              provider={PROVIDER_DEFAULT}
              style={StyleSheet.absoluteFill}
              initialRegion={{
                latitude: 40.9905,
                longitude: 29.0300,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
            >
              {detailMarkers.map((m, i) => (
                <Marker
                  key={i}
                  coordinate={{ latitude: m.lat, longitude: m.lng }}
                  title={m.label}
                  pinColor={m.color}
                />
              ))}
            </MapView>
            <View style={styles.locationSelector} pointerEvents="none">
              <Ionicons name="location" size={12} color={Colors.primary} />
              <Text style={styles.locationText}>Kadıköy, İstanbul</Text>
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            {[
              { color: Colors.primary, label: 'Araç Kümesi' },
              { color: Colors.danger, label: 'Riskli Bölge' },
              { color: Colors.warning, label: 'Kaldırım Yakını' },
              { color: Colors.purple, label: 'Anon Bölge' },
            ].map((l, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                <Text style={styles.legendText}>{l.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Detection Results */}
        <View style={styles.resultsCard}>
          <Text style={styles.sectionTitle}>Tespit Sonuçları</Text>
          {detailRows.map((row, i) => (
            <View key={i} style={styles.resultRow}>
              <View style={[styles.resultIcon, { backgroundColor: row.color + '20' }]}>
                <Ionicons name={row.icon as any} size={16} color={row.color} />
              </View>
              <Text style={styles.resultLabel}>{row.label}</Text>
              {row.isBadge ? (
                <View style={styles.dangerBadge}>
                  <Text style={styles.dangerBadgeText}>{row.value}</Text>
                </View>
              ) : (
                <Text style={[styles.resultValue, row.isLink && { color: Colors.primary }]}>{row.value}</Text>
              )}
              {row.hasInfo && <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />}
            </View>
          ))}
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark" size={16} color={Colors.secondary} />
          <Text style={styles.privacyNoteText}>Kişisel veriler KVKK kapsamında otomatik olarak anonimleştirilmiştir.</Text>
          <TouchableOpacity>
            <Text style={styles.privacyLink}>Detaylar ›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.md },

  tabsScroll: { marginHorizontal: -Spacing.lg, marginBottom: -Spacing.md },
  tabs: { flexDirection: 'row', gap: Spacing.xs, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },

  mapCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapBg: { height: 260, backgroundColor: '#D8E8F0', position: 'relative', overflow: 'hidden' },
  street: { position: 'absolute', height: 2, backgroundColor: 'rgba(100,130,180,0.25)' },
  locationSelector: {
    position: 'absolute', top: 10, left: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.white, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  locationText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text },

  cluster: { position: 'absolute', borderRadius: 8, borderWidth: 2, borderStyle: 'dashed', padding: 6, paddingRight: 32, minWidth: 90 },
  clusterBlue: { borderColor: Colors.primary, backgroundColor: 'rgba(26,86,255,0.08)' },
  clusterLabel: { fontSize: 10, fontWeight: '600', color: Colors.primary },
  clusterBadge: { position: 'absolute', right: 6, top: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  clusterBadgeText: { fontSize: 11, fontWeight: '800', color: Colors.white },

  riskZone: {
    position: 'absolute', top: '28%', left: '28%',
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.danger + '15', borderRadius: 6, borderWidth: 1.5, borderColor: Colors.danger,
    paddingHorizontal: 8, paddingVertical: 4, width: 100, height: 50, justifyContent: 'center',
  },
  riskZoneText: { fontSize: 10, fontWeight: '600', color: Colors.danger },

  sidewalkZone: { position: 'absolute', backgroundColor: Colors.warning + '15', borderRadius: 6, borderWidth: 1.5, borderColor: Colors.warning, paddingHorizontal: 8, paddingVertical: 4 },
  sidewalkText: { fontSize: 10, fontWeight: '600', color: Colors.warning },

  anonZone: {
    position: 'absolute', bottom: '8%', right: '5%',
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.purple + '15', borderRadius: 6, borderWidth: 1.5, borderColor: Colors.purple,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  anonZoneText: { fontSize: 10, fontWeight: '600', color: Colors.purple },

  mapControls: { position: 'absolute', right: 10, bottom: 10, gap: 4 },
  mapBtn: { width: 30, height: 30, backgroundColor: Colors.white, borderRadius: 6, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  mapBtnText: { fontSize: 18, color: Colors.text, lineHeight: 22 },

  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: Spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: Colors.textSecondary },

  resultsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 4 },
  resultIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  resultLabel: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  resultValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  dangerBadge: { backgroundColor: Colors.dangerLight, borderRadius: BorderRadius.full, paddingHorizontal: 10, paddingVertical: 3 },
  dangerBadgeText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.danger },

  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.secondaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.secondary + '40',
  },
  privacyNoteText: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary },
  privacyLink: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary },
});
