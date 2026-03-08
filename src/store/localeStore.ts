import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LocaleCode = "id" | "en";

type LocaleStore = {
	locale: LocaleCode;
	setLocale: (locale: LocaleCode) => void;
	toggleLocale: () => void;
};

const applyLocaleToDom = (locale: LocaleCode) => {
	if (typeof document === "undefined") return;
	document.documentElement.setAttribute("lang", locale === "id" ? "id-ID" : "en");
};

export const useLocaleStore = create<LocaleStore>()(
	persist(
		(set) => ({
			locale: "id",
			setLocale: (locale) => {
				applyLocaleToDom(locale);
				set({ locale });
			},
			toggleLocale: () =>
				set((state) => {
					const nextLocale: LocaleCode = state.locale === "id" ? "en" : "id";
					applyLocaleToDom(nextLocale);
					return { locale: nextLocale };
				}),
		}),
		{
			name: "mba-locale",
			onRehydrateStorage: () => (state) => {
				if (state?.locale) {
					applyLocaleToDom(state.locale);
				}
			},
		},
	),
);
