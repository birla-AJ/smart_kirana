import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { colors, fontSize, fontWeight, spacing, radius } from '../../theme';

const { width } = Dimensions.get('window');
const BAR_WIDTH = Math.min(width * 0.55, 240);

const CATEGORIES = [
  { label: 'GROCERY', emoji: '🛒', bg: '#dcfce7' },
  { label: 'PERSONAL CARE', emoji: '✨', bg: '#fdedd3' },
  { label: 'HOME CLEANING', emoji: '💧', bg: '#e0f2fe' },
  { label: 'HOUSEHOLD', emoji: '📦', bg: '#ede9fe' },
];

export default function SplashScreen({ navigation, onDone }) {
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(16)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const catAnims = useRef(CATEGORIES.map(() => new Animated.Value(0))).current;
  const progress = useRef(new Animated.Value(0)).current;
  const [progressWidth, setProgressWidth] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 500,
      delay: 250,
      useNativeDriver: true,
    }).start();
    Animated.timing(textSlide, {
      toValue: 0,
      duration: 500,
      delay: 250,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    Animated.stagger(
      130,
      catAnims.map((a) =>
        Animated.spring(a, {
          toValue: 1,
          friction: 7,
          delay: 400,
          useNativeDriver: true,
        }),
      ),
    ).start();

    const listenerId = progress.addListener(({ value }) => {
      setProgressWidth(value * BAR_WIDTH);
    });

    Animated.timing(progress, {
      toValue: 1,
      duration: 2200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      setReady(true);
      setTimeout(() => {
        if (onDone) onDone();
        else if (navigation) navigation.replace('Onboarding');
      }, 600);
    });

    return () => progress.removeListener(listenerId);
  }, []);

  return (
    <View style={styles.container}>
      {/* soft background washes */}
      <View style={[styles.blob, styles.blobTopLeft]} />
      <View style={[styles.blob, styles.blobTopRight]} />

      <View style={styles.content}>
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
        >
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textSlide }],
            alignItems: 'center',
          }}
        >
          <Text style={styles.tagline}>Freshness at Your Doorstep.</Text>
        </Animated.View>

        <View style={styles.catRow}>
          {CATEGORIES.map((c, i) => (
            <Animated.View
              key={c.label}
              style={[
                styles.catItem,
                {
                  opacity: catAnims[i],
                  transform: [
                    {
                      translateY: catAnims[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [16, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={[styles.catIcon, { backgroundColor: c.bg }]}>
                <Text style={{ fontSize: 20 }}>{c.emoji}</Text>
              </View>
              <Text style={styles.catLabel}>{c.label}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        {!ready ? (
          <>
            <Text style={styles.loadingText}>LOADING...</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
          </>
        ) : (
          <Text style={styles.readyText}>Ready!</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.35,
  },
  blobTopLeft: {
    backgroundColor: '#ffedd5',
    top: -90,
    left: -70,
  },
  blobTopRight: {
    backgroundColor: '#d1fae5',
    top: -40,
    right: -90,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  logo: {
    width: 180,
    height: 180,
  },
  tagline: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primaryDark,
    letterSpacing: 0.3,
  },
  catRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.xxl,
    gap: spacing.lg,
  },
  catItem: {
    alignItems: 'center',
    width: 84,
  },
  catIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  catLabel: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: spacing.xxxl,
  },
  loadingText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  progressTrack: {
    width: BAR_WIDTH,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: '#d1fae5',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
  readyText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
});
