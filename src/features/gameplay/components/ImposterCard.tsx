import { RoleCardLayout } from './RoleCardLayout';

/** Intentionally has no word prop: the secret word can never reach this card. */
interface ImposterCardProps {
  illustrationSize: number;
  onGotIt: () => void;
  gotItEnabled: boolean;
}

export function ImposterCard({ illustrationSize, onGotIt, gotItEnabled }: ImposterCardProps) {
  return (
    <RoleCardLayout
      role="imposter"
      eyebrow="YOU ARE THE"
      title="IMPOSTER"
      panelLabel="Your mission:"
      panelText="BLEND IN AND DON'T GET CAUGHT!"
      reminder="You don't know the word. Listen closely and bluff!"
      illustrationSize={illustrationSize}
      onGotIt={onGotIt}
      gotItEnabled={gotItEnabled}
    />
  );
}
