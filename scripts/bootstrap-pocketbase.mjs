import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function loadDotEnv(filePath) {
	if (!fs.existsSync(filePath)) return;
	const content = fs.readFileSync(filePath, "utf8");
	for (const rawLine of content.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line || line.startsWith("#")) continue;
		const eq = line.indexOf("=");
		if (eq <= 0) continue;
		const key = line.slice(0, eq).trim();
		const value = line
			.slice(eq + 1)
			.trim()
			.replace(/^['"]|['"]$/g, "");
		if (!(key in process.env)) {
			process.env[key] = value;
		}
	}
}

loadDotEnv(path.resolve(process.cwd(), ".env"));

const BASE_URL = process.env.POCKETBASE_URL ?? "http://127.0.0.1:8090";
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL ?? "admin@mba-laundry.com";
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD ?? "Admin12345!";

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
	throw new Error("POCKETBASE_ADMIN_EMAIL dan POCKETBASE_ADMIN_PASSWORD wajib diisi.");
}

const textField = (name, required = false) => ({ name, type: "text", required, options: {} });
const boolField = (name, required = false) => ({ name, type: "bool", required, options: {} });
const numberField = (name, required = false) => ({ name, type: "number", required, options: {} });
const dateField = (name, required = false) => ({ name, type: "date", required, options: {} });
const fileField = (name, required = false) => ({
	name,
	type: "file",
	required,
	options: {
		maxSelect: 1,
		maxSize: 5242880,
		mimeTypes: [],
		thumbs: [],
		protected: false,
	},
});
const jsonField = (name, required = false) => ({ name, type: "json", required, options: { maxSize: 2000000 } });

