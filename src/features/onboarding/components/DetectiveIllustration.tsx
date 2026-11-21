import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

/**
 * PLACEHOLDER ARTWORK — a vector "cute detective" drawn in code so the app
 * ships without a binary asset. Replace it with final art by setting
 * `OnboardingIllustrations.loadingDetective` (see ../constants/illustrations.ts);
 * no screen code needs to change.
 */

interface DetectiveIllustrationProps {
  size: number;
}

/** Four-point sparkle centered on (x, y). */
function sparklePath(x: number, y: number, s: number): string {
  return `M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s}Z`;
}

const INK = '#1D1A26';
const COAT_DARK = '#3E2A8F';
const HAT_BRIM = '#2A2140';
const SKIN = '#E9E1FF';

export function DetectiveIllustration({ size }: DetectiveIllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240">
      <Defs>
        <LinearGradient id="coat" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#8B6CFF" />
          <Stop offset="1" stopColor="#5233C7" />
        </LinearGradient>
        <LinearGradient id="hat" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#4A3A78" />
          <Stop offset="1" stopColor="#2A2140" />
        </LinearGradient>
        <LinearGradient id="face" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F5F1FF" />
          <Stop offset="1" stopColor="#D9CCFF" />
        </LinearGradient>
        <RadialGradient id="lens" cx="40%" cy="35%" r="70%">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.45" />
          <Stop offset="1" stopColor="#C9B8FF" stopOpacity="0.15" />
        </RadialGradient>
      </Defs>

      {/* Sparkles */}
      <G fill="#C9B8FF">
        <Path d={sparklePath(40, 58, 9)} opacity={0.9} />
        <Path d={sparklePath(204, 34, 7)} opacity={0.7} />
        <Path d={sparklePath(30, 148, 6)} opacity={0.5} />
        <Path d={sparklePath(222, 112, 5)} opacity={0.6} />
      </G>

      {/* Ground shadow */}
      <Ellipse cx={120} cy={226} rx={60} ry={8} fill="#000000" opacity={0.35} />

      {/* Trench coat */}
      <Path d="M66 226 C60 186 64 150 84 134 L156 134 C176 150 180 186 174 226 Z" fill="url(#coat)" />
      <Line x1={120} y1={150} x2={120} y2={224} stroke={COAT_DARK} strokeWidth={2} opacity={0.6} />
      <Path d="M120 150 L94 134 L104 176 Z" fill="#9E85FF" />
      <Path d="M120 150 L146 134 L136 176 Z" fill="#9E85FF" />
      <Circle cx={128} cy={182} r={3} fill={COAT_DARK} />
      <Circle cx={128} cy={212} r={3} fill={COAT_DARK} />
      <Rect x={64} y={192} width={112} height={9} rx={3} fill={COAT_DARK} />
      <Rect x={112} y={190} width={16} height={13} rx={3} fill="none" stroke="#C9B8FF" strokeWidth={2.5} />

      {/* Head */}
      <Circle cx={120} cy={100} r={44} fill="url(#face)" />
      <Ellipse cx={120} cy={74} rx={40} ry={9} fill="#8E77D9" opacity={0.35} />

      {/* Suspicious eyes glancing toward the magnifying glass */}
      <Path d="M96 84 Q106 78 115 84" stroke="#3A2D5C" strokeWidth={3.5} strokeLinecap="round" fill="none" />
      <Path d="M128 87 L147 84" stroke="#3A2D5C" strokeWidth={3.5} strokeLinecap="round" fill="none" />
      <Ellipse cx={107} cy={100} rx={8} ry={10} fill={INK} />
      <Ellipse cx={139} cy={101} rx={8} ry={9} fill={INK} />
      <Circle cx={110} cy={96} r={3} fill="#FFFFFF" />
      <Circle cx={142} cy={97} r={3} fill="#FFFFFF" />
      <Ellipse cx={94} cy={116} rx={8} ry={4.5} fill="#FF8FB8" opacity={0.55} />
      <Ellipse cx={148} cy={116} rx={8} ry={4.5} fill="#FF8FB8" opacity={0.55} />
      <Path d="M114 120 Q121 125 128 119" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />

      {/* Fedora */}
      <Path d="M78 70 C78 34 98 22 120 22 C142 22 162 34 162 70 Z" fill="url(#hat)" />
      <Path d="M108 27 Q120 36 132 27" stroke="#1E1730" strokeWidth={3} fill="none" opacity={0.6} />
      <Rect x={78} y={54} width={84} height={12} fill="#7C5CFF" />
      <Ellipse cx={120} cy={70} rx={70} ry={12} fill={HAT_BRIM} />
      <Ellipse cx={120} cy={67} rx={64} ry={8} fill="#3A2D5C" />

      {/* Arm + magnifying glass */}
      <Path d="M150 140 Q180 150 190 186" stroke="url(#coat)" strokeWidth={18} strokeLinecap="round" fill="none" />
      <Line x1={188} y1={186} x2={206} y2={206} stroke={HAT_BRIM} strokeWidth={11} strokeLinecap="round" />
      <Line x1={190} y1={188} x2={204} y2={203} stroke="#4A3A78" strokeWidth={4} strokeLinecap="round" />
      <Circle cx={168} cy={166} r={26} fill="url(#lens)" stroke="#E2D8FF" strokeWidth={7} />
      <Path d="M153 158 A17 17 0 0 1 165 149" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.8} />
      <Circle cx={194} cy={193} r={10} fill={SKIN} stroke="#BBA9F2" strokeWidth={2} />
    </Svg>
  );
}
