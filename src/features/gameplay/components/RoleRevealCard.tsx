import { Eye, Lock, VenetianMask } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { AppText } from '@/components';
import { Layout } from '@/constants/dimensions';
import { usePlayerSecret } from '@/features/gameplay/hooks/useGameSession';
import { PlayerAvatar } from '@/features/players/components/PlayerAvatar';
import type { Player } from '@/features/players/types';
import { useTheme } from '@/hooks/useTheme';
import { brandColors } from '@/theme';
import type { EntityId } from '@/types/common';

import { CardActionButton } from './CardActionButton';
import { CrewmateCard } from './CrewmateCard';
import { ImposterCard } from './ImposterCard';

/**
 * 'front'    – name card; the role is not read or rendered at all.
 * 'flipping' – role face mounted (facing away) and rotating into view.
 * 'revealed' – role visible; Got It enabled.
 * 'done'     – Got It pressed; the parent unmounts this card.
 */
type CardStage = 'front' | 'flipping' | 'revealed' | 'done';

interface RoleRevealCardProps {
  player: Player;
  onGotIt: () => void;
}

const FLIP_MS = 700;
const PERSPECTIVE = 1200;

export function RoleRevealCard({ player, onGotIt }: RoleRevealCardProps) {
  const { width, height } = useWindowDimensions();
  const cardWidth = Math.min(width - Layout.screenGutter * 2, 400);
  const cardHeight = Math.min(height * 0.7, cardWidth * 1.6);
  const illustrationSize = Math.round(Math.min(cardWidth * 0.4, cardHeight * 0.22));

  const [stage, setStage] = useState<CardStage>('front');
  const rotation = useSharedValue(0); // degrees, 0 = name side, 180 = role side

  useEffect(() => () => cancelAnimation(rotation), [rotation]);

  const reveal = () => {
    if (stage !== 'front') return;
    setStage('flipping');
    rotation.set(
      withTiming(180, { duration: FLIP_MS, easing: Easing.inOut(Easing.cubic) }, (finished) => {
        if (finished) scheduleOnRN(setStage, 'revealed');
      }),
    );
  };

  const gotIt = () => {
    if (stage !== 'revealed') return;
    setStage('done');
    onGotIt();
  };

  // Each face is hidden twice over: backfaceVisibility *and* an opacity switch
  // at 90° — so neither face can flicker through on any platform.
  const frontStyle = useAnimatedStyle(() => {
    const r = rotation.get();
    return {
      opacity: r < 90 ? 1 : 0,
      transform: [
        { perspective: PERSPECTIVE },
        { rotateY: `${r}deg` },
        { scale: interpolate(r, [0, 90, 180], [1, 1.05, 1]) },
      ],
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const r = rotation.get();
    return {
      opacity: r >= 90 ? 1 : 0,
      transform: [
        { perspective: PERSPECTIVE },
        { rotateY: `${r + 180}deg` },
        { scale: interpolate(r, [0, 90, 180], [1, 1.05, 1]) },
      ],
    };
  });

  const frontActive = stage === 'front';
  const backActive = stage === 'revealed';

  return (
    <View style={{ width: cardWidth, height: cardHeight }}>
      <Animated.View
        style={[styles.face, frontStyle]}
        pointerEvents={frontActive ? 'auto' : 'none'}
        accessibilityElementsHidden={!frontActive}
        importantForAccessibility={frontActive ? 'auto' : 'no-hide-descendants'}>
        <CardFront player={player} onReveal={reveal} disabled={!frontActive} />
      </Animated.View>

      {/* The secret is only read once this player has pressed Reveal. */}
      {stage === 'front' ? null : (
        <Animated.View
          style={[styles.face, backStyle]}
          pointerEvents={backActive ? 'auto' : 'none'}
          accessibilityElementsHidden={!backActive}
          importantForAccessibility={backActive ? 'auto' : 'no-hide-descendants'}>
          <RoleFace
            playerId={player.id}
            illustrationSize={illustrationSize}
            onGotIt={gotIt}
            gotItEnabled={backActive}
          />
        </Animated.View>
      )}
    </View>
  );
}

function RoleFace({
  playerId,
  illustrationSize,
  onGotIt,
  gotItEnabled,
}: {
  playerId: EntityId;
  illustrationSize: number;
  onGotIt: () => void;
  gotItEnabled: boolean;
}) {
  const role = usePlayerSecret(playerId);
  if (!role) return null;
  return role.role === 'crewmate' ? (
    <CrewmateCard
      secretWord={role.secretWord}
      illustrationSize={illustrationSize}
      onGotIt={onGotIt}
      gotItEnabled={gotItEnabled}
    />
  ) : (
    <ImposterCard illustrationSize={illustrationSize} onGotIt={onGotIt} gotItEnabled={gotItEnabled} />
  );
}

/** The face-down side: who's turn it is. Contains no role information. */
function CardFront({ player, onReveal, disabled }: { player: Player; onReveal: () => void; disabled: boolean }) {
  const { radius, spacing } = useTheme();

  return (
    <View style={[styles.front, { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md }]}>
      <View style={styles.watermark} pointerEvents="none">
        <VenetianMask size={260} color={brandColors.lavender} strokeWidth={1.2} opacity={0.06} />
      </View>

      <View style={[styles.row, { gap: spacing.xs }]}>
        <Lock size={14} color={brandColors.lavender} />
        <AppText variant="label" style={styles.topSecret}>
          TOP SECRET
        </AppText>
      </View>

      <View style={styles.flex} />

      <View style={[styles.center, { gap: spacing.sm }]}>
        <PlayerAvatar name={player.name} color={player.color} size={84} />
        <AppText variant="subheading" align="center" style={styles.lavender}>
          It&apos;s your turn,
        </AppText>
        <AppText variant="display" align="center" numberOfLines={1} adjustsFontSizeToFit style={styles.name}>
          {player.name.toLocaleUpperCase()}!
        </AppText>
        <AppText align="center" style={styles.soft}>
          Make sure nobody else is looking.
        </AppText>
      </View>

      <View style={styles.flex} />

      <CardActionButton title="REVEAL MY ROLE" icon={Eye} color="#5233C7" onPress={onReveal} disabled={disabled} />
      <AppText variant="caption" align="center" style={styles.soft}>
        Only {player.name} should see the next screen.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  face: {
    ...StyleSheet.absoluteFill,
    backfaceVisibility: 'hidden',
  },
  front: {
    flex: 1,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(201, 184, 255, 0.35)',
    backgroundImage: 'linear-gradient(165deg, #3A3160 0%, #241E3A 55%, #171322 100%)',
    boxShadow: '0 12px 36px rgba(124, 92, 255, 0.35)',
  },
  watermark: {
    position: 'absolute',
    right: -50,
    bottom: -40,
  },
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
  },
  topSecret: {
    color: brandColors.lavender,
    letterSpacing: 3,
  },
  lavender: {
    color: brandColors.lavender,
  },
  name: {
    color: '#FFFFFF',
    fontWeight: 900,
    letterSpacing: 1.5,
  },
  soft: {
    color: '#CFC8DD',
  },
});
