import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';

export default function ProductCard({ product, onPress, onAdd }) {
  const variant = product.variants?.[0] || {};
  const image = product.images?.[0]?.imageUrl;
  const discount =
    variant.mrp && variant.sellingPrice && variant.mrp > variant.sellingPrice
      ? Math.round(((variant.mrp - variant.sellingPrice) / variant.mrp) * 100)
      : 0;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      {discount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{discount}% OFF</Text>
        </View>
      )}
      <View style={styles.imageWrap}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
        ) : (
          <Text style={{ fontSize: 36 }}>🛒</Text>
        )}
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.unit}>{variant.name}</Text>
      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.price}>₹{variant.sellingPrice}</Text>
          {discount > 0 && <Text style={styles.mrp}>₹{variant.mrp}</Text>}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
          <Text style={styles.addBtnText}>ADD</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: fontWeight.bold },
  imageWrap: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  image: { width: '100%', height: '100%' },
  name: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    minHeight: 34,
  },
  unit: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  price: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.textPrimary },
  mrp: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  addBtnText: { color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
});
