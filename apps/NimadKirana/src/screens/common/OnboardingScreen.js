import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/common/Button';
import { colors, fontSize, fontWeight, spacing, radius } from '../../theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    emoji: '🛒',
    title: 'Fresh Groceries,\nDaily Essentials',
    desc: 'Order fruits, vegetables, and daily needs in a few taps.',
  },
  {
    key: '2',
    emoji: '🚴',
    title: 'Fast Delivery to\nYour Doorstep',
    desc: 'Get your order delivered quickly, right when you need it.',
  },
  {
    key: '3',
    emoji: '💳',
    title: 'Easy & Secure\nPayments',
    desc: 'Pay with UPI, cards, wallet or cash on delivery.',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [index, setIndex] = useState(0);
  const listRef = useRef(null);

  const handleNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i.key}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.iconWrap}>
              <Text style={{ fontSize: 64 }}>{item.emoji}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button title={index === SLIDES.length - 1 ? 'Get Started' : 'Next'} onPress={handleNext} />
        {index < SLIDES.length - 1 && (
          <Text style={styles.skip} onPress={() => navigation.replace('Login')}>
            Skip
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  iconWrap: {
    width: 140,
    height: 140,
    borderRadius: radius.full,
    backgroundColor: colors.bgMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    color: colors.primaryDark,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  desc: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 22,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  skip: {
    marginTop: spacing.lg,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
});
