// ============================================================
// KOI Recall Platform — Authorized Motion Presets
//
// Motion is used ONLY for:
//   - Status changes
//   - Workflow transitions
//   - User feedback
//
// Forbidden:
//   - Floating decoration / neon effects
//   - Continuous animation (except loading states)
//   - Duration > 300ms (or 500ms for page transitions)
// ============================================================

import type { Variants } from 'framer-motion';

// === Easing Curves ===
export const EASING = {
  bladeIn: [0.16, 1, 0.3, 1],      // ease-out-expo-like
  bladeOut: [0.4, 0, 1, 1],        // ease-in
  bladeBoth: [0.65, 0, 0.35, 1],   // ease-in-out
} as const;

// === Transition Presets ===
export const TRANSITION = {
  fast: { duration: 0.15, ease: EASING.bladeIn },
  normal: { duration: 0.25, ease: EASING.bladeIn },
  slow: { duration: 0.35, ease: EASING.bladeIn },
  page: { duration: 0.5, ease: EASING.bladeBoth },
} as const;

// === Variants ===

/** Use for elements entering the viewport or appearing after a state change. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: TRANSITION.normal },
  exit: { opacity: 0, transition: { duration: 0.15, ease: EASING.bladeOut } },
};

/** Use for cards or panels sliding in from the right (wizard steps, drawers). */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: TRANSITION.normal },
  exit: { opacity: 0, x: -24, transition: { duration: 0.15, ease: EASING.bladeOut } },
};

/** Use for panels sliding in from the left (back-navigation in wizards). */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: TRANSITION.normal },
  exit: { opacity: 0, x: 24, transition: { duration: 0.15, ease: EASING.bladeOut } },
};

/** Use for elements appearing from below (modals, toasts, dropdowns). */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: TRANSITION.fast },
  exit: { opacity: 0, y: 8, transition: { duration: 0.1, ease: EASING.bladeOut } },
};

/** Use for success states, confirmation icons, badge updates. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: EASING.bladeIn },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.15, ease: EASING.bladeOut },
  },
};

/** Use for lists where children appear sequentially (recall grids, audit entries). */
export const staggerChildren: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

/** Child item for stagger container — combined with fadeIn. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: EASING.bladeIn },
  },
};

/** Use for step transitions in wizards (forward). */
export const stepForward: Variants = {
  ...slideInRight,
};

/** Use for step transitions in wizards (backward). */
export const stepBackward: Variants = {
  ...slideInLeft,
};
