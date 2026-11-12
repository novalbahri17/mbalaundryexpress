import { request } from "@/api/client";

export type AdminRole = "superadmin" | "admin" | "operator";

export interface AdminUser {
	id: string;
	email: string;
	name: string;
	role: AdminRole;
	is_active: boolean;
	created?: string;
	updated?: string;
}

export interface CreateAdminUserPayload {
	email: string;
	name?: string;
	role?: AdminRole;
	is_active?: boolean;
	password: string;
}

export interface UpdateAdminUserPayload {
	email?: string;
	name?: string;
	role?: AdminRole;
	is_active?: boolean;
	password?: string;
}

export const listAdminUsers = async (): Promise<AdminUser[]> => {
	const res = await request<{ items: AdminUser[] }>("/admin/users");
	return res.items;
};

export const createAdminUser = async (payload: CreateAdminUserPayload): Promise<AdminUser> => {
	return request<AdminUser>("/admin/users", {
		method: "POST",
		body: JSON.stringify(payload),
	});
};

export const updateAdminUser = async (id: string, payload: UpdateAdminUserPayload): Promise<AdminUser> => {
	return request<AdminUser>(`/admin/users/${encodeURIComponent(id)}`, {
		method: "PATCH",
		body: JSON.stringify(payload),
	});
};

export const deleteAdminUser = async (id: string): Promise<void> => {
	await request<{ ok: boolean }>(`/admin/users/${encodeURIComponent(id)}`, {
		method: "DELETE",
	});
};
