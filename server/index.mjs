// ============================================================================
// MBA Laundry Express — API server (Node + Express + MySQL)
// ----------------------------------------------------------------------------
// Backend tunggal aplikasi ini. Bicara ke MySQL dan menyajikan REST API.
//
//   GET    /api/collections/:collection/records   -> list (page, perPage, filter, sort, expand)
//   GET    /api/collections/:collection/records/:id
//   POST   /api/collections/:collection/records
//   PATCH  /api/collections/:collection/records/:id
//   DELETE /api/collections/:collection/records/:id
//   POST   /api/collections/_superusers/auth-with-password
//   POST   /api/files/:collection/:recordId/:filename
//
// Jalankan:  node server/index.mjs        (default port 3002)
// ============================================================================

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, unlink } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import express from "express";
import multer from "multer";
import mysql from "mysql2/promise";

// ---------------------------------------------------------------------------
// Env loader (tanpa dependency, sama seperti script sync)
// ---------------------------------------------------------------------------
function loadEnv() {
	const file = resolve(process.cwd(), ".env");
	if (!existsSync(file)) return;
	const text = readFileSync(file, "utf8");
	for (const line of text.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const i = trimmed.indexOf("=");
		if (i === -1) continue;
		const key = trimmed.slice(0, i).trim();
		let value = trimmed.slice(i + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		if (process.env[key] === undefined) process.env[key] = value;
	}
}
loadEnv();

// PORT dari platform (Dokploy/Nixpacks/HF Spaces) menang supaya health-check
// platform menemukan app-nya. API_PORT hanya untuk pemakaian lokal.
const PORT = Number(process.env.PORT || process.env.API_PORT || 3002);

// Deteksi cerdas UPLOAD_DIR (mendukung /app/upload maupun /app/uploads dari mount volume Dokploy)
const resolveUploadDir = () => {
	const configured = process.env.UPLOAD_DIR;
	if (configured) {
		if (existsSync(configured)) return resolve(configured);
		if (configured.endsWith("uploads") && existsSync(configured.slice(0, -1))) {
			return resolve(configured.slice(0, -1));
		}
		if (configured.endsWith("upload") && existsSync(`${configured}s`)) {
			return resolve(`${configured}s`);
		}
		return resolve(configured);
	}
	if (existsSync("/app/upload")) return "/app/upload";
	if (existsSync("/app/uploads")) return "/app/uploads";
	return resolve(process.cwd(), "uploads");
};

const UPLOAD_DIR = resolveUploadDir();
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Nilai contoh yang ada di .env.example — jangan pernah dipakai di produksi.
const PLACEHOLDER_SECRETS = new Set([
	"",
	"ganti-ini-dengan-string-acak-panjang",
	"replace-with-random-64-char-secret",
	"dev-only-insecure-secret",
	"changeme",
	"secret",
]);

function resolveJwtSecret() {
	const configured = process.env.API_JWT_SECRET || process.env.CRON_SECRET || "";
	if (IS_PRODUCTION) {
		if (PLACEHOLDER_SECRETS.has(configured) || configured.length < 32) {
			console.error(
				"[api] FATAL: API_JWT_SECRET belum diisi dengan string acak minimal 32 karakter.\n" +
					"      Buat dengan:  node -e \"console.log(require('crypto').randomBytes(48).toString('base64url'))\"",
			);
			process.exit(1);
		}
		return configured;
	}
	if (PLACEHOLDER_SECRETS.has(configured)) {
		console.warn("[api] PERINGATAN: API_JWT_SECRET masih nilai contoh. Ganti sebelum dipakai di produksi.");
		return configured || "dev-only-insecure-secret";
	}
	return configured;
}

const JWT_SECRET = resolveJwtSecret();
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

// Origin yang boleh memanggil API dari browser. Frontend dan API disajikan
// dari domain yang sama, jadi default-nya cukup origin publik aplikasi.
const ALLOWED_ORIGINS = new Set(
	[
		process.env.VITE_SITE_URL,
		"http://localhost:3000",
		"http://localhost:5173",
		"http://127.0.0.1:3000",
		"http://127.0.0.1:5173",
		`http://localhost:${PORT}`,
		`http://127.0.0.1:${PORT}`,
	]
		.filter(Boolean)
		.map((value) => String(value).trim().replace(/\/+$/, ""))
		.filter(Boolean),
);

// ---------------------------------------------------------------------------
// Koneksi MySQL
// ---------------------------------------------------------------------------
const createDbPool = (host) =>
	mysql.createPool({
		host: host || process.env.MYSQL_HOST || "127.0.0.1",
		port: Number(process.env.MYSQL_PORT || 3306),
		database: process.env.MYSQL_DATABASE,
		user: process.env.MYSQL_USER,
		password: process.env.MYSQL_PASSWORD ?? "",
		connectionLimit: 10,
		charset: "utf8mb4",
		timezone: "Z",
		enableKeepAlive: true,
		keepAliveInitialDelay: 30000,
		connectTimeout: 8000,
		maxIdle: 10,
		idleTimeout: 60000,
	});

let pool = createDbPool(process.env.MYSQL_HOST);

async function initDatabaseConnection() {
	try {
		await pool.query("SELECT 1");
		console.log(`[api] MySQL terhubung ke host: ${process.env.MYSQL_HOST}`);
	} catch (err) {
		console.warn(`[api] Gagal koneksi ke MySQL host (${process.env.MYSQL_HOST}):`, err.message);
		if (process.env.MYSQL_HOST !== "43.156.144.127") {
			console.log("[api] Mencoba fallback otomatis ke host 43.156.144.127...");
			const fallback = createDbPool("43.156.144.127");
			try {
				await fallback.query("SELECT 1");
				pool = fallback;
				console.log("[api] Fallback ke MySQL 43.156.144.127 BERHASIL!");
			} catch (fbErr) {
				console.error("[api] Fallback MySQL juga gagal:", fbErr.message);
			}
		}
	}
}


// ---------------------------------------------------------------------------
// Skema tabel: kolom yang boleh ditulis, kolom tanggal, kolom JSON,
// kolom boolean, kolom yang menyimpan nama file upload, dan hak akses (auth).
//
// auth.read / auth.create / auth.update / auth.delete:
//   "public" -> boleh tanpa login
//   "admin"  -> wajib token admin
// Kalau tidak ditulis, default-nya "admin" (fail closed). Jadi koleksi baru
// otomatis tertutup, tidak terbuka gara-gara lupa mengisi.
// ---------------------------------------------------------------------------
const SCHEMA = {
	branches: {
		datetime: ["created", "updated"],
		file: ["cover_image"],
		order: "+sort_order,+name",
		auth: { read: "public" },
	},
	branch_hours: { datetime: ["created", "updated"], order: "+day", auth: { read: "public" } },
	branch_facilities: {
		datetime: ["created", "updated"],
		order: "+sort_order,+name",
		auth: { read: "public" },
	},
	branch_gallery: { datetime: ["created", "updated"], file: ["image"], order: "-created", auth: { read: "public" } },
	branch_machines: {
		datetime: ["created", "updated"],
		order: "+branch_id,+sort_order",
		auth: { read: "public" },
	},
	promos: {
		datetime: ["start_date", "end_date", "created", "updated"],
		file: ["image"],
		order: "+priority,+end_date",
		auth: { read: "public" },
	},
	promo_branches: { datetime: ["created", "updated"], order: "+created", auth: { read: "public" } },
	jobs: {
		datetime: ["posted_at", "closed_at", "created", "updated"],
		file: ["image"],
		order: "-posted_at,-created",
		auth: { read: "public" },
	},
	articles: {
		datetime: ["published_at", "created", "updated"],
		json: ["tags"],
		file: ["thumbnail"],
		order: "-published_at,-created",
		auth: { read: "public" },
	},
	testimonials: {
		datetime: ["created", "updated"],
		order: "-created",
		// Dibaca publik (halaman testimoni & statistik) tapi hanya yang sudah
		// di-approve yang ditampilkan. Kiriman pengunjung selalu dipaksa
		// is_approved = false oleh sanitizePublicPayload().
		auth: { read: "public", create: "public" },
	},
	faqs: { datetime: ["created", "updated"], order: "+sort_order,-created", auth: { read: "public" } },
	page_contents: { datetime: ["created", "updated"], order: "+group,+key", auth: { read: "public" } },
	spin_rewards: { datetime: ["created", "updated"], order: "+created", auth: { read: "public" } },
	spin_plays: { datetime: ["played_at", "created", "updated"], order: "-played_at", auth: { create: "public" } },
	loyalty_members: { datetime: ["created", "updated"], order: "-created" },
	loyalty_transactions: { datetime: ["created", "updated"], order: "-created" },
	partnerships: { datetime: ["created", "updated"], order: "-created", auth: { create: "public" } },
	contact_messages: {
		datetime: ["created", "updated"],
		// Kolom topic/branch_id/incident_date/machine_code ditambahkan lewat
		// ensureContactColumns() supaya database lama tetap kompatibel.
		order: "-created",
		// Laporan bantuan berisi nama, nomor WA, email, dan isi keluhan
		// pelanggan. Hanya boleh dibuat publik, dibaca hanya admin.
		auth: { read: "admin", create: "public" },
	},
	shift_employees: {
		datetime: ["created", "updated"],
		json: ["allowed_shifts"],
		order: "+branch_id,+sort_order,+name",
	},
	shift_events: { datetime: ["created", "updated"], order: "-created" },
	shift_assignments: { datetime: ["created", "updated"], order: "+date,+branch_id" },
	site_settings: { datetime: ["created", "updated"], order: "+key", auth: { read: "public" } },
	branding_files: { datetime: ["created", "updated"], file: ["file"], order: "-created", auth: { read: "public" } },
	admin_login_logs: { datetime: ["created"], order: "-created" },
	admin_activity_logs: { datetime: ["created"], order: "-created" },
};

const AUTH_DEFAULT = { read: "admin", create: "admin", update: "admin", delete: "admin" };

// Kolom yang boleh dilihat pengunjung tanpa login, untuk koleksi yang
// read-nya "public" tapi punya data internal. Koleksi lain: semua kolom.
// testimonials dibaca publik, tapi source (asal testimoni) hanya untuk admin.
// branches dibaca publik, tapi schedule_token (link internal karyawan) hanya untuk admin.
const PUBLIC_READ_COLUMNS = {
	testimonials: ["id", "customer_name", "branch_id", "rating", "comment", "photo", "is_approved", "created", "updated"],
	branches: [
		"id",
		"name",
		"slug",
		"address",
		"maps_url",
		"maps_embed",
		"whatsapp",
		"email",
		"description",
		"cover_image",
		"is_active",
		"status",
		"coin_value",
		"qris_enabled",
		"cash_enabled",
		"sort_order",
		"created",
		"updated",
	],
};

/** Ekspresi SELECT yang aman untuk pembaca publik. */
const selectColumnsFor = (collection, isPublicReader) => {
	const allow = isPublicReader ? PUBLIC_READ_COLUMNS[collection] : null;
	if (!allow) return "*";
	return allow.map(identifier).join(", ");
};

/** Hak akses satu aksi pada satu koleksi. Default "admin" (fail closed). */
const accessRule = (collection, action) => SCHEMA[collection]?.auth?.[action] ?? AUTH_DEFAULT[action];

/** True kalau aksi ini boleh dilakukan tanpa login. */
const isPublicAction = (collection, action) => accessRule(collection, action) === "public";


// Kolom DATE murni (tanpa jam). Dikirim sebagai "YYYY-MM-DD" supaya tidak
// bergeser gara-gara konversi zona waktu.
const DATE_FIELDS_BY_COLLECTION = {
	contact_messages: ["incident_date"],
	shift_events: ["date", "end_date"],
	shift_assignments: ["date"],
};

// Boolean disimpan TINYINT(1) di MySQL, tapi frontend mengharapkan true/false.
const BOOLEAN_FIELDS = {
	is_active: true,
	is_global: true,
	show_on_home: true,
	is_closed: true,
	is_approved: true,
	is_featured: true,
	is_read: true,
	is_resolved: true,
	spin_enabled: true,
	loyalty_enabled: true,
	allow_indexing: true,
	is_used: true,
	is_redeemed: true,
	qris_enabled: true,
	cash_enabled: true,
	can_night: true,
	backup_available: true,
};

// ---------------------------------------------------------------------------
// Helper umum
// ---------------------------------------------------------------------------
const identifier = (name) => `\`${String(name).replace(/`/g, "")}\``;

