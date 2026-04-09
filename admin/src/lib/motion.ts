import type { Target, TargetAndTransition, Transition } from "framer-motion";

export const TRANSITIONS = {
  snappy: {
    type: "spring",
    stiffness: 400,
    damping: 30,
  } as Transition,
  fade: {
    duration: 0.15,
    ease: "easeOut",
  } as Transition,
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 20,
  } as Transition
};

export const ANIMATIONS = {
  tap: { scale: 0.98 } as Target,
  hover: { scale: 1.02 } as Target,
  fadeIn: {
    initial: { opacity: 0 } as TargetAndTransition,
    animate: { opacity: 1 } as TargetAndTransition,
    transition: TRANSITIONS.fade,
  },
  fadeInUp: {
    initial: { opacity: 0, y: 10 } as TargetAndTransition,
    animate: { opacity: 1, y: 0 } as TargetAndTransition,
    transition: TRANSITIONS.snappy,
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 } as TargetAndTransition,
    animate: { opacity: 1, scale: 1 } as TargetAndTransition,
    transition: TRANSITIONS.snappy,
  }
};
