import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { brandColors } from '@/theme';

/** Percent-based star positions so the backdrop adapts to any screen size. */
const STARS = [
  { x: '12%', y: '9%', r: 1.6, o: 0.5 },
  { x: '84%', y: '13%', r: 1.2, o: 0.4 },
  { x: '68%', y: '6%', r: 1, o: 0.3 },
  { x: '26%', y: '22%', r: 1, o: 0.3 },
  { x: '91%', y: '34%', r: 1.4, o: 0.35 },
  { x: '6%', y: '41%', r: 1.2, o: 0.3 },
  { x: '18%', y: '68%', r: 1.4, o: 0.25 },
  { x: '88%', y: '72%', r: 1.6, o: 0.3 },
  { x: '74%', y: '86%', r: 1, o: 0.25 },
  { x: '32%', y: '90%', r: 1.2, o: 0.2 },
] as const;

interface AmbientBackgroundProps {
  /** Base fill under the glows. Defaults to the brand night color. */
  baseColor?: string;
}

/** Static (non-animated) violet glows and faint stars for dark branded screens. */
export function AmbientBackground({ baseColor = brandColors.night }: AmbientBackgroundProps) {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
      <Defs>
        <RadialGradient id="topGlow" cx="50%" cy="38%" r="55%">
          <Stop offset="0" stopColor={brandColors.violet} stopOpacity="0.32" />
          <Stop offset="1" stopColor={brandColors.violet} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="bottomGlow" cx="50%" cy="108%" r="60%">
          <Stop offset="0" stopColor={brandColors.violetDeep} stopOpacity="0.45" />
          <Stop offset="1" stopColor={brandColors.violetDeep} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={baseColor} />
      <Rect width="100%" height="100%" fill="url(#topGlow)" />
      <Rect width="100%" height="100%" fill="url(#bottomGlow)" />
      {STARS.map((star) => (
        <Circle
          key={`${star.x}-${star.y}`}
          cx={star.x}
          cy={star.y}
          r={star.r}
          fill={brandColors.lavender}
          opacity={star.o}
        />
      ))}
    </Svg>
  );
}
