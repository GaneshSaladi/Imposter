import { Directory, File, Paths } from 'expo-file-system';

import { logError } from '@/utils/errors';

/**
 * Placeholder for app-owned file storage (e.g. saving a picked profile image
 * so it survives the picker's temporary cache being cleared).
 */
export const fileService = {
  /** Returns (and creates if needed) a sub-directory of the app's document directory. */
  getAppDirectory(name: string): Directory {
    const directory = new Directory(Paths.document, name);
    directory.create({ intermediates: true, idempotent: true });
    return directory;
  },

  /** Copies a file (e.g. an image-picker result) into app storage and returns its new URI. */
  async copyIntoAppStorage(sourceUri: string, directoryName: string, fileName: string): Promise<string | null> {
    try {
      const destination = new File(fileService.getAppDirectory(directoryName), fileName);
      await new File(sourceUri).copy(destination, { overwrite: true });
      return destination.uri;
    } catch (error) {
      logError(error, 'file.copyIntoAppStorage');
      return null;
    }
  },

  deleteFile(uri: string): boolean {
    try {
      const file = new File(uri);
      if (file.exists) file.delete();
      return true;
    } catch (error) {
      logError(error, 'file.deleteFile');
      return false;
    }
  },
};
