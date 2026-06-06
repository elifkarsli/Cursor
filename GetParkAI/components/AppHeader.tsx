import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, FontSize, Spacing } from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AppHeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
  rightElement?: React.ReactNode;
}

export default function AppHeader({ showBack, onBack, title, rightElement }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logo}>
            <View style={styles.logoIcon}>
              <Ionicons name="business" size={18} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.logoTitle}>GetParkAI</Text>
              <Text style={styles.logoSub}>Urban Compliance</Text>
            </View>
          </View>
        )}
        {title ? <Text style={styles.title}>{title}</Text> : null}
      </View>
      <View style={styles.right}>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color={Colors.text} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.userBtn}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={16} color={Colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userGreet}>Merhaba,</Text>
            <Text style={styles.userName}>Ahmet Yılmaz</Text>
          </View>
          <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} />
        </TouchableOpacity>
        {rightElement}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoIcon: {
    width: 36,
    height: 36,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  logoSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: Colors.gray100,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: Spacing.xs,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  notifBtn: {
    position: 'relative',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  userBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    backgroundColor: Colors.gray100,
    borderRadius: 20,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {},
  userGreet: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
});
