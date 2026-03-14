/**
 * MBA Laundry Express - Design Tokens: Colors
 * Premium color system with dark mode support
 */

// ============================================
// PRIMARY BRAND COLORS (Ruby/Sapphire/Teal)
// ============================================
export const ruby = {
	50: "#FEF2F2",
	100: "#FEE2E2",
	200: "#FECACA",
	300: "#FCA5A5",
	400: "#F87171",
	500: "#EF4444",
	600: "#DC2626",
	700: "#B91C1C",
	800: "#991B1B",
	900: "#7F1D1D",
	950: "#450A0A",
} as const;

export const sapphire = {
	50: "#EFF6FF",
	100: "#DBEAFE",
	200: "#BFDBFE",
	300: "#93C5FD",
	400: "#60A5FA",
	500: "#3B82F6",
	600: "#2563EB",
	700: "#1D4ED8",
	800: "#1E40AF",
	900: "#1E3A8A",
	950: "#172554",
} as const;

export const teal = {
	50: "#F0FDFA",
	100: "#CCFBF1",
	200: "#99F6E4",
	300: "#5EEAD4",
	400: "#2DD4BF",
	500: "#14B8A6",
	600: "#0D9488",
	700: "#0F766E",
	800: "#115E59",
	900: "#134E4A",
	950: "#042F2E",
} as const;

// ============================================
// NEUTRAL COLORS (Gray Scale)
// ============================================
export const neutral = {
	0: "#FFFFFF",
	50: "#FAFAFA",
	100: "#F5F5F5",
	200: "#E5E5E5",
	300: "#D4D4D4",
	400: "#A3A3A3",
	500: "#737373",
	600: "#525252",
	700: "#404040",
	800: "#262626",
	900: "#171717",
	950: "#0A0A0A",
} as const;

// ============================================
// SEMANTIC COLORS (Status/Feedback)
// ============================================
export const semantic = {
	success: {
		light: "#22C55E",
		DEFAULT: "#16A34A",
		dark: "#15803D",
		bg: "#DCFCE7",
		bgDark: "#14532D",
	},
	warning: {
		light: "#F59E0B",
		DEFAULT: "#D97706",
		dark: "#B45309",
		bg: "#FEF3C7",
		bgDark: "#78350F",
	},
	error: {
		light: "#EF4444",
		DEFAULT: "#DC2626",
		dark: "#B91C1C",
		bg: "#FEE2E2",
		bgDark: "#7F1D1D",
	},
	info: {
		light: "#3B82F6",
		DEFAULT: "#2563EB",
		dark: "#1D4ED8",
		bg: "#DBEAFE",
		bgDark: "#1E3A8A",
	},
} as const;

// ============================================
// DARK MODE COLOR MAPPING
// ============================================
export const darkModeColors = {
	// Background
	"bg-primary": neutral[950],
	"bg-secondary": neutral[900],
	"bg-tertiary": neutral[800],
	"bg-elevated": "#1F1F1F",

	// Text
	"text-primary": neutral[0],
	"text-secondary": neutral[300],
	"text-tertiary": neutral[500],
	"text-disabled": neutral[600],

	// Border
	"border-default": neutral[700],
	"border-hover": neutral[600],
	"border-focus": sapphire[500],

	// Surface
	"surface-card": neutral[800],
	"surface-input": neutral[900],
	"surface-hover": neutral[700],
	"surface-pressed": neutral[600],
} as const;

// ============================================
// GRADIENT PRESETS
// ============================================
export const gradients = {
	// Brand gradients
	"ruby-sapphire": "linear-gradient(135deg, #DC2626 0%, #2563EB 100%)",
	"sapphire-teal": "linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)",
	"ruby-teal": "linear-gradient(135deg, #DC2626 0%, #14B8A6 100%)",

	// Dark mode gradients
	"dark-hero": "linear-gradient(180deg, #0A0A0A 0%, #171717 50%, #262626 100%)",
	"dark-card": "linear-gradient(145deg, #262626 0%, #1A1A1A 100%)",

	// Light mode gradients
	"light-hero": "linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 100%)",
	"light-card": "linear-gradient(145deg, #FFFFFF 0%, #F5F5F5 100%)",

	// Glow effects
	"ruby-glow": "radial-gradient(circle, rgba(220,38,38,0.3) 0%, transparent 70%)",
	"sapphire-glow": "radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)",
	"teal-glow": "radial-gradient(circle, rgba(20,184,166,0.3) 0%, transparent 70%)",
} as const;

// ============================================
// GAMIFICATION COLORS
// ============================================
export const gamification = {
	gold: {
		DEFAULT: "#FBBF24",
		light: "#FCD34D",
		dark: "#D97706",
		gradient: "linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #D97706 100%)",
	},
	silver: {
		DEFAULT: "#9CA3AF",
		light: "#D1D5DB",
		dark: "#6B7280",
		gradient: "linear-gradient(135deg, #E5E7EB 0%, #9CA3AF 50%, #4B5563 100%)",
	},
	bronze: {
		DEFAULT: "#B45309",
		light: "#D97706",
		dark: "#78350F",
		gradient: "linear-gradient(135deg, #F59E0B 0%, #B45309 50%, #78350F 100%)",
	},
	points: {
		DEFAULT: "#F59E0B",
		glow: "0 0 20px rgba(245, 158, 11, 0.5)",
	},
} as const;

// ============================================
// EXPORT ALL COLORS
// ============================================
export const colors = {
	ruby,
	sapphire,
	teal,
	neutral,
	semantic,
	darkMode: darkModeColors,
	gradients,
	gamification,
} as const;

export type Colors = typeof colors;
