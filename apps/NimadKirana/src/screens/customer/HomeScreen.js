import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryTile from '../../components/common/CategoryTile';
import ProductCard from '../../components/common/ProductCard';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { getCategories, getProducts, getBanners } from '../../api/endpoints/catalog';
import { useCartStore } from '../../store/cartStore';

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Grocery', emoji: '🛒' },
  { id: '2', name: 'Personal Care', emoji: '✨' },
  { id: '3', name: 'Home Cleaning', emoji: '💧' },
  { id: '4', name: 'Household', emoji: '📦' },
  { id: '5', name: 'Beverages', emoji: '🥤' },
  { id: '6', name: 'Snacks', emoji: '🍪' },
];

export default function HomeScreen({ navigation }) {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const totalItems = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0));

  const load = useCallback(async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        getCategories({ limit: 10 }).catch(() => null),
        getProducts({ limit: 10 }).catch(() => null),
      ]);
      if (catRes?.data?.length) setCategories(catRes.data);
      if (prodRes?.data) setProducts(prodRes.data);
    } catch (e) {
      // silently fall back to placeholder data — backend may not be running yet
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.deliverTo}>Deliver to</Text>
              <Text style={styles.address}>📍 Home — Indore, MP ▾</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartBtn}>
              <Text style={{ fontSize: 20 }}>🛒</Text>
              {totalItems > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalItems}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.searchBar} activeOpacity={0.8}>
            <Text style={{ color: colors.textMuted }}>🔍  Search for atta, dal, oil...</Text>
          </TouchableOpacity>
        </View>

        {/* Promo banner */}
        <View style={styles.banner}>
          <View>
            <Text style={styles.bannerTitle}>Freshness at{'\n'}Your Doorstep</Text>
            <Text style={styles.bannerSub}>Up to 30% off on your first order</Text>
          </View>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.bannerLogo}
            resizeMode="contain"
          />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((c) => (
              <CategoryTile
                key={c.id}
                category={c}
                onPress={() => navigation.navigate('Categories', { categoryId: c.id })}
              />
            ))}
          </ScrollView>
        </View>

        {/* Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Popular Products</Text>
            <Text style={styles.seeAll}>See all</Text>
          </View>
          {products.length === 0 ? (
            <Text style={styles.emptyText}>
              Connect the backend to load live products here.
            </Text>
          ) : (
            <View style={styles.grid}>
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onPress={() => navigation.navigate('ProductDetail', { id: p.id })}
                  onAdd={() => addItem(p, p.variants?.[0], 1)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  deliverTo: { color: '#d1fae5', fontSize: fontSize.xs },
  address: { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  cartBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: { color: colors.white, fontSize: 10, fontWeight: fontWeight.bold },
  searchBar: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 46,
    justifyContent: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff7ed',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  bannerTitle: { fontSize: fontSize.md, fontWeight: fontWeight.extrabold, color: colors.primaryDark },
  bannerSub: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs, maxWidth: 180 },
  bannerLogo: { width: 60, height: 60 },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  seeAll: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.semibold },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  emptyText: { color: colors.textMuted, fontSize: fontSize.sm },
});
