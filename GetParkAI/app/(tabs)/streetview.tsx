import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import AppHeader from '../../components/AppHeader';
import { useLocation } from '../../hooks/useLocation';

const criteria = [
  { icon: 'square', label: 'Park çizgileri', desc: 'Mevcut ve görünürlük', color: Colors.secondary },
  { icon: 'footsteps', label: 'Kaldırım yakınlığı', desc: 'Park yerinin kaldırıma mesafesi', color: Colors.secondary },
  { icon: 'sign-caution', label: 'Tabela görünürlüğü', desc: 'Trafik levhası ve yönlendirme', color: Colors.secondary },
  { icon: 'car', label: 'Araç yoğunluğu', desc: 'Park etkisi ve doluluk analizi', color: Colors.secondary },
];

export default function StreetViewScreen() {
  const router = useRouter();
  const { coords: myCoords, isReal } = useLocation();
  const [street, setStreet] = useState('');
  const [coords, setCoords] = useState('');

  const fillMyLocation = () => {
    setCoords(`${myCoords.latitude.toFixed(5)}, ${myCoords.longitude.toFixed(5)}`);
  };

  return (
    <View style={styles.root}>
      <AppHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Street View ile Analiz</Text>

        {/* Location Selectors */}
        <View style={styles.locRow}>
          <View style={styles.locField}>
            <Text style={styles.locLabel}>İl</Text>
            <TouchableOpacity style={styles.locSelect}>
              <Ionicons name="location-outline" size={14} color={Colors.primary} />
              <Text style={styles.locSelectText}>İstanbul</Text>
              <Ionicons name="chevron-down" size={12} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.locField}>
            <Text style={styles.locLabel}>İlçe</Text>
            <TouchableOpacity style={styles.locSelect}>
              <Ionicons name="location-outline" size={14} color={Colors.primary} />
              <Text style={styles.locSelectText}>Kadıköy</Text>
              <Ionicons name="chevron-down" size={12} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Street Input */}
        <View style={styles.fieldGroup}>
          <Text style={styles.locLabel}>Cadde / Sokak</Text>
          <View style={styles.inputRow}>
            <Ionicons name="location-outline" size={16} color={Colors.primary} />
            <TextInput
              style={styles.textInput}
              value={street}
              onChangeText={setStreet}
              placeholder="Cadde veya sokak adı girin"
              placeholderTextColor={Colors.textMuted}
            />
            <TouchableOpacity>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Coords Input */}
        <View style={styles.fieldGroup}>
          <Text style={styles.locLabel}>Koordinatlar (Opsiyonel)</Text>
          <View style={styles.inputRow}>
            <Ionicons name="locate-outline" size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.textInput}
              value={coords}
              onChangeText={setCoords}
              placeholder="Enlem, Boylam girin"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.coordsExample}>örn. 40.9928, 29.0315</Text>
          </View>
        </View>

        {/* Locate Button */}
        <TouchableOpacity style={styles.locateBtn} onPress={fillMyLocation}>
          <Ionicons name="locate" size={18} color={Colors.white} />
          <Text style={styles.locateBtnText}>Konumumu Getir</Text>
        </TouchableOpacity>

        {/* Street View Map */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <View style={styles.mapTitleRow}>
              <Ionicons name="location" size={14} color={Colors.primary} />
              <Text style={styles.mapTitle}>{street ? street : 'Mevcut Konum'}</Text>
            </View>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>{isReal ? 'Konum alındı' : 'Varsayılan konum'}</Text>
            </View>
            <Text style={styles.mapSubtitle}>Seçili cadde segmentinin kapsamı aşağıda gösterilmektedir.</Text>
          </View>

          <View style={styles.mapContentRow}>
            {/* Main map */}
            <View style={styles.mainMapContainer}>
              <View style={styles.mainMapBg}>
                <MapView
                  provider={PROVIDER_DEFAULT}
                  style={StyleSheet.absoluteFill}
                  region={{
                    latitude: myCoords.latitude,
                    longitude: myCoords.longitude,
                    latitudeDelta: 0.012,
                    longitudeDelta: 0.012,
                  }}
                  showsUserLocation
                >
                  <Marker
                    coordinate={{ latitude: myCoords.latitude, longitude: myCoords.longitude }}
                    title={street ? street : 'Mevcut Konum'}
                    pinColor={Colors.primary}
                  />
                </MapView>
              </View>
            </View>

            {/* Side Info */}
            <View style={styles.sideInfo}>
              {/* District map */}
              <View style={styles.districtMapBg}>
                <View style={styles.districtShape} />
                <View style={styles.districtPin}>
                  <Ionicons name="location" size={12} color={Colors.primary} />
                </View>
              </View>

              <Text style={styles.sideInfoTitle}>Analiz Kriterleri</Text>
              {criteria.map((c, i) => (
                <View key={i} style={styles.criterionItem}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.secondary} />
                  <View>
                    <Text style={styles.criterionLabel}>{c.label}</Text>
                    <Text style={styles.criterionDesc}>{c.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Ionicons name="lock-closed" size={14} color={Colors.secondary} />
          <View style={styles.privacyText}>
            <Text style={styles.privacyTitle}>Gizlilik Önceliğimizdir</Text>
            <Text style={styles.privacyDesc}>Görüntüler yalnızca analiz amacıyla işlenir. Kişisel veri içeren unsurlar otomatik olarak bulanıklaştırılır ve anonimleştirilir.</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.privacyLink}>KVKK Politikamızı İncele →</Text>
          </TouchableOpacity>
        </View>

        {/* Analyze Button */}
        <TouchableOpacity style={styles.analyzeBtn} onPress={() => router.push('/analysis/running')}>
          <View style={styles.analyzeBtnContent}>
            <Ionicons name="sparkles" size={18} color={Colors.white} />
            <View>
              <Text style={styles.analyzeBtnTitle}>Seçili Görünümü Analiz Et</Text>
              <Text style={styles.analyzeBtnSub}>Bu segment için KVKK uyumlu analiz başlatılacak.</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.white} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 24 },

  pageTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },

  locRow: { flexDirection: 'row', gap: Spacing.sm },
  locField: { flex: 1, gap: 6 },
  locLabel: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary },
  locSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: Colors.white,
  },
  locSelectText: { flex: 1, fontSize: FontSize.sm, color: Colors.text },

  fieldGroup: { gap: 6 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: Colors.white,
  },
  textInput: { flex: 1, fontSize: FontSize.sm, color: Colors.text, padding: 0 },
  coordsExample: { fontSize: 10, color: Colors.textMuted },

  locateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
  },
  locateBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },

  mapCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  mapHeader: { padding: Spacing.md, gap: 4, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  mapTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mapTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.secondary },
  liveText: { fontSize: FontSize.xs, color: Colors.secondary, fontWeight: '600' },
  mapSubtitle: { fontSize: FontSize.xs, color: Colors.textSecondary },

  mapContentRow: { flexDirection: 'row', height: 230 },
  mainMapContainer: { flex: 1.3 },
  mainMapBg: { flex: 1, backgroundColor: '#D8E8F0', position: 'relative', overflow: 'hidden' },
  street: { position: 'absolute', height: 2, backgroundColor: 'rgba(150,170,210,0.4)' },
  routeHighlight: {
    position: 'absolute',
    top: '18%', left: '27%',
    width: 8, height: '42%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  routePoint: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary, borderWidth: 2, borderColor: Colors.white },
  stationLabel: { position: 'absolute', top: '48%', left: '45%', backgroundColor: Colors.white, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  stationText: { fontSize: 9, fontWeight: '700', color: Colors.text },
  mapControls: { position: 'absolute', left: 8, bottom: 8, gap: 4 },
  mapBtn: { width: 28, height: 28, backgroundColor: Colors.white, borderRadius: 6, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  mapBtnText: { fontSize: 16, color: Colors.text, lineHeight: 20 },
  streetNameTag: { position: 'absolute', top: 8, left: 8, backgroundColor: Colors.text + 'CC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  streetNameText: { fontSize: 10, fontWeight: '700', color: Colors.white },
  mapLegend: { position: 'absolute', bottom: 8, right: 8, backgroundColor: Colors.white + 'EE', borderRadius: 6, padding: 6, gap: 3 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendLine: { width: 16, height: 2, borderRadius: 1 },
  legendText: { fontSize: 9, color: Colors.textSecondary },

  sideInfo: { width: 120, padding: Spacing.sm, gap: Spacing.sm, borderLeftWidth: 1, borderLeftColor: Colors.gray100 },
  districtMapBg: { height: 60, backgroundColor: '#C8DDF0', borderRadius: 6, position: 'relative', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  districtShape: { width: 50, height: 40, borderRadius: 8, backgroundColor: 'rgba(26,86,255,0.2)', borderWidth: 2, borderColor: Colors.primary },
  districtPin: { position: 'absolute', bottom: 6, right: 12 },
  sideInfoTitle: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.text },
  criterionItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  criterionLabel: { fontSize: 10, fontWeight: '600', color: Colors.text },
  criterionDesc: { fontSize: 9, color: Colors.textSecondary },

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
  privacyText: { flex: 1 },
  privacyTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  privacyDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  privacyLink: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary, marginTop: 6 },

  analyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 16,
  },
  analyzeBtnContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  analyzeBtnTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  analyzeBtnSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)' },
});
