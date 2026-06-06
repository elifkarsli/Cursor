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
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import AppHeader from '../../components/AppHeader';
import ScoreCircle from '../../components/ScoreCircle';

const analyses = [
  { date: '10 May 2024', time: '10:24', location: 'Kadıköy, İstanbul', address: 'Moda Cad. ve Çevresi', score: 72, risk: 'Orta Risk', status: 'Tamamlandı', riskColor: Colors.warning },
  { date: '9 May 2024', time: '16:45', location: 'Beşiktaş, İstanbul', address: 'Ortaköy Meydanı', score: 78, risk: 'Orta Risk', status: 'Tamamlandı', riskColor: Colors.warning },
  { date: '8 May 2024', time: '11:10', location: 'Şişli, İstanbul', address: 'Mecidiyeköy Meydanı', score: 61, risk: 'Yüksek Risk', status: 'Tamamlandı', riskColor: Colors.danger },
  { date: '7 May 2024', time: '09:30', location: 'Beyoğlu, İstanbul', address: 'İstiklal Cad. ve Çevresi', score: 75, risk: 'Orta Risk', status: 'Tamamlandı', riskColor: Colors.warning },
  { date: '6 May 2024', time: '14:20', location: 'Üsküdar, İstanbul', address: 'Altunizade Mah.', score: 68, risk: 'Orta Risk', status: 'Tamamlandı', riskColor: Colors.warning },
  { date: '5 May 2024', time: '13:05', location: 'Fatih, İstanbul', address: 'Sultanahmet Meydanı', score: 55, risk: 'Yüksek Risk', status: 'Tamamlandı', riskColor: Colors.danger },
  { date: '4 May 2024', time: '08:50', location: 'Bakırköy, İstanbul', address: 'Ataköy Sahil Yolu', score: 71, risk: 'Orta Risk', status: 'Tamamlandı', riskColor: Colors.warning },
];

export default function GecmisScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = analyses.filter(a =>
    a.location.toLowerCase().includes(search.toLowerCase()) ||
    a.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.root}>
      <AppHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Geçmiş Analizler</Text>
          <Text style={styles.pageSubtitle}>Daha önce gerçekleştirilen park analizlerinizi görüntüleyin.</Text>
        </View>

        {/* Filters */}
        <View style={styles.filtersRow}>
          <TouchableOpacity style={styles.filterChip}>
            <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
            <Text style={styles.filterText}>Son 30 gün</Text>
            <Ionicons name="chevron-down" size={12} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Ionicons name="location-outline" size={14} color={Colors.primary} />
            <Text style={styles.filterText}>Tüm İlçeler</Text>
            <Ionicons name="chevron-down" size={12} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.searchChip}>
            <Ionicons name="search-outline" size={14} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Ara..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="bar-chart" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.statValue}>1.248</Text>
              <Text style={[styles.statChange, { color: Colors.secondary }]}>%18,6 artış</Text>
              <Text style={styles.statSub}>(son 30 gün)</Text>
              <Text style={styles.statLabel}>Toplam Analiz</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.secondaryLight }]}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.secondary} />
            </View>
            <View>
              <Text style={styles.statValue}>72 /100</Text>
              <Text style={[styles.statChange, { color: Colors.secondary }]}>%6,3 artış</Text>
              <Text style={styles.statSub}>(son 30 gün)</Text>
              <Text style={styles.statLabel}>Ortalama Skor</Text>
            </View>
          </View>
        </View>

        {/* Analysis List */}
        <View style={styles.listCard}>
          {filtered.map((item, i) => (
            <TouchableOpacity key={i} style={[styles.listItem, i < filtered.length - 1 && styles.listItemBorder]} onPress={() => router.push('/analysis/result')}>
              <View style={styles.listLeft}>
                <View style={styles.dateSection}>
                  <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
                  <Text style={styles.dateText}>{item.date}</Text>
                </View>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>

              <View style={styles.listCenter}>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={12} color={Colors.primary} />
                  <Text style={styles.locationText}>{item.location}</Text>
                </View>
                <Text style={styles.addressText}>{item.address}</Text>

                {/* Mini map thumbnail */}
                <View style={styles.miniMap}>
                  <View style={styles.miniMapBg}>
                    <View style={styles.miniMapPin} />
                  </View>
                </View>
              </View>

              <View style={styles.listRight}>
                <ScoreCircle score={item.score} size="sm" />
                <View style={[styles.riskBadge, { backgroundColor: item.riskColor + '20' }]}>
                  <Text style={[styles.riskText, { color: item.riskColor }]}>{item.risk}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
                <TouchableOpacity style={styles.viewBtn} onPress={() => router.push('/analysis/result')}>
                  <Text style={styles.viewBtnText}>Görüntüle</Text>
                  <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Load More */}
        <TouchableOpacity style={styles.loadMoreBtn}>
          <Ionicons name="refresh" size={16} color={Colors.primary} />
          <Text style={styles.loadMoreText}>Daha Fazla Yükle</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 24 },

  titleSection: { gap: 4 },
  pageTitle: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.text },
  pageSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary },

  filtersRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  filterText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  searchChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: FontSize.xs, color: Colors.text, padding: 0 },

  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  statChange: { fontSize: FontSize.xs, fontWeight: '700' },
  statSub: { fontSize: 10, color: Colors.textMuted },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },

  listCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', padding: Spacing.md, gap: Spacing.sm },
  listItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.gray100 },

  listLeft: { width: 68, gap: 2 },
  dateSection: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  dateText: { fontSize: 10, color: Colors.textSecondary },
  timeText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.text },

  listCenter: { flex: 1, gap: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.primary },
  addressText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  miniMap: { marginTop: 4 },
  miniMapBg: {
    width: 60,
    height: 40,
    backgroundColor: '#D8E8F0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniMapPin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary + '50',
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  listRight: { alignItems: 'flex-end', gap: 4 },
  riskBadge: { borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 3 },
  riskText: { fontSize: 10, fontWeight: '700' },
  statusBadge: { backgroundColor: Colors.secondaryLight, borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: '700', color: Colors.secondary },
  viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewBtnText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.primary },

  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primaryLight,
  },
  loadMoreText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },
});
