import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

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
	const siteUrl = import.meta.env.VITE_SITE_URL || "https://mba-laundry.com";
	const normalizedPath = location.pathname.endsWith("/") && location.pathname !== "/"
		? location.pathname.slice(0, -1)
		: location.pathname;

	const matchedKey = Object.keys(seoMap)
		.sort((a, b) => b.length - a.length)
		.find((key) => normalizedPath === key || normalizedPath.startsWith(`${key}/`));

	const entry = seoMap[matchedKey ?? "/"];
	const canonical = `${siteUrl}${normalizedPath}`;
	const imageUrl = `${siteUrl}/pwa-512x512.png`;

	const orgSchema = {
		"@context": "https://schema.org",
		"@type": "Laundry",
		name: "MBA Laundry Express",
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
			<title>{entry.title}</title>
			<meta name="description" content={entry.description} />
			<link rel="canonical" href={canonical} />

			<meta property="og:type" content="website" />
			<meta property="og:site_name" content="MBA Laundry Express" />
			<meta property="og:title" content={entry.title} />
			<meta property="og:description" content={entry.description} />
			<meta property="og:url" content={canonical} />
			<meta property="og:image" content={imageUrl} />

			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={entry.title} />
			<meta name="twitter:description" content={entry.description} />
			<meta name="twitter:image" content={imageUrl} />

			<script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
		</Helmet>
	);
}
