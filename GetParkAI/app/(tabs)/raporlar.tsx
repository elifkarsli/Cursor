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

const highlights = [
  { icon: 'checkmark-circle', text: 'Park uygunluğu son 30 günde %6,3 arttı.', color: Colors.secondary, bg: Colors.secondaryLight },
  { icon: 'warning', text: 'Yüksek riskli alanlarda %9,1 artış gözlemlendi.', color: Colors.warning, bg: Colors.warningLight },
  { icon: 'bar-chart', text: 'Trafik etkisi orta seviyede ve stabil seyrediyor.', color: Colors.primary, bg: Colors.primaryLight },
];

const trendPoints = [25, 40, 55, 48, 62, 58, 70, 65, 72, 68, 75, 72];

export default function RaporlarScreen() {
  const router = useRouter();
  const [format, setFormat] = useState<'PDF' | 'CSV'>('PDF');
  const [trendChecked, setTrendChecked] = useState(true);
  const [dagChecked, setDagChecked] = useState(true);

  return (
    <View style={styles.root}>
      <AppHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.pageTitle}>Rapor Oluştur ve İndir</Text>
            <Text style={styles.pageSubtitle}>Analiz sonuçlarınızı raporlayın ve paylaşın</Text>
          </View>
          <Text style={styles.pageCounter}>8 / 10</Text>
        </View>

        <View style={styles.mainRow}>
          {/* Left: Config */}
          <View style={styles.configCard}>
            <View style={styles.configHeader}>
              <Ionicons name="options" size={16} color={Colors.primary} />
              <Text style={styles.configTitle}>Rapor Yapılandırması</Text>
            </View>

            {/* Date Range */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabel}>
                <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.fieldLabelText}>Tarih Aralığı</Text>
              </View>
              <TouchableOpacity style={styles.fieldInput}>
                <Text style={styles.fieldInputText}>01.05.2024 - 31.05.2024</Text>
                <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Location */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabel}>
                <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.fieldLabelText}>Lokasyon</Text>
              </View>
              <TouchableOpacity style={styles.fieldInput}>
                <Text style={styles.fieldInputText}>Kadıköy, İstanbul</Text>
                <Ionicons name="chevron-down" size={14} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Report Type */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabel}>
                <Ionicons name="document-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.fieldLabelText}>Rapor Türü</Text>
              </View>
              <TouchableOpacity style={styles.fieldInput}>
                <Text style={styles.fieldInputText}>Park Uygunluk Analizi</Text>
                <Ionicons name="chevron-down" size={14} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Format */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabel}>
                <Ionicons name="download-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.fieldLabelText}>Çıktı Formatı</Text>
              </View>
              <View style={styles.formatRow}>
                {(['PDF', 'CSV'] as const).map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.formatBtn, format === f && styles.formatBtnActive]}
                    onPress={() => setFormat(f)}
                  >
                    <Ionicons
                      name={f === 'PDF' ? 'document' : 'grid'}
                      size={14}
                      color={format === f ? Colors.white : Colors.primary}
                    />
                    <Text style={[styles.formatBtnText, format === f && styles.formatBtnTextActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.generateBtn}>
              <Ionicons name="document-text" size={16} color={Colors.white} />
              <Text style={styles.generateBtnText}>Raporu Oluştur</Text>
            </TouchableOpacity>
          </View>

          {/* Right: Preview */}
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Ionicons name="eye-outline" size={14} color={Colors.primary} />
              <Text style={styles.previewTitle}>Rapor Önizlemesi</Text>
            </View>
            <View style={styles.previewContent}>
              {/* Mini report card */}
              <View style={styles.miniReport}>
                <View style={styles.miniReportHeader}>
                  <View style={styles.miniLogo}>
                    <Ionicons name="business" size={10} color={Colors.white} />
                  </View>
                  <View>
                    <Text style={styles.miniLogoTitle}>GetParkAI</Text>
                    <Text style={styles.miniLogoSub}>Urban Compliance</Text>
                  </View>
                  <View style={styles.miniReportMeta}>
                    <Text style={styles.miniReportMetaText}>Rapor Tarihi</Text>
                    <Text style={styles.miniReportMetaValue}>31 Mayıs 2024</Text>
                  </View>
                </View>
                <Text style={styles.miniReportLocation}>Kadıköy, İstanbul</Text>
                <Text style={styles.miniReportType}>Park Uygunluk Analizi</Text>

                {/* Mini map */}
                <View style={styles.miniMapContainer}>
                  <View style={styles.miniMapBg}>
                    {['30%', '55%'].map((top, i) => (
                      <View key={i} style={[{ position: 'absolute', top, left: 0, right: 0, height: 1, backgroundColor: 'rgba(100,140,200,0.3)' }]} />
                    ))}
                    {['30%', '60%'].map((left, i) => (
                      <View key={i} style={[{ position: 'absolute', left, top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(100,140,200,0.3)' }]} />
                    ))}
                    {[{ top: '10%', left: '10%' }, { top: '20%', left: '55%' }, { top: '55%', left: '15%' }, { top: '50%', left: '60%' }].map((p, i) => (
                      <View key={i} style={[styles.miniPin, { top: p.top, left: p.left, backgroundColor: i === 1 ? Colors.danger : Colors.secondary }]}>
                        <Text style={styles.miniPinText}>P</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Scores */}
                <View style={styles.miniScores}>
                  <View style={styles.miniScoreCircle}>
                    <Text style={styles.miniScoreNum}>72</Text>
                    <Text style={styles.miniScoreSub}>/100</Text>
                  </View>
                  <View style={styles.miniScoreList}>
                    {[
                      { label: 'Park Uygunluğu', value: 72, color: Colors.secondary },
                      { label: 'Trafik Etkisi', value: 68, color: Colors.primary },
                      { label: 'Kentsel Risk', value: 60, color: Colors.warning },
                    ].map((s, i) => (
                      <View key={i} style={styles.miniScoreItem}>
                        <Text style={styles.miniScoreLabel}>{s.label}</Text>
                        <Text style={[styles.miniScoreValue, { color: s.color }]}>{s.value}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Mini trend chart */}
                <Text style={styles.miniTrendTitle}>Trend (Son 30 Gün)</Text>
                <View style={styles.miniChart}>
                  <View style={styles.chartArea}>
                    {[100, 75, 50, 25, 0].map((y, i) => (
                      <View key={i} style={[styles.chartLine, { bottom: `${y}%` as any }]}>
                        <Text style={styles.chartLineLabel}>{y}</Text>
                      </View>
                    ))}
                    <View style={styles.chartDots}>
                      {trendPoints.map((p, i) => (
                        <View key={i} style={[styles.chartDot, {
                          bottom: `${p}%` as any,
                          left: `${(i / (trendPoints.length - 1)) * 100}%` as any,
                          backgroundColor: Colors.primary,
                        }]} />
                      ))}
                    </View>
                  </View>
                  <View style={styles.chartXLabels}>
                    {['01 May', '08 May', '15 May', '22 May', '31 May'].map((l, i) => (
                      <Text key={i} style={styles.chartXLabel}>{l}</Text>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Highlights */}
        <View style={styles.highlightsCard}>
          <View style={styles.highlightsHeader}>
            <Ionicons name="star" size={16} color={Colors.warning} />
            <Text style={styles.highlightsTitle}>Öne Çıkan Bulgular</Text>
          </View>
          <View style={styles.highlightsList}>
            {highlights.map((h, i) => (
              <View key={i} style={[styles.highlightItem, { backgroundColor: h.bg }]}>
                <Ionicons name={h.icon as any} size={16} color={h.color} />
                <Text style={styles.highlightText}>{h.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Charts + Share */}
        <View style={styles.bottomRow}>
          <View style={styles.chartsCard}>
            <View style={styles.chartsHeader}>
              <Ionicons name="bar-chart" size={14} color={Colors.primary} />
              <Text style={styles.chartsTitle}>Grafikler</Text>
            </View>
            <Text style={styles.chartsDesc}>Rapora dahil edilecek grafikleri seçin.</Text>
            {[
              { label: 'Trend Grafiği', desc: 'Zaman içindeki değişimi gösterir.', checked: trendChecked, toggle: () => setTrendChecked(!trendChecked) },
              { label: 'Dağılım Grafiği', desc: 'Bölgeler arası dağılımı gösterir.', checked: dagChecked, toggle: () => setDagChecked(!dagChecked) },
            ].map((g, i) => (
              <TouchableOpacity key={i} style={styles.chartOption} onPress={g.toggle}>
                <View style={[styles.checkbox, g.checked && styles.checkboxChecked]}>
                  {g.checked && <Ionicons name="checkmark" size={12} color={Colors.white} />}
                </View>
                <View>
                  <Text style={styles.chartOptionLabel}>{g.label}</Text>
                  <Text style={styles.chartOptionDesc}>{g.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.shareCard}>
            <View style={styles.shareHeader}>
              <Ionicons name="share-social" size={14} color={Colors.primary} />
              <Text style={styles.shareTitle}>Paylaşım</Text>
            </View>
            <Text style={styles.shareDesc}>Raporunuzu paylaşın veya indirin.</Text>
            <TouchableOpacity style={styles.shareBtn}>
              <Ionicons name="link" size={16} color={Colors.primary} />
              <Text style={styles.shareBtnText}>Bağlantı Oluştur</Text>
            </TouchableOpacity>
            <Text style={styles.shareBtnDesc}>Paylaşılabilir bağlantı oluşturun</Text>
            <TouchableOpacity style={[styles.shareBtn, styles.emailBtn]}>
              <Ionicons name="mail" size={16} color={Colors.white} />
              <Text style={[styles.shareBtnText, { color: Colors.white }]}>E-posta ile Gönder</Text>
            </TouchableOpacity>
            <Text style={styles.shareBtnDesc}>Raporu e-posta ile gönderin</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 24 },

  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  pageTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text },
  pageSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  pageCounter: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: '600' },

  mainRow: { flexDirection: 'column', gap: Spacing.md },
  configCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  configHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  configTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },

  fieldGroup: { gap: 6 },
  fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fieldLabelText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary },
  fieldInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  fieldInputText: { fontSize: FontSize.sm, color: Colors.text },

  formatRow: { flexDirection: 'row', gap: Spacing.sm },
  formatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  formatBtnActive: { backgroundColor: Colors.primary },
  formatBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  formatBtnTextActive: { color: Colors.white },

  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
  },
  generateBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },

  previewCard: {
    flex: 1.1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  previewTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  previewContent: {},

  miniReport: { gap: 8 },
  miniReportHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  miniLogo: { width: 20, height: 20, borderRadius: 4, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  miniLogoTitle: { fontSize: 10, fontWeight: '800', color: Colors.text },
  miniLogoSub: { fontSize: 8, color: Colors.textSecondary },
  miniReportMeta: { marginLeft: 'auto', alignItems: 'flex-end' },
  miniReportMetaText: { fontSize: 8, color: Colors.textMuted },
  miniReportMetaValue: { fontSize: 9, fontWeight: '700', color: Colors.text },
  miniReportLocation: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  miniReportType: { fontSize: FontSize.xs, color: Colors.textSecondary },

  miniMapContainer: {},
  miniMapBg: { height: 80, backgroundColor: '#D8E8F0', borderRadius: 6, position: 'relative', overflow: 'hidden' },
  miniPin: { position: 'absolute', width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  miniPinText: { color: Colors.white, fontSize: 8, fontWeight: '800' },

  miniScores: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  miniScoreCircle: { width: 50, height: 50, borderRadius: 25, borderWidth: 3, borderColor: Colors.secondary, alignItems: 'center', justifyContent: 'center' },
  miniScoreNum: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  miniScoreSub: { fontSize: 9, color: Colors.textSecondary, marginTop: -2 },
  miniScoreList: { flex: 1, gap: 4 },
  miniScoreItem: { flexDirection: 'row', justifyContent: 'space-between' },
  miniScoreLabel: { fontSize: 10, color: Colors.textSecondary },
  miniScoreValue: { fontSize: 10, fontWeight: '700' },

  miniTrendTitle: { fontSize: 10, fontWeight: '700', color: Colors.text },
  miniChart: { height: 60, position: 'relative' },
  chartArea: { flex: 1, position: 'relative', borderLeftWidth: 1, borderBottomWidth: 1, borderColor: Colors.gray200, marginLeft: 16 },
  chartLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: Colors.gray100 },
  chartLineLabel: { position: 'absolute', left: -16, top: -6, fontSize: 8, color: Colors.textMuted },
  chartDots: { position: 'absolute', inset: 0 },
  chartDot: { position: 'absolute', width: 4, height: 4, borderRadius: 2, transform: [{ translateX: -2 }, { translateY: 2 }] },
  chartXLabels: { flexDirection: 'row', justifyContent: 'space-between', marginLeft: 16, marginTop: 4 },
  chartXLabel: { fontSize: 7, color: Colors.textMuted },

  highlightsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  highlightsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  highlightsTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  highlightsList: { flexDirection: 'row', gap: Spacing.sm },
  highlightItem: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 6, padding: Spacing.sm, borderRadius: BorderRadius.sm },
  highlightText: { flex: 1, fontSize: FontSize.xs, color: Colors.text },

  bottomRow: { flexDirection: 'column', gap: Spacing.md },
  chartsCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chartsTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  chartsDesc: { fontSize: FontSize.xs, color: Colors.textSecondary },
  chartOption: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: Colors.gray300, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chartOptionLabel: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text },
  chartOptionDesc: { fontSize: 10, color: Colors.textSecondary },

  shareCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shareTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  shareDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4 },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingVertical: 10,
  },
  emailBtn: { backgroundColor: Colors.primary },
  shareBtnText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary },
  shareBtnDesc: { fontSize: 10, color: Colors.textMuted, textAlign: 'center', marginBottom: 4 },
});
