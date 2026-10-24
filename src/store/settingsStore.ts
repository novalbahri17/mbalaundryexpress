import { create } from "zustand";
import { getSiteSettingsMap } from "@/api/settings.api";

type SettingsStore = {
	settings: Record<string, string>;
	loading: boolean;
	error: string | null;
	fetchSettings: () => Promise<void>;
	setSetting: (key: string, value: string) => void;
};

export const useSettingsStore = create<SettingsStore>((set) => ({
	settings: {},
	loading: false,
	error: null,
	fetchSettings: async () => {
		set({ loading: true, error: null });
		try {
			const settings = await getSiteSettingsMap();
			set({ settings, loading: false });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Gagal memuat pengaturan situs";
			set({ error: message, loading: false });
		}
	},
	setSetting: (key, value) =>
		set((state) => ({
			settings: {
				...state.settings,
				[key]: value,
			},
		})),
}));
