/**
 * Test-only stubs so store code (which imports React Native-only modules)
 * can run in plain Node. Import this FIRST in any test that touches stores.
 */
import Module from 'node:module';

/** In-memory AsyncStorage. Survives store re-hydration, like a real device. */
export const memoryStorage = new Map<string, string>();

const asyncStorage = {
  getItem: async (key: string) => memoryStorage.get(key) ?? null,
  setItem: async (key: string, value: string) => {
    memoryStorage.set(key, value);
  },
  removeItem: async (key: string) => {
    memoryStorage.delete(key);
  },
  getAllKeys: async () => [...memoryStorage.keys()],
  multiRemove: async (keys: string[]) => keys.forEach((key) => memoryStorage.delete(key)),
};

type Loader = (request: string, parent: unknown, isMain: boolean) => unknown;
const moduleInternals = Module as unknown as { _load: Loader };
const originalLoad = moduleInternals._load;
moduleInternals._load = function load(request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return { __esModule: true, default: asyncStorage };
  if (request === 'expo-constants') return { __esModule: true, default: { expoConfig: null } };
  // Icons are React Native components; content/data modules only reference them.
  if (request === 'lucide-react-native') return new Proxy({ __esModule: true }, { get: (target, key) => (key in target ? target[key as '__esModule'] : () => null) });
  return originalLoad.call(this, request, parent, isMain);
};

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

/** Lets pending promise callbacks (e.g. persistence writes) run. */
export const flushAsync = () => new Promise((resolve) => setTimeout(resolve, 0));
