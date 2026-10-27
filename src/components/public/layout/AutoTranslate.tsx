import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { getCachedTranslations, translateTexts } from "@/api/translate.api";
import { PAGE_CONTENT_QUERY_KEY } from "@/hooks/usePageContent";
import { useLocaleStore } from "@/store/localeStore";

/**
 * Jaring pengaman terjemahan: menerjemahkan SEMUA teks yang benar-benar tampil
 * di layar, apa pun asalnya (kamus bawaan, `page_contents`, `site_settings`,
 * atau teks yang di-hardcode di komponen).
 *
 * Alur:
 * 1. Kumpulkan simpul teks yang terlihat (lewati script/style/code/input).
 * 2. Terapkan dulu terjemahan yang sudah ada di cache browser → langsung tampil.
 * 3. Kirim sisanya ke `/api/translate` (di-cache permanen di MySQL + localStorage).
 * 4. Ganti teksnya di DOM, simpan teks asli supaya bisa dipulihkan saat
 *    pengunjung kembali ke Bahasa Indonesia.
 * 5. Refetch konten DB sekali supaya kolom `<nama>__en` dari server dipakai
 *    React juga, bukan cuma DOM.
 *
 * Komponen ini hanya dipasang di PublicLayout, tidak pernah di /admin.
 *
 * Catatan penting: React tidak akan menimpa simpul teks yang sudah ada, jadi
 * perubahan DOM ini aman. Sebaliknya, saat React menukar isi simpul (misal
 * data dari API selesai dimuat), `MutationObserver` dengan `characterData`
 * akan mendeteksinya dan menjadwalkan ulang penerjemahan.
 */
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA", "INPUT", "OPTION", "SVG"]);

/** Penanda teks asli, disimpan di objek simpul teks itu sendiri. */
type TaggedText = Text & { __original?: string };

const collectTextNodes = (): TaggedText[] => {
	const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	const nodes: TaggedText[] = [];
	let current = walker.nextNode();
	while (current) {
		const text = current as TaggedText;
		const parent = text.parentElement;
		const value = text.nodeValue ?? "";
		const ok =
			parent &&
			!SKIP_TAGS.has(parent.tagName) &&
			!parent.closest("[data-no-translate]") &&
			/[A-Za-z]/.test(value) &&
			value.trim().length > 1;
		if (ok) nodes.push(text);
		current = walker.nextNode();
	}
	return nodes;
};

