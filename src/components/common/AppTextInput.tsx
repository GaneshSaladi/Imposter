import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { Layout } from '@/constants/dimensions';
import { useTheme } from '@/hooks/useTheme';

export interface AppTextInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  /** Validation message shown under the field; also turns the border red. */
  error?: string | null;
}

export function AppTextInput({ label, error, onFocus, onBlur, ...rest }: AppTextInputProps) {
  const { colors, radius, spacing, typography, scheme } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View style={{ gap: spacing.xs }}>
      {label ? (
        <AppText variant="label" color="textMuted">
          {label}
        </AppText>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        keyboardAppearance={scheme}
        {...rest}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          typography.body,
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.background,
            borderColor,
            borderRadius: radius.md,
            paddingHorizontal: spacing.lg,
          },
        ]}
      />
      {error ? (
        <AppText variant="caption" color="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: Layout.minTouchTarget + 4,
    borderWidth: 2,
  },
});
