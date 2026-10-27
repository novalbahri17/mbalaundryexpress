import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { translateTexts } from "@/api/translate.api";
import { PAGE_CONTENT_QUERY_KEY } from "@/hooks/usePageContent";
import { useLocaleStore } from "@/store/localeStore";

/**
 * Jaring pengaman terjemahan: menerjemahkan SEMUA teks yang benar-benar tampil
 * di layar, apa pun asalnya (kamus bawaan, `page_contents`, `site_settings`,
 * atau teks yang di-hardcode di komponen).
 *
 * Cara kerja
 * ----------
 * 1. Kumpulkan simpul teks yang terlihat (lewati script/style/code/input).
 * 2. Kirim ke `/api/translate` — hasilnya di-cache permanen di MySQL, jadi
 *    teks yang sama hanya diterjemahkan sekali seumur aplikasi.
 * 3. Ganti teksnya di DOM, tapi simpan teks aslinya supaya bisa dipulihkan
 *    saat pengunjung kembali ke Bahasa Indonesia.
 * 4. Setelah cache terisi, `page_contents` di-refetch sekali supaya kolom
 *    `<nama>__en` yang dikirim server ikut dipakai React (bukan cuma DOM).
 *
 * Komponen ini hanya dipasang di PublicLayout, tidak pernah di /admin.
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
	// Cache di memori supaya perpindahan bahasa tidak memicu request ulang.
	const memory = useRef(new Map<string, string>());
	const warmed = useRef(false);

	useEffect(() => {
		// Kembali ke Bahasa Indonesia: pulihkan teks asli, selesai.
		if (locale !== "en") {
			for (const node of collectTextNodes()) {
				if (node.__original !== undefined) {
					node.nodeValue = node.__original;
					node.__original = undefined;
				}
			}
			return;
		}

		let cancelled = false;
		let raf = 0;

		const run = async () => {
			const nodes = collectTextNodes();
			if (nodes.length === 0) return;

			const pending: Array<{ node: TaggedText; source: string }> = [];
			for (const node of nodes) {
				const source = node.nodeValue ?? "";
				if (node.__original === undefined) node.__original = source;
				const original = node.__original;
				if (!original.trim()) continue;
				const hit = memory.current.get(original);
				if (hit) {
					if (node.nodeValue !== hit) node.nodeValue = hit;
					continue;
				}
				pending.push({ node, source: original });
			}

			// Terapkan dulu apa yang sudah ada di memori.
			for (const [source, translated] of memory.current) {
				for (const node of nodes) {
					if (node.__original === source && node.nodeValue !== translated) node.nodeValue = translated;
				}
			}

			const unique = [...new Set(pending.map((item) => item.source))];
			if (unique.length === 0) return;

			const result = await translateTexts(unique, "en");
			if (cancelled) return;
			for (const [source, translated] of Object.entries(result.translations)) {
				memory.current.set(source, translated);
			}

			for (const item of pending) {
				const translated = memory.current.get(item.source);
				if (translated) item.node.nodeValue = translated;
			}

			// Sekali saja: minta React refetch konten DB supaya terjemahan
			// versi server (`<kolom>__en`) juga dipakai, bukan cuma DOM.
			if (!warmed.current && Object.keys(result.translations).length > 0) {
				warmed.current = true;
				await queryClient.invalidateQueries({ queryKey: [PAGE_CONTENT_QUERY_KEY] });
				await queryClient.invalidateQueries({ queryKey: ["site-settings"] });
				await queryClient.invalidateQueries({ queryKey: ["branding"] });
			}
		};

		// Debounce: konten dari API masuk bertahap, jadi tunggu render stabil.
		const schedule = () => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => {
				run().catch(() => {
					/* terjemahan bersifat opsional; kegagalan tidak boleh merusak halaman */
				});
			});
		};

		schedule();
		const observer = new MutationObserver(schedule);
			observer.observe(document.body, { childList: true, subtree: true });

		return () => {
			cancelled = true;
			cancelAnimationFrame(raf);
			observer.disconnect();
		};
	}, [locale, queryClient]);

	return null;
}