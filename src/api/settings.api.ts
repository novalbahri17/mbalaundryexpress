import { createRecord, deleteRecord, escapeFilterValue, listRecords, updateRecord } from "@/api/pocketbase";
import type { ContactMessage, Partnership, SiteSetting } from "@/types/database.types";

export const getSiteSettings = async (): Promise<SiteSetting[]> => {
	const res = await listRecords("site_settings", {
		page: 1,
		perPage: 500,
		sort: "+key",
	});
	return res.items;
};

export const getSiteSettingsMap = async (): Promise<Record<string, string>> => {
	const rows = await getSiteSettings();
	return rows.reduce<Record<string, string>>((acc, item) => {
		acc[item.key] = item.value;
		return acc;
	}, {});
};

export const upsertSiteSetting = async (payload: Partial<SiteSetting>): Promise<SiteSetting> => {
	if (!payload.key) {
		throw new Error("key setting wajib diisi");
	}
	const existing = await listRecords("site_settings", {
		page: 1,
		perPage: 1,
		filter: `key = \"${escapeFilterValue(payload.key)}\"`,
	});
	if (existing.items[0]) {
		return updateRecord("site_settings", existing.items[0].id, payload);
	}
	return createRecord("site_settings", payload);
};

export const saveBulkSettings = async (rows: Array<Partial<SiteSetting>>): Promise<void> => {
	for (const row of rows) {
		await upsertSiteSetting(row);
	}
};

export const deleteSiteSetting = (id: string): Promise<void> => deleteRecord("site_settings", id);

export const getPartnerships = async (): Promise<Partnership[]> => {
	const res = await listRecords("partnerships", {
		page: 1,
		perPage: 500,
		sort: "-created",
	});
	return res.items;
};

export const createPartnership = (payload: Partial<Partnership>): Promise<Partnership> =>
	createRecord("partnerships", payload);
export const updatePartnership = (id: string, payload: Partial<Partnership>): Promise<Partnership> =>
	updateRecord("partnerships", id, payload);
export const deletePartnership = (id: string): Promise<void> => deleteRecord("partnerships", id);

export const getContactMessages = async (): Promise<ContactMessage[]> => {
	const res = await listRecords("contact_messages", {
		page: 1,
		perPage: 500,
		sort: "-created",
	});
	return res.items;
};

export const createContactMessage = (payload: Partial<ContactMessage>): Promise<ContactMessage> =>
	createRecord("contact_messages", payload);
export const updateContactMessage = (id: string, payload: Partial<ContactMessage>): Promise<ContactMessage> =>
	updateRecord("contact_messages", id, payload);
export const deleteContactMessage = (id: string): Promise<void> => deleteRecord("contact_messages", id);


