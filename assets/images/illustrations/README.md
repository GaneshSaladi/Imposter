# Illustrations

Final artwork for branded screens goes here.

## Loading screen detective

The loading screen currently renders a **vector placeholder** drawn in code
(`src/features/onboarding/components/DetectiveIllustration.tsx`).

To replace it:

1. Export the art as a square PNG or WebP with a transparent background,
   at least 1024×1024 px (e.g. `detective.png`), and place it in this folder.
2. In `src/features/onboarding/constants/illustrations.ts`, set:

   ```ts
   loadingDetective: require('@/assets/images/illustrations/detective.png'),
   ```

No screen code needs to change. The artwork is sized from the screen width and
height and centered automatically; keep important detail away from the edges.
