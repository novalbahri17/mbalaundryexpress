import { baseUrl } from "@/api/client";

/**
 * Terjemahan otomatis untuk teks yang tersimpan di database.
 *
 * Server menyimpan hasil terjemahan secara permanen di tabel `translations`,
 * jadi teks yang sama tidak pernah diterjemahkan dua kali. Di sisi browser
 * hasilnya juga disimpan di localStorage (`mba-i18n-cache`), supaya:
 * - Teks yang sudah pernah diterjemahkan langsung tampil tanpa menunggu request.
 * - Kalau satu request gagal (jaringan / layanan penerjemah sibuk), teks yang
 *   sudah punya terjemahan tetap tampil dalam bahasa Inggris.
 */
export type TranslateResult = {
	/** Map dari teks asli ke teks terjemahan. */
	translations: Record<string, string>;
	/** True kalau ada teks yang belum berhasil diterjemahkan. */
	failed: boolean;
	pending: number;
};

const CHUNK_SIZE = 40;
const CACHE_KEY = "mba-i18n-cache";
const CACHE_LIMIT = 6000;

type CacheShape = Record<string, string>;

const readCache = (): CacheShape => {
	try {
		const raw = localStorage.getItem(CACHE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw) as CacheShape;
		return parsed && typeof parsed === "object" ? parsed : {};
	} catch {
		return {};
	}
};

let cache: CacheShape = readCache();
let saveTimer: ReturnType<typeof setTimeout> | null = null;

const persistCache = (): void => {
	if (saveTimer) return;
	saveTimer = setTimeout(() => {
		saveTimer = null;
		try {
			const keys = Object.keys(cache);
			if (keys.length > CACHE_LIMIT) {
				// Buang entri terlama (urutan key mengikuti waktu insert).
				const trimmed: CacheShape = {};
				for (const key of keys.slice(keys.length - CACHE_LIMIT)) trimmed[key] = cache[key];
				cache = trimmed;
			}
			localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
		} catch {
			// localStorage penuh/diblokir: cache hanya hidup di memori.
		}
	}, 400);
};

/** Terjemahan yang sudah diketahui dari cache browser, untuk banyak teks sekaligus. */
export const getCachedTranslations = (texts: string[]): Record<string, string> => {
	const out: Record<string, string> = {};
	for (const text of texts) {
		const hit = cache[text];
		if (hit) out[text] = hit;
	}
	return out;
};

/** Buang cache browser (dipakai kalau admin mengubah teks dan ingin terjemahan ulang). */
export const clearTranslationCache = (): void => {
	cache = {};
	try {
		localStorage.removeItem(CACHE_KEY);
	} catch {
		// abaikan
	}
};

const remember = (translations: Record<string, string>): void => {
	let changed = false;
	for (const [source, translated] of Object.entries(translations)) {
		if (!translated || cache[source] === translated) continue;
		cache[source] = translated;
		changed = true;
	}
	if (changed) persistCache();
};

const requestChunk = async (texts: string[], target: string): Promise<TranslateResult> => {
	const search = new URLSearchParams();
	search.set("target", target);
	for (const text of texts) search.append("q", text);
	const response = await fetch(`${baseUrl}/translate?${search.toString()}`, {
		headers: { Accept: "application/json" },
	});
	if (!response.ok) return { translations: {}, failed: true, pending: texts.length };
	const payload = (await response.json()) as Partial<TranslateResult>;
	return {
		translations: payload.translations ?? {},
		failed: Boolean(payload.failed),
		pending: Number(payload.pending ?? 0),
	};
};

/**
 * Terjemahkan sekumpulan teks sekaligus. Teks yang sudah ada di cache browser
 * tidak dikirim lagi; sisanya dipecah per 40 teks supaya URL tidak terlalu
 * panjang. Kalau satu gelombang gagal, gelombang lainnya tetap diproses.
 */
export const translateTexts = async (texts: string[], target: "en" | "id" = "en"): Promise<TranslateResult> => {
	const unique = [...new Set(texts.filter((text) => typeof text === "string" && text.trim()))];
	if (unique.length === 0) return { translations: {}, failed: false, pending: 0 };

	const merged: Record<string, string> = getCachedTranslations(unique);
	const missing = unique.filter((text) => !merged[text]);
	let failed = false;
	let pending = 0;

	for (let index = 0; index < missing.length; index += CHUNK_SIZE) {
		const chunk = missing.slice(index, index + CHUNK_SIZE);
		try {
			const result = await requestChunk(chunk, target);
			Object.assign(merged, result.translations);
			failed = failed || result.failed;
			pending += result.pending;
		} catch {
			failed = true;
			pending += chunk.length;
		}
	}

	remember(merged);
	return { translations: merged, failed, pending };
};
