import type { Config } from "tailwindcss";

export default {
	darkMode: "class",
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["'Plus Jakarta Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
				mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
			},
			fontSize: {
				display: ["clamp(2.5rem, 8vw, 5rem)", { lineHeight: "1.02", letterSpacing: "-0.03em", fontWeight: "800" }],
				h1: ["clamp(2rem, 6vw, 3.5rem)", { lineHeight: "1.08", letterSpacing: "-0.03em", fontWeight: "800" }],
				h2: ["clamp(1.75rem, 4vw, 2.5rem)", { lineHeight: "1.12", letterSpacing: "-0.02em", fontWeight: "700" }],
				h3: ["1.5rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
				h4: ["1.25rem", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "700" }],
				body: ["1rem", { lineHeight: "1.7", fontWeight: "400" }],
				caption: ["0.875rem", { lineHeight: "1.5", fontWeight: "500" }],
			},
			spacing: {
				section: "clamp(3rem, 6vw, 6rem)",
				"section-sm": "clamp(2rem, 4vw, 4rem)",
				"container-x": "clamp(1rem, 3vw, 1.5rem)",
			},
			colors: {
				ruby: {
					50: "#fff5f5",
					100: "#ffe3e3",
					200: "#ffc9c9",
					300: "#ffa8a8",
					400: "#ff8787",
					500: "#ef5350",
					600: "#e53935",
					700: "#c62828",
					800: "#ad1f1f",
					900: "#8d1a1a",
					950: "#5a0f0f",
				},
				sapphire: {
					50: "#eff6ff",
					100: "#dbeafe",
					200: "#bfdbfe",
					300: "#93c5fd",
					400: "#60a5fa",
					500: "#3b82f6",
					600: "#2563eb",
					700: "#1d4ed8",
					800: "#1e40af",
					900: "#1e3a8a",
					950: "#172554",
				},
				teal: {
					50: "#f0fdfa",
					100: "#ccfbf1",
					200: "#99f6e4",
					300: "#5eead4",
					400: "#2dd4bf",
					500: "#14b8a6",
					600: "#0d9488",
					700: "#0f766e",
					800: "#115e59",
					900: "#134e4a",
					950: "#042f2e",
				},
				neutral: {
					50: "#fafafa",
					100: "#f5f5f5",
					200: "#e5e5e5",
					300: "#d4d4d4",
					400: "#a3a3a3",
					500: "#737373",
					600: "#525252",
					700: "#404040",
					800: "#262626",
					900: "#171717",
					950: "#0a0a0f",
				},
			},
			backgroundImage: {
				// Anti-slop: was a ruby→sapphire gradient. Single brand color now.
				"gradient-primary": "var(--brand)",
				"gradient-surface": "var(--bg-app)",
			},
			boxShadow: {
				xs: "0 1px 2px rgba(2, 6, 23, 0.06)",
				sm: "0 3px 10px rgba(2, 6, 23, 0.08)",
				md: "0 8px 22px rgba(2, 6, 23, 0.12)",
				lg: "0 14px 34px rgba(2, 6, 23, 0.16)",
				xl: "0 22px 50px rgba(2, 6, 23, 0.18)",
				"2xl": "0 28px 80px rgba(2, 6, 23, 0.22)",
				// Anti-slop: glow shadows replaced by normal elevation.
				"ruby-glow": "0 3px 10px rgba(2, 6, 23, 0.08)",
				"sapphire-glow": "0 3px 10px rgba(2, 6, 23, 0.08)",
				"teal-glow": "0 3px 10px rgba(2, 6, 23, 0.08)",
			},
			backdropBlur: {
				glass: "16px",
				"glass-lg": "24px",
			},
			borderRadius: {
				glass: "1.25rem",
				"glass-lg": "1.75rem",
			},
			keyframes: {
				// Identity motif: the washing-machine drum. The one motion the
				// product actually owns.
				drumSpin: {
					"0%": { transform: "rotate(0deg)" },
					"100%": { transform: "rotate(360deg)" },
				},
				fadeInUp: {
					"0%": { opacity: "0", transform: "translateY(16px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
				shimmer: {
					"0%": { backgroundPosition: "-200% 0" },
					"100%": { backgroundPosition: "200% 0" },
				},
			},
			animation: {
				"drum-spin": "drumSpin 3s linear infinite",
				"fade-in-up": "fadeInUp 0.6s ease forwards",
				shimmer: "shimmer 2s linear infinite",
			},
		},
	},
	plugins: [],
} satisfies Config;
