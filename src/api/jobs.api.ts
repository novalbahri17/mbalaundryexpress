import { createRecord, deleteRecord, escapeFilterValue, getRecordById, listRecords, updateRecord } from "@/api/pocketbase";
import type { Job } from "@/types/database.types";

export const getJobs = async (params?: { openOnly?: boolean; branchId?: string }): Promise<Job[]> => {
	const filters: string[] = [];
	if (params?.openOnly) filters.push("is_open = true");
	if (params?.branchId) filters.push(`branch_id = \"${escapeFilterValue(params.branchId)}\"`);
	const res = await listRecords("jobs", {
		page: 1,
		perPage: 200,
		filter: filters.join(" && "),
		sort: "-posted_at,-created",
	});
	return res.items;
};

export const getJobById = (id: string): Promise<Job> => getRecordById("jobs", id);
export const createJob = (payload: Partial<Job>): Promise<Job> => createRecord("jobs", payload);
export const updateJob = (id: string, payload: Partial<Job>): Promise<Job> => updateRecord("jobs", id, payload);
export const deleteJob = (id: string): Promise<void> => deleteRecord("jobs", id);