const jsonError = (res, status, message) => res.status(status).json({ code: status, message, data: {} });

const toBoolValue = (v) => {
	if (v === null || v === undefined) return null;
	if (typeof v === "boolean") return v ? 1 : 0;
	const s = String(v).toLowerCase();
	if (s === "true" || s === "1") return 1;
	if (s === "false" || s === "0" || s === "") return 0;
	return Number(v) ? 1 : 0;
};

const fromDb = (collection, row) => {
	const spec = SCHEMA[collection] ?? {};
	const out = {};
	for (const [key, value] of Object.entries(row)) {
		if (spec.json?.includes(key) && typeof value === "string") {
			try {
				out[key] = JSON.parse(value);
			} catch {
				out[key] = value;
			}
			continue;
		}
		if (BOOLEAN_FIELDS[key]) {
			out[key] = value === 1 || value === true || value === "1";
			continue;
		}
		if (spec.datetime?.includes(key) && value instanceof Date) {
			out[key] = value.toISOString().replace("T", " ");
			continue;
		}
		// Kolom DATE dikirim sebagai "YYYY-MM-DD" agar aman dari geser zona waktu.
		if (DATE_FIELDS_BY_COLLECTION[collection]?.includes(key) && value instanceof Date) {
			const pad = (n) => String(n).padStart(2, "0");
			out[key] = `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
			continue;
		}
		out[key] = value;
	}
	out.collectionId = collection;
	out.collectionName = collection;
	return out;
};

const toDb = (collection, payload) => {
	const spec = SCHEMA[collection] ?? {};
	const out = {};
	for (const [key, value] of Object.entries(payload)) {
		if (key === "id" || key === "collectionId" || key === "collectionName" || key === "expand") continue;
		if (spec.json?.includes(key)) {
			out[key] = typeof value === "string" ? value : JSON.stringify(value ?? []);
			continue;
		}
		if (BOOLEAN_FIELDS[key]) {
			out[key] = toBoolValue(value);
			continue;
		}
		if (spec.datetime?.includes(key)) {
			if (!value) {
				out[key] = null;
			} else {
				const parsed = new Date(String(value).replace(" ", "T"));
				out[key] = Number.isNaN(parsed.getTime()) ? null : parsed;
			}
			continue;
		}
		// Kolom DATE murni: terima "YYYY-MM-DD" (atau ISO) apa adanya, jangan
		// diubah jadi Date supaya tidak bergeser zona waktu. String kosong -> NULL.
		if (DATE_FIELDS_BY_COLLECTION[collection]?.includes(key)) {
			const raw = value === null || value === undefined ? "" : String(value).trim();
			out[key] = raw ? raw.slice(0, 10) : null;
			continue;
		}
		if (typeof value === "object" && value !== null) {
			out[key] = JSON.stringify(value);
			continue;
		}
		out[key] = value === undefined ? null : value;
	}
	return out;
};

// Cache kolom nyata tiap tabel, supaya field yang tidak ada di tabel
// (mis. kiriman form yang tidak relevan) tidak merusak INSERT/UPDATE.
const columnCache = new Map();
async function tableColumns(table) {
	if (columnCache.has(table)) return columnCache.get(table);
	const [rows] = await pool.query(
		"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
		[process.env.MYSQL_DATABASE, table],
	);
	const set = new Set(rows.map((r) => r.COLUMN_NAME));
	columnCache.set(table, set);
	return set;
}

async function filterToColumns(collection, fields) {
	const cols = await tableColumns(collection);
	const out = {};
	for (const [key, value] of Object.entries(fields)) {
		if (cols.has(key)) out[key] = value;
	}
	return out;
}

const newRecordId = () => randomBytes(8).toString("hex").slice(0, 15);

// ---------------------------------------------------------------------------
// Rate limiter sederhana (in-memory, tanpa dependency).
// Cukup untuk satu proses API; kalau nanti di-cluster, pindahkan ke Redis.
// ---------------------------------------------------------------------------
const rateBuckets = new Map();

function rateLimit({ name, limit, windowMs, key }) {
	const bucketKey = `${name}:${key}`;
	const now = Date.now();
	let bucket = rateBuckets.get(bucketKey);
	if (!bucket || bucket.resetAt <= now) {
		bucket = { count: 0, resetAt: now + windowMs };
		rateBuckets.set(bucketKey, bucket);
	}
	bucket.count += 1;
	const allowed = bucket.count <= limit;
	return { allowed, remaining: Math.max(0, limit - bucket.count), retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
}

// Bersihkan bucket lama supaya memory tidak menumpuk.
setInterval(
	() => {
		const now = Date.now();
		for (const [key, bucket] of rateBuckets) {
			if (bucket.resetAt <= now) rateBuckets.delete(key);
		}
	},
	60_000,
).unref?.();

/**
 * Deteksi IP klien asli (mendukung Cloudflare, X-Real-IP, X-Forwarded-For, dll.)
 */
const clientIp = (req) => {
	const cf = req.headers["cf-connecting-ip"];
	if (cf) return String(cf).trim().slice(0, 64);

	const real = req.headers["x-real-ip"];
	if (real) return String(real).trim().slice(0, 64);

	const forwarded = req.headers["x-forwarded-for"];
	if (forwarded) {
		const raw = Array.isArray(forwarded) ? forwarded[0] : String(forwarded);
		const list = raw.split(",").map((s) => s.trim());
		for (const ip of list) {
			if (
				ip &&
				!ip.startsWith("10.") &&
				!ip.startsWith("192.168.") &&
				!ip.startsWith("172.16.") &&
				ip !== "127.0.0.1" &&
				ip !== "::1"
			) {
				return ip.slice(0, 64);
			}
		}
		if (list[0]) return list[0].slice(0, 64);
	}

	const trueClient = req.headers["true-client-ip"];
	if (trueClient) return String(trueClient).trim().slice(0, 64);

	let remote = req.socket?.remoteAddress || req.connection?.remoteAddress || "";
	if (remote.startsWith("::ffff:")) remote = remote.replace("::ffff:", "");
	if (remote === "::1" || remote === "127.0.0.1") return "127.0.0.1 (Localhost)";
	return (remote || "127.0.0.1").trim().slice(0, 64);
};

/**
 * Jam Real-Time Indonesia (WIB / Asia/Jakarta, UTC+7)
 */
function getIndoRealTime() {
	const now = new Date();
	const formatted = now.toLocaleString("id-ID", {
		timeZone: "Asia/Jakarta",
		year: "numeric",
		month: "short",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});
	return `${formatted} WIB`;
}

/**
 * Deteksi Perangkat & Browser dari User-Agent
 */
function parseDevice(uaString) {
	const ua = String(uaString ?? "").toLowerCase();
	let deviceType = "Desktop PC";
	let os = "Windows";
	let browser = "Google Chrome";

	// Device & OS
	if (ua.includes("iphone")) {
		deviceType = "iPhone";
		os = "iOS";
	} else if (ua.includes("ipad")) {
		deviceType = "iPad";
		os = "iPadOS";
	} else if (ua.includes("android")) {
		deviceType = ua.includes("mobile") ? "HP Android" : "Tablet Android";
		os = "Android";
	} else if (ua.includes("macintosh") || ua.includes("mac os x")) {
		deviceType = "Mac / MacBook";
		os = "macOS";
	} else if (ua.includes("windows")) {
		deviceType = "Windows PC / Laptop";
		if (ua.includes("windows nt 10.0")) os = "Windows 10/11";
		else os = "Windows";
	} else if (ua.includes("linux")) {
		deviceType = "Linux PC";
		os = "Linux";
	}

	// Browser
	if (ua.includes("edg/")) browser = "Microsoft Edge";
	else if (ua.includes("chrome/") && !ua.includes("edg/") && !ua.includes("opr/")) browser = "Google Chrome";
	else if (ua.includes("firefox/")) browser = "Mozilla Firefox";
	else if (ua.includes("safari/") && !ua.includes("chrome/")) browser = "Apple Safari";
	else if (ua.includes("opr/") || ua.includes("opera/")) browser = "Opera";
	else if (ua.includes("samsungbrowser")) browser = "Samsung Internet";

	return `${deviceType} • ${browser} (${os})`;
}

async function recordLoginLog({ email, ip, device, ua, status, reason }) {
	try {
		await pool.query(
			"INSERT INTO `admin_login_logs` (`id`,`admin_email`,`ip_address`,`device`,`user_agent`,`status`,`fail_reason`,`created_wib`,`created`) VALUES (?,?,?,?,?,?,?,?,NOW())",
			[newRecordId(), email, ip, device, ua ? String(ua).slice(0, 500) : null, status, reason, getIndoRealTime()],
		);
	} catch (err) {
		logError("recordLoginLog", err);
	}
}

async function recordActivityLog({ email, action, collection, targetId, summary, details, ip, device }) {
	try {
		await pool.query(
			"INSERT INTO `admin_activity_logs` (`id`,`admin_email`,`action`,`collection`,`target_id`,`summary`,`details`,`ip_address`,`device`,`created_wib`,`created`) VALUES (?,?,?,?,?,?,?,?,?,?,NOW())",
			[
				newRecordId(),
				email || "admin",
				action || "update",
				collection || "system",
				targetId || null,
				summary || "Perubahan data",
				details ? String(details).slice(0, 3000) : null,
				ip,
				device,
				getIndoRealTime(),
			],
		);
	} catch (err) {
		logError("recordActivityLog", err);
	}
}

function generateActivitySummary(collection, mode, payload, id) {
	if (collection === "shift_assignments") {
		return mode === "create" ? "Menyimpan slot jadwal shift" : "Mengubah slot jadwal shift";
	}
	if (collection === "shift_employees") {
		return `${mode === "create" ? "Menambah karyawan baru" : "Mengubah data karyawan"}: ${payload?.name || id}`;
	}
	if (collection === "shift_events") {
		return `Mencatat event absensi/izin (${payload?.type || "izin"}) tanggal ${payload?.date || ""}`;
	}
	if (collection === "branches") {
		return `${mode === "create" ? "Menambah cabang" : "Mengubah data cabang"}: ${payload?.name || id}`;
	}
	if (collection === "branch_machines") {
		return `${mode === "create" ? "Menambah mesin laundry" : "Mengubah data mesin laundry"}`;
	}
	if (collection === "branch_hours") {
		return `Mengubah jam operasional cabang hari ${payload?.day || ""}`;
	}
	if (collection === "promos") {
		return `${mode === "create" ? "Membuat promo baru" : "Mengubah promo"}: ${payload?.title || id}`;
	}
	if (collection === "articles") {
		return `${mode === "create" ? "Menerbitkan artikel baru" : "Mengubah artikel"}: ${payload?.title || id}`;
	}
	if (collection === "faqs") {
		return `${mode === "create" ? "Menambah FAQ" : "Mengubah FAQ"}: ${payload?.question || id}`;
	}
	if (collection === "site_settings") {
		return `Mengubah pengaturan situs (${payload?.key || id})`;
	}
	return `${mode === "create" ? "Menambah" : "Mengubah"} data pada ${collection}`;
}

/**
 * Middleware pembatas request.
 *   rateLimitMiddleware({ name, limit, windowMs })       -> per IP
 *   rateLimitMiddleware({ name, limit, windowMs, by })   -> per IP + by(req)
 */
function rateLimitMiddleware({ name, limit, windowMs, by, message }) {
	return (req, res, next) => {
		const extra = by ? String(by(req) ?? "").toLowerCase().slice(0, 191) : "";
		const result = rateLimit({ name, limit, windowMs, key: `${clientIp(req)}|${extra}` });
		if (!result.allowed) {
			res.setHeader("Retry-After", String(result.retryAfter));
			return jsonError(res, 429, message || "Terlalu banyak permintaan. Coba lagi nanti.");
		}
		next();
	};
}

/**
 * Kunci + hitung percobaan. Dipakai untuk login: yang dihitung hanya
 * percobaan GAGAL, jadi admin yang berhasil login tidak pernah terkunci.
 */
function loginAttemptKey(req) {
	const ip = clientIp(req);
	const identity = String(req.body?.identity ?? req.body?.email ?? "").toLowerCase().slice(0, 191);
	return `login:${ip}|${identity}`;
}

function loginBlocked(req) {
	const bucket = rateBuckets.get(loginAttemptKey(req));
	if (!bucket || bucket.resetAt <= Date.now()) return 0;
	if (bucket.count < 8) return 0;
	return Math.ceil((bucket.resetAt - Date.now()) / 1000);
}

function registerLoginFailure(req) {
	const key = loginAttemptKey(req);
	const now = Date.now();
	let bucket = rateBuckets.get(key);
	if (!bucket || bucket.resetAt <= now) {
		bucket = { count: 0, resetAt: now + 15 * 60 * 1000 };
		rateBuckets.set(key, bucket);
	}
	bucket.count += 1;
}

// ---------------------------------------------------------------------------
// Sanitasi & validasi input sisi server.
// Frontend sudah memvalidasi, tapi itu bisa dilewati. Semua payload dari
// pengunjung tanpa login WAJIB lewat sini.
// ---------------------------------------------------------------------------
const stripHtml = (value) =>
	String(value ?? "")
		// Buang tag beserta isinya untuk elemen berbahaya.
		.replace(/<\s*(script|style|iframe|object|embed|svg|math)[\s\S]*?<\s*\/\s*\1\s*>/gi, " ")
		.replace(/<\s*[^>]*>/g, " ")
		// Buang karakter kontrol (termasuk NUL) yang bisa menyusup ke log/DB.
		.replace(/\p{Cc}/gu, " ")
		.replace(/\s+/g, " ")
		.trim();

const cleanText = (value, maxLength) => {
	if (value === null || value === undefined) return null;
	const cleaned = stripHtml(value);
	if (!cleaned) return null;
	return cleaned.slice(0, maxLength);
};

const PHONE_RE = /^[+]?[0-9][0-9\s().-]{6,19}$/;
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ID_RE = /^[A-Za-z0-9]{1,32}$/;
const CONTACT_TOPICS = new Set(["kehilangan", "saran", "kritik"]);

/** Ubah "YYYY-MM-DD" jadi Date lokal; null kalau tidak valid. */
const parseIsoDate = (value) => {
	if (typeof value !== "string" || !DATE_RE.test(value)) return null;
	const [y, m, d] = value.split("-").map(Number);
	const date = new Date(y, m - 1, d);
	if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
	return date;
};

/**
 * Validasi + bersihkan payload form publik.
 * @returns {{ ok: true, data: object } | { ok: false, error: string }}
 */
async function sanitizePublicPayload(collection, body) {
	const payload = {};

	if (collection === "contact_messages") {
		const name = cleanText(body?.name, 120);
		if (!name || name.length < 2) return { ok: false, error: "Nama wajib diisi (minimal 2 karakter)." };

		const phoneRaw = String(body?.phone ?? "").trim();
		if (!PHONE_RE.test(phoneRaw)) return { ok: false, error: "Nomor WA tidak valid." };

		const emailRaw = String(body?.email ?? "").trim();
		if (emailRaw && (emailRaw.length > 191 || !EMAIL_RE.test(emailRaw))) {
			return { ok: false, error: "Email tidak valid." };
		}

		const message = cleanText(body?.message, 5000);
		if (!message || message.length < 10) {
			return { ok: false, error: "Ceritakan detailnya (minimal 10 karakter)." };
		}

		const topicRaw = String(body?.topic ?? "").trim();
		const topic = CONTACT_TOPICS.has(topicRaw) ? topicRaw : null;

		const branchRaw = String(body?.branch_id ?? "").trim();
		if (branchRaw && !ID_RE.test(branchRaw)) return { ok: false, error: "Cabang tidak valid." };
		if (branchRaw) {
			const [rows] = await pool.query(`SELECT \`id\` FROM \`branches\` WHERE \`id\` = ? LIMIT 1`, [branchRaw]);
			if (!rows[0]) return { ok: false, error: "Cabang tidak ditemukan." };
		}

		let incidentDate = null;
		const dateRaw = String(body?.incident_date ?? "").trim();
		if (dateRaw) {
			const parsed = parseIsoDate(dateRaw);
			if (!parsed) return { ok: false, error: "Tanggal kejadian tidak valid." };
			const tomorrow = new Date();
			tomorrow.setHours(23, 59, 59, 999);
			if (parsed.getTime() > tomorrow.getTime()) {
				return { ok: false, error: "Tanggal kejadian tidak boleh di masa depan." };
			}
			incidentDate = dateRaw;
		}

		payload.name = name;
		payload.phone = phoneRaw.replace(/\s+/g, "");
		payload.email = emailRaw || null;
		payload.subject = cleanText(body?.subject, 191);
		payload.message = message;
		payload.topic = topic;
		payload.branch_id = branchRaw || null;
		payload.incident_date = incidentDate;
		// Apa pun yang dikirim klien, status selalu "new".
		payload.status = "new";
		return { ok: true, data: payload };
	}

	if (collection === "partnerships") {
		const name = cleanText(body?.name, 120);
		if (!name || name.length < 2) return { ok: false, error: "Nama wajib diisi (minimal 2 karakter)." };

		const phoneRaw = String(body?.phone ?? "").trim();
		if (!PHONE_RE.test(phoneRaw)) return { ok: false, error: "Nomor WA tidak valid." };

		const emailRaw = String(body?.email ?? "").trim();
		if (emailRaw && (emailRaw.length > 191 || !EMAIL_RE.test(emailRaw))) {
			return { ok: false, error: "Email tidak valid." };
		}

		payload.name = name;
		payload.company = cleanText(body?.company, 120);
		payload.phone = phoneRaw.replace(/\s+/g, "");
		payload.email = emailRaw || null;
		payload.city = cleanText(body?.city, 120);
		payload.notes = cleanText(body?.notes, 2000);
		payload.status = "new";
		return { ok: true, data: payload };
	}

	if (collection === "testimonials") {
		const name = cleanText(body?.customer_name ?? body?.name, 120);
		if (!name) return { ok: false, error: "Nama wajib diisi." };

		const comment = cleanText(body?.comment ?? body?.message, 2000);
		if (!comment || comment.length < 5) return { ok: false, error: "Isi testimoni terlalu pendek." };

		payload.customer_name = name;
		payload.comment = comment;
		payload.rating = Math.min(5, Math.max(1, Number(body?.rating) || 5));
		payload.branch_id = ID_RE.test(String(body?.branch_id ?? "")) ? String(body.branch_id) : null;
		payload.source = "website";
		// Pengunjung tidak boleh meloloskan testimoni sendiri.
		payload.is_approved = false;
		return { ok: true, data: payload };
	}

	if (collection === "spin_plays") {
		const phoneRaw = String(body?.phone ?? "").trim();
		if (!PHONE_RE.test(phoneRaw)) return { ok: false, error: "Nomor WA tidak valid." };
		payload.phone = phoneRaw.replace(/\s+/g, "");
		payload.branch_id = ID_RE.test(String(body?.branch_id ?? "")) ? String(body.branch_id) : null;
		payload.reward_id = ID_RE.test(String(body?.reward_id ?? "")) ? String(body.reward_id) : null;
		payload.is_winner = false;
		payload.is_redeemed = false;
		return { ok: true, data: payload };
	}

	// Koleksi lain tidak boleh ditulis publik; ini pengaman terakhir.
	return { ok: false, error: "Forbidden" };
}

