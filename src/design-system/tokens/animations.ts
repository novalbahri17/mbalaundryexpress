/**
 * MBA Laundry Express - Design Tokens: Animations
 * Framer Motion variants & animation presets
 */

import type { Variants, Transition } from "framer-motion";

// ============================================
// TRANSITION PRESETS
// ============================================
export const transitions: Record<string, Transition> = {
	// Basic
	fast: { duration: 0.1, ease: "easeOut" },
	normal: { duration: 0.2, ease: "easeOut" },
	slow: { duration: 0.3, ease: "easeOut" },
	slower: { duration: 0.5, ease: "easeOut" },

	// Spring (bouncy)
	spring: { type: "spring", stiffness: 300, damping: 30 },
	springBouncy: { type: "spring", stiffness: 400, damping: 25 },
	springStiff: { type: "spring", stiffness: 500, damping: 35 },
	springSoft: { type: "spring", stiffness: 200, damping: 20 },

	// Special
	bounce: { type: "spring", stiffness: 400, damping: 10 },
	magnetic: { type: "spring", stiffness: 350, damping: 15 },
};

// ============================================
// FADE ANIMATIONS
// ============================================
export const fade: Record<string, Variants> = {
	in: {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: transitions.normal },
		exit: { opacity: 0, transition: transitions.fast },
	},

	up: {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { ...transitions.normal, staggerChildren: 0.1 },
		},
		exit: { opacity: 0, y: -10, transition: transitions.fast },
	},

	down: {
		hidden: { opacity: 0, y: -20 },
		visible: { opacity: 1, y: 0, transition: transitions.normal },
		exit: { opacity: 0, y: 10, transition: transitions.fast },
	},

	left: {
		hidden: { opacity: 0, x: 20 },
		visible: { opacity: 1, x: 0, transition: transitions.normal },
		exit: { opacity: 0, x: -10, transition: transitions.fast },
	},

	right: {
		hidden: { opacity: 0, x: -20 },
		visible: { opacity: 1, x: 0, transition: transitions.normal },
		exit: { opacity: 0, x: 10, transition: transitions.fast },
	},

	scale: {
		hidden: { opacity: 0, scale: 0.95 },
		visible: { opacity: 1, scale: 1, transition: transitions.spring },
		exit: { opacity: 0, scale: 0.95, transition: transitions.fast },
	},
};

// ============================================
// SLIDE ANIMATIONS
// ============================================
export const slide: Record<string, Variants> = {
	up: {
		hidden: { y: "100%" },
		visible: { y: 0, transition: transitions.spring },
		exit: { y: "100%", transition: transitions.normal },
	},

	down: {
		hidden: { y: "-100%" },
		visible: { y: 0, transition: transitions.spring },
		exit: { y: "-100%", transition: transitions.normal },
	},

	left: {
		hidden: { x: "-100%" },
		visible: { x: 0, transition: transitions.spring },
		exit: { x: "-100%", transition: transitions.normal },
	},

	right: {
		hidden: { x: "100%" },
		visible: { x: 0, transition: transitions.spring },
		exit: { x: "100%", transition: transitions.normal },
	},
};

// ============================================
// PAGE TRANSITIONS
// ============================================
export const pageTransition: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { ...transitions.normal, when: "beforeChildren" },
	},
	exit: {
		opacity: 0,
		y: -20,
		transition: { ...transitions.fast, when: "afterChildren" },
	},
};

export const pageSlide: Record<string, Variants> = {
	slideLeft: {
		initial: { x: "100%", opacity: 0 },
		animate: { x: 0, opacity: 1, transition: transitions.spring },
		exit: { x: "-30%", opacity: 0, transition: transitions.normal },
	},

	slideRight: {
		initial: { x: "-100%", opacity: 0 },
		animate: { x: 0, opacity: 1, transition: transitions.spring },
		exit: { x: "30%", opacity: 0, transition: transitions.normal },
	},

	slideUp: {
		initial: { y: "100%", opacity: 0 },
		animate: { y: 0, opacity: 1, transition: transitions.spring },
		exit: { y: "-30%", opacity: 0, transition: transitions.normal },
	},
};

// ============================================
// STAGGER ANIMATIONS (for lists)
// ============================================
export const staggerContainer: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.1,
		},
	},
};

export const staggerItem: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: transitions.spring,
	},
};

export const staggerScale: Variants = {
	hidden: { opacity: 0, scale: 0.8 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: transitions.spring,
	},
};

// ============================================
// HOVER ANIMATIONS
// ============================================
export const hover = {
	scale: { scale: 1.02, transition: transitions.spring },
	scaleDown: { scale: 0.98, transition: transitions.spring },
	lift: { y: -4, transition: transitions.spring },
	glow: {
		boxShadow: "0 0 20px rgba(220, 38, 38, 0.3)",
		transition: transitions.normal,
	},
};

