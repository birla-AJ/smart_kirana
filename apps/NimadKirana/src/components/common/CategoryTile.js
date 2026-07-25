import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';

export default function CategoryTile({ category, onPress }) {
  return (
    <TouchableOpacity style={styles.wrap} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.iconWrap}>
        {category.imageUrl ? (
          <Image source={{ uri: category.imageUrl }} style={styles.image} resizeMode="contain" />
        ) : (
          <Text style={{ fontSize: 26 }}>{category.emoji || '🛍️'}</Text>
        )}
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 78, alignItems: 'center', marginRight: spacing.md },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.bgMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  image: { width: 36, height: 36 },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