// ---------------------------------------------------------------------------
// Penerjemah filter teks -> SQL
//   "name ~ \"bohar\""            -> `name` LIKE '%bohar%'
//   "is_active = true"            -> `is_active` = 1
//   "a = \"x\" && b >= \"y\""     -> `a` = ? AND `b` >= ?
// ---------------------------------------------------------------------------
const FILTER_TOKEN = /([A-Za-z_][A-Za-z0-9_]*)\s*(~|!~|>=|<=|!=|=|>|<)\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|(-?\d+(?:\.\d+)?)|(true|false|null))/g;

function parseFilter(filter, params) {
	if (!filter || !String(filter).trim()) return { sql: "", values: [] };

	// Pecah berdasarkan && dan || di level teratas saja, supaya tanda kurung
	// seperti `(a = null || b >= "x")` tidak ikut terpecah.
	const tokenize = (input) => {
		const tokens = [];
		let depth = 0;
		let current = "";
		for (let i = 0; i < input.length; i += 1) {
			const ch = input[i];
			if (ch === '"' || ch === "'") {
				const quote = ch;
				current += ch;
				i += 1;
				while (i < input.length) {
					current += input[i];
					if (input[i] === "\\") {
						i += 1;
						current += input[i] ?? "";
					} else if (input[i] === quote) break;
					i += 1;
				}
				continue;
			}
			if (ch === "(") depth += 1;
			if (ch === ")") depth = Math.max(0, depth - 1);
			if (depth === 0 && (ch === "&" || ch === "|") && input[i + 1] === ch) {
				tokens.push({ type: "op", value: ch + ch });
				current = "";
				i += 1;
				continue;
			}
			current += ch;
		}
		if (current.trim()) tokens.push({ type: "part", value: current });
		return tokens;
	};

	const toSql = (fragment) => {
		const trimmed = String(fragment).trim();
		if (!trimmed) return null;
		// Buang kurung pembungkus, lalu proses isinya secara rekursif.
		if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
			const inner = trimmed.slice(1, -1).trim();
			const nested = toSql(inner);
			return nested ? `(${nested})` : null;
		}
		FILTER_TOKEN.lastIndex = 0;
		const match = FILTER_TOKEN.exec(trimmed);
		if (!match) return null;
		const [, field, op, dq, sq, num, bool] = match;
		const col = identifier(field);
		let raw = dq ?? sq;
		if (raw !== undefined) raw = raw.replace(/\\(.)/g, "$1");

		if (op === "~" || op === "!~") {
			params.push(`%${raw}%`);
			return `${col} ${op === "~" ? "LIKE" : "NOT LIKE"} ?`;
		}
		if (field === "id" && (op === "=" || op === "!=")) {
			// id disimpan sebagai string di kolom VARCHAR(15), jangan di-parse angka.
			params.push(String(raw ?? ""));
			return `${col} ${op === "=" ? "=" : "<>"} ?`;
		}
		const SQL_OP = { "=": "=", "!=": "<>", ">": ">", "<": "<", ">=": ">=", "<=": "<=" }[op];
		// FILTER_TOKEN menangkap literal `null` di grup 6, sama seperti `true`/`false`.
		const nullLiteral = bool === "null" ? true : undefined;
		if (bool !== undefined && bool !== "null") {
			params.push(bool === "true" ? 1 : 0);
			return `${col} ${SQL_OP} ?`;
		}
		if (num !== undefined) {
			params.push(Number(num));
			return `${col} ${SQL_OP} ?`;
		}
		// Membandingkan dengan null di SQL butuh IS NULL / IS NOT NULL.
		if (nullLiteral) {
			return `${col} IS ${op === "!=" ? "NOT " : ""}NULL`;
		}
		params.push(raw ?? null);
		return `${col} ${SQL_OP} ?`;
	};

	const tokens = tokenize(String(filter));
	let sql = "";
	let pendingOp = "&&";
	for (const token of tokens) {
		if (token.type === "op") {
			pendingOp = token.value;
			continue;
		}
		const clause = toSql(token.value);
		if (!clause) continue;
		if (!sql) {
			sql = clause;
			continue;
		}
		sql += ` ${pendingOp === "&&" ? "AND" : "OR"} ${clause}`;
		pendingOp = "&&";
	}
	if (!sql) return { sql: "", values: [] };
	return { sql, values: params };
}

