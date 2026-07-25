import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, fontWeight, spacing, radius } from '../../theme';
import { useAuthStore } from '../../store/authStore';

const MENU = ['Account Information', 'Delivery Address', 'Payment Methods', 'Wallet', 'My Wishlist', 'Notifications', 'Help & Support'];

export default function ProfileScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 24 }}>👤</Text>
        </View>
        <Text style={styles.name}>{user ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : 'Guest User'}</Text>
        <Text style={styles.phone}>{user?.mobile || ''}</Text>
        {user?.userId && (
          <View style={styles.userIdPill}>
            <Text style={styles.userIdText}>User ID: {user.userId}</Text>
          </View>
        )}
      </View>
      {MENU.map((item) => (
        <TouchableOpacity
          key={item}
          style={styles.menuItem}
          onPress={() => item === 'Wallet' ? null : item.includes('Wishlist') ? navigation.navigate('Wishlist') : null}
        >
          <Text style={styles.menuText}>{item}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={styles.logout}
        onPress={async () => {
          await clearSession();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 72, height: 72, borderRadius: radius.full, backgroundColor: colors.bgMuted, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  name: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
  phone: { fontSize: fontSize.sm, color: colors.textMuted },
  userIdPill: { backgroundColor: colors.bgMuted, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 4, marginTop: spacing.sm },
  userIdText: { fontSize: fontSize.xs, color: colors.primary, fontWeight: fontWeight.bold },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuText: { fontSize: fontSize.base, color: colors.textPrimary },
  chevron: { fontSize: fontSize.lg, color: colors.textMuted },
  logout: { marginTop: spacing.xl, backgroundColor: colors.primaryDark, borderRadius: radius.full, height: 52, alignItems: 'center', justifyContent: 'center' },
  logoutText: { color: colors.white, fontWeight: fontWeight.bold, fontSize: fontSize.base },
});
