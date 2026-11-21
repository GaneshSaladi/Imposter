import {
  AndroidImportance,
  getPermissionsAsync,
  requestPermissionsAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
} from 'expo-notifications';
import { Platform } from 'react-native';

import { toPermissionState } from '@/services/permissions/permissionService';
import type { PermissionState } from '@/types/common';
import { logError } from '@/utils/errors';

const DEFAULT_CHANNEL_ID = 'default';

/**
 * Placeholder for future local notifications (e.g. "game night" reminders).
 * Import this module only where notifications are used — not at app startup.
 */
export const notificationService = {
  /** Controls how notifications appear while the app is in the foreground. */
  configureForegroundHandler(): void {
    setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  },

  async getPermission(): Promise<PermissionState> {
    try {
      return toPermissionState(await getPermissionsAsync());
    } catch (error) {
      logError(error, 'notifications.getPermission');
      return 'unavailable';
    }
  },

  /** Must be called from a user action. Android 13+ needs a channel before the prompt appears. */
  async requestPermission(): Promise<PermissionState> {
    try {
      if (Platform.OS === 'android') {
        await setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
          name: 'General',
          importance: AndroidImportance.DEFAULT,
        });
      }
      const current = await getPermissionsAsync();
      if (current.granted || !current.canAskAgain) return toPermissionState(current);
      return toPermissionState(await requestPermissionsAsync());
    } catch (error) {
      logError(error, 'notifications.requestPermission');
      return 'unavailable';
    }
  },
};
