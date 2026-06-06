import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from 'react-native-maps';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import AppHeader from '../../components/AppHeader';
import { useParkingMap, riskPinColor } from '../../hooks/useParkingMap';

export default function AnalysisStartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));
  const { coords, spots, loading: mapLoading, locationLabel, hasSpots, isReal } = useParkingMap(3000);
  const [anonymize, setAnonymize] = useState(true);
  const [plateFilter, setPlateFilter] = useState(true);
  const [pedestrian, setPedestrian] = useState(true);

  return (
    <View style={styles.root}>
      <AppHeader showBack onBack={goBack} title="Konum ile Analiz Başlat" />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Adres veya konum ara"
            placeholderTextColor={Colors.textMuted}
          />
          <TouchableOpacity style={styles.searchLocBtn}>
            <Ionicons name="locate" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Location info */}
        <View style={styles.locationInfo}>
          <Ionicons name="navigate" size={16} color={isReal ? Colors.secondary : Colors.warning} />
          <Text style={styles.locationInfoText}>
            {mapLoading ? 'Konum alınıyor...' : isReal ? `Mevcut konum: ${locationLabel}` : 'Konum izni gerekli — Ayarlar\'dan konum iznini açın'}
          </Text>
        </View>
        {!mapLoading && !hasSpots && (
          <View style={styles.noDataBanner}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.noDataBannerText}>Bu bölgede kayıtlı park yeri verisi yok</Text>
          </View>
        )}

        {/* Map */}
        <View style={styles.mapCard}>
          <View style={styles.mapArea}>
            <View style={styles.mapBg}>
              <MapView
                provider={PROVIDER_DEFAULT}
                style={StyleSheet.absoluteFill}
                region={{
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                  latitudeDelta: 0.014,
                  longitudeDelta: 0.014,
                }}
                showsUserLocation={isReal}
              >
                {spots.map((s) => (
                  <Marker
                    key={s.id}
                    coordinate={{ latitude: s.latitude, longitude: s.longitude }}
                    pinColor={riskPinColor(s.risk_level)}
                  />
                ))}
                <Circle
                  center={{ latitude: coords.latitude, longitude: coords.longitude }}
                  radius={350}
                  strokeColor={Colors.primary}
                  strokeWidth={2}
                  fillColor={'rgba(26,86,255,0.10)'}
                />
              </MapView>
              <View style={styles.selectedBadge} pointerEvents="none">
                <Text style={styles.selectedBadgeText}>
                  {hasSpots ? `${spots.length} park noktası` : 'Park yeri verisi yok'} · ≈ 350 m
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyCard}>
          <Ionicons name="lock-closed" size={16} color={Colors.secondary} />
          <View style={styles.privacyText}>
            <Text style={styles.privacyTitle}>Gizliliğiniz Önceliğimiz</Text>
            <Text style={styles.privacyDesc}>Ham görseller hiçbir şekilde ön yüze gösterilmez.{'\n'}Tüm analizler KVKK uyumlu şekilde çalışır ve veriler şifrelenir.</Text>
          </View>
          <TouchableOpacity style={styles.kvkkBadge}>
            <Text style={styles.kvkkBadgeText}>KVKK Uyumlu</Text>
          </TouchableOpacity>
        </View>

        {/* Analysis Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analiz Ayarları</Text>

          {[
            { label: 'Anonimleştirme açık', desc: 'Kişisel veriler otomatik olarak gizlenir.', value: anonymize, onToggle: setAnonymize, icon: 'shield-checkmark-outline' },
            { label: 'Plaka filtreleme', desc: 'Araç plakaları bulanıklaştırılır.', value: plateFilter, onToggle: setPlateFilter, icon: 'car-outline' },
            { label: 'Yaya alanı kontrolü', desc: 'Yaya geçidi ve kaldırımlar analiz edilir.', value: pedestrian, onToggle: setPedestrian, icon: 'walk-outline' },
          ].map((item, i) => (
            <View key={i} style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Ionicons name={item.icon as any} size={16} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingDesc}>{item.desc}</Text>
                </View>
              </View>
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ true: Colors.primary, false: Colors.gray200 }}
                thumbColor={Colors.white}
              />
            </View>
          ))}
        </View>

        {/* Model Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Model Seçimi</Text>
          <TouchableOpacity style={styles.modelCard}>
            <View style={styles.modelLeft}>
              <View style={styles.modelIcon}>
                <Ionicons name="flash" size={20} color={Colors.warning} />
              </View>
              <View>
                <Text style={styles.modelTitle}>Hızlı Demo Modu</Text>
                <Text style={styles.modelDesc}>Daha hızlı sonuç için optimize edilmiş model.</Text>
              </View>
            </View>
            <View style={styles.modelBadge}>
              <Text style={styles.modelBadgeText}>Önerilen</Text>
            </View>
            <View style={styles.modelRadio}>
              <View style={styles.modelRadioInner} />
            </View>
          </TouchableOpacity>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nasıl çalışır?</Text>
          <View style={styles.stepsRow}>
            {[
              { num: '1', title: 'Konum seçin', desc: 'Haritadan bir alan seçin veya adres girin.' },
              { num: '2', title: 'Analizi başlatın', desc: 'AI modelimiz bölgeyi analiz eder.' },
              { num: '3', title: 'Sonuçları inceleyin', desc: 'Uygunluk skorları ve raporları görün.' },
            ].map((step, i) => (
              <View key={i} style={styles.step}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{step.num}</Text>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/analysis/running')}>
          <Ionicons name="play-circle" size={20} color={Colors.white} />
          <Text style={styles.startBtnText}>Analizi Başlat</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.md },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  searchLocBtn: { padding: 4 },

  locationInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  locationInfoText: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  noDataBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.gray100, borderRadius: BorderRadius.lg, padding: Spacing.md },
  noDataBannerText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  districtRow: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  districtChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  districtChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  districtText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  districtTextActive: { color: Colors.primary, fontWeight: '600' },

  mapCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapArea: { position: 'relative' },
  mapBg: { height: 220, backgroundColor: '#E8EEF8', position: 'relative', overflow: 'hidden' },
  selectedBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  selectedBadgeText: { fontSize: 10, color: Colors.white, fontWeight: '700' },
  street: { position: 'absolute', backgroundColor: 'rgba(100,120,180,0.2)' },
  selectedArea: { position: 'absolute', top: '20%', left: '25%' },
  selectedCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(26,86,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDotText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.lg },
  selectedLabel: {
    position: 'absolute',
    top: -28,
    left: 4,
    backgroundColor: Colors.primary,
    color: Colors.white,
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  streetLabel: { position: 'absolute', bottom: '20%', left: '15%', backgroundColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  streetLabelText: { fontSize: 10, color: Colors.text },
  parkLabel: { position: 'absolute', bottom: '10%', left: 12 },
  parkLabelText: { fontSize: 10, color: Colors.textSecondary },
  mapControls: { position: 'absolute', right: 12, bottom: 12, gap: 4 },
  mapBtn: {
    width: 32,
    height: 32,
    backgroundColor: Colors.white,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mapBtnText: { fontSize: 18, color: Colors.text, lineHeight: 22 },

  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.secondaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.secondary + '40',
  },
  privacyText: { flex: 1 },
  privacyTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  privacyDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  kvkkBadge: { backgroundColor: Colors.secondary, borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 3 },
  kvkkBadgeText: { fontSize: 10, color: Colors.white, fontWeight: '700' },

  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },

  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  settingIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  settingDesc: { fontSize: FontSize.xs, color: Colors.textSecondary },

  modelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    backgroundColor: Colors.primaryLight,
  },
  modelLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  modelIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.warningLight, alignItems: 'center', justifyContent: 'center' },
  modelTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  modelDesc: { fontSize: FontSize.xs, color: Colors.textSecondary },
  modelBadge: { backgroundColor: Colors.secondary, borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 3 },
  modelBadgeText: { fontSize: 10, color: Colors.white, fontWeight: '700' },
  modelRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  modelRadioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },

  stepsRow: { flexDirection: 'row', gap: Spacing.sm },
  step: { flex: 1, alignItems: 'center', gap: 6 },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontSize: FontSize.md, fontWeight: '800', color: Colors.primary },
  stepTitle: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  stepDesc: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },

  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
  },
  startBtnText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.white },
});
