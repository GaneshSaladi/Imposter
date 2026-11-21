import { useEffect, useState, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

/** Long enough to absorb an accidental double tap, short enough to go unnoticed. */
const DEFAULT_SETTLE_MS = 400;

interface SettleGateProps {
  children: ReactNode;
  delayMs?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Ignores touches for a moment after a new step appears. Prevents the second
 * tap of a double tap from landing on the *next* screen's button (e.g.
 * skipping a speaker or a pass-the-phone handover). Mount it per step,
 * typically with a `key`, so the delay restarts on every step change.
 */
export function SettleGate({ children, delayMs = DEFAULT_SETTLE_MS, style }: SettleGateProps) {
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return <View style={[{ flex: 1, pointerEvents: settled ? 'auto' : 'none' }, style]}>{children}</View>;
}
