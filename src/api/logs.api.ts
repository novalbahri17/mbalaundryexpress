import { request } from "@/api/client";
import type { AdminActivityLog, AdminLoginLog } from "@/types/database.types";

export interface LogItemsResponse<T> {
	items: T[];
}

export const getLoginLogs = async (limit = 200): Promise<AdminLoginLog[]> => {
	const res = await request<LogItemsResponse<AdminLoginLog>>(`/admin/login-logs?limit=${limit}`);
	return res.items;
};

export const getActivityLogs = async (limit = 200): Promise<AdminActivityLog[]> => {
	const res = await request<LogItemsResponse<AdminActivityLog>>(`/admin/activity-logs?limit=${limit}`);
	return res.items;
};

export const logAdminActivity = async (payload: {
	action: string;
	collection: string;
	targetId?: string | null;
	summary: string;
	details?: unknown;
}): Promise<void> => {
	await request<{ ok: boolean }>("/admin/log-activity", {
		method: "POST",
		body: JSON.stringify(payload),
	});
};

export const clearAdminLogs = async (type?: "login" | "activity" | "all"): Promise<void> => {
	const query = type ? `?type=${type}` : "";
	await request<{ ok: boolean }>(`/admin/logs/clear${query}`, {
		method: "DELETE",
	});
};