const collections = [
	{
		name: "branches",
		fields: [
			textField("name", true),
			textField("slug", true),
			textField("address", true),
			textField("maps_url"),
			textField("maps_embed"),
			textField("whatsapp"),
			textField("email"),
			textField("description"),
			fileField("cover_image"),
			boolField("is_active"),
			textField("status"),
			numberField("price_wash"),
			numberField("price_dry"),
			numberField("sort_order"),
		],
		indexes: ["CREATE UNIQUE INDEX idx_branches_slug ON branches (slug)"],
		listRule: "",
		viewRule: "",
		createRule: null,
		updateRule: null,
		deleteRule: null,
	},
	{
		name: "branch_hours",
		fields: [
			textField("branch_id", true),
			textField("day", true),
			textField("open_time"),
			textField("close_time"),
			boolField("is_closed"),
		],
		listRule: "",
		viewRule: "",
		createRule: null,
		updateRule: null,
		deleteRule: null,
	},
	{
		name: "branch_facilities",
		fields: [textField("branch_id", true), textField("name", true), textField("icon"), numberField("sort_order")],
		listRule: "",
		viewRule: "",
		createRule: null,
		updateRule: null,
		deleteRule: null,
	},
	{
		name: "branch_gallery",
		fields: [
			textField("branch_id"),
			fileField("image", true),
			textField("caption"),
			textField("type"),
			numberField("sort_order"),
		],
		listRule: "",
		viewRule: "",
		createRule: null,
		updateRule: null,
		deleteRule: null,
	},
	{
		name: "promos",
		fields: [
			textField("title", true),
			textField("slug", true),
			textField("description"),
			fileField("image"),
			textField("terms"),
			dateField("start_date", true),
			dateField("end_date", true),
			boolField("is_active"),
			boolField("show_on_home"),
			boolField("is_global"),
			numberField("priority"),
			textField("status"),
		],
		indexes: ["CREATE UNIQUE INDEX idx_promos_slug ON promos (slug)"],
		listRule: "",
		viewRule: "",
		createRule: null,
		updateRule: null,
		deleteRule: null,
	},
	{
		name: "promo_branches",
		fields: [textField("promo_id", true), textField("branch_id", true)],
		listRule: "",
		viewRule: "",
		createRule: null,
		updateRule: null,
		deleteRule: null,
	},
	{
		name: "jobs",
		fields: [
			textField("title", true),
			textField("description"),
			textField("requirements"),
			textField("benefits"),
			textField("type"),
			textField("branch_id"),
			numberField("salary_min"),
			numberField("salary_max"),
			boolField("show_salary"),
			boolField("is_open"),
			textField("whatsapp_apply"),
			dateField("posted_at"),
			dateField("closed_at"),
			fileField("image"),
		],
		listRule: "",
		viewRule: "",
		createRule: null,
		updateRule: null,
		deleteRule: null,
	},
	{
		name: "articles",
		fields: [
			textField("title", true),
			textField("slug", true),
			textField("content", true),
			textField("excerpt"),
			fileField("thumbnail"),
			textField("category"),
			jsonField("tags"),
			textField("meta_title"),
			textField("meta_desc"),
			textField("author"),
			numberField("read_time"),
			textField("status"),
			dateField("published_at"),
			numberField("views"),
		],
		indexes: ["CREATE UNIQUE INDEX idx_articles_slug ON articles (slug)"],
		listRule: "",
		viewRule: "",
		createRule: null,
		updateRule: null,
		deleteRule: null,
	},
	{
		name: "testimonials",
		fields: [
			textField("customer_name", true),
			textField("branch_id"),
			numberField("rating", true),
			textField("comment", true),
			fileField("photo"),
			boolField("is_approved"),
			textField("source"),
		],
		listRule: "",
		viewRule: "",
		createRule: "",
		updateRule: null,
		deleteRule: null,
	},
	{
		name: "faqs",
		fields: [
			textField("question", true),
			textField("answer", true),
			textField("category"),
			textField("branch_id"),
			numberField("sort_order"),
			boolField("is_active"),
		],
		listRule: "",
		viewRule: "",
		createRule: null,
		updateRule: null,
		deleteRule: null,
	},
	{
		name: "page_contents",
		fields: [
			textField("key", true),
			textField("value", true),
			textField("type", true),
			textField("label"),
			textField("description"),
			textField("group"),
		],
		indexes: ["CREATE UNIQUE INDEX idx_page_contents_key ON page_contents (key)"],
		listRule: "",
		viewRule: "",
		createRule: null,
		updateRule: null,
		deleteRule: null,
	},
	{
		name: "subscribers",
		fields: [textField("phone", true), textField("branch_id"), boolField("is_active"), textField("source")],
		indexes: ["CREATE UNIQUE INDEX idx_subscribers_phone ON subscribers (phone)"],
		listRule: "",
		viewRule: "",
		createRule: "",
		updateRule: null,
		deleteRule: null,
	},
	{
		name: "spin_rewards",
		fields: [
			textField("name", true),
			textField("description"),
			textField("reward_type", true),
			textField("reward_value"),
			numberField("probability"),
			boolField("is_active"),
			numberField("stock"),
		],
		listRule: "",
		viewRule: "",
		createRule: null,
		updateRule: null,
		deleteRule: null,
	},
	{
		name: "spin_plays",
		fields: [
			textField("phone", true),
			textField("branch_id"),
			textField("reward_id"),
			boolField("is_winner"),
			dateField("played_at", true),
		],
		listRule: "",
		viewRule: "",
		createRule: "",
		updateRule: null,
		deleteRule: null,
	},
	{
		name: "loyalty_members",
		fields: [
			textField("name", true),
			textField("phone", true),
			textField("email"),
			textField("branch_id"),
			numberField("points"),
			textField("level"),
			boolField("is_active"),
		],
		listRule: "",
		viewRule: "",
		createRule: "",
		updateRule: null,
		deleteRule: null,
	},
	{
		name: "loyalty_transactions",
		fields: [
			textField("member_id", true),
			textField("branch_id"),
			textField("type", true),
			numberField("points", true),
			textField("description"),
			textField("reference_id"),
		],
		listRule: "",
		viewRule: "",
		createRule: null,
		updateRule: null,
		deleteRule: null,
	},
	{
		name: "partnerships",
		fields: [
			textField("name", true),
			textField("company"),
			textField("phone", true),
			textField("email"),
			textField("city"),
			textField("notes"),
			textField("status", true),
		],
		listRule: null,
		viewRule: null,
		createRule: "",
		updateRule: null,
		deleteRule: null,
	},
	{
		name: "contact_messages",
		fields: [
			textField("name", true),
			textField("phone"),
			textField("email"),
			textField("subject"),
			textField("message", true),
			textField("status", true),
		],
		listRule: null,
		viewRule: null,
		createRule: "",
		updateRule: null,
		deleteRule: null,
	},
	{
		name: "site_settings",
		fields: [textField("key", true), textField("value", true), textField("description")],
		indexes: ["CREATE UNIQUE INDEX idx_site_settings_key ON site_settings (key)"],
		listRule: "",
		viewRule: "",
		createRule: null,
		updateRule: null,
		deleteRule: null,
	},
];

