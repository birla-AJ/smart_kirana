import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, fontWeight, spacing } from '../../theme';

export default function CategoriesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Browse Categories</Text>
      <Text style={styles.sub}>Full category + subcategory grid wires up here once /categories & /subcategories APIs are connected.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: spacing.lg },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  sub: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20 },
});