function parseSort(sort, collection) {
	const fallback = SCHEMA[collection]?.order ?? "-created";
	const source = sort && String(sort).trim() ? String(sort) : fallback;
	return source
		.split(",")
		.map((token) => token.trim())
		.filter(Boolean)
		.map((token) => {
			const desc = token.startsWith("-");
			const field = token.replace(/^[+-]/, "");
			if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(field)) return null;
			return `${identifier(field)} ${desc ? "DESC" : "ASC"}`;
		})
		.filter(Boolean)
		.join(", ");
}

// ---------------------------------------------------------------------------
// Autentikasi: password hash + token sederhana (HMAC-SHA256)
// ---------------------------------------------------------------------------
const hashPassword = (password, salt) => {
	const useSalt = salt ?? randomBytes(8).toString("hex");
	const digest = createHash("sha256").update(`${useSalt}:${password}`).digest("hex");
	return `${useSalt}$${digest}`;
};

const verifyPassword = (password, stored) => {
	if (!stored || !stored.includes("$")) return false;
	const [salt] = stored.split("$");
	const candidate = hashPassword(password, salt);
	try {
		return timingSafeEqual(Buffer.from(candidate), Buffer.from(String(stored)));
	} catch {
		return false;
	}
};

const signToken = (payload) => {
	const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
	const signature = createHash("sha256").update(`${body}.${JWT_SECRET}`).digest("base64url");
	return `${body}.${signature}`;
};

const verifyToken = (token) => {
	if (!token || !token.includes(".")) return null;
	const [body, signature] = token.split(".");
	const expected = createHash("sha256").update(`${body}.${JWT_SECRET}`).digest("base64url");
	// Perbandingan timing-safe supaya signature tidak bisa ditebak
	// lewat perbedaan waktu respons.
	if (!constantTimeEqual(expected, signature)) return null;
	try {
		const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
		if (payload.exp && Date.now() / 1000 > payload.exp) return null;
		return payload;
	} catch {
		return null;
	}
};

/** Bandingkan dua string tanpa membocorkan panjang/waktu lewat timing. */
function constantTimeEqual(a, b) {
	const bufA = Buffer.from(String(a ?? ""), "utf8");
	const bufB = Buffer.from(String(b ?? ""), "utf8");
	// Panjang hash HMAC selalu sama; kalau beda, sudah pasti tidak cocok.
	if (bufA.length !== bufB.length) return false;
	return timingSafeEqual(bufA, bufB);
}

// ---------------------------------------------------------------------------
// Bootstrap tabel admin
// ---------------------------------------------------------------------------
async function ensureAdminTable() {
	await pool.query(`
		CREATE TABLE IF NOT EXISTS \`_admins\` (
			\`id\`       VARCHAR(15)  NOT NULL,
			\`email\`    VARCHAR(191) NOT NULL,
			\`password\` VARCHAR(191) NOT NULL,
			\`created\`  DATETIME     NULL,
			\`updated\`  DATETIME     NULL,
			PRIMARY KEY (\`id\`),
			UNIQUE KEY \`uq_admins_email\` (\`email\`)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
	`);

	// File branding (logo, favicon, gambar artikel).
	// Yang disimpan di MySQL hanya nama filenya; file aslinya di folder uploads/.
	await pool.query(`
		CREATE TABLE IF NOT EXISTS \`branding_files\` (
			\`id\`      VARCHAR(15)  NOT NULL,
			\`type\`    VARCHAR(64)  NOT NULL DEFAULT 'logo',
			\`file\`    VARCHAR(255) NULL,
			\`created\` DATETIME     NULL,
			\`updated\` DATETIME     NULL,
			PRIMARY KEY (\`id\`)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
	`);

	const [[{ c }]] = await pool.query("SELECT COUNT(*) AS c FROM `_admins`");
	if (Number(c) === 0) {
		const email = process.env.API_ADMIN_EMAIL || "admin@mba-laundry.com";
		const raw = process.env.API_ADMIN_PASSWORD || "Admin12345!";
		await pool.query("INSERT INTO `_admins` (`id`,`email`,`password`,`created`) VALUES (?,?,?,NOW())", [
			newRecordId(),
			email,
			hashPassword(raw),
		]);
		console.log(`[api] akun admin dibuat: ${email}`);
	}
}

// ---------------------------------------------------------------------------
// Migrasi ringan: tambah kolom yang belum ada tanpa menyentuh data lama.
// ---------------------------------------------------------------------------
async function ensureColumn(table, column, definition) {
	const cols = await tableColumns(table);
	if (cols.has(column)) return;
	await pool.query(`ALTER TABLE ${identifier(table)} ADD COLUMN ${identifier(column)} ${definition}`);
	// Cache kolom dibuat sebelum ALTER, jadi harus dibuang supaya kolom baru
	// langsung ikut terpakai oleh INSERT/UPDATE berikutnya.
	columnCache.delete(table);
	console.log(`[api] kolom ${table}.${column} ditambahkan`);
}

async function ensureContactColumns() {
	// Tabel ini sudah ada di database produksi, jadi cukup pastikan bentuknya
	// lengkap untuk halaman Bantuan (topik + detail laporan kehilangan).
	await pool.query(`
		CREATE TABLE IF NOT EXISTS \`contact_messages\` (
			\`id\`            VARCHAR(15)  NOT NULL,
			\`name\`          VARCHAR(191) NOT NULL,
			\`phone\`         VARCHAR(32)  NULL,
			\`email\`         VARCHAR(191) NULL,
			\`subject\`       VARCHAR(191) NULL,
			\`message\`       TEXT         NULL,
			\`topic\`         VARCHAR(24)  NULL,
			\`branch_id\`     VARCHAR(15)  NULL,
			\`incident_date\` DATE         NULL,
			\`machine_code\`  VARCHAR(32)  NULL,
			\`status\`        VARCHAR(16)  NOT NULL DEFAULT 'new',
			\`created\`       DATETIME     NULL,
			\`updated\`       DATETIME     NULL,
			PRIMARY KEY (\`id\`),
			KEY \`idx_contact_topic\` (\`topic\`),
			KEY \`idx_contact_status\` (\`status\`)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
	`);

	await ensureColumn("contact_messages", "topic", "VARCHAR(24) NULL");
	await ensureColumn("contact_messages", "branch_id", "VARCHAR(15) NULL");
	await ensureColumn("contact_messages", "incident_date", "DATE NULL");
	await ensureColumn("contact_messages", "machine_code", "VARCHAR(32) NULL");
}

