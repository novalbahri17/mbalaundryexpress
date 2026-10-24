import { createRecord, deleteRecord, escapeFilterValue, getRecordById, listRecords, updateRecord } from "@/api/client";
import type { Faq } from "@/types/database.types";

export const getFaqs = async (params?: {
	activeOnly?: boolean;
	category?: Faq["category"];
	branchId?: string;
}): Promise<Faq[]> => {
	const filters: string[] = [];
	if (params?.activeOnly) filters.push("is_active = true");
	if (params?.category) filters.push(`category = \"${escapeFilterValue(params.category)}\"`);
	if (params?.branchId) {
		filters.push(`(branch_id = \"${escapeFilterValue(params.branchId)}\" || branch_id = \"\")`);
	}
	const res = await listRecords("faqs", {
		page: 1,
		perPage: 200,
		filter: filters.join(" && "),
		sort: "+sort_order,-created",
	});
	return res.items;
};

export const getFaqById = (id: string): Promise<Faq> => getRecordById("faqs", id);
export const createFaq = (payload: Partial<Faq>): Promise<Faq> => createRecord("faqs", payload);
export const updateFaq = (id: string, payload: Partial<Faq>): Promise<Faq> => updateRecord("faqs", id, payload);
export const deleteFaq = (id: string): Promise<void> => deleteRecord("faqs", id);
