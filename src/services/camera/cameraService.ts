import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

import { ensurePermission, toPermissionState } from '@/services/permissions/permissionService';
import type { PermissionState } from '@/types/common';
import { logError } from '@/utils/errors';

/**
 * Placeholder for camera / photo features (e.g. player avatars).
 * Live camera UI should use `<CameraView>` from expo-camera in a screen;
 * this service only handles permissions and one-shot image capture/picking.
 */
export const cameraService = {
  async getCameraPermission(): Promise<PermissionState> {
    try {
      return toPermissionState(await Camera.getCameraPermissionsAsync());
    } catch (error) {
      logError(error, 'camera.getPermission');
      return 'unavailable';
    }
  },

  requestCameraPermission(): Promise<PermissionState> {
    return ensurePermission(Camera.getCameraPermissionsAsync, Camera.requestCameraPermissionsAsync);
  },

  /** Opens the photo library. Returns the selected image URI, or null if cancelled. */
  async pickImage(): Promise<string | null> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      return result.canceled ? null : (result.assets[0]?.uri ?? null);
    } catch (error) {
      logError(error, 'camera.pickImage');
      return null;
    }
  },

  /** Takes a photo with the system camera UI. Requests permission if needed. */
  async takePhoto(): Promise<string | null> {
    const permission = await ensurePermission(
      ImagePicker.getCameraPermissionsAsync,
      ImagePicker.requestCameraPermissionsAsync,
    );
    if (permission !== 'granted') return null;
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      return result.canceled ? null : (result.assets[0]?.uri ?? null);
    } catch (error) {
      logError(error, 'camera.takePhoto');
      return null;
    }
  },
};
