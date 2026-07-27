// Centralized Framer Motion animation variants — keeps all durations & easings consistent

export const easeOut = [0.2, 0.8, 0.2, 1] as const
export const easeIn = [0.4, 0, 0.2, 1] as const

export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export const pageTransition = {
  duration: 0.42,
  ease: easeOut,
}

export const cardVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

export const cardTransition = (i: number = 0) => ({
  duration: 0.42,
  ease: easeOut,
  delay: i * 0.06, // stagger 60ms per card
})

export const hoverCard = {
  scale: 1.03,
  transition: { duration: 0.24, ease: easeOut },
}

export const tapCard = {
  scale: 0.98,
  transition: { duration: 0.12, ease: easeIn },
}

export const modalOverlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const modalVariants = {
  initial: { opacity: 0, scale: 0.94, y: 16 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 8 },
}

export const modalTransition = {
  duration: 0.3,
  ease: easeOut,
}

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.06 },
  },
}

export const fadeUpItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.42, ease: easeOut } },
}
