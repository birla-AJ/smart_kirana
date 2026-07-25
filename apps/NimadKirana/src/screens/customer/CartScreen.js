import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/common/Button';
import { colors, fontSize, fontWeight, spacing, radius } from '../../theme';
import { useCartStore } from '../../store/cartStore';

export default function CartScreen({ navigation }) {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const total = items.reduce((sum, i) => sum + i.qty * Number(i.variant?.sellingPrice || 0), 0);

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Add items to get started</Text>
          <Button title="Start Shopping" onPress={() => navigation.navigate('Home')} style={{ marginTop: spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>My Cart</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.variant.id}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.thumb}>
              <Text style={{ fontSize: 22 }}>🛒</Text>
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.name} numberOfLines={1}>{item.product.name}</Text>
              <Text style={styles.unit}>{item.variant.name}</Text>
              <Text style={styles.price}>₹{item.variant.sellingPrice}</Text>
            </View>
            <View style={styles.qtyBox}>
              <TouchableOpacity onPress={() => updateQty(item.variant.id, item.qty - 1)} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.qty}</Text>
              <TouchableOpacity onPress={() => updateQty(item.variant.id, item.qty + 1)} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
        </View>
        <Button title="Proceed to Checkout" onPress={() => navigation.navigate('Checkout')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, padding: spacing.lg, paddingBottom: 0 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  emptyTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary, marginTop: spacing.md },
  emptySub: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  thumb: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.bgMuted, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  unit: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  price: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary, marginTop: 2 },
  qtyBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm },
  qtyBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primary },
  qtyText: { minWidth: 20, textAlign: 'center', fontWeight: fontWeight.semibold },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  totalLabel: { fontSize: fontSize.base, color: colors.textSecondary },
  totalValue: { fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, color: colors.textPrimary },
});
