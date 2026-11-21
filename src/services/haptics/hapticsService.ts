import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { logError } from '@/utils/errors';

let enabled = true;
const isSupported = Platform.OS === 'ios' || Platform.OS === 'android';

/** Fire-and-forget wrapper: haptics must never block or crash the UI. */
function run(effect: () => Promise<void>): void {
  if (!enabled || !isSupported) return;
  effect().catch((error: unknown) => logError(error, 'haptics'));
}

export const hapticsService = {
  setEnabled(value: boolean): void {
    enabled = value;
  },

  /** Light tap — buttons, toggles. */
  light(): void {
    run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
  },

  medium(): void {
    run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
  },

  heavy(): void {
    run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
  },

  /** Picker / selection changes. */
  selection(): void {
    run(() => Haptics.selectionAsync());
  },

  success(): void {
    run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  },

  warning(): void {
    run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
  },

  error(): void {
    run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
  },
};