// ---------------------------------------------------------------------------
// Jadwal shift karyawan (Smart Laundry Shift Scheduler)
// ---------------------------------------------------------------------------
async function ensureShiftTables() {
	await pool.query(`
		CREATE TABLE IF NOT EXISTS \`shift_employees\` (
			\`id\`           VARCHAR(15)  NOT NULL,
			\`branch_id\`    VARCHAR(15)  NOT NULL,
			\`name\`         VARCHAR(120) NOT NULL,
			\`phone\`        VARCHAR(32)  NULL,
			\`role\`         VARCHAR(32)  NOT NULL DEFAULT 'crew',
			\`status\`       VARCHAR(16)  NOT NULL DEFAULT 'active',
			\`can_night\`    TINYINT(1)   NOT NULL DEFAULT 1,
			\`allowed_shifts\` TEXT      NULL,
			\`sort_order\`   INT          NOT NULL DEFAULT 0,
			\`created\`      DATETIME     NULL,
			\`updated\`      DATETIME     NULL,
			PRIMARY KEY (\`id\`),
			KEY \`idx_shift_emp_branch\` (\`branch_id\`)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
	`);

	await pool.query(`
		CREATE TABLE IF NOT EXISTS \`shift_events\` (
			\`id\`               VARCHAR(15)  NOT NULL,
			\`employee_id\`      VARCHAR(15)  NOT NULL,
			\`branch_id\`        VARCHAR(15)  NOT NULL,
			\`date\`             DATE         NOT NULL,
			\`end_date\`         DATE         NULL,
			\`type\`             VARCHAR(16)  NOT NULL,
			\`note\`             VARCHAR(255) NULL,
			\`backup_available\` TINYINT(1)   NOT NULL DEFAULT 1,
			\`created\`          DATETIME     NULL,
			\`updated\`          DATETIME     NULL,
			PRIMARY KEY (\`id\`),
			KEY \`idx_shift_event_date\` (\`date\`),
			KEY \`idx_shift_event_emp\` (\`employee_id\`)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
	`);

	await pool.query(`
		CREATE TABLE IF NOT EXISTS \`shift_assignments\` (
			\`id\`            VARCHAR(15)  NOT NULL,
			\`branch_id\`     VARCHAR(15)  NOT NULL,
			\`date\`          DATE         NOT NULL,
			\`employee_id\`   VARCHAR(15)  NULL,
			\`employee_name\` VARCHAR(120) NOT NULL,
			\`shift\`         VARCHAR(16)  NOT NULL,
			\`start_time\`    VARCHAR(8)   NOT NULL,
			\`end_time\`      VARCHAR(8)   NOT NULL,
			\`hours\`         INT          NOT NULL DEFAULT 8,
			\`is_backup\`     TINYINT(1)   NOT NULL DEFAULT 0,
			\`is_emergency\`  TINYINT(1)   NOT NULL DEFAULT 0,
			\`note\`          VARCHAR(255) NULL,
			\`created\`       DATETIME     NULL,
			\`updated\`       DATETIME     NULL,
			PRIMARY KEY (\`id\`),
			KEY \`idx_shift_asg_date\` (\`date\`),
			KEY \`idx_shift_asg_branch\` (\`branch_id\`)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
	`);

	await pool.query(`
		CREATE TABLE IF NOT EXISTS \`admin_login_logs\` (
			\`id\`          VARCHAR(15)  NOT NULL,
			\`admin_email\` VARCHAR(191) NOT NULL,
			\`ip_address\`  VARCHAR(64)  NOT NULL,
			\`device\`      VARCHAR(120) NOT NULL,
			\`user_agent\`  TEXT         NULL,
			\`status\`      VARCHAR(24)  NOT NULL,
			\`fail_reason\` VARCHAR(255) NULL,
			\`created_wib\` VARCHAR(64)  NOT NULL,
			\`created\`     DATETIME     NOT NULL,
			PRIMARY KEY (\`id\`),
			KEY \`idx_login_logs_created\` (\`created\`),
			KEY \`idx_login_logs_email\` (\`admin_email\`)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
	`);

	await pool.query(`
		CREATE TABLE IF NOT EXISTS \`admin_activity_logs\` (
			\`id\`          VARCHAR(15)  NOT NULL,
			\`admin_email\` VARCHAR(191) NOT NULL,
			\`action\`      VARCHAR(32)  NOT NULL,
			\`collection\`  VARCHAR(64)  NOT NULL,
			\`target_id\`   VARCHAR(64)  NULL,
			\`summary\`     VARCHAR(255) NOT NULL,
			\`details\`     TEXT         NULL,
			\`ip_address\`  VARCHAR(64)  NOT NULL,
			\`device\`      VARCHAR(120) NOT NULL,
			\`created_wib\` VARCHAR(64)  NOT NULL,
			\`created\`     DATETIME     NOT NULL,
			PRIMARY KEY (\`id\`),
			KEY \`idx_act_logs_created\` (\`created\`),
			KEY \`idx_act_logs_email\` (\`admin_email\`),
			KEY \`idx_act_logs_col\` (\`collection\`)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
	`);

	// Database lama belum punya kolom allowed_shifts — tambahkan tanpa
	// menghapus data yang sudah ada.
	await ensureColumn("shift_employees", "allowed_shifts", "TEXT NULL");

	// Kolom kode unik link jadwal internal karyawan per-cabang
	await ensureColumn("branches", "schedule_token", "VARCHAR(32) NULL");
	try {
		const [branchRows] = await pool.query("SELECT `id`, `slug`, `schedule_token` FROM `branches`");
		for (const b of branchRows) {
			if (!b.schedule_token) {
				const uniqueToken = createHash("sha256")
					.update(b.id + (b.slug || "") + (process.env.API_JWT_SECRET || "mba-secret"))
					.digest("hex")
					.slice(0, 10);
				await pool.query("UPDATE `branches` SET `schedule_token` = ? WHERE `id` = ?", [uniqueToken, b.id]);
			}
		}
	} catch (e) {
		logError("ensure branch schedule_token", e);
	}

	// Dua cabang resmi: Bohar dan Pagesangan. Kalau tabel branches kosong,
	// buat supaya penjadwalan bisa langsung dipakai.
	const [[{ c }]] = await pool.query("SELECT COUNT(*) AS c FROM \`branches\`");
	if (Number(c) === 0) {
		const seeds = [
			{ id: newRecordId(), name: "MBA Laundry Bohar", slug: "bohar" },
			{ id: newRecordId(), name: "MBA Laundry Pagesangan", slug: "pagesangan" },
		];
		for (const seed of seeds) {
			await pool.query(
				"INSERT INTO \`branches\` (\`id\`,\`name\`,\`slug\`,\`address\`,\`is_active\`,\`status\`,\`sort_order\`,\`created\`) VALUES (?,?,?,'-',1,'buka',0,NOW())",
				[seed.id, seed.name, seed.slug],
			);
		}
		console.log("[api] cabang awal dibuat: Bohar, Pagesangan");
	}
}

// ---------------------------------------------------------------------------
// Upload file
// ---------------------------------------------------------------------------
// Hanya ekstensi gambar & dokumen aman. File .html/.js tidak diizinkan karena
// bisa dipakai untuk stored XSS kalau dibuka langsung dari /api/files.
// .svg diizinkan (dipakai logo/favicon) tapi selalu disajikan dengan CSP ketat
// yang mematikan script di dalamnya.
const ALLOWED_UPLOAD_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".ico", ".svg", ".pdf"]);

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
	filename: (_req, file, cb) => {
		const ext = extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, "");
		cb(null, `${randomBytes(10).toString("hex")}${ext}`);
	},
});
const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024, files: 10, fields: 60 },
	fileFilter: (_req, file, cb) => {
		const ext = extname(file.originalname).toLowerCase();
		const mimeOk =
			/^image\/(jpeg|png|webp|gif|avif|svg\+xml|x-icon|vnd\.microsoft\.icon)$/.test(file.mimetype) ||
			file.mimetype === "application/pdf";
		if (!ALLOWED_UPLOAD_EXT.has(ext) || !mimeOk) {
			return cb(new Error("Tipe file tidak diizinkan. Hanya gambar atau PDF."));
		}
		cb(null, true);
	},
});

// Kebijakan CSP untuk HTML aplikasi. Respons API tetap memakai STRICT_CSP.
//
// Catatan tiap directive:
// - script-src 'unsafe-inline': index.html punya satu <script> inline
//   (menentukan favicon dari localStorage). Bundle sendiri TIDAK memakai eval,
//   jadi eval tetap diblokir.
// - style-src 'unsafe-inline': React/Ant Design menulis style inline.
// - connect-src: fetch ke API wilayah Indonesia (filter cabang) + Google
//   Analytics kalau GOOGLE_ANALYTICS_ID diisi.
// - img-src https:: gambar cabang & blog boleh dari URL mana pun yang diisi
//   admin lewat /admin/cabang.
// - frame-src: peta cabang dirender sebagai <iframe> Google Maps.
const WILAYAH_API_ORIGIN = "https://novalbahri17.github.io";
const SPA_CSP = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"font-src 'self' data: https://fonts.gstatic.com",
	"img-src 'self' data: blob: https:",
	[
		"connect-src 'self'",
		WILAYAH_API_ORIGIN,
		"https://www.google-analytics.com",
		"https://region1.google-analytics.com",
	].join(" "),
	"frame-src 'self' https://www.google.com https://maps.google.com",
	"worker-src 'self'",
	"manifest-src 'self'",
	"media-src 'self' https:",
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
	"upgrade-insecure-requests",
].join("; ");

// CSP ketat untuk respons non-HTML (API, upload, file).
const STRICT_CSP = "default-src 'none'; img-src 'self' data:; frame-ancestors 'none'";

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
const app = express();
// Jangan pernah membocorkan teknologi yang dipakai.
app.disable("x-powered-by");
// Di belakang reverse proxy (nginx), supaya req.ip / x-forwarded-for benar.
app.set("trust proxy", 1);

app.use((req, res, next) => {
	// Header keamanan dasar untuk semua respons.
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
	res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
	res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=()");
	// HTML aplikasi butuh CSP lebih longgar daripada API.
	const isAppAsset = !req.path.startsWith("/api/") && !req.path.startsWith("/uploads/");
	res.setHeader("Content-Security-Policy", isAppAsset ? SPA_CSP : STRICT_CSP);
	if (IS_PRODUCTION) {
		res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
	}
	if (req.path.startsWith("/api/")) res.setHeader("Cache-Control", "no-store");

	// CORS: hanya origin yang dikenal. Request tanpa Origin (curl, server-side)
	// tetap dilayani karena tidak mengirim kredensial browser.
	const origin = (req.headers.origin || "").replace(/\/+$/, "");
	if (origin && ALLOWED_ORIGINS.has(origin)) {
		res.setHeader("Access-Control-Allow-Origin", origin);
		res.setHeader("Vary", "Origin");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
		res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
		res.setHeader("Access-Control-Max-Age", "600");
	}
	next();
});
app.options(/.*/, (req, res) => {
	const origin = (req.headers.origin || "").replace(/\/+$/, "");
	if (!origin || ALLOWED_ORIGINS.has(origin)) return res.sendStatus(204);
	res.sendStatus(403);
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "256kb" }));

// Log setiap error ke terminal supaya penyebab 500 langsung kelihatan.
const logError = (where, error) => {
	console.error(`[api] ERROR ${where}: ${error.code ?? ""} ${error.message}`);
};

app.get("/api/health", (_req, res) => {
	res.json({ code: 200, message: "API is healthy.", data: {} });
});

// --- translate -----------------------------------------------------------
app.get(
	"/api/translate",
	rateLimitMiddleware({ name: "translate", limit: 240, windowMs: 60_000 }),
	handleTranslate,
);

// --- auth -----------------------------------------------------------------
app.post(
	"/api/collections/_superusers/auth-with-password",
	async (req, res) => {
		const ip = clientIp(req);
		const ua = req.headers["user-agent"];
		const device = parseDevice(ua);

		const retryAfter = loginBlocked(req);
		if (retryAfter > 0) {
			res.setHeader("Retry-After", String(retryAfter));
			await recordLoginLog({
				email: String(req.body?.identity ?? req.body?.email ?? "").slice(0, 191),
				ip,
				device,
				ua,
				status: "locked",
				reason: `Terkunci limit percobaan. Coba lagi ${Math.ceil(retryAfter / 60)} menit lagi.`,
			});
			return jsonError(res, 429, "Terlalu banyak percobaan login. Coba lagi 15 menit lagi.");
		}

		const identity = req.body?.identity ?? req.body?.email;
		const password = req.body?.password;
		if (!identity || !password) return jsonError(res, 400, "Email dan password wajib diisi.");
		if (String(identity).length > 191 || String(password).length > 200) {
			return jsonError(res, 400, "Failed to authenticate.");
		}

		try {
			const [rows] = await pool.query("SELECT * FROM `_admins` WHERE `email` = ? LIMIT 1", [String(identity)]);
			const admin = rows[0];
			if (!admin || !verifyPassword(String(password), admin.password)) {
				// Yang dihitung hanya percobaan gagal, jadi login yang berhasil
				// tidak pernah ikut mengunci akun sendiri.
				registerLoginFailure(req);
				await recordLoginLog({
					email: String(identity),
					ip,
					device,
					ua,
					status: "failed",
					reason: !admin ? "Email tidak terdaftar" : "Password salah",
				});
				// Pesan sengaja sama supaya tidak bisa dipakai menebak email mana
				// yang terdaftar.
				return jsonError(res, 400, "Failed to authenticate.");
			}

			const token = signToken({
				id: admin.id,
				email: admin.email,
				type: "superuser",
				exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
			});

			await recordLoginLog({
				email: admin.email,
				ip,
				device,
				ua,
				status: "success",
				reason: null,
			});

			await recordActivityLog({
				email: admin.email,
				action: "login",
				collection: "_superusers",
				targetId: admin.id,
				summary: `Login berhasil ke panel admin`,
				details: JSON.stringify({ ip, device, wib: getIndoRealTime() }),
				ip,
				device,
			});

			res.json({
				token,
				record: { id: admin.id, email: admin.email, collectionName: "_superusers" },
				admin: { id: admin.id, email: admin.email },
			});
		} catch (error) {
			logError("login", error);
			jsonError(res, 500, "Database error.");
		}
	},
);

