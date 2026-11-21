import { Redirect } from 'expo-router';

import { Routes } from '@/constants/routes';

/**
 * Entry route. Decides where the app starts; later this can route
 * first-time users to onboarding based on `hasCompletedOnboarding`.
 */
export default function Index() {
  return <Redirect href={Routes.home} />;
}
