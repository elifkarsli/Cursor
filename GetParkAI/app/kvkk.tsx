import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/Colors';
import AppHeader from '../components/AppHeader';

const priorities = [
  { icon: 'map-outline', label: 'Sadece harita\nve analiz gösterimi', color: Colors.secondary },
  { icon: 'eye-off-outline', label: 'Ham görsel\ngösterimi yok', color: Colors.secondary },
  { icon: 'person-outline', label: 'Kişi tanıma\nyok', color: Colors.secondary },
  { icon: 'car-outline', label: 'Plaka gösterimi\nyok', color: Colors.secondary },
  { icon: 'trash-outline', label: 'Otomatik\nsilme', color: Colors.secondary },
];

const complianceItems = [
  { icon: 'scale', title: 'KVKK Tam Uyum', desc: 'Tüm süreçler KVKK ve ilgili mevzuata uygun olarak tasarlanır ve denetlenir.', color: Colors.primary },
  { icon: 'shield-checkmark', title: 'Veri Güvenliği', desc: 'Veriler şifreli iletilir ve güvenli altyapıda saklanır. Yetkisiz erişim engellenir.', color: Colors.secondary },
  { icon: 'people', title: 'Anonimleştirme', desc: 'Veriler kimliksizleştirilir, analizler toplulaştırılmış şekilde üretilir.', color: Colors.purple },
  { icon: 'locate', title: 'Amaç Sınırlaması', desc: 'Veriler yalnızca kentsel park uygunluğu analizi amacıyla kullanılır.', color: Colors.warning },
  { icon: 'funnel', title: 'Veri Minimizasyonu', desc: 'Sadece analiz için gerekli veriler işlenir. Gereksiz veriler toplanmaz.', color: Colors.primary },
  { icon: 'people-circle', title: 'Erişim Kontrolü', desc: 'Role dayalı yetkilendirme ve kayıt altına alınmış erişim denetimleri.', color: Colors.secondary },
];

const processSteps = [
  { icon: 'camera', num: '1.', label: 'Toplama', desc: 'Kamera görüntüleri arka planda alınır.' },
  { icon: 'server', num: '2.', label: 'İşleme (Arka Uç)', desc: 'Kişi ve plaka bilgileri algılanmaz / kaydedilmez.' },
  { icon: 'analytics', num: '3.', label: 'Analiz', desc: 'Veriler anonimleştirilir ve toplanır.' },
  { icon: 'eye', num: '4.', label: 'Gösterim (Ön Yüz)', desc: 'Yalnızca harita ve toplam analizler gösterilir.' },
  { icon: 'trash', num: '5.', label: 'Otomatik Silme', desc: 'Ham veriler kısa sürede otomatik olarak silinir.' },
];

const privacyPolicies = [
  'Kişi tanıma yok',
  'Plaka gösterimi yok',
  'Ham görsel gösterimi yok',
  'Ham veriye erişim yok (ön yüzde)',
  'Veriler otomatik olarak silinir',
];

