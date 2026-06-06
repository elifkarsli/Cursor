import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/Colors';
import AppHeader from '../../components/AppHeader';
import { useParkingMap } from '../../hooks/useParkingMap';
import { uploadParkingSpot } from '../../lib/api';

export default function AnalysisUploadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));
  const { coords, locationLabel, isReal, loading: locLoading } = useParkingMap(3000);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [uploading, setUploading] = useState(false);

  const hasSelection = !!imageUri;

  const pickImage = async (fromCamera: boolean) => {
    if (picking || uploading) return;
    setPicking(true);
    try {
      if (fromCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Kamera izni gerekli', 'Fotoğraf çekmek için Ayarlar\'dan kamera iznini açın.');
          return;
        }
        const res = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.7,
          allowsEditing: false,
        });
        if (!res.canceled && res.assets?.length) setImageUri(res.assets[0].uri);
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Galeri izni gerekli', 'Fotoğraf seçmek için Ayarlar\'dan galeri iznini açın.');
          return;
        }
        const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.7,
          allowsEditing: false,
        });
        if (!res.canceled && res.assets?.length) setImageUri(res.assets[0].uri);
      }
    } catch (e: any) {
      const msg = e?.message ?? '';
      if (msg.includes('ExponentImagePicker') || msg.includes('native module')) {
        Alert.alert(
          'Native build gerekli',
          'Kamera ve galeri için Xcode\'da uygulamayı yeniden build almanız gerekiyor (▶ Run).',
        );
      } else {
        Alert.alert('Hata', 'Görsel seçilemedi. Lütfen tekrar deneyin.');
      }
    } finally {
      setPicking(false);
    }
  };

  const handleUpload = async () => {
    if (!imageUri || uploading) return;

    if (!isReal) {
      Alert.alert(
        'Konum gerekli',
        'Park yerini sisteme kaydetmek için konum iznini açmanız gerekiyor.',
      );
      return;
    }

    setUploading(true);
    try {
      const result = await uploadParkingSpot(imageUri, coords.latitude, coords.longitude);
      Alert.alert(
        'Park yeri yüklendi',
        `Konum: ${locationLabel}\nUygunluk skoru: ${result.urban_parking_index}/100\nRisk: ${result.risk_level}`,
        [
          { text: 'Haritada Gör', onPress: () => router.replace('/riskmap') },
          { text: 'Tamam', onPress: () => { setImageUri(null); router.replace('/(tabs)'); } },
        ],
      );
    } catch (e: any) {
      Alert.alert('Yükleme başarısız', e?.message ?? 'Backend\'e bağlanılamadı. Sunucunun çalıştığından emin olun.');
    } finally {
      setUploading(false);
    }
  };

  const reset = () => setImageUri(null);

  return (
    <View style={styles.root}>
      <AppHeader showBack onBack={goBack} title="Sisteme Park Yeri Yükle" />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>

        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Park Yeri Fotoğrafı</Text>
          <Text style={styles.pageSubtitle}>
            Çektiğiniz veya seçtiğiniz park yeri fotoğrafını mevcut konumunuzla birlikte sisteme yükleyin.
          </Text>
        </View>

        {/* Location */}
        <View style={styles.locationCard}>
          <Ionicons name="navigate" size={18} color={isReal ? Colors.secondary : Colors.warning} />
          <Text style={styles.locationText}>
            {locLoading ? 'Konum alınıyor...' : isReal ? `Konum: ${locationLabel}` : 'Konum izni gerekli'}
          </Text>
        </View>

        {/* Upload / Preview */}
        {!hasSelection ? (
          <TouchableOpacity style={styles.dropZone} activeOpacity={0.8} onPress={() => pickImage(false)} disabled={picking || uploading}>
            <View style={styles.dropIcon}>
              <Ionicons name="cloud-upload-outline" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.dropTitle}>Park yeri fotoğrafı seç</Text>
            <Text style={styles.dropDesc}>JPG, PNG · maks. 10 MB</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.previewCard}>
            <Image source={{ uri: imageUri! }} style={styles.previewImage} resizeMode="cover" />
            <View style={styles.previewBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.secondary} />
              <Text style={styles.previewBadgeText}>Fotoğraf hazır</Text>
            </View>
            <TouchableOpacity style={styles.previewRemove} onPress={reset} disabled={uploading}>
              <Ionicons name="close" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.sourceRow}>
          <TouchableOpacity style={styles.sourceBtn} onPress={() => pickImage(false)} disabled={picking || uploading}>
            <Ionicons name="images-outline" size={18} color={Colors.primary} />
            <Text style={styles.sourceBtnText}>Galeriden Seç</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sourceBtn} onPress={() => pickImage(true)} disabled={picking || uploading}>
            <Ionicons name="camera-outline" size={18} color={Colors.primary} />
            <Text style={styles.sourceBtnText}>Fotoğraf Çek</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.privacyCard}>
          <Ionicons name="lock-closed" size={16} color={Colors.secondary} />
          <View style={styles.privacyText}>
            <Text style={styles.privacyTitle}>KVKK Uyumlu Yükleme</Text>
            <Text style={styles.privacyDesc}>Fotoğraftaki plakalar otomatik anonimleştirilir. Ham görsel kalıcı saklanmaz.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nasıl çalışır?</Text>
          {[
            { icon: 'camera-outline', title: 'Fotoğraf seç', desc: 'Park yerinin fotoğrafını çekin veya galeriden seçin.' },
            { icon: 'location-outline', title: 'Konum eşleştir', desc: 'GPS konumunuz otomatik olarak kaydedilir.' },
            { icon: 'cloud-upload-outline', title: 'Sisteme yükle', desc: 'AI analiz eder ve haritada görünür hale gelir.' },
          ].map((s, i) => (
            <View key={i} style={styles.howRow}>
              <View style={styles.howIcon}>
                <Ionicons name={s.icon as any} size={16} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.howTitle}>{s.title}</Text>
                <Text style={styles.howDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.uploadBtn, (!hasSelection || uploading || !isReal) && styles.uploadBtnDisabled]}
          disabled={!hasSelection || uploading || !isReal}
          onPress={handleUpload}
        >
          {uploading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Ionicons name="cloud-upload" size={18} color={Colors.white} />
          )}
          <Text style={styles.uploadBtnText}>
            {uploading ? 'Yükleniyor...' : 'Sisteme Park Yeri Yükle'}
          </Text>
        </TouchableOpacity>
        {!hasSelection && (
          <Text style={styles.hintText}>Yüklemek için önce bir park yeri fotoğrafı seçin.</Text>
        )}
        {hasSelection && !isReal && !locLoading && (
          <Text style={styles.hintText}>Konum izni olmadan yükleme yapılamaz.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.md },

  titleSection: { gap: 6 },
  pageTitle: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.text },
  pageSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary },

  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationText: { flex: 1, fontSize: FontSize.sm, color: Colors.text, fontWeight: '600' },

  dropZone: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  dropIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  dropTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  dropDesc: { fontSize: FontSize.xs, color: Colors.textSecondary },

  previewCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  previewImage: { width: '100%', height: 220 },
  previewBadge: { position: 'absolute', bottom: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.white, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  previewBadgeText: { fontSize: FontSize.xs, color: Colors.secondary, fontWeight: '700' },
  previewRemove: { position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },

  sourceRow: { flexDirection: 'row', gap: Spacing.sm },
  sourceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sourceBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },

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

  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  howRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  howIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  howTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  howDesc: { fontSize: FontSize.xs, color: Colors.textSecondary },

  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
  },
  uploadBtnDisabled: { backgroundColor: Colors.gray200 },
  uploadBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  hintText: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
});
