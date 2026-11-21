import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View, type ViewProps } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { AppText } from '@/components';
import { AmbientBackground } from '@/components/layout/AmbientBackground';
import { brandColors, spacing } from '@/theme';
import { clamp } from '@/utils/helpers';

import { LoadingDots } from './LoadingDots';
import { LoadingIllustration } from './LoadingIllustration';

export interface LoadingScreenProps {
  message?: string;
  /** Override the artwork for a specific usage; defaults to the configured illustration. */
  illustration?: ReactNode;
  /** Fires once the entrance animation has finished. */
  onIntroComplete?: () => void;
  onLayout?: ViewProps['onLayout'];
}

const ILLUSTRATION_FADE_MS = 700;
const TITLE_DELAY_MS = 350;
const TITLE_FADE_MS = 650;
const FLOAT_CYCLE_MS = 1800;
const easeOut = Easing.out(Easing.cubic);

/**
 * Branded, always-dark loading screen. Renders as a full-screen overlay and
 * fades itself out when unmounted.
 */
export function LoadingScreen({
  message = 'Preparing the mystery...',
  illustration,
  onIntroComplete,
  onLayout,
}: LoadingScreenProps) {
  const { width, height } = useWindowDimensions();
  // Scale from the live window so small phones and tablets both look balanced.
  const illustrationSize = Math.min(width * 0.68, height * 0.36, 340);
  const titleSize = clamp(Math.round(width * 0.12), 36, 64);

  const [introFinished, setIntroFinished] = useState(false);
  const illustrationOpacity = useSharedValue(0);
  const float = useSharedValue(0);
  const titleProgress = useSharedValue(0);

  useEffect(() => {
    illustrationOpacity.set(withTiming(1, { duration: ILLUSTRATION_FADE_MS, easing: easeOut }));
    float.set(
      withDelay(
        ILLUSTRATION_FADE_MS,
        withRepeat(withTiming(1, { duration: FLOAT_CYCLE_MS, easing: Easing.inOut(Easing.sin) }), -1, true),
      ),
    );
    titleProgress.set(
      withDelay(
        TITLE_DELAY_MS,
        withTiming(1, { duration: TITLE_FADE_MS, easing: easeOut }, (finished) => {
          if (finished) scheduleOnRN(setIntroFinished, true);
        }),
      ),
    );
    return () => {
      cancelAnimation(illustrationOpacity);
      cancelAnimation(float);
      cancelAnimation(titleProgress);
    };
  }, [illustrationOpacity, float, titleProgress]);

  useEffect(() => {
    if (introFinished) onIntroComplete?.();
  }, [introFinished, onIntroComplete]);

  const floatDistance = illustrationSize * 0.04;

  const illustrationStyle = useAnimatedStyle(() => ({
    opacity: illustrationOpacity.get(),
    transform: [{ translateY: -floatDistance * float.get() }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: illustrationOpacity.get() * (0.75 + 0.25 * float.get()),
    transform: [{ scale: 0.96 + 0.06 * float.get() }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleProgress.get(),
    transform: [{ translateY: 14 * (1 - titleProgress.get()) }],
  }));

  const footerStyle = useAnimatedStyle(() => ({ opacity: titleProgress.get() }));

  const haloSize = illustrationSize * 0.9;

  return (
    <Animated.View
      style={styles.root}
      exiting={FadeOut.duration(450)}
      onLayout={onLayout}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Imposter. ${message}`}>
      <AmbientBackground />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <View style={[styles.center, { gap: spacing.xl }]}>
          <View style={{ width: illustrationSize, height: illustrationSize }}>
            <Animated.View
              style={[
                styles.halo,
                {
                  width: haloSize,
                  height: haloSize,
                  borderRadius: haloSize / 2,
                  top: (illustrationSize - haloSize) / 2,
                  left: (illustrationSize - haloSize) / 2,
                  boxShadow: `0 0 ${Math.round(haloSize * 0.3)}px ${brandColors.violetGlow}`,
                },
                haloStyle,
              ]}
            />
            <Animated.View style={illustrationStyle}>
              {illustration ?? <LoadingIllustration size={illustrationSize} />}
            </Animated.View>
          </View>

          <Animated.View style={[styles.titleBlock, { gap: spacing.sm }, titleStyle]}>
            <AppText
              variant="display"
              align="center"
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[
                styles.title,
                { fontSize: titleSize, lineHeight: Math.round(titleSize * 1.15), letterSpacing: titleSize * 0.12 },
              ]}>
              IMPOSTER
            </AppText>
            <AppText align="center" style={styles.subtitle}>
              Trust no one. Find the imposter.
            </AppText>
          </Animated.View>
        </View>

        <Animated.View style={[styles.footer, { gap: spacing.md, paddingBottom: spacing.xxl }, footerStyle]}>
          <LoadingDots />
          <AppText variant="caption" align="center" style={styles.message}>
            {message}
          </AppText>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: brandColors.night,
    zIndex: 10,
  },
  safeArea: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  halo: {
    position: 'absolute',
    backgroundColor: 'rgba(124, 92, 255, 0.16)',
  },
  titleBlock: {
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  title: {
    color: brandColors.white,
    fontWeight: 900,
    textShadowColor: brandColors.violetGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  subtitle: {
    color: brandColors.lavender,
  },
  footer: {
    alignItems: 'center',
  },
  message: {
    color: brandColors.lavenderSoft,
    letterSpacing: 0.4,
  },
});
