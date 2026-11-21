import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { useTheme } from '@/hooks/useTheme';

export interface LoadingIndicatorProps {
  message?: string;
  /** Fill the available space and center (for full-screen loading states). */
  fullScreen?: boolean;
  size?: 'small' | 'large';
}

export function LoadingIndicator({ message, fullScreen = false, size = 'large' }: LoadingIndicatorProps) {
  const { colors, spacing } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { gap: spacing.md },
        fullScreen && [styles.fullScreen, { backgroundColor: colors.background }],
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel={message ?? 'Loading'}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message ? (
        <AppText variant="caption" color="textSecondary" align="center">
          {message}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
  },
});