app.post(
	"/api/collections/_superusers/update",
	rateLimitMiddleware({ name: "admin-update", limit: 10, windowMs: 15 * 60 * 1000 }),
	async (req, res) => {
		const auth = verifyToken(bearerToken(req));
		if (!auth) return jsonError(res, 401, "Unauthorized");
		const { email, password, currentPassword } = req.body ?? {};
		if (String(password ?? "").length > 200 || String(email ?? "").length > 191) {
			return jsonError(res, 400, "Data tidak valid.");
		}
		if (email && !EMAIL_RE.test(String(email))) return jsonError(res, 400, "Format email tidak valid.");
		if (password && String(password).length < 8) return jsonError(res, 400, "Password minimal 8 karakter.");
		const [rows] = await pool.query("SELECT * FROM `_admins` WHERE `id` = ? LIMIT 1", [auth.id]);
		if (!rows[0] || !verifyPassword(String(currentPassword ?? ""), rows[0].password)) {
			return jsonError(res, 400, "Password lama tidak cocok.");
		}
		const nextEmail = email ? String(email) : rows[0].email;
		const nextPassword = password ? hashPassword(String(password)) : rows[0].password;
		await pool.query("UPDATE `_admins` SET `email` = ?, `password` = ?, `updated` = NOW() WHERE `id` = ?", [
			nextEmail,
			nextPassword,
			auth.id,
		]);
		res.json({ id: auth.id, email: nextEmail, collectionName: "_superusers" });
	},
);

function bearerToken(req) {
	const header = req.get("authorization") || "";
	return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

/**
 * Cek hak akses. Mengembalikan true kalau boleh lanjut.
 * Kalau tidak boleh, respons 401/403 sudah dikirim dan hasilnya false.
 */
function enforceAccess(req, res, collection, action) {
	if (isPublicAction(collection, action)) return true;
	if (verifyToken(bearerToken(req))) return true;
	jsonError(res, 401, "Unauthorized");
	return false;
}

// ---------------------------------------------------------------------------
// Auto-translate
// ---------------------------------------------------------------------------
// Konten publik di MySQL ditulis admin dalam bahasa Indonesia. Saat pengunjung
// memilih bahasa Inggris, teks dari database perlu diterjemahkan otomatis.
//
// Alur:
//   GET /api/translate?target=en&q=<teks>&q=<teks>...
//     -> ambil dari tabel `translations` (cache permanen di MySQL)
//     -> yang belum ada, terjemahkan lewat Google Translate (tanpa API key),
//        lalu simpan ke tabel supaya tidak pernah diterjemahkan dua kali.
//
// Hasil terjemahan disimpan permanen, jadi biaya/latensi hanya muncul sekali
// per teks. Kalau layanan penerjemah tidak bisa dihubungi, endpoint tetap
// membalas 200 dengan teks asli supaya halaman tidak rusak.
const TRANSLATION_PROVIDER = "https://clients5.google.com/translate_a/t?client=dict-chrome-ex";
const TRANSLATE_BATCH_LIMIT = 60;
const TRANSLATE_WAVE = 25;
const TRANSLATE_TEXT_LIMIT = 1500;
// Jangan buang kuota penerjemah untuk teks yang tidak perlu diterjemahkan.
const TRANSLATE_SKIP_RE = /^[\s\d\p{P}\p{S}]*$/u;

async function ensureTranslationTable() {
	await pool.query(`
		CREATE TABLE IF NOT EXISTS \`translations\` (
			\`source_hash\` CHAR(40)     NOT NULL,
			\`source_lang\` VARCHAR(8)   NOT NULL DEFAULT 'id',
			\`target_lang\` VARCHAR(8)   NOT NULL DEFAULT 'en',
			\`source_text\` TEXT         NOT NULL,
			\`translated\`  TEXT         NOT NULL,
			\`created\`     DATETIME     NULL,
			\`updated\`     DATETIME     NULL,
			PRIMARY KEY (\`source_hash\`,\`target_lang\`),
			KEY \`idx_translations_target\` (\`target_lang\`)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
	`);
	columnCache.delete("translations");
}

const translationHash = (text, target) => createHash("sha1").update(`${target}\u0000${text}`).digest("hex");

/**
 * Ambil terjemahan dari cache MySQL untuk sekumpulan teks.
 * Mengembalikan Map<teks asli, terjemahan>.
 */
async function readTranslationCache(texts, target) {
	if (texts.length === 0) return new Map();
	const hashes = texts.map((text) => translationHash(text, target));
	const [rows] = await pool.query(
		"SELECT `source_hash`, `translated` FROM `translations` WHERE `target_lang` = ? AND `source_hash` IN (?)",
		[target, hashes],
	);
	const byHash = new Map(rows.map((row) => [row.source_hash, row.translated]));
	const out = new Map();
	for (const text of texts) {
		const hit = byHash.get(translationHash(text, target));
		if (hit) out.set(text, hit);
	}
	return out;
}

async function writeTranslationCache(pairs, target) {
	if (pairs.length === 0) return;
	const values = pairs.map(([source, translated]) => [
		translationHash(source, target),
		"id",
		target,
		source,
		translated,
	]);
	await pool.query(
		"INSERT INTO `translations` (`source_hash`,`source_lang`,`target_lang`,`source_text`,`translated`,`created`,`updated`) VALUES ? ON DUPLICATE KEY UPDATE `translated`=VALUES(`translated`), `updated`=NOW()",
		[values],
	);
}

const TRANSLATION_HEADERS = {
	// Tanpa header ini Google kadang membalas 403.
	"User-Agent":
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
	Accept: "application/json,text/plain,*/*",
};

/** Satu teks per panggilan (dipakai sebagai cadangan / untuk teks panjang). */
/**
 * Terjemahkan satu atau banyak teks dalam SATU request.
 *
 * Endpoint `clients5` menerima parameter `q` berulang dan membalas array JSON
 * ("a", "b", "c") yang urutannya sama dengan urutan `q`. Kalau hanya satu `q`
 * yang dikirim, balasannya berupa array berisi satu string.
 *
 * Mengembalikan array sepanjang `texts`; item bernilai null kalau gagal.
 */
async function translateMany(texts, target) {
	if (texts.length === 0) return [];
	const params = new URLSearchParams();
	params.set("sl", "id");
	params.set("tl", target);
	for (const text of texts) params.append("q", text);
	const url = `${TRANSLATION_PROVIDER}&${params.toString()}`;
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 12_000);
	try {
		const response = await fetch(url, { signal: controller.signal, headers: TRANSLATION_HEADERS });
		if (!response.ok) {
			logError("translate http", new Error(`status ${response.status}`));
			return texts.map(() => null);
		}
		const payload = await response.json();
		const list = Array.isArray(payload) ? payload : [payload];
		// Balasan bisa diratakan (semua teks dalam satu array) — cocokkan per urutan.
		const flat = list.flat().map((item) => (typeof item === "string" ? item.trim() : null));
		return texts.map((_text, index) => flat[index] || null);
	} catch (error) {
		logError("translate fetch", error);
		return texts.map(() => null);
	} finally {
		clearTimeout(timer);
	}
}

/** Satu teks saja (dipakai untuk teks panjang / cadangan). */
async function translateOne(text, target) {
	const [result] = await translateMany([text], target);
	return result;
}

/**
 * Terjemahkan kumpulan teks. Dipecah per gelombang supaya URL tidak terlalu
 * panjang; tiap gelombang hanya perlu satu request.
 */
async function translateBatch(texts, target) {
	const results = new Array(texts.length).fill(null);
	for (let index = 0; index < texts.length; index += TRANSLATE_WAVE) {
		const slice = texts.slice(index, index + TRANSLATE_WAVE);
		const translated = await translateMany(slice, target);
		translated.forEach((value, offset) => {
			results[index + offset] = value;
		});
	}
	return results;
}

async function translateViaGoogle(text, target) {
	const [result] = await translateBatch([text], target);
	return result ?? null;
}

async function handleTranslate(req, res) {
	const rawTarget = String(req.query.target ?? "en").toLowerCase();
	const target = /^[a-z]{2}(-[a-z]{2})?$/.test(rawTarget) ? rawTarget : "en";
	const sourceLang = String(req.query.source ?? "id").toLowerCase();
	const rawTexts = Array.isArray(req.query.q) ? req.query.q : [req.query.q];
	const texts = [];
	const seen = new Set();
	for (const item of rawTexts) {
		const text = String(item ?? "").trim();
		if (!text || text.length > TRANSLATE_TEXT_LIMIT) continue;
		if (TRANSLATE_SKIP_RE.test(text)) continue;
		if (seen.has(text)) continue;
		seen.add(text);
		texts.push(text);
		if (texts.length >= TRANSLATE_BATCH_LIMIT) break;
	}

	// Tidak ada yang perlu diterjemahkan -> balas kosong, bukan error.
	if (texts.length === 0) {
		return res.json({ translations: {}, failed: false, pending: 0 });
	}

	let cached = new Map();
	try {
		cached = await readTranslationCache(texts, target);
	} catch (error) {
		logError("translate cache read", error);
	}

	const missing = texts.filter((text) => !cached.has(text));
	const translations = {};
	for (const [source, translated] of cached) translations[source] = translated;

	if (missing.length > 0) {
		const fetched = await translateBatch(missing, target);
		const fresh = [];
		missing.forEach((text, index) => {
			const translated = fetched[index];
			if (translated) {
				translations[text] = translated;
				fresh.push([text, translated]);
			}
		});
		if (fresh.length > 0) {
			try {
				await writeTranslationCache(fresh, target);
			} catch (error) {
				logError("translate cache write", error);
			}
		}
		if (IS_PRODUCTION && fresh.length === 0) {
			console.warn(`[api] translate: ${missing.length} teks gagal diterjemahkan (layanan tidak merespons)`);
		}
	}

	res.json({
		translations,
		failed: missing.some((text) => translations[text] === undefined),
		pending: missing.filter((text) => translations[text] === undefined).length,
		source: sourceLang,
		target,
	});
}

// Kolom teknis yang tidak pernah perlu diterjemahkan.
const TRANSLATE_EXCLUDED_COLUMNS = new Set([
	"id",
	"created",
	"updated",
	"slug",
	"key",
	"email",
	"phone",
	"whatsapp",
	"category",
	"status",
	"type",
	"topic",
	"group",
	"source",
	"code",
	"color",
	"icon",
	"url",
	"link",
	"image",
	"photo",
	"file",
	"thumbnail",
	"cover_image",
	"map_url",
	"machine_code",
	"branch_id",
	"tags",
	"content",
]);

/** Teks (bukan HTML/kode) yang layak diterjemahkan? */
const isTranslatableValue = (key, value) => {
	if (typeof value !== "string") return false;
	if (!value.trim()) return false;
	if (TRANSLATE_EXCLUDED_COLUMNS.has(key)) return false;
	if (key.endsWith("_url") || key.endsWith("_id") || key.endsWith("_at")) return false;
	// HTML, URL, dan path file tidak boleh diterjemahkan.
	if (/[<>]/.test(value)) return false;
	if (/^(https?:|data:|blob:|\/)/.test(value)) return false;
	if (/^[\w.-]+@[\w.-]+$/.test(value)) return false;
	return !TRANSLATE_SKIP_RE.test(value);
};

/**
	 * Tambahkan pasangan `<kolom>__en` berisi terjemahan untuk setiap kolom teks
	 * yang bisa dibaca manusia. Hanya membaca cache; tidak memanggil penerjemah.
	 * Baris yang belum punya terjemahan tetap dikirim apa adanya.
	 */
