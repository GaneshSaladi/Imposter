import { Linking } from 'react-native';

import type { PermissionState } from '@/types/common';
import { logError } from '@/utils/errors';

/** Structural shape shared by every Expo module's permission response. */
export interface PermissionResponseLike {
  status: string;
  granted: boolean;
  canAskAgain: boolean;
}

export function toPermissionState(response: PermissionResponseLike): PermissionState {
  if (response.granted) return 'granted';
  if (response.status === 'undetermined') return 'undetermined';
  return response.canAskAgain ? 'denied' : 'blocked';
}

/**
 * Generic "check, then ask only if allowed" flow. Services call this from a
 * user action — never at app startup.
 */
export async function ensurePermission(
  getPermission: () => Promise<PermissionResponseLike>,
  requestPermission: () => Promise<PermissionResponseLike>,
): Promise<PermissionState> {
  try {
    const current = await getPermission();
    if (current.granted || !current.canAskAgain) return toPermissionState(current);
    return toPermissionState(await requestPermission());
  } catch (error) {
    logError(error, 'permissions.ensure');
    return 'unavailable';
  }
}

/** Opens the OS settings page for this app (for 'blocked' permissions). */
export async function openAppSettings(): Promise<void> {
  try {
    await Linking.openSettings();
  } catch (error) {
    logError(error, 'permissions.openSettings');
  }
}
