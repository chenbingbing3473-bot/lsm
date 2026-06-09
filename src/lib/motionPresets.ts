/** Shared modal / sheet motion curves */
export const EASE_OUT_SMOOTH = [0.22, 1, 0.36, 1] as const;

export const overlayTransition = {
  duration: 0.32,
  ease: EASE_OUT_SMOOTH,
};

export const springSheet = {
  type: 'spring' as const,
  damping: 36,
  stiffness: 420,
  mass: 0.75,
};

export const springCenter = {
  type: 'spring' as const,
  damping: 30,
  stiffness: 360,
  mass: 0.82,
};

export const springPanel = {
  type: 'spring' as const,
  damping: 32,
  stiffness: 340,
  mass: 0.85,
};

export const springSidebar = {
  type: 'spring' as const,
  damping: 34,
  stiffness: 380,
  mass: 0.8,
};

/** Dismiss bottom sheet when dragged down enough */
export function shouldDismissSheet(offsetY: number, velocityY: number) {
  return offsetY > 72 || velocityY > 380;
}
