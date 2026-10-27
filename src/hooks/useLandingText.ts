import { useMemo } from "react";
import { usePageContentMap } from "@/hooks/usePageContent";
import { usePublicText } from "@/hooks/usePublicText";
import { buildLandingSections, buildLandingValues, type LandingSection } from "@/lib/landingText";
import { useLocaleStore } from "@/store/localeStore";

/**
 * Ambil seluruh teks landing page yang bisa diedit admin.
 *
 * Nilai diambil dari `page_contents` (key `landing_*`). Kalau admin belum
 * mengisi (atau query masih loading), otomatis jatuh ke kamus bawaan
 * `src/locales/public.ts` — jadi tidak pernah muncul teks kosong.
 *
 * Untuk locale `en`, dipakai dulu versi `landing_*_en` yang diisi otomatis
 * oleh pipeline terjemahan; kalau belum ada, pakai kamus Inggris bawaan.
 */
export function useLandingText(): {
	sections: LandingSection[];
	values: Record<string, string>;
	isLoading: boolean;
} {
	const text = usePublicText();
	const locale = useLocaleStore((state) => state.locale);
	const { data: content = {}, isLoading } = usePageContentMap();

	const sections = useMemo(() => buildLandingSections(text), [text]);
	const values = useMemo(
		() => buildLandingValues(sections, content, locale === "en" ? "en" : "id"),
		[sections, content, locale],
	);

	return { sections, values, isLoading };
}
