import PocketBase, { type RecordModel } from "pocketbase";
import type { CollectionName, CollectionRecord, PaginatedResponse } from "@/types/database.types";

const baseUrl = import.meta.env.VITE_POCKETBASE_BASE_PATH || "/pb-api";

export const pb = new PocketBase(baseUrl);
pb.autoCancellation(false);

interface JwtPayload {
	exp?: number;
	type?: string;
}

const decodeBase64Url = (value: string): string => {
	const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
	const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
	return atob(padded);
};

const parseJwtPayload = (token?: string): JwtPayload | null => {
	if (!token) return null;
	const parts = token.split(".");
	if (parts.length !== 3) return null;
	try {
		const json = decodeBase64Url(parts[1]);
		return JSON.parse(json) as JwtPayload;
	} catch {
		return null;
	}
};

export const isAdminSession = (): boolean => {
	if (!pb.authStore.isValid || !pb.authStore.token) return false;
	const payload = parseJwtPayload(pb.authStore.token);
	return payload?.type === "admin";
};

export interface ListParams {
	page?: number;
	perPage?: number;
	filter?: string;
	sort?: string;
	expand?: string;
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

export const normalizeRecord = <T>(record: RecordModel): T => record as unknown as T;

export const escapeFilterValue = (value: string): string =>
	value
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		// biome-ignore lint/suspicious/noControlCharactersInRegex: intentionally stripping control characters from filter values
		.replace(/[\u0000-\u001F\u007F]/gu, "");

const sanitizeFileSegment = (value: string): string => value.replace(/[^\w.-]/g, "");

export const listRecords = async <T extends CollectionName>(
	collection: T,
	params?: ListParams,
): Promise<PaginatedResponse<CollectionRecord<T>>> => {
	const page = params?.page ?? 1;
	const perPage = params?.perPage ?? 20;
	const res = await pb.collection(collection).getList(page, perPage, {
		filter: params?.filter,
		sort: params?.sort,
		expand: params?.expand,
	});

	return {
		items: res.items.map((item) => normalizeRecord<CollectionRecord<T>>(item)),
		page: res.page,
		perPage: res.perPage,
		totalItems: res.totalItems,
		totalPages: res.totalPages,
	};
};

export const getRecordById = async <T extends CollectionName>(
	collection: T,
	id: string,
	expand?: string,
): Promise<CollectionRecord<T>> => {
	const record = await pb.collection(collection).getOne(id, { expand });
	return normalizeRecord<CollectionRecord<T>>(record);
};

export const getFirstRecord = async <T extends CollectionName>(
	collection: T,
	filter: string,
	expand?: string,
): Promise<CollectionRecord<T> | null> => {
	try {
		const record = await pb.collection(collection).getFirstListItem(filter, { expand });
		return normalizeRecord<CollectionRecord<T>>(record);
	} catch {
		return null;
	}
};

export const createRecord = async <T extends CollectionName>(
	collection: T,
	payload: Partial<CollectionRecord<T>> | FormData,
): Promise<CollectionRecord<T>> => {
	const record = await pb.collection(collection).create(payload);
	return normalizeRecord<CollectionRecord<T>>(record);
};

export const updateRecord = async <T extends CollectionName>(
	collection: T,
	id: string,
	payload: Partial<CollectionRecord<T>> | FormData,
): Promise<CollectionRecord<T>> => {
	const record = await pb.collection(collection).update(id, payload);
	return normalizeRecord<CollectionRecord<T>>(record);
};

export const deleteRecord = async (collection: CollectionName, id: string): Promise<void> => {
	await pb.collection(collection).delete(id);
};

export const fileUrl = (collection: CollectionName, record: { id: string }, filename?: string): string | undefined => {
	if (!filename) return undefined;
	const safeFileName = sanitizeFileSegment(filename);
	if (!safeFileName) return undefined;
	return `${baseUrl}/api/files/${collection}/${record.id}/${safeFileName}`;
};

export interface AdminLoginPayload {
	email: string;
	password: string;
}

export interface AdminSession {
	token: string;
	model: RecordModel;
}

const loginWithSuperuser = async (payload: AdminLoginPayload): Promise<AdminSession> => {
	// Support both v0.23+ (_superusers) and v0.22- (admins) auth endpoints
	pb.authStore.clear();

	let url = `${baseUrl}/api/collections/_superusers/auth-with-password`;
	let res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			identity: payload.email,
			password: payload.password,
		}),
	});

	// Fallback for older PocketBase versions ONLY if the endpoint is missing
	if (res.status === 404) {
		const fallbackUrl = `${baseUrl}/api/admins/auth-with-password`;
		const fallbackRes = await fetch(fallbackUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				identity: payload.email,
				password: payload.password,
			}),
		});
		
		if (fallbackRes.ok || (fallbackRes.status !== 404 && res.status === 404)) {
			res = fallbackRes;
		}
	}

	if (!res.ok) {
		throw new Error("Admin login failed");
	}

	const data = await res.json();
	// v0.23 uses `record`, v0.22 uses `admin`
	const modelData = data.record || data.admin;
	
	pb.authStore.save(data.token, modelData);
	
	if (!isAdminSession()) {
		pb.authStore.clear();
		throw new Error("Admin session is invalid");
	}

	return {
		token: data.token,
		model: modelData,
	};
};

export const adminLogin = async (payload: AdminLoginPayload): Promise<AdminSession> => {
	try {
		return await loginWithSuperuser(payload);
	} catch {
		throw new Error("Invalid login credentials");
	}
};

export const adminLogout = (): void => {
	pb.authStore.clear();
};

export const isAuthenticated = (): boolean => isAdminSession();
