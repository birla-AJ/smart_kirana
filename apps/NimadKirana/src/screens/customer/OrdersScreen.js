import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { getMyOrders } from '../../api/endpoints/orders';

const STATUS_COLORS = {
  PENDING: colors.warning,
  CONFIRMED: colors.info,
  PROCESSING: colors.info,
  PACKED: colors.info,
  OUT_FOR_DELIVERY: colors.primary,
  DELIVERED: colors.success,
  CANCELLED: colors.danger,
  RETURNED: colors.danger,
  REFUNDED: colors.textMuted,
};

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await getMyOrders({ limit: 20 });
      setOrders(r?.data ?? []);
    } catch (e) {
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!loading && orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{ fontSize: 48 }}>📦</Text>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySub}>Your order history will show up here once the backend is connected and you place an order.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>My Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: spacing.lg }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OrderDetail', { id: item.id })}>
            <View style={styles.row}>
              <Text style={styles.orderNo}>#{item.orderNumber || item.id.slice(-8).toUpperCase()}</Text>
              <View style={[styles.statusPill, { backgroundColor: `${STATUS_COLORS[item.status] || colors.textMuted}20` }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] || colors.textMuted }]}>
                  {item.status?.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            <View style={styles.rowBottom}>
              <Text style={styles.itemCount}>{item.items?.length || 0} items</Text>
              <Text style={styles.total}>₹{item.totalAmount}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, padding: spacing.lg, paddingBottom: 0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  emptyTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary, marginTop: spacing.md },
  emptySub: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNo: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.textPrimary },
  statusPill: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: fontWeight.bold, letterSpacing: 0.3 },
  date: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.xs },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  itemCount: { fontSize: fontSize.sm, color: colors.textSecondary },
  total: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.textPrimary },
});
