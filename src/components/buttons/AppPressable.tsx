import { useRef } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { feedbackService, type FeedbackKind } from '@/services/feedback/feedbackService';

export interface AppPressableProps extends Omit<PressableProps, 'onPress' | 'style'> {
  onPress?: () => void;
  /** Sound + haptic played on press. Defaults to a standard tap. */
  feedback?: FeedbackKind;
  /** Scale while pressed; 1 disables the effect. */
  pressedScale?: number;
  /**
   * Ignore repeat presses within this window (prevents double navigation).
   * Use 0 for controls meant to be tapped rapidly, like counters.
   */
  debounceMs?: number;
  style?: PressableProps['style'];
  /** Style for the animated outer wrapper (layout: flex, alignSelf, margins). */
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Base for every tappable element: centralized feedback, a subtle
 * press-scale animation and double-tap protection.
 */
export function AppPressable({
  onPress,
  feedback = 'tap',
  pressedScale = 0.97,
  debounceMs = 300,
  style,
  containerStyle,
  onPressIn,
  onPressOut,
  ...rest
}: AppPressableProps) {
  const scale = useSharedValue(1);
  const lastPressAt = useRef(0);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  const handlePress = () => {
    const now = Date.now();
    if (debounceMs > 0 && now - lastPressAt.current < debounceMs) return;
    lastPressAt.current = now;
    feedbackService.trigger(feedback);
    onPress?.();
  };

  return (
    <Animated.View style={[containerStyle, animatedStyle]}>
      <Pressable
        {...rest}
        onPress={handlePress}
        onPressIn={(event) => {
          scale.set(withSpring(pressedScale, { duration: 150 }));
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          scale.set(withSpring(1, { duration: 220 }));
          onPressOut?.(event);
        }}
        style={style}
      />
    </Animated.View>
  );
}
