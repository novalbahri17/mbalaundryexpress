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
	root.classList.toggle("dark", mode === "dark");
	root.setAttribute("data-theme", mode);
};

export const useThemeStore = create<ThemeStore>()(
	persist(
		(set) => ({
			mode: "light",
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
			name: "mba-theme",
			onRehydrateStorage: () => (state) => {
				if (state?.mode) {
					applyModeToDom(state.mode);
				}
			},
		},
	),
);

