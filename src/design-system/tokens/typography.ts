/**
 * MBA Laundry Express - Design Tokens: Typography
 * Premium typography system
 */

// ============================================
// FONT FAMILIES
// ============================================
export const fontFamily = {
	// Display font for headings (elegant, modern)
	display: ['"Plus Jakarta Sans"', '"Inter"', "system-ui", "sans-serif"].join(","),

	// Body font for content (readable, clean)
	body: ['"Inter"', '"Plus Jakarta Sans"', "system-ui", "sans-serif"].join(","),

	// Mono font for numbers, codes
	mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"].join(","),

	// Fallback stack
	fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "sans-serif"].join(","),
} as const;

// ============================================
// FONT SIZES (in rem)
// ============================================
export const fontSize = {
	// Display sizes (hero, large headlines)
	display: {
		xs: "2.25rem", // 36px
		sm: "3rem", // 48px
		md: "3.75rem", // 60px
		lg: "4.5rem", // 72px
		xl: "6rem", // 96px
	},

	// Heading sizes
	heading: {
		h1: "2.5rem", // 40px
		h2: "2rem", // 32px
		h3: "1.75rem", // 28px
		h4: "1.5rem", // 24px
		h5: "1.25rem", // 20px
		h6: "1.125rem", // 18px
	},

	// Body sizes
	body: {
		xl: "1.25rem", // 20px
		lg: "1.125rem", // 18px
		md: "1rem", // 16px (base)
		sm: "0.875rem", // 14px
		xs: "0.75rem", // 12px
	},

	// Special sizes
	label: "0.75rem", // 12px
	caption: "0.6875rem", // 11px
} as const;

// ============================================
// FONT WEIGHTS
// ============================================
export const fontWeight = {
	thin: 100,
	extralight: 200,
	light: 300,
	normal: 400,
	medium: 500,
	semibold: 600,
	bold: 700,
	extrabold: 800,
	black: 900,
} as const;

// ============================================
// LINE HEIGHTS
// ============================================
export const lineHeight = {
	none: 1,
	tight: 1.25,
	snug: 1.375,
	normal: 1.5,
	relaxed: 1.625,
	loose: 2,

	// Specific for headings
	heading: {
		tight: 1.1,
		normal: 1.2,
		relaxed: 1.3,
	},
} as const;

// ============================================
// LETTER SPACING
// ============================================
export const letterSpacing = {
	tighter: "-0.05em",
	tight: "-0.025em",
	normal: "0",
	wide: "0.025em",
	wider: "0.05em",
	widest: "0.1em",

	// Special
	label: "0.05em",
	uppercase: "0.1em",
} as const;

// ============================================
// TYPOGRAPHY PRESETS (Ready-to-use combinations)
// ============================================
export const typography = {
	// Display styles
	"display-xl": {
		fontSize: fontSize.display.xl,
		fontWeight: fontWeight.bold,
		lineHeight: lineHeight.heading.tight,
		letterSpacing: letterSpacing.tighter,
		fontFamily: fontFamily.display,
	},
	"display-lg": {
		fontSize: fontSize.display.lg,
		fontWeight: fontWeight.bold,
		lineHeight: lineHeight.heading.tight,
		letterSpacing: letterSpacing.tight,
		fontFamily: fontFamily.display,
	},
	"display-md": {
		fontSize: fontSize.display.md,
		fontWeight: fontWeight.semibold,
		lineHeight: lineHeight.heading.normal,
		letterSpacing: letterSpacing.tight,
		fontFamily: fontFamily.display,
	},

	// Heading styles
	h1: {
		fontSize: fontSize.heading.h1,
		fontWeight: fontWeight.bold,
		lineHeight: lineHeight.heading.normal,
		letterSpacing: letterSpacing.tight,
		fontFamily: fontFamily.display,
	},
	h2: {
		fontSize: fontSize.heading.h2,
		fontWeight: fontWeight.semibold,
		lineHeight: lineHeight.heading.normal,
		letterSpacing: letterSpacing.tight,
		fontFamily: fontFamily.display,
	},
	h3: {
		fontSize: fontSize.heading.h3,
		fontWeight: fontWeight.semibold,
		lineHeight: lineHeight.heading.relaxed,
		letterSpacing: letterSpacing.normal,
		fontFamily: fontFamily.display,
	},
	h4: {
		fontSize: fontSize.heading.h4,
		fontWeight: fontWeight.medium,
		lineHeight: lineHeight.heading.relaxed,
		letterSpacing: letterSpacing.normal,
		fontFamily: fontFamily.display,
	},
	h5: {
		fontSize: fontSize.heading.h5,
		fontWeight: fontWeight.medium,
		lineHeight: lineHeight.normal,
		letterSpacing: letterSpacing.wide,
		fontFamily: fontFamily.body,
	},
	h6: {
		fontSize: fontSize.heading.h6,
		fontWeight: fontWeight.semibold,
		lineHeight: lineHeight.normal,
		letterSpacing: letterSpacing.wide,
		fontFamily: fontFamily.body,
	},

	// Body styles
	"body-xl": {
		fontSize: fontSize.body.xl,
		fontWeight: fontWeight.normal,
		lineHeight: lineHeight.relaxed,
		letterSpacing: letterSpacing.normal,
		fontFamily: fontFamily.body,
	},
	"body-lg": {
		fontSize: fontSize.body.lg,
		fontWeight: fontWeight.normal,
		lineHeight: lineHeight.relaxed,
		letterSpacing: letterSpacing.normal,
		fontFamily: fontFamily.body,
	},
	"body-md": {
		fontSize: fontSize.body.md,
		fontWeight: fontWeight.normal,
		lineHeight: lineHeight.normal,
		letterSpacing: letterSpacing.normal,
		fontFamily: fontFamily.body,
	},
	"body-sm": {
		fontSize: fontSize.body.sm,
		fontWeight: fontWeight.normal,
		lineHeight: lineHeight.normal,
		letterSpacing: letterSpacing.wide,
		fontFamily: fontFamily.body,
	},

	// Special styles
	label: {
		fontSize: fontSize.label,
		fontWeight: fontWeight.semibold,
		lineHeight: lineHeight.none,
		letterSpacing: letterSpacing.label,
		textTransform: "uppercase",
		fontFamily: fontFamily.body,
	},
	caption: {
		fontSize: fontSize.caption,
		fontWeight: fontWeight.medium,
		lineHeight: lineHeight.normal,
		letterSpacing: letterSpacing.wide,
		fontFamily: fontFamily.body,
	},
	button: {
		fontSize: fontSize.body.sm,
		fontWeight: fontWeight.semibold,
		lineHeight: lineHeight.none,
		letterSpacing: letterSpacing.wide,
		fontFamily: fontFamily.body,
	},
	price: {
		fontSize: fontSize.heading.h3,
		fontWeight: fontWeight.bold,
		lineHeight: lineHeight.tight,
		letterSpacing: letterSpacing.tight,
		fontFamily: fontFamily.mono,
	},
} as const;

export type Typography = typeof typography;