export function AutoTranslate() {
	const locale = useLocaleStore((state) => state.locale);
	const queryClient = useQueryClient();
	const warmed = useRef(false);
	// Jumlah kegagalan per teks. Setelah beberapa kali gagal, teks itu berhenti
	// dicoba supaya tidak menembak server terus, tapi masih bisa dicoba lagi
	// pada kunjungan berikutnya (state hidup selama komponen terpasang).
	const failures = useRef(new Map<string, number>());
	const MAX_FAILURES = 3;

	useEffect(() => {
		// Kembali ke Bahasa Indonesia: pulihkan teks asli, selesai.
		if (locale !== "en") {
			for (const node of collectTextNodes()) {
				if (node.__original !== undefined) {
					node.nodeValue = node.__original;
					node.__original = undefined;
				}
			}
			failures.current.clear();
			warmed.current = false;
			return;
		}

		let cancelled = false;
		let raf = 0;
		let running = false;
		let rerun = false;

		/**
		 * Terapkan terjemahan ke DOM.
		 *
		 * Kasus yang harus ditangani: React bisa mengganti isi simpul teks kapan
		 * saja (data API selesai dimuat, prop berubah, dsb). Kalau itu terjadi,
		 * `__original` lama sudah tidak relevan dan HARUS diganti dengan teks baru
		 * — kalau tidak, teks baru tidak pernah ikut diterjemahkan. Inilah penyebab
		 * "kadang berubah, kadang tidak".
		 */
		const apply = (translations: Record<string, string>) => {
			if (cancelled) return;
			for (const node of collectTextNodes()) {
				const current = node.nodeValue ?? "";
				if (!current.trim()) continue;

				let source = node.__original;
				if (source !== undefined) {
					const known = translations[source];
					// Simpul masih berisi teks asli atau terjemahannya: aman.
					if (current === source || current === known) continue;
					// Selain itu: React menulis teks baru → jadikan sumber baru.
					source = undefined;
				}

				const value = source ?? current;
				const translated = translations[value];
				if (!translated || translated === value) {
					if (node.__original !== undefined && node.nodeValue !== node.__original) node.nodeValue = value;
					continue;
				}
				node.__original = value;
				if (node.nodeValue !== translated) node.nodeValue = translated;
			}
		};

		const run = async () => {
			if (cancelled || running) {
				rerun = true;
				return;
			}
			running = true;
			try {
				const nodes = collectTextNodes();
				if (nodes.length === 0) return;

				const sources = new Set<string>();
				for (const node of nodes) {
					const current = node.nodeValue ?? "";
					// `__original` hanya valid kalau simpul memang masih menampilkan
					// teks itu (asli atau terjemahannya). Kalau React sudah mengganti
					// isinya, pakai teks yang sekarang.
					const source =
						node.__original !== undefined &&
						(current === node.__original || current === getCachedTranslations([node.__original])[node.__original])
							? node.__original
							: current;
					if (source.trim().length > 1 && /[A-Za-z]/.test(source)) sources.add(source);
				}
				if (sources.size === 0) return;

				// 1) Terapkan yang sudah ada di cache browser → tanpa menunggu jaringan.
				const cached = getCachedTranslations([...sources]);
				if (Object.keys(cached).length > 0) apply(cached);

				// 2) Minta sisanya ke server.
				const missing = [...sources].filter(
					(text) => !cached[text] && (failures.current.get(text) ?? 0) < MAX_FAILURES,
				);
				if (missing.length === 0) return;

				const result = await translateTexts(missing, "en");
				if (cancelled) return;

				for (const text of missing) {
					if (!result.translations[text]) {
						failures.current.set(text, (failures.current.get(text) ?? 0) + 1);
					} else {
						failures.current.delete(text);
					}
				}
				apply(result.translations);

				// Sekali saja: minta React refetch konten DB supaya terjemahan
				// versi server (`<kolom>__en`) juga dipakai, bukan cuma DOM.
				if (!warmed.current && Object.keys(result.translations).length > 0) {
					warmed.current = true;
					void queryClient.invalidateQueries({ queryKey: [PAGE_CONTENT_QUERY_KEY] });
					void queryClient.invalidateQueries({ queryKey: ["site-settings"] });
					void queryClient.invalidateQueries({ queryKey: ["branding"] });
				}
			} finally {
				running = false;
				if (rerun) {
					rerun = false;
					schedule();
				}
			}
		};

		// Debounce: konten dari API masuk bertahap, jadi tunggu render stabil.
		const schedule = () => {
			if (cancelled) return;
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => {
				run().catch(() => {
					/* terjemahan bersifat opsional; kegagalan tidak boleh merusak halaman */
				});
			});
		};

		schedule();
		const observer = new MutationObserver((records) => {
			// Abaikan perubahan teks yang berasal dari kita sendiri: kalau semua
			// record hanya menyentuh simpul yang sudah punya `__original`,
			// tidak perlu menjadwalkan ulang.
			const external = records.some((record) => {
				if (record.type === "characterData") {
					return (record.target as TaggedText).__original === undefined;
				}
				return true;
			});
			if (external) schedule();
		});
		observer.observe(document.body, { childList: true, subtree: true, characterData: true });

		return () => {
			cancelled = true;
			cancelAnimationFrame(raf);
			observer.disconnect();
		};
	}, [locale, queryClient]);

	return null;
}
