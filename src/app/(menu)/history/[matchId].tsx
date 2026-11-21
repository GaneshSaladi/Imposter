import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import { AppButton, AppText, ScreenContainer } from '@/components';
import { Routes } from '@/constants/routes';
import { GameHistoryDetail } from '@/features/history/components/GameHistoryDetail';
import { selectHistoryRecord, useHistoryStore } from '@/store';

export default function GameHistoryDetailScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const record = useHistoryStore(selectHistoryRecord(matchId));

  if (!record) {
    return (
      <ScreenContainer centered ambient edges={['bottom', 'left', 'right']}>
        <AppText variant="heading" align="center">
          Match not found
        </AppText>
        <AppText color="textMuted" align="center">
          It may have been deleted.
        </AppText>
        <AppButton
          title="Back to History"
          icon={ArrowLeft}
          onPress={() => (router.canGoBack() ? router.back() : router.replace(Routes.history))}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer ambient edges={['bottom', 'left', 'right']}>
      <GameHistoryDetail record={record} />
    </ScreenContainer>
  );
}
