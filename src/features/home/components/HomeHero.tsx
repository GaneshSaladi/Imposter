import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components';
import { LoadingIllustration } from '@/features/onboarding/components/LoadingIllustration';
import { useTheme } from '@/hooks/useTheme';
import { brandColors } from '@/theme';
import { clamp } from '@/utils/helpers';

/** Brand header for the main menu: floating detective + glowing title. */
export function HomeHero() {
  const { width, height } = useWindowDimensions();
  const { spacing, scheme } = useTheme();
  // Height-driven so the full menu fits without scrolling on small phones.
  const illustrationSize = Math.min(width * 0.42, height * 0.17, 210);
  const titleSize = clamp(Math.round(width * 0.11), 34, 56);

  const float = useSharedValue(0);
  useEffect(() => {
    float.set(withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), -1, true));
    return () => cancelAnimation(float);
  }, [float]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -illustrationSize * 0.04 * float.get() }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(500)} style={[styles.container, { gap: spacing.sm }]}>
      <Animated.View style={floatStyle}>
        <View
          style={[
            styles.halo,
            {
              width: illustrationSize * 0.86,
              height: illustrationSize * 0.86,
              borderRadius: illustrationSize,
              top: illustrationSize * 0.07,
              left: illustrationSize * 0.07,
              boxShadow: `0 0 ${Math.round(illustrationSize * 0.3)}px ${brandColors.violetGlow}`,
            },
          ]}
        />
        <LoadingIllustration size={illustrationSize} />
      </Animated.View>
      <AppText
        variant="display"
        align="center"
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[
          styles.title,
          { fontSize: titleSize, lineHeight: Math.round(titleSize * 1.15), letterSpacing: titleSize * 0.12 },
          scheme === 'dark' && styles.titleGlow,
        ]}>
        IMPOSTER
      </AppText>
      <AppText align="center" color="accent">
        Trust no one. Find the imposter.
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  halo: {
    position: 'absolute',
    backgroundColor: 'rgba(124, 92, 255, 0.16)',
  },
  title: {
    fontWeight: 900,
  },
  titleGlow: {
    textShadowColor: brandColors.violetGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
});