async function localizeRecords(_collection, items, target) {
	const texts = [];
	for (const item of items) {
		for (const [key, value] of Object.entries(item)) {
			if (isTranslatableValue(key, value)) texts.push(value);
		}
	}
	if (texts.length === 0) return items;
	const cache = await readTranslationCache([...new Set(texts)], target).catch(() => new Map());
	return items.map((item) => {
		const localized = { ...item };
		for (const [key, value] of Object.entries(item)) {
			if (!isTranslatableValue(key, value)) continue;
			const hit = cache.get(value);
			if (hit) localized[`${key}__en`] = hit;
		}
		return localized;
	});
}

// --- files ----------------------------------------------------------------
// Cari file di UPLOAD_DIR dan folder mount volume alternatif (/app/upload maupun /app/uploads).
app.get("/api/files/:collection/:recordId/:filename", async (req, res) => {
	const { filename } = req.params;
	if (!/^[A-Za-z0-9._-]+$/.test(filename)) return res.sendStatus(400);

	const candidateRoots = [
		resolve(UPLOAD_DIR),
		resolve(process.cwd(), "uploads"),
		resolve(process.cwd(), "upload"),
		"/app/uploads",
		"/app/upload",
	].filter((dir, idx, arr) => arr.indexOf(dir) === idx && existsSync(dir));

	for (const root of candidateRoots) {
		const local = resolve(root, filename);
		if (local.startsWith(root + sep) && existsSync(local)) {
			res.setHeader("Cache-Control", "public, max-age=86400, immutable");
			// SVG bisa berisi script. Saat dibuka langsung, script itu tidak boleh jalan.
			if (extname(local).toLowerCase() === ".svg") {
				res.setHeader("Content-Type", "image/svg+xml");
				res.setHeader("Content-Disposition", "inline");
				res.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox");
			}
			return res.sendFile(local);
		}
	}

	res.sendStatus(404);
});

// Route akses file langsung (/uploads/:filename dan /upload/:filename)
app.use("/uploads", express.static(UPLOAD_DIR));
app.use("/upload", express.static(UPLOAD_DIR));
if (existsSync("/app/upload")) {
	app.use("/uploads", express.static("/app/upload"));
	app.use("/upload", express.static("/app/upload"));
}
if (existsSync("/app/uploads")) {
	app.use("/uploads", express.static("/app/uploads"));
	app.use("/upload", express.static("/app/uploads"));
}

// --- generic collection CRUD ---------------------------------------------
app.get("/api/collections/:collection/records", async (req, res) => {
	const { collection } = req.params;
	const table = SCHEMA[collection];
	if (!table) return jsonError(res, 404, `Collection "${collection}" tidak dikenal.`);
	if (!enforceAccess(req, res, collection, "read")) return;
	const isPublicReader = isPublicAction(collection, "read");
	const selectCols = selectColumnsFor(collection, isPublicReader);

	try {
		const page = Math.max(1, Number(req.query.page || 1));
		const perPage = Math.min(500, Math.max(1, Number(req.query.perPage || 20)));
		const params = [];
		const { sql: whereSql, values } = parseFilter(req.query.filter, params);
		const orderBy = parseSort(req.query.sort, collection);

		const where = whereSql ? ` WHERE ${whereSql}` : "";
		// Pengunjung tanpa login hanya boleh melihat testimoni yang sudah
		// disetujui. Filter ini dipaksa di server, tidak bisa dilewati klien.
		const forced = isPublicReader && collection === "testimonials" ? "`is_approved` = 1" : "";
		const finalWhere = forced ? (where ? `${where} AND ${forced}` : ` WHERE ${forced}`) : where;
		const [[{ total }]] = await pool.query(
			`SELECT COUNT(*) AS total FROM ${identifier(collection)}${finalWhere}`,
			values,
		);
		const [rows] = await pool.query(
			`SELECT ${selectCols} FROM ${identifier(collection)}${finalWhere} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
			[...values, perPage, (page - 1) * perPage],
		);

		let items = rows.map((row) => fromDb(collection, row));
		// ?lang=en -> setiap kolom teks mendapat pasangan `<kolom>__en` berisi
		// terjemahan dari cache `translations`. Frontend memilih versi Inggris
		// lewat helper `pickText()`. Tanpa parameternya, respons tidak berubah.
		if (isPublicReader && String(req.query.lang ?? "").toLowerCase().startsWith("en")) {
			try {
				items = await localizeRecords(collection, items, "en");
			} catch (error) {
				logError(`translate ${collection}`, error);
			}
		}

		res.json({
			page,
			perPage,
			totalItems: Number(total),
			totalPages: Math.max(1, Math.ceil(Number(total) / perPage)),
			items,
		});
	} catch (error) {
		logError(`list ${collection}`, error);
		jsonError(res, 500, error.message);
	}
});

app.get("/api/collections/:collection/records/:id", async (req, res) => {
	const { collection, id } = req.params;
	if (!SCHEMA[collection]) return jsonError(res, 404, `Collection "${collection}" tidak dikenal.`);
	if (!enforceAccess(req, res, collection, "read")) return;
	const isPublicReader = isPublicAction(collection, "read");
	const selectCols = selectColumnsFor(collection, isPublicReader);
	// Testimoni yang belum di-approve tidak boleh terlihat tanpa login.
	const forced = isPublicReader && collection === "testimonials" ? " AND `is_approved` = 1" : "";
	try {
		const [rows] = await pool.query(
			`SELECT ${selectCols} FROM ${identifier(collection)} WHERE \`id\` = ?${forced} LIMIT 1`,
			[id],
		);
		if (!rows[0]) return jsonError(res, 404, "Record tidak ditemukan.");
		res.json(fromDb(collection, rows[0]));
	} catch (error) {
		logError(`get ${collection}`, error);
		jsonError(res, 500, error.message);
	}
});

async function writeRecord(req, res, mode) {
	const { collection } = req.params;
	const id = req.params.id;
	if (!SCHEMA[collection]) return jsonError(res, 404, `Collection "${collection}" tidak dikenal.`);

	// Hak tulis diambil dari SCHEMA[collection].auth. Default "admin".
	// Pengunjung tanpa login hanya boleh create pada koleksi form publik
	// (contact_messages, partnerships, testimonials, spin_plays).
	const action = mode === "create" ? "create" : "update";
	if (!enforceAccess(req, res, collection, action)) return;

	try {
		const isPublicWrite = isPublicAction(collection, action);
		let payload;

		if (isPublicWrite) {
			// Payload dari pengunjung tanpa login dibersihkan & divalidasi ulang
			// di server. Frontend tidak bisa dipercaya.
			const result = await sanitizePublicPayload(collection, req.body);
			if (!result.ok) return jsonError(res, 400, result.error);
			payload = result.data;
		} else {
			payload = { ...req.body };
			// multipart/form-data mengirim nilai sebagai string
			for (const key of Object.keys(payload)) {
				if (typeof payload[key] === "string" && (payload[key] === "true" || payload[key] === "false")) {
					if (BOOLEAN_FIELDS[key]) payload[key] = payload[key] === "true";
				}
			}
			if (req.files?.length) {
				for (const file of req.files) {
					payload[file.fieldname] = file.filename;
				}
			}
		}

		let recordId = id;

		if (mode === "create") {
			recordId = payload.id && /^[A-Za-z0-9]{15}$/.test(payload.id) ? payload.id : newRecordId();
			const fields = await filterToColumns(collection, toDb(collection, payload));
			const cols = ["id", ...Object.keys(fields)];
			const vals = [recordId, ...Object.values(fields)];
			if (cols.includes("created") === false && (await tableColumns(collection)).has("created")) {
				cols.push("created");
				vals.push(new Date());
			}
			if (cols.includes("updated") === false && (await tableColumns(collection)).has("updated")) {
				cols.push("updated");
				vals.push(new Date());
			}
			await pool.query(
				`INSERT INTO ${identifier(collection)} (${cols.map(identifier).join(",")}) VALUES (${cols.map(() => "?").join(",")})`,
				vals,
			);
		} else {
			const fields = await filterToColumns(collection, toDb(collection, payload));
			const keys = Object.keys(fields);
			const sets = keys.map((k) => `${identifier(k)} = ?`);
			const vals = [...Object.values(fields)];
			if ((await tableColumns(collection)).has("updated") && !keys.includes("updated")) {
				sets.push(`${identifier("updated")} = ?`);
				vals.push(new Date());
			}
			if (sets.length) {
				await pool.query(
					`UPDATE ${identifier(collection)} SET ${sets.join(", ")} WHERE \`id\` = ?`,
					[...vals, recordId],
				);
			}
		}

		const [found] = await pool.query(`SELECT * FROM ${identifier(collection)} WHERE \`id\` = ? LIMIT 1`, [
			recordId,
		]);
		const row = found[0];
		if (!row) return jsonError(res, 404, "Record tidak ditemukan.");

		// Catat log aktivitas jika aksi dilakukan oleh admin
		const authHeader = bearerToken(req);
		const adminAuth = authHeader ? verifyToken(authHeader) : null;
		if (adminAuth && !isPublicWrite) {
			const summary = generateActivitySummary(collection, mode, payload, recordId);
			const ip = clientIp(req);
			const device = parseDevice(req.headers["user-agent"]);
			recordActivityLog({
				email: adminAuth.email || "admin",
				action: mode,
				collection,
				targetId: recordId,
				summary,
				details: JSON.stringify(payload).slice(0, 3000),
				ip,
				device,
			}).catch(() => {});
		}

		res.json(fromDb(collection, row));
	} catch (error) {
		logError(`write ${collection}`, error);
		jsonError(res, 400, error.message);
	}
}

const uploadMiddleware = upload.any();

/**
 * Dipasang SEBELUM multer. Kalau request tanpa login (form publik), file upload
 * tidak diizinkan sama sekali supaya orang tidak bisa menumpuk file di server.
 */
function guardPublicUpload(req, res, next) {
	const { collection } = req.params;
	const action = req.method === "POST" ? "create" : "update";
	if (!SCHEMA[collection]) return jsonError(res, 404, `Collection "${collection}" tidak dikenal.`);
	if (isPublicAction(collection, action)) {
		const contentType = String(req.headers["content-type"] ?? "");
		if (contentType.startsWith("multipart/form-data")) {
			return jsonError(res, 400, "Form publik tidak menerima upload file.");
		}
		return next();
	}
	// Admin: token dicek dulu supaya file tidak ditulis untuk request anonim.
	if (!enforceAccess(req, res, collection, action)) return;
	next();
}

// Pembatas khusus form publik: 5 kiriman / 10 menit / IP.
const publicFormLimiter = rateLimitMiddleware({
	name: "public-form",
	limit: 5,
	windowMs: 10 * 60 * 1000,
	message: "Terlalu banyak kiriman. Coba lagi beberapa menit lagi.",
});

app.post(
	"/api/collections/:collection/records",
	(req, res, next) => guardPublicUpload(req, res, next),
	(req, res, next) => {
		const { collection } = req.params;
		if (!SCHEMA[collection] || isPublicAction(collection, "create")) return publicFormLimiter(req, res, next);
		next();
	},
	uploadMiddleware,
	(req, res) => writeRecord(req, res, "create"),
);
app.patch(
	"/api/collections/:collection/records/:id",
	(req, res, next) => guardPublicUpload(req, res, next),
	uploadMiddleware,
	(req, res) => writeRecord(req, res, "update"),
);

