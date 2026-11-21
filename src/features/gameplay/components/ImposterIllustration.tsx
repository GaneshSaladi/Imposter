import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

/**
 * PLACEHOLDER ARTWORK — a cute, slightly suspicious imposter (tilted fedora,
 * domino mask, fake mustache, popped collar) drawn in code. Replace it with
 * final art via `GameplayIllustrations.imposter` (../constants/illustrations.ts);
 * no screen code needs to change.
 */

interface ImposterIllustrationProps {
  size: number;
}

function sparklePath(x: number, y: number, s: number): string {
  return `M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s}Z`;
}

const INK = '#1D1A26';
const COAT_DARK = '#5A0F1E';
const HAT_DARK = '#1E0A10';

export function ImposterIllustration({ size }: ImposterIllustrationProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240">
      <Defs>
        <LinearGradient id="impCoat" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F25A6E" />
          <Stop offset="1" stopColor="#8E1B2E" />
        </LinearGradient>
        <LinearGradient id="impHat" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#4A1A26" />
          <Stop offset="1" stopColor={HAT_DARK} />
        </LinearGradient>
        <LinearGradient id="impFace" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFF3F4" />
          <Stop offset="1" stopColor="#F6CDD3" />
        </LinearGradient>
      </Defs>

      {/* Sparkles */}
      <G fill="#FFB3BE">
        <Path d={sparklePath(38, 54, 9)} opacity={0.9} />
        <Path d={sparklePath(206, 40, 7)} opacity={0.7} />
        <Path d={sparklePath(28, 150, 6)} opacity={0.5} />
        <Path d={sparklePath(214, 132, 5)} opacity={0.6} />
      </G>

      {/* Ground shadow */}
      <Ellipse cx={120} cy={226} rx={60} ry={8} fill="#000000" opacity={0.35} />

      {/* Trench coat with popped collar */}
      <Path d="M66 226 C60 186 64 150 84 134 L156 134 C176 150 180 186 174 226 Z" fill="url(#impCoat)" />
      <Path d="M86 136 L70 104 L104 130 Z" fill="#F06A7C" />
      <Path d="M154 136 L170 104 L136 130 Z" fill="#F06A7C" />
      <Path d="M120 150 L94 134 L104 176 Z" fill="#D9364F" />
      <Path d="M120 150 L146 134 L136 176 Z" fill="#D9364F" />
      <Circle cx={128} cy={182} r={3} fill={COAT_DARK} />
      <Circle cx={128} cy={212} r={3} fill={COAT_DARK} />
      <Rect x={64} y={192} width={112} height={9} rx={3} fill={COAT_DARK} />
      <Rect x={112} y={190} width={16} height={13} rx={3} fill="none" stroke="#FFB3BE" strokeWidth={2.5} />

      {/* Head */}
      <Circle cx={120} cy={100} r={44} fill="url(#impFace)" />

      {/* Domino mask with sly, narrowed eyes */}
      <Path
        d="M78 94 Q120 78 162 94 Q160 114 140 112 Q128 106 120 110 Q112 106 100 112 Q80 114 78 94 Z"
        fill={INK}
      />
      <Ellipse cx={104} cy={99} rx={8} ry={4.2} fill="#FFFFFF" />
      <Ellipse cx={137} cy={99} rx={8} ry={4.2} fill="#FFFFFF" />
      <Circle cx={108} cy={99} r={2.8} fill={INK} />
      <Circle cx={141} cy={99} r={2.8} fill={INK} />
      <Path d="M92 84 L114 89" stroke="#3A1A22" strokeWidth={3.5} strokeLinecap="round" />
      <Path d="M126 89 L148 84" stroke="#3A1A22" strokeWidth={3.5} strokeLinecap="round" />

      {/* Blush, fake mustache, smirk */}
      <Ellipse cx={92} cy={120} rx={7} ry={4} fill="#FF8FA3" opacity={0.55} />
      <Ellipse cx={150} cy={120} rx={7} ry={4} fill="#FF8FA3" opacity={0.55} />
      <Path
        d="M120 117 C112 111 101 113 98 121 C104 118 112 120 120 119 C128 120 136 118 142 121 C139 113 128 111 120 117 Z"
        fill="#3A1A22"
      />
      <Path d="M112 128 Q122 133 131 126" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />

      {/* Tilted fedora */}
      <G transform="rotate(-8 120 66)">
        <Path d="M80 70 C80 34 98 22 120 22 C142 22 160 34 160 70 Z" fill="url(#impHat)" />
        <Path d="M108 27 Q120 36 132 27" stroke="#0C0306" strokeWidth={3} fill="none" opacity={0.6} />
        <Rect x={80} y={54} width={80} height={12} fill="#E0475B" />
        <Ellipse cx={120} cy={70} rx={70} ry={12} fill={HAT_DARK} />
        <Ellipse cx={120} cy={67} rx={64} ry={8} fill="#3A1620" />
      </G>
    </Svg>
  );
}
