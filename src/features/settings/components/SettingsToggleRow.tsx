import { StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components';
import { Layout } from '@/constants/dimensions';
import { useTheme } from '@/hooks/useTheme';
import { feedbackService } from '@/services/feedback/feedbackService';

interface SettingsToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function SettingsToggleRow({ label, value, onValueChange }: SettingsToggleRowProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.row, { paddingHorizontal: spacing.sm }]}>
      <AppText variant="bodyStrong">{label}</AppText>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={(next) => {
          feedbackService.selection();
          onValueChange(next);
        }}
        trackColor={{ false: colors.disabled, true: colors.primary }}
        thumbColor={colors.surface}
        ios_backgroundColor={colors.disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: Layout.minTouchTarget + 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