let authToken = "";

async function api(pathname, options = {}) {
	const headers = {
		"Content-Type": "application/json",
		...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
		...(options.headers ?? {}),
	};
	const url = `${BASE_URL}${pathname}`;
	console.log(`[api] calling: ${url}`);
	const response = await fetch(url, {
		...options,
		headers,
	});

	const isJson = response.headers.get("content-type")?.includes("application/json");
	const body = isJson ? await response.json() : await response.text();

	if (!response.ok) {
		console.log(`[api] FAILED: ${response.status} ${response.statusText}`);
		console.log(`[api] Response body:`, body);
		const message = typeof body === "string" ? body : body?.message || response.statusText;
		throw new Error(`${response.status} ${message}`);
	}
	return body;
}

async function authenticate() {
	const endpoints = [
		"/api/collections/_superusers/auth-with-password",
		"/api/collections/_admins/auth-with-password",
		"/api/admins/auth-with-password",
	];
	let lastError = null;

	for (const endpoint of endpoints) {
		console.log(`[auth] mencoba endpoint: ${endpoint}`);
		try {
			const body = await api(endpoint, {
				method: "POST",
				body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
			});
			authToken = body.token;
			console.log(`[auth] BERHASIL login via ${endpoint}`);
			return;
		} catch (error) {
			console.log(`[auth] Gagal di ${endpoint}: ${error.message}`);
			lastError = error;
		}
	}
	throw new Error(`Semua endpoint auth gagal. Terakhir: ${lastError?.message}`);
}

async function findCollection(name) {
	try {
		console.log(`[find] mencari koleksi: ${name}`);
		return await api(`/api/collections/${name}`);
	} catch (error) {
		const message = error instanceof Error ? error.message : "";
		console.log(`[find] Error mencari ${name}: ${message}`);
		if (message.startsWith("404")) return null;
		throw error;
	}
}

async function createCollection(definition) {
	const finalFields = [
		...definition.fields,
		{ name: "created", type: "autodate", onCreate: true, onUpdate: false },
		{ name: "updated", type: "autodate", onCreate: true, onUpdate: true }
	];

	await api("/api/collections", {
		method: "POST",
		body: JSON.stringify({
			type: "base",
			name: definition.name,
			schema: finalFields,
			fields: finalFields,
			indexes: definition.indexes ?? [],
			listRule: definition.listRule ?? null,
			viewRule: definition.viewRule ?? null,
			createRule: definition.createRule ?? null,
			updateRule: definition.updateRule ?? null,
			deleteRule: definition.deleteRule ?? null,
		}),
	});
}

async function listRecords(collection, perPage = 500) {
	const data = await api(`/api/collections/${collection}/records?page=1&perPage=${perPage}`);
	return data.items ?? [];
}

async function totalRecords(collection) {
	const data = await api(`/api/collections/${collection}/records?page=1&perPage=1`);
	return data.totalItems ?? 0;
}

