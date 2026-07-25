import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { getMyOrderById } from '../../api/endpoints/orders';

const TIMELINE_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export default function OrderDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getMyOrderById(id).then((r) => setOrder(r?.data ?? r)).catch(() => setOrder(null));
  }, [id]);

  const currentIdx = order ? TIMELINE_STEPS.indexOf(order.status) : -1;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Text style={{ fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {!order ? (
        <View style={styles.center}>
          <Text style={{ color: colors.textMuted }}>Loading order — connect the backend to see live status here.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          <View style={styles.card}>
            <Text style={styles.orderNo}>#{order.orderNumber || order.id.slice(-8).toUpperCase()}</Text>
            <Text style={styles.date}>{new Date(order.createdAt).toLocaleString()}</Text>

            <View style={styles.timeline}>
              {TIMELINE_STEPS.map((step, i) => (
                <View key={step} style={styles.timelineRow}>
                  <View style={[styles.dot, i <= currentIdx && styles.dotActive]} />
                  <Text style={[styles.stepText, i <= currentIdx && styles.stepTextActive]}>
                    {step.replace(/_/g, ' ')}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Items</Text>
            {(order.items || []).map((it) => (
              <View key={it.id} style={styles.itemRow}>
                <Text style={styles.itemName}>{it.productName || it.product?.name} × {it.quantity}</Text>
                <Text style={styles.itemPrice}>₹{it.totalPrice}</Text>
              </View>
            ))}
            <View style={[styles.itemRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgMuted },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md },
  orderNo: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
  date: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, marginBottom: spacing.lg },
  timeline: { marginTop: spacing.sm },
  timelineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border, marginRight: spacing.md },
  dotActive: { backgroundColor: colors.primary },
  stepText: { fontSize: fontSize.sm, color: colors.textMuted },
  stepTextActive: { color: colors.textPrimary, fontWeight: fontWeight.semibold },
  sectionTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.md },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  itemName: { fontSize: fontSize.sm, color: colors.textPrimary, flex: 1 },
  itemPrice: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  totalRow: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  totalLabel: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.textPrimary },
  totalValue: { fontSize: fontSize.base, fontWeight: fontWeight.extrabold, color: colors.textPrimary },
});
