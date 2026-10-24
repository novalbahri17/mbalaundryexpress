import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useBranding } from "@/hooks/useBranding";
import { usePublicText } from "@/hooks/usePublicText";

// ---------------------------------------------------------------------------
// SEO per halaman.
//
// Kenapa tidak pakai react-helmet-async?
// Helmet menandai tag yang ia kelola dengan `data-rh` dan hanya menyentuh tag
// yang punya penanda itu. Tag SEO statis di index.html (yang sengaja ditulis
// untuk crawler non-JS) tidak punya penanda tersebut, sehingga Helmet:
//   - menambah <title> kedua, atau
//   - tidak memperbarui canonical/description sama sekali.
// Sudah dicoba dua-duanya dan hasilnya tidak konsisten.
//
// Jadi di sini DOM diurus langsung: cari tag yang ada, ubah isinya, dan
// hanya buat elemen baru kalau memang belum ada. Hasilnya selalu tepat satu
// <title>, satu canonical, satu meta description.
// ---------------------------------------------------------------------------

type SeoEntry = {
	title: string;
	description: string;
};

// Cadangan kalau entri locale tidak ditemukan (mis. rute baru belum didaftarkan).
const FALLBACK_ENTRY: SeoEntry = {
	title: "MBA Laundry Express",
	description: "MBA Laundry Express",
};

const SITE_URL = import.meta.env.VITE_SITE_URL || "https://mbalaundryexpress.com";
const DEFAULT_TITLE = "MBA Laundry Express";

/** Ambil satu elemen, buat kalau belum ada. Tidak pernah menduplikasi. */
function upsertMeta(selector: string, attrs: Record<string, string>) {
	let el = document.head.querySelector<HTMLMetaElement>(selector);
	if (!el) {
		el = document.createElement("meta");
		document.head.appendChild(el);
	}
	for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
}

function upsertCanonical(href: string) {
	let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
	if (!el) {
		el = document.createElement("link");
		el.rel = "canonical";
		document.head.appendChild(el);
	}
	el.setAttribute("href", href);
}

function applySeo(opts: {
	title: string;
	description: string;
	canonical: string;
	logoUrl: string;
	siteName: string;
	ogLocale: string;
}) {
	const { title, description, canonical, logoUrl, siteName, ogLocale } = opts;

	if (document.title !== title) document.title = title;

	upsertMeta('meta[name="description"]', { name: "description", content: description });
	upsertCanonical(canonical);

	upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
	upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: ogLocale });
	upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: siteName });
	upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
	upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
	upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
	upsertMeta('meta[property="og:image"]', { property: "og:image", content: logoUrl });

	upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
	upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
	upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
	upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: logoUrl });
}

export function PublicSeo() {
	const location = useLocation();
	const { data: branding } = useBranding();
	const text = usePublicText();
	const seoMap = text.seo as Record<string, SeoEntry>;

	const normalizedPath =
		location.pathname.endsWith("/") && location.pathname !== "/" ? location.pathname.slice(0, -1) : location.pathname;

	const matchedKey = Object.keys(seoMap)
		.sort((a, b) => b.length - a.length)
		.find((key) => normalizedPath === key || normalizedPath.startsWith(`${key}/`));

	// Slug dinamis (mis. /blog/:slug) mewarisi entri induknya.
	const entry = seoMap[matchedKey ?? "/"] ?? FALLBACK_ENTRY;

	const siteTitle = branding?.site_title || DEFAULT_TITLE;
	const description = entry.description || branding?.site_description || FALLBACK_ENTRY.description;

	// Jangan ulangi nama brand dua kali di judul.
	const pageTitle =
		normalizedPath === "/" || entry.title.includes(siteTitle) ? entry.title : `${entry.title} | ${siteTitle}`;

	const canonical = `${SITE_URL}${normalizedPath === "/" ? "/" : normalizedPath}`;

	const ogLocale = text.numberLocale === "en-US" ? "en_US" : "id_ID";

	const logoUrl = branding?.logo_url
		? branding.logo_url.startsWith("http")
			? branding.logo_url
			: `${SITE_URL}${branding.logo_url}`
		: `${SITE_URL}/pwa-512x512.png`;

	useEffect(() => {
		applySeo({ title: pageTitle, description, canonical, logoUrl, siteName: siteTitle, ogLocale });
	}, [pageTitle, description, canonical, logoUrl, siteTitle, ogLocale]);

	return null;
}
