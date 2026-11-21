import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientBackground, AppText } from '@/components';
import { Layout } from '@/constants/dimensions';
import { LoadingDots } from '@/features/onboarding/components/LoadingDots';
import { LoadingIllustration } from '@/features/onboarding/components/LoadingIllustration';
import { brandColors, spacing } from '@/theme';
import { clamp } from '@/utils/helpers';

import { GameTopBar } from './GameTopBar';

/** Intentional intro length before the first reveal. */
export const PREPARATION_MS = 4500;
const MESSAGE_INTERVAL_MS = 1100;

const MESSAGES = [
  'Get your detective skills ready...',
  'Trust your instincts...',
  'Someone is hiding among you...',
  'Let the mystery begin!',
] as const;

interface GamePreparationScreenProps {
  /** Called once when the intro has finished. */
  onFinished: () => void;
  onLeave: () => void;
  /** Pauses the countdown (e.g. while the leave dialog is open). */
  paused: boolean;
}

function PulseRing({ size, delay }: { size: number; delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(
      withDelay(delay, withRepeat(withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) }), -1, false)),
    );
    return () => cancelAnimation(progress);
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.55 * (1 - progress.get()),
    transform: [{ scale: 0.65 + 0.6 * progress.get() }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }, style]}
    />
  );
}

/**
 * "GET READY!" intro shown while the (already created) session waits.
 * Purely presentational: it never creates or changes the session.
 */
export function GamePreparationScreen({ onFinished, onLeave, paused }: GamePreparationScreenProps) {
  const { width, height } = useWindowDimensions();
  const illustrationSize = Math.min(width * 0.42, height * 0.22, 200);
  const stageSize = illustrationSize * 1.7;
  const titleSize = clamp(Math.round(width * 0.12), 36, 60);

  const [messageIndex, setMessageIndex] = useState(0);
  const barProgress = useSharedValue(0);
  const float = useSharedValue(0);
  const remainingMs = useRef(PREPARATION_MS);
  const finish = useEffectEvent(onFinished);

  // Countdown that survives pauses: resumes with whatever time was left.
  useEffect(() => {
    if (paused) return;
    const startedAt = Date.now();
    const duration = remainingMs.current;
    barProgress.set(withTiming(1, { duration, easing: Easing.linear }));
    const timer = setTimeout(() => finish(), duration);
    return () => {
      clearTimeout(timer);
      cancelAnimation(barProgress);
      remainingMs.current = Math.max(0, duration - (Date.now() - startedAt));
    };
  }, [paused, barProgress]);

  useEffect(() => {
    const interval = setInterval(
      () => setMessageIndex((index) => Math.min(index + 1, MESSAGES.length - 1)),
      MESSAGE_INTERVAL_MS,
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    float.set(withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }), -1, true));
    return () => cancelAnimation(float);
  }, [float]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -illustrationSize * 0.05 * float.get() }],
  }));
  const barStyle = useAnimatedStyle(() => ({ width: `${barProgress.get() * 100}%` }));

  return (
    <View style={styles.root}>
      <AmbientBackground />
      <SafeAreaView style={styles.flex}>
        <View style={[styles.flex, styles.content]}>
          <GameTopBar onLeave={onLeave} />

          <View style={[styles.flex, styles.center, { gap: spacing.lg }]}>
            <View style={[styles.center, { width: stageSize, height: stageSize }]}>
              <PulseRing size={stageSize} delay={0} />
              <PulseRing size={stageSize} delay={730} />
              <PulseRing size={stageSize} delay={1460} />
              <Animated.View style={floatStyle}>
                <LoadingIllustration size={illustrationSize} />
              </Animated.View>
            </View>

            <Animated.View entering={ZoomIn.springify().damping(14)} style={[styles.center, { gap: spacing.xs }]}>
              <AppText
                variant="display"
                align="center"
                style={[styles.title, { fontSize: titleSize, lineHeight: Math.round(titleSize * 1.15) }]}>
                GET READY!
              </AppText>
              <AppText align="center" style={styles.subtitle}>
                Time to find the imposter.
              </AppText>
            </Animated.View>

            <View style={styles.messageSlot}>
              <Animated.View key={messageIndex} entering={FadeInDown.duration(300)} exiting={FadeOutUp.duration(200)}>
                <AppText variant="bodyStrong" align="center" style={styles.message}>
                  {MESSAGES[messageIndex]}
                </AppText>
              </Animated.View>
            </View>
          </View>

          <View style={[styles.center, { gap: spacing.md, paddingBottom: spacing.xl }]}>
            <LoadingDots />
            <View style={styles.track}>
              <Animated.View style={[styles.fill, barStyle]} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: brandColors.night,
  },
  flex: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Layout.screenGutter,
    paddingTop: spacing.sm,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: brandColors.lavender,
    backgroundColor: 'rgba(124, 92, 255, 0.08)',
  },
  title: {
    color: brandColors.white,
    fontWeight: 900,
    letterSpacing: 3,
    textShadowColor: brandColors.violetGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    color: brandColors.lavender,
  },
  messageSlot: {
    minHeight: 28,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  message: {
    color: brandColors.lavenderSoft,
  },
  track: {
    width: '60%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(201, 184, 255, 0.15)',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: brandColors.lavender,
  },
});
