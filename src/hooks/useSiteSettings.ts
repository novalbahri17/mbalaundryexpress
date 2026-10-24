import { useQuery } from "@tanstack/react-query";
import { getSiteSettings, getSiteSettingsMap } from "@/api/settings.api";

export const SITE_SETTINGS_QUERY_KEY = "site-settings";

export const useSiteSettings = () =>
	useQuery({
		queryKey: [SITE_SETTINGS_QUERY_KEY],
		queryFn: getSiteSettings,
		staleTime: 60_000,
	});

export const useSiteSettingsMap = () =>
	useQuery({
		queryKey: [SITE_SETTINGS_QUERY_KEY, "map"],
		queryFn: getSiteSettingsMap,
		staleTime: 60_000,
	});
