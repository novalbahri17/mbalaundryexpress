import type { CollectionName, CollectionRecord, PaginatedResponse } from "@/types/database.types";

// ============================================================================
// Klien API: penghubung frontend ke server Express + MySQL kita sendiri
// (lihat server/index.mjs).
// ============================================================================

export const baseUrl = import.meta.env.VITE_API_BASE_PATH || "/api";

const apiUrl = (path: string): string => `${baseUrl.replace(/\/+$/, "")}${path}`;

// ---------------------------------------------------------------------------
// Sesi admin (disimpan di localStorage)
// ---------------------------------------------------------------------------
interface SessionModel {
	id: string;
	email: string;
	collectionName?: string;
}

interface SessionState {
	token: string;
	model: SessionModel | null;
}

const TOKEN_KEY = "mba-admin-token";
const MODEL_KEY = "mba-admin-model";

const readSession = (): SessionState => {
	try {
		const token = localStorage.getItem(TOKEN_KEY) ?? "";
		const raw = localStorage.getItem(MODEL_KEY);
		return { token, model: raw ? (JSON.parse(raw) as SessionModel) : null };
	} catch {
		return { token: "", model: null };
	}
};

let session: SessionState = readSession();

interface JwtPayload {
	exp?: number;
	type?: string;
}

const decodeBase64Url = (value: string): string => {
	const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
	const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
	return atob(padded);
};

const parseTokenPayload = (token?: string): JwtPayload | null => {
	if (!token) return null;
	const parts = token.split(".");
	if (parts.length < 2) return null;
	// Token kita: base64url(payload).signature
	try {
		return JSON.parse(decodeBase64Url(parts[0])) as JwtPayload;
	} catch {
		return null;
	}
};

export const isAdminSession = (): boolean => {
	if (!session.token || !session.model) return false;
	const payload = parseTokenPayload(session.token);
	if (!payload) return false;
	if (payload.exp && Date.now() / 1000 > payload.exp) return false;
	return payload.type === "superuser" || payload.type === "admin" || payload.type === "auth";
};

export const authStore = {
	get token(): string {
		return session.token;
	},
	get model(): SessionModel | null {
		return session.model;
	},
	get isValid(): boolean {
		return isAdminSession();
	},
	save(token: string, model: SessionModel | null): void {
		session = { token, model };
		try {
			localStorage.setItem(TOKEN_KEY, token);
			localStorage.setItem(MODEL_KEY, JSON.stringify(model ?? {}));
		} catch {
			// localStorage bisa diblokir; sesi tetap jalan di memori.
		}
	},
	clear(): void {
		session = { token: "", model: null };
		try {
			localStorage.removeItem(TOKEN_KEY);
			localStorage.removeItem(MODEL_KEY);
		} catch {
			// abaikan
		}
	},
};

// Beberapa halaman admin memakai `pb.authStore.model` / `pb.files.getURL` /
// `pb.collection(...)`. Objek ini menjaga nama-nama itu tetap hidup, tapi
// semuanya diarahkan ke API MySQL kita sendiri.
interface QueryOptions {
	filter?: string;
	sort?: string;
	expand?: string;
}

const fullList = async <T>(collection: string, options?: QueryOptions): Promise<T[]> => {
	const res = await listRecords(collection as CollectionName, {
		page: 1,
		perPage: 500,
		filter: options?.filter,
		sort: options?.sort,
		expand: options?.expand,
	});
	return res.items as unknown as T[];
};

