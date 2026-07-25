import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/common/Button';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { getProductById } from '../../api/endpoints/catalog';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';

export default function ProductDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [variantIdx, setVariantIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.ids.includes(id));

  useEffect(() => {
    getProductById(id)
      .then((r) => setProduct(r?.data ?? r))
      .catch(() => setProduct(null));
  }, [id]);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{ fontSize: 48 }}>🛒</Text>
          <Text style={styles.notFound}>
            Product details will load here once the backend is connected.
          </Text>
          <Button title="Go Back" variant="outline" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  const variant = product.variants?.[variantIdx] || {};
  const discount =
    variant.mrp && variant.sellingPrice && variant.mrp > variant.sellingPrice
      ? Math.round(((variant.mrp - variant.sellingPrice) / variant.mrp) * 100)
      : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Text style={{ fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleWishlist(product.id)} style={styles.iconBtn}>
          <Text style={{ fontSize: 18 }}>{isWishlisted ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrap}>
          {product.images?.[0]?.imageUrl ? (
            <Image source={{ uri: product.images[0].imageUrl }} style={styles.image} resizeMode="contain" />
          ) : (
            <Text style={{ fontSize: 80 }}>🛒</Text>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.name}>{product.name}</Text>
          {product.isVeg !== undefined && (
            <View style={[styles.vegDot, { borderColor: product.isVeg ? colors.success : colors.danger }]}>
              <View style={[styles.vegDotInner, { backgroundColor: product.isVeg ? colors.success : colors.danger }]} />
            </View>
          )}

          {product.variants?.length > 1 && (
            <View style={styles.variantRow}>
              {product.variants.map((v, i) => (
                <TouchableOpacity
                  key={v.id}
                  onPress={() => setVariantIdx(i)}
                  style={[styles.variantChip, i === variantIdx && styles.variantChipActive]}
                >
                  <Text style={[styles.variantText, i === variantIdx && styles.variantTextActive]}>
                    {v.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{variant.sellingPrice}</Text>
            {discount > 0 && (
              <>
                <Text style={styles.mrp}>₹{variant.mrp}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{discount}% OFF</Text>
                </View>
              </>
            )}
          </View>

          <Text style={styles.sectionTitle}>Product Description</Text>
          <Text style={styles.desc}>{product.description || 'No description available.'}</Text>

          <View style={styles.qtySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.qtyBox}>
              <TouchableOpacity onPress={() => setQty(Math.max(1, qty - 1))} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity onPress={() => setQty(qty + 1)} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={styles.footerPrice}>₹{(variant.sellingPrice * qty).toFixed(2)}</Text>
        </View>
        <Button
          title="Add to Cart"
          onPress={() => {
            addItem(product, variant, qty);
            navigation.navigate('Cart');
          }}
          style={{ flex: 1, marginLeft: spacing.lg }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.bgMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  notFound: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.md },
  imageWrap: { height: 240, alignItems: 'center', justifyContent: 'center' },
  image: { width: '80%', height: '80%' },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  name: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary },
  vegDot: { width: 16, height: 16, borderWidth: 1.5, marginTop: spacing.xs, alignItems: 'center', justifyContent: 'center' },
  vegDotInner: { width: 8, height: 8, borderRadius: 4 },
  variantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  variantChip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  variantChipActive: { borderColor: colors.primary, backgroundColor: colors.bgMuted },
  variantText: { fontSize: fontSize.sm, color: colors.textSecondary },
  variantTextActive: { color: colors.primary, fontWeight: fontWeight.bold },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  price: { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, color: colors.textPrimary },
  mrp: { fontSize: fontSize.base, color: colors.textMuted, textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: colors.accent, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  discountText: { color: colors.white, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  sectionTitle: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.sm },
  desc: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
  qtySection: { marginTop: spacing.md },
  qtyBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, alignSelf: 'flex-start' },
  qtyBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.primary },
  qtyText: { minWidth: 30, textAlign: 'center', fontWeight: fontWeight.bold, fontSize: fontSize.base },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  footerPrice: { fontSize: fontSize.md, fontWeight: fontWeight.extrabold, color: colors.textPrimary },
});
