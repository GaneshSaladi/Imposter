import { Sparkles } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import type { Highlight } from '@/features/how-to-play/constants/howToPlayContent';
import { useTheme } from '@/hooks/useTheme';

import { useToneColors } from './tones';

/** A short, emphasized tip inside a section. */
export function HighlightCallout({ highlight }: { highlight: Highlight }) {
  const { radius, spacing } = useTheme();
  const tone = useToneColors()[highlight.tone];

  return (
    <View
      style={[
        styles.callout,
        { gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: tone.soft, borderLeftColor: tone.accent },
      ]}>
      <Sparkles size={16} color={tone.accent} />
      <AppText variant="bodyStrong" style={styles.text}>
        {highlight.text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  callout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
  },
  text: {
    flex: 1,
  },
});