export const pb = {
	authStore,
	files: {
		getURL: (record: { id: string; collectionName?: string }, filename?: string): string =>
			fileUrl((record.collectionName ?? "branding_files") as CollectionName, record, filename) ?? "",
	},
	collection: (name: string) => ({
		getFullList: <T = unknown>(options?: QueryOptions) => fullList<T>(name, options),
		getList: (page: number, perPage: number, options?: QueryOptions) =>
			listRecords(name as CollectionName, { page, perPage, ...options }),
		getOne: <T = unknown>(id: string) => getRecordById(name as CollectionName, id) as Promise<T>,
		getFirstListItem: <T = unknown>(filter: string) => getFirstRecord(name as CollectionName, filter) as Promise<T>,
		create: <T = unknown>(payload: unknown) => createRecord(name as CollectionName, payload as never) as Promise<T>,
		update: <T = unknown>(id: string, payload: unknown) =>
			updateRecord(name as CollectionName, id, payload as never) as Promise<T>,
		delete: (id: string) => deleteRecord(name as CollectionName, id),
		authWithPassword: (identity: string, password: string) => adminLogin({ email: identity, password }),
	}),
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
export interface ListParams {
	page?: number;
	perPage?: number;
	filter?: string;
	sort?: string;
	expand?: string;
	/**
	 * Bahasa yang diminta. `"en"` membuat server menambahkan kolom
	 * `<nama>__en` berisi terjemahan otomatis pada setiap record.
	 */
	lang?: "id" | "en";
}

export const toBoolean = (value: string | boolean | undefined): boolean => {
	if (typeof value === "boolean") return value;
	return value === "1" || value === "true";
};

export const toNumber = (value: string | number | undefined, fallback = 0): number => {
	if (typeof value === "number") return value;
	if (!value) return fallback;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizeRecord = <T>(record: unknown): T => record as T;

export const escapeFilterValue = (value: string): string =>
	value
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		// biome-ignore lint/suspicious/noControlCharactersInRegex: intentionally stripping control characters from filter values
		.replace(/[\u0000-\u001F\u007F]/gu, "");

const sanitizeFileSegment = (value: string): string => value.replace(/[^\w.-]/g, "");

export class ApiError extends Error {
	status: number;
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
		this.name = "ApiError";
	}
}

async function request<T>(path: string, init: RequestInit = {}, expectJson = true): Promise<T> {
	const headers = new Headers(init.headers);
	if (session.token) headers.set("Authorization", `Bearer ${session.token}`);
	if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");

	const res = await fetch(apiUrl(path), { ...init, headers });
	if (!res.ok) {
		let message = `Request gagal (${res.status})`;
		try {
			const body = await res.json();
			if (body?.message) message = body.message;
		} catch {
			// biarkan pesan default
		}
		if (res.status === 401) authStore.clear();
		throw new ApiError(res.status, message);
	}
	if (!expectJson) return undefined as T;
	return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// CRUD koleksi
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Terjemahan otomatis
// ---------------------------------------------------------------------------
// Konten dari database ditulis admin dalam Bahasa Indonesia. Saat pengunjung
// memilih Bahasa Inggris, server mengirim tambahan kolom `<nama>__en` (lihat
// /api/translate di server/index.mjs). Helper di bawah menukar nilai aslinya
// dengan versi Inggris, jadi komponen tidak perlu tahu soal terjemahan.

/** Locale yang dipilih pengunjung, dibaca dari localStorage Zustand. */
const readVisitorLocale = (): string => {
	try {
		const raw = localStorage.getItem("mba-locale");
		if (!raw) return "id";
		const parsed = JSON.parse(raw) as { state?: { locale?: string } };
		return parsed?.state?.locale === "en" ? "en" : "id";
	} catch {
		return "id";
	}
};

/**
 * Panel admin TIDAK boleh ikut diterjemahkan: kalau form admin terisi teks
 * Inggris, admin bisa tanpa sengaja menimpa konten Indonesia saat menyimpan.
 */
const isAdminArea = (): boolean =>
	typeof window !== "undefined" && window.location.pathname.startsWith("/admin");

/** Bahasa yang harus diminta ke server untuk request saat ini. */
const activeLang = (): "id" | "en" => (!isAdminArea() && readVisitorLocale() === "en" ? "en" : "id");

/** Tukar `<kolom>` dengan `<kolom>__en` kalau terjemahannya tersedia. */
const applyEnglishFields = <T>(record: T): T => {
	if (!record || typeof record !== "object") return record;
	const source = record as Record<string, unknown>;
	const out: Record<string, unknown> = { ...source };
	for (const [key, value] of Object.entries(source)) {
		if (!key.endsWith("__en")) continue;
		const base = key.slice(0, -"__en".length);
		if (typeof value !== "string" || !value.trim()) continue;
		if (typeof source[base] !== "string") continue;
		out[base] = value;
	}
	return out as T;
};
export const listRecords = async <T extends CollectionName>(
	collection: T,
	params?: ListParams,
): Promise<PaginatedResponse<CollectionRecord<T>>> => {
	const lang = params?.lang ?? activeLang();
	const search = new URLSearchParams();
	search.set("page", String(params?.page ?? 1));
	search.set("perPage", String(params?.perPage ?? 20));
	if (params?.filter) search.set("filter", params.filter);
	if (params?.sort) search.set("sort", params.sort);
	if (params?.expand) search.set("expand", params.expand);
	if (lang === "en") search.set("lang", "en");

	const res = await request<PaginatedResponse<CollectionRecord<T>>>(
		`/collections/${collection}/records?${search.toString()}`,
	);
	const localize = lang === "en";
	return {
		items: res.items.map((item) =>
			localize
				? normalizeRecord<CollectionRecord<T>>(applyEnglishFields(item))
				: normalizeRecord<CollectionRecord<T>>(item),
		),
		page: res.page,
		perPage: res.perPage,
		totalItems: res.totalItems,
		totalPages: res.totalPages,
	};
};

export const getRecordById = async <T extends CollectionName>(
	collection: T,
	id: string,
	_expand?: string,
): Promise<CollectionRecord<T>> => {
	const row = await request<CollectionRecord<T>>(`/collections/${collection}/records/${encodeURIComponent(id)}`);
	return normalizeRecord<CollectionRecord<T>>(row);
};

export const getFirstRecord = async <T extends CollectionName>(
	collection: T,
	filter: string,
	_expand?: string,
): Promise<CollectionRecord<T> | null> => {
	const res = await listRecords<T>(collection, { page: 1, perPage: 1, filter });
	return res.items[0] ?? null;
};

const toRequestBody = (payload: unknown): BodyInit => {
	if (payload instanceof FormData) return payload;
	return JSON.stringify(payload ?? {});
};

export const createRecord = async <T extends CollectionName>(
	collection: T,
	payload: Partial<CollectionRecord<T>> | FormData,
): Promise<CollectionRecord<T>> => {
	const row = await request<CollectionRecord<T>>(`/collections/${collection}/records`, {
		method: "POST",
		body: toRequestBody(payload),
	});
	return normalizeRecord<CollectionRecord<T>>(row);
};

export const updateRecord = async <T extends CollectionName>(
	collection: T,
	id: string,
	payload: Partial<CollectionRecord<T>> | FormData,
): Promise<CollectionRecord<T>> => {
	const row = await request<CollectionRecord<T>>(`/collections/${collection}/records/${encodeURIComponent(id)}`, {
		method: "PATCH",
		body: toRequestBody(payload),
	});
	return normalizeRecord<CollectionRecord<T>>(row);
};

export const deleteRecord = async (collection: CollectionName, id: string): Promise<void> => {
	await request<void>(`/collections/${collection}/records/${encodeURIComponent(id)}`, { method: "DELETE" }, false);
};

export const fileUrl = (collection: CollectionName, record: { id: string }, filename?: string): string | undefined => {
	if (!filename) return undefined;
	const safeFileName = sanitizeFileSegment(filename);
	if (!safeFileName) return undefined;
	return apiUrl(`/files/${collection}/${record.id}/${safeFileName}`);
};

// ---------------------------------------------------------------------------
// Login admin
// ---------------------------------------------------------------------------
export interface AdminLoginPayload {
	email: string;
	password: string;
}

export interface AdminSession {
	token: string;
	model: SessionModel;
}

export const adminLogin = async (payload: AdminLoginPayload): Promise<AdminSession> => {
	authStore.clear();
	let res: Response;
	try {
		res = await fetch(apiUrl("/collections/_superusers/auth-with-password"), {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ identity: payload.email, password: payload.password }),
		});
	} catch {
		throw new Error("Tidak bisa menghubungi server. Pastikan API server jalan.");
	}

	if (!res.ok) {
		throw new Error("Email atau password salah.");
	}

	const data = (await res.json()) as { token: string; record?: SessionModel; admin?: SessionModel };
	const modelData = data.record ?? data.admin ?? null;
	if (!modelData) {
		throw new Error("Email atau password salah.");
	}
	authStore.save(data.token, modelData);
	if (!isAdminSession()) {
		authStore.clear();
		throw new Error("Email atau password salah.");
	}
	return { token: data.token, model: modelData };
};

export const adminLogout = (): void => {
	authStore.clear();
};

export const isAuthenticated = (): boolean => isAdminSession();

// ---------------------------------------------------------------------------
// Ganti email / password admin (dipakai halaman pengaturan)
// ---------------------------------------------------------------------------
export const updateAdminAccount = async (payload: {
	currentPassword: string;
	email?: string;
	password?: string;
}): Promise<void> => {
	await request<unknown>("/collections/_superusers/update", {
		method: "POST",
		body: JSON.stringify(payload),
	});
};
