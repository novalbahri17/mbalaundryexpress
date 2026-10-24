import {
	createRecord,
	deleteRecord,
	escapeFilterValue,
	fileUrl,
	getRecordById,
	listRecords,
	updateRecord,
} from "@/api/client";
import type { Job } from "@/types/database.types";

const isDirectUrl = (value?: string): boolean =>
	Boolean(
		value &&
			(value.startsWith("http://") ||
				value.startsWith("https://") ||
				value.startsWith("/") ||
				value.startsWith("data:image/") ||
				value.startsWith("blob:")),
	);

const mapJobImage = (item: Job): Job => {
	const imageValue = Array.isArray(item.image) ? item.image[0] : item.image;
	if (!imageValue) return item;
	if (isDirectUrl(imageValue)) return { ...item, image: imageValue };

	return {
		...item,
		image: fileUrl("jobs", { id: item.id }, imageValue) ?? imageValue,
	};
};

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
	return res.items.map(mapJobImage);
};

export const getJobById = async (id: string): Promise<Job> => {
	const job = await getRecordById("jobs", id);
	return mapJobImage(job);
};

export const createJob = (payload: Partial<Job> | FormData): Promise<Job> => createRecord("jobs", payload);
export const updateJob = (id: string, payload: Partial<Job> | FormData): Promise<Job> =>
	updateRecord("jobs", id, payload);
export const deleteJob = (id: string): Promise<void> => deleteRecord("jobs", id);
