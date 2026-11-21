import { RoleCardLayout } from './RoleCardLayout';

interface CrewmateCardProps {
  secretWord: string;
  illustrationSize: number;
  onGotIt: () => void;
  gotItEnabled: boolean;
}

export function CrewmateCard({ secretWord, illustrationSize, onGotIt, gotItEnabled }: CrewmateCardProps) {
  return (
    <RoleCardLayout
      role="crewmate"
      eyebrow="YOU ARE A"
      title="CREWMATE"
      panelLabel="Your secret word:"
      panelText={secretWord.toLocaleUpperCase()}
      reminder="Remember your word. Don't let anyone see your screen."
      illustrationSize={illustrationSize}
      onGotIt={onGotIt}
      gotItEnabled={gotItEnabled}
    />
  );
}
