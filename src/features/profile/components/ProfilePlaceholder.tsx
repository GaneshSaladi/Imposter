import { UserRound } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppCard, AppText } from '@/components';
import { useTheme } from '@/hooks/useTheme';

export function ProfilePlaceholder() {
  const { colors, radius, spacing } = useTheme();

  return (
    <AppCard style={[styles.card, { gap: spacing.md }]}>
      <View style={[styles.icon, { borderRadius: radius.pill, backgroundColor: colors.secondary }]}>
        <UserRound size={36} color={colors.accent} />
      </View>
      <AppText variant="heading" align="center">
        Detective profile
      </AppText>
      <AppText color="textSecondary" align="center">
        Your stats, badges and favorite colors will live here. Coming soon!
      </AppText>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
  },
  icon: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
