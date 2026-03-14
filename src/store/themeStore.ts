import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "light" | "dark";

type ThemeStore = {
	mode: ThemeMode;
	toggle: () => void;
	setMode: (mode: ThemeMode) => void;
};

const applyModeToDom = (mode: ThemeMode) => {
	if (typeof document === "undefined") return;
	const root = document.documentElement;
	if (mode === "dark") {
		root.classList.add("dark");
	} else {
		root.classList.remove("dark");
	}
	root.setAttribute("data-theme", mode);
};

export const useThemeStore = create<ThemeStore>()(
	persist(
		(set) => ({
			mode: "light", // Default always light
			toggle: () =>
				set((state) => {
					const next = state.mode === "light" ? "dark" : "light";
					applyModeToDom(next);
					return { mode: next };
				}),
			setMode: (mode) => {
				applyModeToDom(mode);
				set({ mode });
			},
		}),
		{
			name: "mba-theme-storage", // Storage key in localStorage
			skipHydration: false,
			onRehydrateStorage: () => (state) => {
				// Apply theme when store is rehydrated from localStorage
				if (state?.mode) {
					applyModeToDom(state.mode);
				}
			},
		},
	),
);

// Initialize theme on import (for SSR safety)
if (typeof window !== "undefined") {
	const saved = localStorage.getItem("mba-theme-storage");
	if (saved) {
		try {
			const parsed = JSON.parse(saved);
			if (parsed.state?.mode) {
				applyModeToDom(parsed.state.mode);
			}
		} catch {
			applyModeToDom("light");
		}
	} else {
		applyModeToDom("light");
	}
}
