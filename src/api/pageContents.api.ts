import { createRecord, deleteRecord, escapeFilterValue, listRecords, updateRecord } from "@/api/pocketbase";
import type { PageContent } from "@/types/database.types";

export const getPageContents = async (group?: string): Promise<PageContent[]> => {
	const filter = group ? `group = \"${escapeFilterValue(group)}\"` : undefined;
	const res = await listRecords("page_contents", {
		page: 1,
		perPage: 500,
		filter,
		sort: "+group,+key",
	});
	return res.items;
};

export const getPageContentValueMap = async (): Promise<Record<string, string>> => {
	const contents = await getPageContents();
	return contents.reduce<Record<string, string>>((acc, item) => {
		acc[item.key] = item.value;
		return acc;
	}, {});
};

export const upsertPageContent = async (payload: Partial<PageContent>): Promise<PageContent> => {
	if (!payload.key) {
		throw new Error("key wajib diisi");
	}
	const existing = await listRecords("page_contents", {
		page: 1,
		perPage: 1,
		filter: `key = \"${escapeFilterValue(payload.key)}\"`,
	});
	if (existing.items[0]) {
		return updateRecord("page_contents", existing.items[0].id, payload);
	}
	return createRecord("page_contents", payload);
};

export const saveBulkPageContents = async (rows: Array<Partial<PageContent>>): Promise<void> => {
	await Promise.all(rows.map((row) => upsertPageContent(row)));
};

export const deletePageContent = async (id: string): Promise<void> => {
	await deleteRecord("page_contents", id);
};


