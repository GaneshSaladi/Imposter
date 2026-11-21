import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { brandColors } from '@/theme';

const DOT_SIZE = 10;
const STAGGER_MS = 160;
const PULSE_MS = 420;
const DOT_COLORS = [brandColors.violet, '#A48BFF', brandColors.lavender] as const;

function Dot({ index, color }: { index: number; color: string }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const pulse = withTiming(1, { duration: PULSE_MS, easing: Easing.inOut(Easing.quad) });
    const settle = withTiming(0, { duration: PULSE_MS, easing: Easing.inOut(Easing.quad) });
    progress.set(withDelay(index * STAGGER_MS, withRepeat(withSequence(pulse, settle), -1)));
    return () => cancelAnimation(progress);
  }, [index, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.get();
    return {
      opacity: 0.35 + 0.65 * p,
      transform: [{ translateY: -5 * p }, { scale: 0.85 + 0.25 * p }],
    };
  });

  return <Animated.View style={[styles.dot, { backgroundColor: color }, animatedStyle]} />;
}

/** Three staggered pulsing dots — light on the UI thread, no JS per frame. */
export function LoadingDots() {
  return (
    <View style={styles.row} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {DOT_COLORS.map((color, index) => (
        <Dot key={color} index={index} color={color} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DOT_SIZE,
    height: DOT_SIZE * 2.5,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});
