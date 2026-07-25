import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { useCartStore } from '../../store/cartStore';
import { createOrder } from '../../api/endpoints/orders';
import { addCartItem } from '../../api/endpoints/cart';
import { getAddresses, createAddress } from '../../api/endpoints/addresses';

const PAYMENT_METHODS = [
  { id: 'CASH', label: 'Cash on Delivery', emoji: '💵' },
  { id: 'UPI', label: 'UPI', emoji: '📱' },
  { id: 'CARD', label: 'Credit / Debit Card', emoji: '💳' },
];

export default function CheckoutScreen({ navigation }) {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const total = items.reduce((sum, i) => sum + i.qty * Number(i.variant?.sellingPrice || 0), 0);

  const [payment, setPayment] = useState('CASH');
  const [placing, setPlacing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ fullName: '', mobile: '', addressLine1: '', city: '', state: '', pincode: '' });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    getAddresses()
      .then((r) => {
        const list = r?.data ?? [];
        setAddresses(list);
        const def = list.find((a) => a.isDefault) || list[0];
        if (def) setSelectedAddressId(def.id);
        else setShowAddForm(true);
      })
      .catch(() => setShowAddForm(true));
  }, []);

  const handleSaveAddress = async () => {
    if (!form.fullName || !form.mobile || !form.addressLine1 || !form.city || !form.state || form.pincode.length !== 6) {
      Alert.alert('Missing details', 'Please fill all required address fields.');
      return;
    }
    setSavingAddress(true);
    try {
      const res = await createAddress({ ...form, isDefault: addresses.length === 0 });
      const newAddr = res?.data ?? res;
      setAddresses((prev) => [...prev, newAddr]);
      setSelectedAddressId(newAddr.id);
      setShowAddForm(false);
    } catch (e) {
      Alert.alert('Could not save address', e?.response?.data?.message || 'Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      Alert.alert('Address required', 'Please add a delivery address first.');
      setShowAddForm(true);
      return;
    }
    setPlacing(true);
    try {
      // Sync locally-held cart items to the server-side cart first —
      // the backend builds the order from /cart, not from the request body.
      for (const item of items) {
        await addCartItem(item.product.id, item.variant.id, item.qty);
      }

      await createOrder({ addressId: selectedAddressId, paymentMethodType: payment });
      clearCart();
      Alert.alert('Order Placed! 🎉', 'Your order has been placed successfully.', [
        { text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'Orders' }) },
      ]);
    } catch (e) {
      Alert.alert('Could not place order', e?.response?.data?.message || 'Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Text style={{ fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Delivery Address</Text>

          {addresses.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={styles.addressRow}
              onPress={() => setSelectedAddressId(a.id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.addressName}>{a.fullName} · {a.type}</Text>
                <Text style={styles.cardSub}>{a.addressLine1}, {a.city}, {a.state} - {a.pincode}</Text>
              </View>
              <View style={[styles.radio, selectedAddressId === a.id && styles.radioActive]} />
            </TouchableOpacity>
          ))}

          {!showAddForm ? (
            <TouchableOpacity onPress={() => setShowAddForm(true)}>
              <Text style={styles.changeLink}>+ Add New Address</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ marginTop: spacing.md }}>
              <Input placeholder="Full Name" value={form.fullName} onChangeText={(v) => setForm({ ...form, fullName: v })} />
              <Input placeholder="Mobile Number" keyboardType="number-pad" maxLength={10} value={form.mobile} onChangeText={(v) => setForm({ ...form, mobile: v })} />
              <Input placeholder="Address Line 1" value={form.addressLine1} onChangeText={(v) => setForm({ ...form, addressLine1: v })} />
              <Input placeholder="City" value={form.city} onChangeText={(v) => setForm({ ...form, city: v })} />
              <Input placeholder="State" value={form.state} onChangeText={(v) => setForm({ ...form, state: v })} />
              <Input placeholder="Pincode" keyboardType="number-pad" maxLength={6} value={form.pincode} onChangeText={(v) => setForm({ ...form, pincode: v })} />
              <Button title="Save Address" onPress={handleSaveAddress} loading={savingAddress} />
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          {PAYMENT_METHODS.map((p) => (
            <TouchableOpacity key={p.id} style={styles.paymentRow} onPress={() => setPayment(p.id)}>
              <Text style={styles.paymentLabel}>{p.emoji}  {p.label}</Text>
              <View style={[styles.radio, payment === p.id && styles.radioActive]} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bill Summary</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{total.toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billValue}>₹0.00</Text>
          </View>
          <View style={[styles.billRow, styles.billTotalRow]}>
            <Text style={styles.billTotalLabel}>To Pay</Text>
            <Text style={styles.billTotalValue}>₹{total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title={`Place Order — ₹${total.toFixed(2)}`} onPress={handlePlaceOrder} loading={placing} disabled={items.length === 0} />
      </View>
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
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.xs },
  cardSub: { fontSize: fontSize.sm, color: colors.textSecondary },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addressName: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: 2 },
  changeLink: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.bold, marginTop: spacing.sm },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paymentLabel: { fontSize: fontSize.base, color: colors.textPrimary },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border },
  radioActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  billLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  billValue: { fontSize: fontSize.sm, color: colors.textPrimary },
  billTotalRow: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  billTotalLabel: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.textPrimary },
  billTotalValue: { fontSize: fontSize.base, fontWeight: fontWeight.extrabold, color: colors.textPrimary },
  footer: { padding: spacing.lg, backgroundColor: colors.white },
});
