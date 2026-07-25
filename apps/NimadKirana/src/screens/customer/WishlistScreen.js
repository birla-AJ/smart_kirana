import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../components/common/ProductCard';
import { colors, fontSize, fontWeight, spacing } from '../../theme';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { getProductById } from '../../api/endpoints/catalog';

export default function WishlistScreen({ navigation }) {
  const ids = useWishlistStore((s) => s.ids);
  const [products, setProducts] = useState([]);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    Promise.all(ids.map((id) => getProductById(id).then((r) => r?.data ?? r).catch(() => null)))
      .then((list) => setProducts(list.filter(Boolean)));
  }, [ids]);

  if (ids.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{ fontSize: 48 }}>🤍</Text>
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySub}>Tap the heart on any product to save it here</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>My Wishlist</Text>
      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: spacing.lg }}
        contentContainerStyle={{ paddingBottom: spacing.lg }}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetail', { id: item.id })}
            onAdd={() => addItem(item, item.variants?.[0], 1)}
          />
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
});
