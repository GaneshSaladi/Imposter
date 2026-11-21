import { ShieldCheck, VenetianMask } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import type { RoleType } from '@/features/gameplay/types/game.types';
import { useTheme } from '@/hooks/useTheme';

const CHIP: Record<RoleType, { bg: string; label: string }> = {
  crewmate: { bg: '#6845F0', label: 'Crewmate' },
  imposter: { bg: '#B81F3B', label: 'Imposter' },
};

export function RoleChip({ role }: { role: RoleType }) {
  const { radius } = useTheme();
  const Icon = role === 'imposter' ? VenetianMask : ShieldCheck;
  return (
    <View style={[styles.chip, { borderRadius: radius.pill, backgroundColor: CHIP[role].bg }]}>
      <Icon size={12} color="#FFFFFF" strokeWidth={2.6} />
      <AppText variant="caption" style={styles.text}>
        {CHIP[role].label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 700,
  },
});