export default function KVKKScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <AppHeader showBack onBack={() => router.back()} title="KVKK ve Etik Uyum" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <LinearGradient colors={['#E8F4FF', '#F0FFF8']} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>KVKK uyumlu ve etik odaklı</Text>
            <Text style={styles.heroDesc}>
              Verileriniz 6698 sayılı KVKK kapsamında korunur. Şeffaf, güvenli ve sorumlu yapay zeka uygulamalarıyla kentlerinizi daha yaşanabilir hale getiriyoruz.
            </Text>
            <View style={styles.heroBadges}>
              <View style={[styles.heroBadge, { backgroundColor: Colors.secondary + '20', borderColor: Colors.secondary }]}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.secondary} />
                <Text style={[styles.heroBadgeText, { color: Colors.secondary }]}>Uyumlu</Text>
              </View>
              <View style={[styles.heroBadge, { backgroundColor: Colors.primary + '15', borderColor: Colors.primary }]}>
                <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />
                <Text style={[styles.heroBadgeText, { color: Colors.primary }]}>Güvenli</Text>
              </View>
            </View>
          </View>
          <View style={styles.heroIllustration}>
            <View style={styles.shieldOuter}>
              <View style={styles.shieldInner}>
                <Ionicons name="lock-closed" size={28} color={Colors.white} />
              </View>
              <View style={styles.shieldCheck}>
                <Ionicons name="checkmark" size={12} color={Colors.white} />
              </View>
            </View>
            <View style={styles.cityBg}>
              <View style={styles.building1} />
              <View style={styles.building2} />
              <View style={styles.building3} />
            </View>
          </View>
        </LinearGradient>

        {/* Priority Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="lock-closed" size={16} color={Colors.primary} />
            <Text style={styles.cardTitle}>Önceliğimiz: Gizlilik ve Mahremiyet</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.priorityRow}>
            {priorities.map((p, i) => (
              <View key={i} style={styles.priorityItem}>
                <View style={styles.priorityIcon}>
                  <Ionicons name={p.icon as any} size={16} color={Colors.secondary} />
                </View>
                <Text style={styles.priorityText}>{p.label}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.priorityNote}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.primary} />
            <Text style={styles.priorityNoteText}>
              Ön yüz (frontend) yalnızca harita ve toplulaştırılmış analizleri gösterir.{'\n'}Ham görsellere, plakalara ve kişisel verilere hiçbir şekilde erişilemez veya gösterilemez.
            </Text>
          </View>
        </View>

        {/* Compliance Grid */}
        <View style={styles.card}>
          <View style={styles.complianceGrid}>
            {complianceItems.map((item, i) => (
              <TouchableOpacity key={i} style={styles.complianceItem}>
                <View style={[styles.complianceIcon, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={styles.complianceTitle}>{item.title}</Text>
                <Text style={styles.complianceDesc}>{item.desc}</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} style={styles.complianceArrow} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Process Flow */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Veri İşleme Süreci</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.processRow}>
            {processSteps.map((step, i) => (
              <View key={i} style={styles.processStep}>
                <View style={styles.processIconWrap}>
                  <View style={styles.processIcon}>
                    <Ionicons name={step.icon as any} size={18} color={Colors.secondary} />
                  </View>
                  {i < processSteps.length - 1 && <View style={styles.processArrow} />}
                </View>
                <Text style={styles.processNum}>{step.num}</Text>
                <Text style={styles.processLabel}>{step.label}</Text>
                <Text style={styles.processDesc}>{step.desc}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.processNote}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.secondary} />
            <Text style={styles.processNoteText}>Hiçbir aşamada ham görsel, kişi veya plaka bilgisi ön yüzde gösterilmez.</Text>
          </View>
        </View>

        {/* Privacy + Audit Row */}
        <View style={styles.bottomRow}>
          <View style={[styles.card, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>Gizlilik İlkelerimiz</Text>
            {privacyPolicies.map((p, i) => (
              <View key={i} style={styles.policyItem}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.secondary} />
                <Text style={styles.policyText}>{p}</Text>
              </View>
            ))}
            <View style={styles.shieldBadge}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.secondary} />
            </View>
          </View>

          <View style={[styles.card, { flex: 1 }]}>
            <View style={styles.auditHeader}>
              <Text style={styles.sectionTitle}>Denetim ve Şeffaflık</Text>
              <View style={styles.updatedBadge}>
                <Text style={styles.updatedText}>Güncel</Text>
              </View>
            </View>
            <View style={styles.auditDateCard}>
              <View style={[styles.auditIcon, { backgroundColor: Colors.primaryLight }]}>
                <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
              </View>
              <View style={styles.auditInfo}>
                <Text style={styles.auditLabel}>Son denetim: 10.24</Text>
                <Text style={styles.auditDesc}>Bağımsız denetimler düzenli olarak gerçekleştirilir.</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={Colors.secondary} />
            </View>
            <TouchableOpacity style={styles.kvkkLink}>
              <Text style={styles.kvkkLinkText}>KVKK Aydınlatma Metnini incele →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Banner */}
        <View style={styles.footerBanner}>
          <Ionicons name="lock-closed" size={16} color={Colors.primary} />
          <View style={styles.footerText}>
            <Text style={styles.footerTitle}>GetParkAI, KVKK'ya tam uyum sağlar. Detaylı bilgi için KVKK Aydınlatma Metnini inceleyebilirsiniz.</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.footerLink}>KVKK Aydınlatma Metni →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 24 },

  hero: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.secondary + '30',
  },
  heroContent: { flex: 1, gap: Spacing.sm },
  heroTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  heroDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  heroBadges: { flexDirection: 'row', gap: Spacing.sm },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: BorderRadius.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  heroBadgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  heroIllustration: { alignItems: 'center', position: 'relative' },
  shieldOuter: {
    width: 80, height: 90,
    backgroundColor: Colors.secondary,
    borderRadius: 40,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  shieldInner: { alignItems: 'center', justifyContent: 'center' },
  shieldCheck: {
    position: 'absolute',
    bottom: -6, right: -6,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.white,
  },
  cityBg: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginTop: 4 },
  building1: { width: 16, height: 28, backgroundColor: Colors.secondary + '40', borderRadius: 2 },
  building2: { width: 20, height: 38, backgroundColor: Colors.secondary + '60', borderRadius: 2 },
  building3: { width: 14, height: 22, backgroundColor: Colors.secondary + '40', borderRadius: 2 },

  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },

  priorityRow: { flexDirection: 'row', gap: Spacing.md, paddingBottom: 4 },
  priorityItem: { alignItems: 'center', gap: 6, width: 72 },
  priorityIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.secondaryLight, alignItems: 'center', justifyContent: 'center' },
  priorityText: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },
  priorityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  priorityNoteText: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },

  complianceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  complianceItem: { width: '48%', backgroundColor: Colors.gray50, borderRadius: BorderRadius.md, padding: Spacing.md, gap: 6, position: 'relative' },
  complianceIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  complianceTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  complianceDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 16 },
  complianceArrow: { position: 'absolute', top: Spacing.md, right: Spacing.md },

  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },

  processRow: { flexDirection: 'row', gap: 0, paddingBottom: 4 },
  processStep: { width: 90, alignItems: 'center', gap: 4 },
  processIconWrap: { flexDirection: 'row', alignItems: 'center' },
  processIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.secondaryLight, alignItems: 'center', justifyContent: 'center' },
  processArrow: { width: 20, height: 2, backgroundColor: Colors.gray300 },
  processNum: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary, marginTop: 2 },
  processLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  processDesc: { fontSize: 9, color: Colors.textSecondary, textAlign: 'center', lineHeight: 14 },
  processNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.secondaryLight,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  processNoteText: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary },

  bottomRow: { flexDirection: 'row', gap: Spacing.sm },
  policyItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  policyText: { fontSize: FontSize.xs, color: Colors.text },
  shieldBadge: { alignItems: 'center', marginTop: 8 },

  auditHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  updatedBadge: { backgroundColor: Colors.secondaryLight, borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 3 },
  updatedText: { fontSize: 10, fontWeight: '700', color: Colors.secondary },
  auditDateCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.gray50, borderRadius: BorderRadius.sm, padding: Spacing.sm },
  auditIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  auditInfo: { flex: 1 },
  auditLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
  auditDesc: { fontSize: FontSize.xs, color: Colors.textSecondary },
  kvkkLink: {},
  kvkkLinkText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },

  footerBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  footerText: { flex: 1 },
  footerTitle: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  footerLink: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.primary, marginTop: 4 },
});
