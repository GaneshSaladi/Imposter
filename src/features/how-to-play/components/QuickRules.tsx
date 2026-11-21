import { CircleCheck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppCard, AppText } from '@/components';
import { QUICK_RULES } from '@/features/how-to-play/constants/howToPlayContent';
import { useTheme } from '@/hooks/useTheme';

export function QuickRules() {
  const { colors, spacing } = useTheme();

  return (
    <AppCard style={{ gap: spacing.md }}>
      <AppText variant="heading" accessibilityRole="header">
        Remember These Rules
      </AppText>
      <View style={{ gap: spacing.sm }}>
        {QUICK_RULES.map((rule) => (
          <View key={rule} style={[styles.row, { gap: spacing.sm }]}>
            <CircleCheck size={18} color={colors.success} />
            <AppText style={styles.flex}>{rule}</AppText>
          </View>
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  flex: {
    flex: 1,
  },
});
