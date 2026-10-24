import { useEffect } from "react";
import { useBranding } from "../../hooks/useBranding";

// ---------------------------------------------------------------------------
// Satu pintu untuk memasang favicon.
// Dulu logika ini terduplikasi di DynamicFavicon, AdminFavicon, dan
// updateFavicon(): masing-masing punya efek yang memasang ulang favicon
// dengan `?t=<timestamp>` tiap 3 detik, sehingga tab browser "berkedip"
// (permintaan baru terus, gambar default sempat tampil, dst).
// Sekarang hanya ada satu implementasi + satu penanda agar tidak dobel.
// ---------------------------------------------------------------------------

const BRANDING_CACHE_KEY = "branding_settings";
const ICON_RELS = ["icon", "shortcut icon", "apple-touch-icon"];

/** Pasang favicon + title + meta description.
 *
 *  PENTING: jangan pernah `remove()` lalu bikin ulang elemen <link rel=icon>.
 *  Chrome menganggap itu ikon baru dan langsung request ulang gambar, sehingga
 *  sempat tampil ikon default (inilah penyebab tab "berkedip").
 *  Di sini elemen yang sudah ada hanya di-`setAttribute("href")` bila memang
 *  berbeda: kalau sudah sama, DOM tidak disentuh sama sekali. */
function applyFavicon(href: string, siteTitle?: string, siteDescription?: string, writeText = true) {
	const resolved = href || "";

	if (resolved) {
		const existing = Array.from(
			document.querySelectorAll<HTMLLinkElement>("link[rel~='icon'], link[rel='apple-touch-icon']"),
		);
		const alreadyCorrect = existing.some((el) => el.getAttribute("href") === resolved);

		if (!alreadyCorrect) {
			if (existing.length > 0) {
				// Update di tempat: elemen tidak dibuang, jadi tidak ada flicker.
				existing.forEach((el) => el.setAttribute("href", resolved));
			} else {
				ICON_RELS.forEach((rel) => {
					const link = document.createElement("link");
					link.rel = rel;
					link.href = resolved;
					document.head.appendChild(link);
				});
			}
		}
	}

	if (!writeText) return;

	if (siteTitle) document.title = siteTitle;

	if (siteDescription) {
		let metaDesc = document.querySelector('meta[name="description"]');
		if (!metaDesc) {
			metaDesc = document.createElement("meta");
			metaDesc.setAttribute("name", "description");
			document.head.appendChild(metaDesc);
		}
		metaDesc.setAttribute("content", siteDescription);
	}
}

interface CachedBranding {
	logo_url?: string;
	favicon_url?: string;
	site_title?: string;
	site_description?: string;
}

function readCachedBranding(): CachedBranding | null {
	try {
		const raw = localStorage.getItem(BRANDING_CACHE_KEY);
		return raw ? (JSON.parse(raw) as CachedBranding) : null;
	} catch {
		return null;
	}
}

/** Dipakai halaman Pengaturan → Branding setelah logo diunggah/diubah. */
export function updateFavicon() {
	const branding = readCachedBranding();
	const href = branding?.favicon_url || branding?.logo_url || "";
	applyFavicon(href, branding?.site_title, branding?.site_description);
}

/** Hook inti: dipasang sekali di level layout (publik maupun admin). */
function useApplyBrandingFavicon(suffix?: string, writeText = true) {
	const { data: branding } = useBranding();

	useEffect(() => {
		if (!branding) return;

		// Simpan untuk script di index.html (dipakai saat load berikutnya)
		// dan untuk updateFavicon().
		try {
			localStorage.setItem(BRANDING_CACHE_KEY, JSON.stringify(branding));
		} catch {
			// localStorage penuh / private mode: abaikan, favicon tetap jalan.
		}

		// Tanpa cache-buster: URL file dari server sudah stabil dan
		// header-nya sudah `Cache-Control: max-age=86400`.
		const href = branding.favicon_url || branding.logo_url || "";
		const title = branding.site_title ? `${branding.site_title}${suffix ?? ""}` : undefined;
		applyFavicon(href, title, branding.site_description, writeText);
	}, [branding, suffix, writeText]);
}

export function DynamicFavicon() {
	// Halaman publik: judul & deskripsi per halaman dipegang PublicSeo.
	// Komponen ini hanya mengurus ikon, supaya tidak menimpa SEO.
	useApplyBrandingFavicon(undefined, false);
	return null;
}

export function AdminFavicon() {
	useApplyBrandingFavicon(" - Admin");
	return null;
}
