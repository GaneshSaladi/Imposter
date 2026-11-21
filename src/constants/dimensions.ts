/** Layout constraints shared across screens. Read live sizes with `useWindowDimensions()`. */
export const Layout = {
  /** Content is centered and capped at this width on tablets / web. */
  maxContentWidth: 560,
  /** Horizontal padding applied by ScreenContainer. */
  screenGutter: 20,
  /** Minimum recommended touch target (Material / HIG). */
  minTouchTarget: 48,
  /** Width cap for modal dialogs. */
  modalMaxWidth: 420,
} as const;

/** Window-width breakpoints for adapting portrait layouts. */
export const Breakpoints = {
  compact: 360,
  regular: 414,
  tablet: 600,
} as const;

export const HitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const;
