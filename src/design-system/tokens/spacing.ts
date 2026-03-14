/**
 * MBA Laundry Express - Design Tokens: Spacing
 * 4px base grid system
 */

// ============================================
// BASE SPACING SCALE (4px grid)
// ============================================
export const space = {
	0: "0",
	0.5: "0.125rem", // 2px
	1: "0.25rem", // 4px (base)
	1.5: "0.375rem", // 6px
	2: "0.5rem", // 8px
	2.5: "0.625rem", // 10px
	3: "0.75rem", // 12px
	3.5: "0.875rem", // 14px
	4: "1rem", // 16px
	5: "1.25rem", // 20px
	6: "1.5rem", // 24px
	7: "1.75rem", // 28px
	8: "2rem", // 32px
	9: "2.25rem", // 36px
	10: "2.5rem", // 40px
	11: "2.75rem", // 44px
	12: "3rem", // 48px
	14: "3.5rem", // 56px
	16: "4rem", // 64px
	20: "5rem", // 80px
	24: "6rem", // 96px
	28: "7rem", // 112px
	32: "8rem", // 128px
	36: "9rem", // 144px
	40: "10rem", // 160px
	44: "11rem", // 176px
	48: "12rem", // 192px
	52: "13rem", // 208px
	56: "14rem", // 224px
	60: "15rem", // 240px
	64: "16rem", // 256px
	72: "18rem", // 288px
	80: "20rem", // 320px
	96: "24rem", // 384px
} as const;

// ============================================
// SECTION SPACING (Vertical rhythm)
// ============================================
export const section = {
	sm: "3rem", // 48px
	md: "5rem", // 80px
	lg: "8rem", // 128px
	xl: "12rem", // 192px
} as const;

// ============================================
// CONTAINER WIDTHS
// ============================================
export const container = {
	sm: "640px",
	md: "768px",
	lg: "1024px",
	xl: "1280px",
	"2xl": "1536px",

	// Content max widths
	content: {
		narrow: "640px",
		default: "768px",
		wide: "1024px",
		full: "1280px",
	},
} as const;

// ============================================
// BORDER RADIUS
// ============================================
export const radius = {
	none: "0",
	xs: "0.125rem", // 2px
	sm: "0.25rem", // 4px
	md: "0.375rem", // 6px
	DEFAULT: "0.5rem", // 8px
	lg: "0.75rem", // 12px
	xl: "1rem", // 16px
	"2xl": "1.25rem", // 20px
	"3xl": "1.5rem", // 24px
	"4xl": "2rem", // 32px
	full: "9999px",

	// Special
	card: "1.5rem", // 24px
	button: "0.75rem", // 12px
	input: "0.75rem", // 12px
	modal: "1.5rem", // 24px
} as const;

// ============================================
// SHADOWS (Elevation)
// ============================================
export const shadow = {
	none: "none",
	xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
	sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
	DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
	md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
	lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
	xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
	"2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
	inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",

	// Dark mode shadows
	dark: {
		sm: "0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)",
		md: "0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)",
		lg: "0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)",
		xl: "0 20px 25px -5px rgb(0 0 0 / 0.6), 0 8px 10px -6px rgb(0 0 0 / 0.6)",
		glow: {
			ruby: "0 0 20px rgba(220, 38, 38, 0.3)",
			sapphire: "0 0 20px rgba(37, 99, 235, 0.3)",
			teal: "0 0 20px rgba(20, 184, 166, 0.3)",
		},
	},

	// Special
	card: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
	cardHover: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
	button: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
	buttonHover: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
	modal: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
	dropdown: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
} as const;

// ============================================
// Z-INDEX SCALE
// ============================================
export const zIndex = {
	hide: -1,
	auto: "auto",
	base: 0,
	docked: 10,
	dropdown: 1000,
	sticky: 1100,
	banner: 1200,
	overlay: 1300,
	modal: 1400,
	popover: 1500,
	skipLink: 1600,
	toast: 1700,
	tooltip: 1800,
} as const;

// ============================================
// TRANSITIONS
// ============================================
export const transition = {
	// Duration
	duration: {
		fast: "100ms",
		normal: "200ms",
		slow: "300ms",
		slower: "500ms",
		slowest: "1000ms",
	},

	// Easing
	easing: {
		linear: "linear",
		ease: "ease",
		easeIn: "cubic-bezier(0.4, 0, 1, 1)",
		easeOut: "cubic-bezier(0, 0, 0.2, 1)",
		easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
		spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
		bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
	},

	// Presets
	default: "200ms ease",
	fast: "100ms ease",
	slow: "300ms ease",
	spring: "300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

// ============================================
// BREAKPOINTS
// ============================================
export const breakpoint = {
	sm: "640px",
	md: "768px",
	lg: "1024px",
	xl: "1280px",
	"2xl": "1536px",
} as const;

// ============================================
// EXPORT ALL
// ============================================
export const tokens = {
	space,
	section,
	container,
	radius,
	shadow,
	zIndex,
	transition,
	breakpoint,
} as const;

export type Tokens = typeof tokens;