export const tap = {
	scale: { scale: 0.95 },
};

// ============================================
// CARD ANIMATIONS
// ============================================
export const card: Variants = {
	hidden: { opacity: 0, y: 30, scale: 0.95 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { ...transitions.spring, staggerChildren: 0.05 },
	},
	hover: {
		y: -8,
		boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
		transition: transitions.spring,
	},
};

// ============================================
// MODAL/DIALOG ANIMATIONS
// ============================================
export const modal: Record<string, Variants> = {
	overlay: {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: transitions.normal },
		exit: { opacity: 0, transition: transitions.fast },
	},

	content: {
		hidden: { opacity: 0, scale: 0.95, y: 20 },
		visible: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: transitions.spring,
		},
		exit: {
			opacity: 0,
			scale: 0.95,
			y: 20,
			transition: transitions.fast,
		},
	},

	sheet: {
		hidden: { y: "100%" },
		visible: { y: 0, transition: transitions.spring },
		exit: { y: "100%", transition: transitions.normal },
	},
};

// ============================================
// BUTTON ANIMATIONS
// ============================================
export const button: Variants = {
	initial: { scale: 1 },
	hover: { scale: 1.02, transition: transitions.spring },
	tap: { scale: 0.95 },
	disabled: { opacity: 0.5, scale: 1 },
};

export const buttonRipple = {
	initial: { scale: 0, opacity: 0.5 },
	animate: { scale: 2, opacity: 0, transition: { duration: 0.6 } },
};

// ============================================
// LOADING ANIMATIONS
// ============================================
export const loading = {
	spinner: {
		animate: { rotate: 360 },
		transition: { duration: 1, repeat: Infinity, ease: "linear" },
	},

	pulse: {
		animate: { opacity: [0.5, 1, 0.5] },
		transition: { duration: 1.5, repeat: Infinity },
	},

	bounce: {
		animate: { y: [0, -10, 0] },
		transition: { duration: 0.6, repeat: Infinity },
	},

	skeleton: {
		animate: {
			x: ["-100%", "100%"],
			transition: { duration: 1.5, repeat: Infinity, ease: "linear" },
		},
	},
};

// ============================================
// SCROLL ANIMATIONS
// ============================================
export const scrollReveal: Variants = {
	hidden: { opacity: 0, y: 50 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { ...transitions.slow, ease: "easeOut" },
	},
};

export const scrollFade: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: transitions.slow },
};

// ============================================
// GAMIFICATION ANIMATIONS
// ============================================
export const gamification = {
	spinWheel: {
		spin: {
			rotate: 720,
			transition: { duration: 3, ease: "easeOut" },
		},
		bounce: {
			y: [0, -20, 0],
			transition: { ...transitions.bounce, repeat: 2 },
		},
	},

	coin: {
		collect: {
			scale: [1, 1.5, 0],
			y: [0, -50, -100],
			opacity: [1, 1, 0],
			transition: { duration: 0.8 },
		},
	},

	celebration: {
		confetti: {
			y: [0, -200],
			opacity: [1, 0],
			rotate: [0, 720],
			transition: { duration: 1.5, ease: "easeOut" },
		},
	},

	badgeUnlock: {
		hidden: { scale: 0, rotate: -180 },
		visible: {
			scale: 1,
			rotate: 0,
			transition: { ...transitions.bounce, duration: 0.8 },
		},
	},
};

// ============================================
// NOTIFICATION ANIMATIONS
// ============================================
export const notification: Variants = {
	hidden: { opacity: 0, x: 100, scale: 0.9 },
	visible: {
		opacity: 1,
		x: 0,
		scale: 1,
		transition: transitions.spring,
	},
	exit: {
		opacity: 0,
		x: 100,
		scale: 0.9,
		transition: transitions.fast,
	},
};

// ============================================
// ERROR/SUCCESS STATES
// ============================================
export const error = {
	shake: {
		x: [0, -10, 10, -10, 10, 0],
		transition: { duration: 0.5 },
	},
};

export const success = {
	pop: {
		scale: [0, 1.2, 1],
		transition: { ...transitions.bounce, duration: 0.5 },
	},
	checkmark: {
		pathLength: [0, 1],
		opacity: [0, 1],
		transition: { duration: 0.5, ease: "easeOut" },
	},
};

// ============================================
// EXPORT ALL
// ============================================
export const animations = {
	transitions,
	fade,
	slide,
	pageTransition,
	pageSlide,
	staggerContainer,
	staggerItem,
	staggerScale,
	hover,
	tap,
	card,
	modal,
	button,
	buttonRipple,
	loading,
	scrollReveal,
	scrollFade,
	gamification,
	notification,
	error,
	success,
};

export default animations;