async function createRecord(collection, payload) {
	return api(`/api/collections/${collection}/records`, {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

const nonEmpty = (value) => (value === "" ? " " : value);

async function ensureCollections() {
	console.log(`[ensure] Memulai pengecekan ${collections.length} koleksi...`);
	for (const definition of collections) {
		const existing = await findCollection(definition.name);
		if (existing) {
			console.log(`[skip] koleksi ${definition.name} sudah ada`);
			continue;
		}
		console.log(`[create] membuat koleksi: ${definition.name}`);
		await createCollection(definition);
		console.log(`[ok] koleksi ${definition.name} dibuat`);
	}
}

async function seedCoreData() {
	const branchTotal = await totalRecords("branches");
	if (branchTotal === 0) {
		await createRecord("branches", {
			name: "MBA Laundry Bohar",
			slug: "bohar",
			address: "Jl. Bohar Raya No. 12, Sidoarjo",
			whatsapp: "6281234567890",
			email: "bohar@mba-laundry.com",
			description: "Cabang strategis dekat area kos dan kampus dengan mesin modern.",
			is_active: true,
			status: "buka",
			price_wash: 10000,
			price_dry: 10000,
			sort_order: 1,
		});
		await createRecord("branches", {
			name: "MBA Laundry Pagesangan",
			slug: "pagesangan",
			address: "Jl. Pagesangan Utama No. 7, Surabaya",
			whatsapp: "6281234567890",
			email: "pagesangan@mba-laundry.com",
			description: "Cabang dengan area tunggu nyaman dan jam operasional panjang.",
			is_active: true,
			status: "ramai",
			price_wash: 10000,
			price_dry: 10000,
			sort_order: 2,
		});
		console.log("[ok] seed branches selesai");
	}

	const branches = await listRecords("branches", 100);
	const dayNames = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"];

	const hoursTotal = await totalRecords("branch_hours");
	if (hoursTotal === 0) {
		for (const branch of branches) {
			for (const day of dayNames) {
				await createRecord("branch_hours", {
					branch_id: branch.id,
					day,
					open_time: "07:00",
					close_time: "23:00",
					is_closed: false,
				});
			}
		}
		console.log("[ok] seed branch_hours selesai");
	}

	const facilityTotal = await totalRecords("branch_facilities");
	if (facilityTotal === 0) {
		for (const branch of branches) {
			await createRecord("branch_facilities", {
				branch_id: branch.id,
				name: "WiFi Gratis",
				icon: "wifi",
				sort_order: 1,
			});
			await createRecord("branch_facilities", {
				branch_id: branch.id,
				name: "Ruang Tunggu",
				icon: "sofa",
				sort_order: 2,
			});
			await createRecord("branch_facilities", {
				branch_id: branch.id,
				name: "Mesin Hemat Air",
				icon: "droplets",
				sort_order: 3,
			});
		}
		console.log("[ok] seed branch_facilities selesai");
	}

	const pageContentsSeed = [
		["hero_title", "Laundry Sendiri, Bersih Maksimal, Harga Pasti", "text", "Hero", "Judul hero utama", "hero"],
		[
			"hero_subtitle",
			"Rp 10.000 cuci · Rp 10.000 kering · Cabang Siap Melayanimu",
			"text",
			"Hero",
			"Subtitle hero",
			"hero",
		],
		["hero_cta_primary", "Pilih Cabang Terdekat", "text", "Hero", "CTA primer", "hero"],
		["hero_cta_secondary", "Lihat Promo Hari Ini", "text", "Hero", "CTA sekunder", "hero"],
		["stats_cucian", "12000", "number", "Statistik", "Total cucian", "stats"],
		["stats_rating", "4.9", "number", "Statistik", "Rating pelanggan", "stats"],
		["announcement_active", "false", "boolean", "Pengumuman", "Status pengumuman", "announcement"],
		["announcement_text", "", "text", "Pengumuman", "Teks pengumuman", "announcement"],
		["announcement_color", "red", "text", "Pengumuman", "Warna pengumuman", "announcement"],
		[
			"footer_desc",
			"Laundry self-service modern, mesin bersih, harga transparan.",
			"text",
			"Footer",
			"Deskripsi footer",
			"footer",
		],
		["footer_tagline", "Bersih Itu Mudah, Cepat, dan Terjangkau", "text", "Footer", "Tagline footer", "footer"],
		["social_instagram", "", "url", "Footer", "Instagram", "footer"],
		["social_tiktok", "", "url", "Footer", "Tiktok", "footer"],
		["social_facebook", "", "url", "Footer", "Facebook", "footer"],
		["social_youtube", "", "url", "Footer", "Youtube", "footer"],
		["seo_title", "MBA Laundry Express - Self Service Laundry Terpercaya", "text", "SEO", "SEO title", "seo"],
		[
			"seo_desc",
			"MBA Laundry Express hadir dengan mesin cuci modern dan layanan self-service cepat.",
			"text",
			"SEO",
			"SEO description",
			"seo",
		],
		["whatsapp_cs", "6281234567890", "text", "Kontak", "Nomor WA customer service", "contact"],
		["how_to_step1_title", "Pilih Mesin Kosong", "text", "Cara Pakai", "Judul langkah 1", "howto"],
		[
			"how_to_step1_desc",
			"Cari mesin cuci atau pengering yang tersedia",
			"text",
			"Cara Pakai",
			"Deskripsi langkah 1",
			"howto",
		],
		["how_to_step2_title", "Bayar & Mulai", "text", "Cara Pakai", "Judul langkah 2", "howto"],
		[
			"how_to_step2_desc",
			"Scan QRIS atau masukkan koin sesuai tarif",
			"text",
			"Cara Pakai",
			"Deskripsi langkah 2",
			"howto",
		],
		["how_to_step3_title", "Tunggu & Ambil", "text", "Cara Pakai", "Judul langkah 3", "howto"],
		[
			"how_to_step3_desc",
			"Estimasi 30-40 menit cuci, 20-30 menit kering",
			"text",
			"Cara Pakai",
			"Deskripsi langkah 3",
			"howto",
		],
	];

	{
		const existingPageContentRows = await listRecords("page_contents", 500);
		const existingKeys = new Set(existingPageContentRows.map((item) => item.key));
		let inserted = 0;

		for (const [key, value, type, label, description, group] of pageContentsSeed) {
			if (existingKeys.has(key)) continue;
			await createRecord("page_contents", {
				key,
				value: nonEmpty(value),
				type,
				label: nonEmpty(label),
				description: nonEmpty(description),
				group: nonEmpty(group),
			});
			inserted += 1;
		}

		if (inserted > 0) {
			console.log(`[ok] seed page_contents selesai (+${inserted})`);
		}
	}

	const siteSettingsSeed = [
		["maintenance_mode", "0", "Mode maintenance"],
		["spin_enabled", "1", "Aktifkan spin"],
		["loyalty_enabled", "1", "Aktifkan loyalitas"],
		["booking_enabled", "0", "Aktifkan booking"],
		["max_promo_popup", "1", "Maks promo popup"],
		["fonnte_token", "", "Token Fonnte"],
		["google_analytics_id", "", "GA ID"],
		["meta_pixel_id", "", "Meta Pixel ID"],
	];

	{
		const existingSiteSettingRows = await listRecords("site_settings", 500);
		const existingKeys = new Set(existingSiteSettingRows.map((item) => item.key));
		let inserted = 0;

		for (const [key, value, description] of siteSettingsSeed) {
			if (existingKeys.has(key)) continue;
			await createRecord("site_settings", {
				key,
				value: nonEmpty(value),
				description: nonEmpty(description),
			});
			inserted += 1;
		}

		if (inserted > 0) {
			console.log(`[ok] seed site_settings selesai (+${inserted})`);
		}
	}

	if ((await totalRecords("promos")) === 0) {
		const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
		const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
		const promo = await createRecord("promos", {
			title: "Diskon Weekday 10%",
			slug: "diskon-weekday-10",
			description: "Diskon 10% untuk transaksi Senin sampai Kamis.",
			terms: "Berlaku untuk semua cabang dan tidak dapat digabung promo lain.",
			start_date: startDate,
			end_date: endDate,
			is_active: true,
			show_on_home: true,
			is_global: true,
			priority: 1,
			status: "published",
		});

		if (branches[0]) {
			await createRecord("promo_branches", {
				promo_id: promo.id,
				branch_id: branches[0].id,
			});
		}
		console.log("[ok] seed promos selesai");
	}

	if ((await totalRecords("articles")) === 0) {
		await createRecord("articles", {
			title: "Cara Memilih Mode Cuci yang Tepat",
			slug: "cara-memilih-mode-cuci",
			content:
				"<p>Pisahkan pakaian berdasarkan bahan, warna, dan tingkat kotor. Gunakan mode cepat untuk pakaian harian dan mode normal untuk beban berat.</p>",
			excerpt: "Panduan cepat memilih mode cuci agar pakaian awet dan hasil maksimal.",
			category: "tips-mencuci",
			tags: ["tips", "cuci", "self-service"],
			meta_title: "Cara Memilih Mode Cuci yang Tepat",
			meta_desc: "Pelajari cara memilih mode cuci yang tepat di laundry self-service.",
			author: "Tim MBA Laundry",
			read_time: 4,
			status: "published",
			published_at: new Date().toISOString(),
			views: 0,
		});
		console.log("[ok] seed articles selesai");
	}

	if ((await totalRecords("faqs")) === 0) {
		await createRecord("faqs", {
			question: "Berapa harga cuci dan kering?",
			answer: "Harga default adalah Rp 10.000 untuk mencuci dan Rp 10.000 untuk mengeringkan.",
			category: "harga",
			sort_order: 1,
			is_active: true,
		});
		await createRecord("faqs", {
			question: "Berapa lama proses mencuci?",
			answer: "Estimasi mencuci 30-40 menit dan pengeringan 20-30 menit.",
			category: "waktu",
			sort_order: 2,
			is_active: true,
		});
		console.log("[ok] seed faqs selesai");
	}

	if ((await totalRecords("testimonials")) === 0 && branches[0]) {
		await createRecord("testimonials", {
			customer_name: "Nadia Putri",
			branch_id: branches[0].id,
			rating: 5,
			comment: "Tempatnya bersih, mesin cepat, dan hasil cucian memuaskan.",
			is_approved: true,
			source: "website",
		});
		await createRecord("testimonials", {
			customer_name: "Bimo Ardi",
			branch_id: branches[0].id,
			rating: 5,
			comment: "Harga transparan dan tidak ribet buat anak kos.",
			is_approved: true,
			source: "google",
		});
		console.log("[ok] seed testimonials selesai");
	}

	if ((await totalRecords("spin_rewards")) === 0) {
		await createRecord("spin_rewards", {
			name: "Voucher Cuci 5K",
			reward_type: "voucher",
			reward_value: "5000",
			probability: 0.25,
			is_active: true,
			stock: 100,
		});
		await createRecord("spin_rewards", {
			name: "Zonk",
			reward_type: "zonk",
			reward_value: "0",
			probability: 0.75,
			is_active: true,
			stock: 100000,
		});
		console.log("[ok] seed spin_rewards selesai");
	}
}

async function main() {
	console.log(`Bootstrap PocketBase: ${BASE_URL}`);
	await authenticate();
	await ensureCollections();
	await seedCoreData();
	console.log("Selesai: collection dan seed PocketBase siap.");
}

main().catch((error) => {
	console.error("Gagal bootstrap PocketBase:", error);
	process.exitCode = 1;
});
