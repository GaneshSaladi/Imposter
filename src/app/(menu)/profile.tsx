import { ScreenContainer } from '@/components';
import { ProfilePlaceholder } from '@/features/profile/components/ProfilePlaceholder';

export default function ProfileScreen() {
  return (
    <ScreenContainer ambient edges={['bottom', 'left', 'right']}>
      <ProfilePlaceholder />
    </ScreenContainer>
  );
}
