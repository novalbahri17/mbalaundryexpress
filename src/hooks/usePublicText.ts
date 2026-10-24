import { useMemo } from "react";
import { useLocaleStore } from "@/store/localeStore";
import { PUBLIC_TEXT, fillTemplate, type PublicDict } from "@/locales/public";
import { setFormatLocale, type FormatLocale } from "@/utils/format";

export type PublicText = PublicDict & {
	/** `"id-ID"` atau `"en-US"`, siap dipakai `toLocaleString`. */
	numberLocale: FormatLocale;
	/** Ganti placeholder `{nama}` pada template teks. */
	fill: (template: string, values: Record<string, string | number>) => string;
};

/**
 * Ambil kamus teks situs publik sesuai bahasa yang dipilih pengguna.
 *
 * Selain mengembalikan kamus, hook ini juga menyetel locale helper format
 * (`formatRupiah`, `formatDate`, ...) supaya angka dan tanggal ikut berubah
 * saat bahasa diganti.
 */
export function usePublicText(): PublicText {
	const locale = useLocaleStore((state) => state.locale);
	const numberLocale: FormatLocale = locale === "en" ? "en-US" : "id-ID";

	// Disetel di badan render (bukan `useEffect`) supaya komponen anak yang
	// dirender setelahnya — mis. `formatDuration` di dalam `useMemo` — sudah
	// membaca locale yang benar pada render yang sama.
	setFormatLocale(numberLocale);

	return useMemo(
		() => ({
			...PUBLIC_TEXT[locale],
			numberLocale,
			fill: fillTemplate,
		}),
		[locale, numberLocale],
	);
}