app.delete("/api/collections/:collection/records/:id", async (req, res) => {
	const { collection, id } = req.params;
	if (!SCHEMA[collection]) return jsonError(res, 404, `Collection "${collection}" tidak dikenal.`);
	if (!enforceAccess(req, res, collection, "delete")) return;
	try {
		const [rows] = await pool.query(`SELECT * FROM ${identifier(collection)} WHERE \`id\` = ? LIMIT 1`, [id]);
		const spec = SCHEMA[collection] ?? {};
		for (const field of spec.file ?? []) {
			const name = rows[0]?.[field];
			if (typeof name === "string" && /^[A-Za-z0-9._-]+$/.test(name)) {
				await unlink(join(UPLOAD_DIR, name)).catch(() => {});
			}
		}
		await pool.query(`DELETE FROM ${identifier(collection)} WHERE \`id\` = ?`, [id]);

		const authHeader = bearerToken(req);
		const adminAuth = authHeader ? verifyToken(authHeader) : null;
		if (adminAuth) {
			const ip = clientIp(req);
			const device = parseDevice(req.headers["user-agent"]);
			recordActivityLog({
				email: adminAuth.email || "admin",
				action: "delete",
				collection,
				targetId: id,
				summary: `Menghapus data di ${collection} (ID: ${id})`,
				details: JSON.stringify(rows[0] ?? {}).slice(0, 3000),
				ip,
				device,
			}).catch(() => {});
		}

		res.sendStatus(204);
	} catch (error) {
		logError(`delete ${collection}`, error);
		jsonError(res, 500, error.message);
	}
});

// --- logs endpoints --------------------------------------------------------
app.get("/api/admin/login-logs", async (req, res) => {
	const auth = verifyToken(bearerToken(req));
	if (!auth) return jsonError(res, 401, "Unauthorized");
	const limit = Math.min(Number(req.query.limit || 200), 1000);
	try {
		const [rows] = await pool.query("SELECT * FROM `admin_login_logs` ORDER BY `created` DESC LIMIT ?", [limit]);
		res.json({ items: rows });
	} catch (error) {
		logError("get login-logs", error);
		jsonError(res, 500, error.message);
	}
});

app.get("/api/admin/activity-logs", async (req, res) => {
	const auth = verifyToken(bearerToken(req));
	if (!auth) return jsonError(res, 401, "Unauthorized");
	const limit = Math.min(Number(req.query.limit || 200), 1000);
	try {
		const [rows] = await pool.query("SELECT * FROM `admin_activity_logs` ORDER BY `created` DESC LIMIT ?", [limit]);
		res.json({ items: rows });
	} catch (error) {
		logError("get activity-logs", error);
		jsonError(res, 500, error.message);
	}
});

app.post("/api/admin/log-activity", async (req, res) => {
	const auth = verifyToken(bearerToken(req));
	if (!auth) return jsonError(res, 401, "Unauthorized");
	const { action, collection, targetId, summary, details } = req.body ?? {};
	const ip = clientIp(req);
	const device = parseDevice(req.headers["user-agent"]);
	await recordActivityLog({
		email: auth.email || "admin",
		action: action || "custom",
		collection: collection || "system",
		targetId: targetId || null,
		summary: summary || "Aktivitas admin",
		details: typeof details === "object" ? JSON.stringify(details) : String(details || ""),
		ip,
		device,
	});
	res.json({ ok: true });
});

app.delete("/api/admin/logs/clear", async (req, res) => {
	const auth = verifyToken(bearerToken(req));
	if (!auth) return jsonError(res, 401, "Unauthorized");
	const { type } = req.query;
	try {
		if (type === "login") {
			await pool.query("DELETE FROM `admin_login_logs`");
		} else if (type === "activity") {
			await pool.query("DELETE FROM `admin_activity_logs`");
		} else {
			await pool.query("DELETE FROM `admin_login_logs`");
			await pool.query("DELETE FROM `admin_activity_logs`");
		}
		res.json({ ok: true, message: "Log berhasil dibersihkan." });
	} catch (error) {
		logError("clear logs", error);
		jsonError(res, 500, error.message);
	}
});

// --- Public employee schedule endpoint (Protected by branch slug & secret token) ---
app.get("/api/public/schedule/:slug/:token", async (req, res) => {
	const { slug, token } = req.params;
	if (!slug || !token) return jsonError(res, 400, "Parameter tidak lengkap.");

	try {
		const [branchRows] = await pool.query(
			"SELECT `id`, `name`, `slug`, `address`, `schedule_token` FROM `branches` WHERE `slug` = ? LIMIT 1",
			[slug],
		);
		const branch = branchRows[0];
		if (!branch || !branch.schedule_token || branch.schedule_token !== token) {
			return jsonError(res, 403, "Akses ditolak. Link jadwal tidak valid atau kode rahasia salah.");
		}

		// Hitung periode minggu ini (Senin - Minggu) dalam zona waktu Indonesia (WIB)
		const nowWib = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
		const y = nowWib.getFullYear();
		const m = String(nowWib.getMonth() + 1).padStart(2, "0");
		const d = String(nowWib.getDate()).padStart(2, "0");
		const todayKey = `${y}-${m}-${d}`;
		const dow = nowWib.getDay(); // 0 = Minggu, 1 = Senin, ... 6 = Sabtu

		// Start of current week (Senin)
		const dKey = new Date(nowWib);
		dKey.setDate(dKey.getDate() + (dow === 0 ? -6 : 1 - dow));
		const currentWeekStart = `${dKey.getFullYear()}-${String(dKey.getMonth() + 1).padStart(2, "0")}-${String(dKey.getDate()).padStart(2, "0")}`;

		const endKey = new Date(dKey);
		endKey.setDate(endKey.getDate() + 6);
		const currentWeekEnd = `${endKey.getFullYear()}-${String(endKey.getMonth() + 1).padStart(2, "0")}-${String(endKey.getDate()).padStart(2, "0")}`;

		// Apakah hari Sabtu (6) atau Minggu (0)?
		const isWeekend = dow === 6 || dow === 0;

		const nextDKey = new Date(dKey);
		nextDKey.setDate(nextDKey.getDate() + 7);
		const nextWeekStart = `${nextDKey.getFullYear()}-${String(nextDKey.getMonth() + 1).padStart(2, "0")}-${String(nextDKey.getDate()).padStart(2, "0")}`;

		const nextEndKey = new Date(nextDKey);
		nextEndKey.setDate(nextEndKey.getDate() + 6);
		const nextWeekEnd = `${nextEndKey.getFullYear()}-${String(nextEndKey.getMonth() + 1).padStart(2, "0")}-${String(nextEndKey.getDate()).padStart(2, "0")}`;

		const queryTo = isWeekend ? nextWeekEnd : currentWeekEnd;

		// Ambil shift_assignments yang tersimpan di database
		const [assignments] = await pool.query(
			"SELECT `date`, `employee_id`, `employee_name`, `shift`, `start_time`, `end_time`, `hours`, `is_backup`, `is_emergency`, `note` FROM `shift_assignments` WHERE `branch_id` = ? AND `date` >= ? AND `date` <= ? ORDER BY `date` ASC, `start_time` ASC",
			[branch.id, currentWeekStart, queryTo],
		);

		// Ambil daftar karyawan cabang ini
		const [employees] = await pool.query(
			"SELECT `id`, `name`, `role`, `status`, `allowed_shifts` FROM `shift_employees` WHERE `branch_id` = ? AND `status` = 'active' ORDER BY `sort_order` ASC, `name` ASC",
			[branch.id],
		);

		// Ambil event izin/libur cabang ini
		const [events] = await pool.query(
			"SELECT `employee_id`, `date`, `end_date`, `type`, `note` FROM `shift_events` WHERE `branch_id` = ? AND `date` <= ? AND (`end_date` >= ? OR `end_date` IS NULL)",
			[branch.id, queryTo, currentWeekStart],
		);

		res.json({
			branch: {
				id: branch.id,
				name: branch.name,
				slug: branch.slug,
				address: branch.address,
			},
			todayKey,
			dayOfWeek: dow,
			isWeekend,
			currentWeek: {
				from: currentWeekStart,
				to: currentWeekEnd,
			},
			nextWeek: isWeekend
				? {
						from: nextWeekStart,
						to: nextWeekEnd,
				  }
				: null,
			assignments,
			employees: employees.map((e) => ({
				id: e.id,
				name: e.name,
				role: e.role,
				allowed_shifts: e.allowed_shifts
					? typeof e.allowed_shifts === "string"
						? JSON.parse(e.allowed_shifts)
						: e.allowed_shifts
					: null,
			})),
			events,
			generatedAtWib: getIndoRealTime(),
		});
	} catch (error) {
		logError("public schedule", error);
		jsonError(res, 500, "Database error.");
	}
});

// ---------------------------------------------------------------------------
// Frontend (hasil `vite build`) disajikan oleh proses yang sama.
// Satu container, satu port, tanpa reverse proxy terpisah.
// ---------------------------------------------------------------------------
const SPA_DIR = resolve(process.cwd(), process.env.SPA_DIST_DIR || "dist");
const SPA_INDEX = join(SPA_DIR, "index.html");
const SERVE_SPA = process.env.SERVE_SPA !== "false" && existsSync(SPA_INDEX);

// Route /api yang tidak dikenal tetap dijawab JSON, bukan HTML.
app.use("/api", (_req, res) => {
	jsonError(res, 404, "Endpoint tidak ditemukan.");
});

if (SERVE_SPA) {
	// File ber-hash di /assets aman di-cache selamanya.
	app.use(
		"/assets",
		express.static(join(SPA_DIR, "assets"), {
			index: false,
			etag: true,
			immutable: true,
			maxAge: "365d",
		}),
	);

	app.use(
		express.static(SPA_DIR, {
			index: false,
			etag: true,
			setHeaders: (res, filePath) => {
				// index.html, service worker, dan manifest jangan di-cache,
				// biar update hasil deploy langsung kebaca.
				if (/[\\/](index\.html|sw\.js|registerSW\.js|manifest\.webmanifest)$/.test(filePath)) {
					res.setHeader("Cache-Control", "no-cache, must-revalidate");
					return;
				}
				res.setHeader("Cache-Control", "public, max-age=3600");
			},
		}),
	);

	// SPA fallback: semua path selain /api dikembalikan ke index.html.
	app.get(/^\/(?!api\/).*/, (_req, res) => {
		res.setHeader("Cache-Control", "no-cache, must-revalidate");
		res.sendFile(SPA_INDEX);
	});

	console.log(`[api] frontend disajikan dari ${SPA_DIR}`);
}

// Penangan error terakhir: jangan pernah kirim stack trace ke klien.
app.use((error, _req, res, _next) => {
	logError("unhandled", error);
	if (res.headersSent) return;
	const status = error?.status || (error?.code === "LIMIT_FILE_SIZE" ? 413 : 500);
	const message =
		status === 413
			? "File terlalu besar (maksimal 5 MB)."
			: status === 400
				? error.message || "Permintaan tidak valid."
				: "Terjadi kesalahan pada server.";
	jsonError(res, status, message);
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
await mkdir(UPLOAD_DIR, { recursive: true });

// Pastikan koneksi database siap (termasuk fallback jika host awal gagal)
await initDatabaseConnection();

// Pastikan tabel _admins ada lalu isi akun admin dari API_ADMIN_EMAIL /
// API_ADMIN_PASSWORD kalau tabelnya masih kosong.
await ensureAdminTable();
await ensureTranslationTable();
await ensureContactColumns();
await ensureShiftTables();

app.listen(PORT, () => {
	console.log(`[api] MBA Laundry API jalan di http://localhost:${PORT}`);
	console.log(`[api] MySQL: ${process.env.MYSQL_DATABASE}@${process.env.MYSQL_HOST}`);
	console.log(`[api] upload: ${UPLOAD_DIR}`);
});
