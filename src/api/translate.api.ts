import { baseUrl } from "@/api/client";

/**
 * Terjemahan otomatis untuk teks yang tersimpan di database.
 *
 * Server menyimpan hasil terjemahan secara permanen di tabel `translations`,
 * jadi teks yang sama tidak pernah diterjemahkan dua kali. Kalau layanan
 * penerjemah sedang tidak bisa dihubungi, server tetap membalas 200 dan teks
 * yang gagal akan muncul dengan nilai aslinya.
 */
export type TranslateResult = {
	/** Map dari teks asli ke teks terjemahan. */
	translations: Record<string, string>;
	/** True kalau ada teks yang belum berhasil diterjemahkan. */
	failed: boolean;
	pending: number;
};

const CHUNK_SIZE = 40;

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
 * Terjemahkan sekumpulan teks sekaligus. Dipecah per 40 teks supaya URL tidak
 * melebihi batas panjang yang wajar.
 */
export const translateTexts = async (texts: string[], target: "en" | "id" = "en"): Promise<TranslateResult> => {
	const unique = [...new Set(texts.filter((text) => typeof text === "string" && text.trim()))];
	if (unique.length === 0) return { translations: {}, failed: false, pending: 0 };

	const merged: Record<string, string> = {};
	let failed = false;
	let pending = 0;

	for (let index = 0; index < unique.length; index += CHUNK_SIZE) {
		const chunk = unique.slice(index, index + CHUNK_SIZE);
		const result = await requestChunk(chunk, target);
		Object.assign(merged, result.translations);
		failed = failed || result.failed;
		pending += result.pending;
	}

	return { translations: merged, failed, pending };
};
