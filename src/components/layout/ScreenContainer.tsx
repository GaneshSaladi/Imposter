import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { AmbientBackground } from '@/components/layout/AmbientBackground';
import { Layout } from '@/constants/dimensions';
import { useTheme } from '@/hooks/useTheme';

export interface ScreenContainerProps {
  children: ReactNode;
  /** Wrap content in a ScrollView (forms, long lists of settings). */
  scrollable?: boolean;
  /** Apply the standard horizontal gutter and vertical padding. */
  padded?: boolean;
  /** Vertically center content (splash-like / menu screens). */
  centered?: boolean;
  /** Violet glow + stars backdrop (dark theme only). */
  ambient?: boolean;
  /** Safe-area edges to inset. Omit 'top' on screens that show a native header. */
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
}

const DEFAULT_EDGES: Edge[] = ['top', 'bottom', 'left', 'right'];

/**
 * Base wrapper for every screen: themed background, safe-area insets,
 * and content capped at a readable width on large screens.
 */
export function ScreenContainer({
  children,
  scrollable = false,
  padded = true,
  centered = false,
  ambient = false,
  edges = DEFAULT_EDGES,
  contentStyle,
}: ScreenContainerProps) {
  const { colors, spacing, scheme } = useTheme();

  const layoutStyle: StyleProp<ViewStyle> = [
    styles.content,
    padded && { paddingHorizontal: Layout.screenGutter, paddingVertical: spacing.xl },
    centered && styles.centered,
    { gap: spacing.lg },
    contentStyle,
  ];

  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: colors.background }]}>
      {ambient && scheme === 'dark' ? <AmbientBackground baseColor={colors.background} /> : null}
      {scrollable ? (
        <ScrollView
          style={styles.fill}
          // Content may grow past the screen (that's what scrolls) but must never be
          // squeezed to the screen height — `flex: 1` here would disable scrolling.
          contentContainerStyle={[layoutStyle, styles.scrollContent]}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, layoutStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  /** Width rules only — no flex sizing (that differs between scroll and fixed modes). */
  content: {
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
  },
  /** Fill at least the screen (so `centered` works), but never cap the height. */
  scrollContent: {
    flexGrow: 1,
    flexShrink: 0,
  },
  centered: {
    justifyContent: 'center',
  },
});
