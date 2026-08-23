import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useBranding } from "@/hooks/useBranding";

type SeoEntry = {
	title: string;
	description: string;
};

const seoMap: Record<string, SeoEntry> = {
	"/": {
		title: "MBA Laundry Express - Self Service Laundry Modern",
		description:
			"Laundry self-service modern dengan harga transparan, proses cepat, dan cabang strategis untuk mahasiswa, keluarga, dan pekerja.",
	},
	"/cabang": {
		title: "Cabang MBA Laundry Express",
		description: "Temukan cabang MBA Laundry Express terdekat lengkap dengan jam operasional, fasilitas, dan harga per layanan.",
	},
	"/promo": {
		title: "Promo MBA Laundry Express",
		description: "Dapatkan promo laundry terbaru dengan diskon menarik, countdown real-time, dan kode promo khusus.",
	},
	"/harga": {
		title: "Harga Laundry MBA Laundry Express",
		description: "Cek daftar harga laundry transparan tanpa biaya tersembunyi untuk cuci, kering, dan paket bundling.",
	},
	"/blog": {
		title: "Blog Tips Laundry - MBA Laundry Express",
		description: "Artikel dan tips merawat pakaian, mengatasi noda, serta panduan laundry praktis setiap hari.",
	},
	"/faq": {
		title: "FAQ MBA Laundry Express",
		description: "Jawaban lengkap pertanyaan umum seputar layanan laundry, pembayaran, promo, dan operasional cabang.",
	},
	"/kontak": {
		title: "Kontak MBA Laundry Express",
		description: "Hubungi tim MBA Laundry Express untuk pertanyaan layanan, kemitraan, atau dukungan pelanggan.",
	},
};

export function PublicSeo() {
	const location = useLocation();
	const { data: branding } = useBranding();
	
	const siteUrl = import.meta.env.VITE_SITE_URL || "https://mbalaundryexpress.com";
	const normalizedPath = location.pathname.endsWith("/") && location.pathname !== "/"
		? location.pathname.slice(0, -1)
		: location.pathname;

	const matchedKey = Object.keys(seoMap)
		.sort((a, b) => b.length - a.length)
		.find((key) => normalizedPath === key || normalizedPath.startsWith(`${key}/`));

	const defaultEntry = seoMap[matchedKey ?? "/"];
	
	// Use branding settings if available
	const siteTitle = branding?.site_title || "MBA Laundry Express";
	const siteDescription = branding?.site_description || defaultEntry.description;
	const pageTitle = normalizedPath === "/" 
		? `${siteTitle} - Self Service Laundry Modern`
		: `${defaultEntry.title.replace("MBA Laundry Express", siteTitle)}`;
	
	const canonical = `${siteUrl}${normalizedPath}`;
	const imageUrl = branding?.logo_url || `${siteUrl}/pwa-512x512.png`;

	const orgSchema = {
		"@context": "https://schema.org",
		"@type": "Laundry",
		name: siteTitle,
		url: siteUrl,
		telephone: "+62 812-3456-7890",
		address: {
			"@type": "PostalAddress",
			addressCountry: "ID",
			addressRegion: "Jawa Timur",
		},
	};

	return (
		<Helmet>
			<title>{pageTitle}</title>
			<meta name="description" content={siteDescription} />
			<link rel="canonical" href={canonical} />

			<meta property="og:type" content="website" />
			<meta property="og:site_name" content={siteTitle} />
			<meta property="og:title" content={pageTitle} />
			<meta property="og:description" content={siteDescription} />
			<meta property="og:url" content={canonical} />
			<meta property="og:image" content={imageUrl} />

			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={pageTitle} />
			<meta name="twitter:description" content={siteDescription} />
			<meta name="twitter:image" content={imageUrl} />

			<script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
		</Helmet>
	);
}
