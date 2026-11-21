import type { Routes } from '@/constants/routes';
import type { ValueOf } from '@/types/common';

export type { Href } from 'expo-router';

/** Any static route declared in `@/constants/routes`. */
export type AppRoute = ValueOf<typeof Routes>;
