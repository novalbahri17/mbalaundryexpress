import {
	createRecord,
	deleteRecord,
	escapeFilterValue,
	fileUrl,
	getRecordById,
	listRecords,
	updateRecord,
} from "@/api/client";
import type {
	Branch,
	BranchFacility,
	BranchGallery,
	BranchHour,
	BranchMachine,
	PaginatedResponse,
} from "@/types/database.types";

const isDirectUrl = (value?: string): boolean =>
	Boolean(
		value &&
			(value.startsWith("http://") ||
				value.startsWith("https://") ||
				value.startsWith("/") ||
				value.startsWith("data:image/") ||
				value.startsWith("blob:")),
	);

const mapBranchImage = (branch: Branch): Branch => {
	if (!branch.cover_image || isDirectUrl(branch.cover_image)) return branch;
	return {
		...branch,
		cover_image: fileUrl("branches", { id: branch.id }, branch.cover_image) ?? branch.cover_image,
	};
};

const mapGalleryImage = (item: BranchGallery): BranchGallery => {
	if (!item.image || isDirectUrl(item.image)) return item;
	return {
		...item,
		image: fileUrl("branch_gallery", { id: item.id }, item.image) ?? item.image,
	};
};

export const getBranches = async (params?: {
	activeOnly?: boolean;
	search?: string;
	page?: number;
	perPage?: number;
}): Promise<PaginatedResponse<Branch>> => {
	const filters: string[] = [];
	if (params?.activeOnly) filters.push("is_active = true");
	if (params?.search) filters.push(`name ~ \"${escapeFilterValue(params.search)}\"`);
	const res = await listRecords("branches", {
		page: params?.page,
		perPage: params?.perPage,
		filter: filters.join(" && "),
		sort: "+sort_order,+name",
	});

	return {
		...res,
		items: res.items.map(mapBranchImage),
	};
};

export const getBranchById = async (id: string): Promise<Branch> => {
	const row = await getRecordById("branches", id);
	return mapBranchImage(row);
};

export const createBranch = (payload: Partial<Branch> | FormData): Promise<Branch> => createRecord("branches", payload);
export const updateBranch = (id: string, payload: Partial<Branch> | FormData): Promise<Branch> =>
	updateRecord("branches", id, payload);
export const deleteBranch = (id: string): Promise<void> => deleteRecord("branches", id);

export const getBranchHours = async (branchId: string): Promise<BranchHour[]> => {
	const res = await listRecords("branch_hours", {
		page: 1,
		perPage: 50,
		filter: `branch_id = \"${escapeFilterValue(branchId)}\"`,
		sort: "+day",
	});
	return res.items;
};

export const getBranchHoursByDay = async (day: BranchHour["day"]): Promise<BranchHour[]> => {
	const res = await listRecords("branch_hours", {
		page: 1,
		perPage: 500,
		filter: `day = \"${escapeFilterValue(day)}\"`,
		sort: "+branch_id",
	});
	return res.items;
};

export const saveBranchHour = (payload: Partial<BranchHour>): Promise<BranchHour> => {
	if (payload.id) {
		return updateRecord("branch_hours", payload.id, payload);
	}
	return createRecord("branch_hours", payload);
};

export const deleteBranchHour = (id: string): Promise<void> => deleteRecord("branch_hours", id);

export const getBranchFacilities = async (branchId: string): Promise<BranchFacility[]> => {
	const res = await listRecords("branch_facilities", {
		page: 1,
		perPage: 100,
		filter: `branch_id = \"${escapeFilterValue(branchId)}\"`,
		sort: "+sort_order,+name",
	});
	return res.items;
};

export const saveBranchFacility = (payload: Partial<BranchFacility>): Promise<BranchFacility> => {
	if (payload.id) {
		return updateRecord("branch_facilities", payload.id, payload);
	}
	return createRecord("branch_facilities", payload);
};

export const deleteBranchFacility = (id: string): Promise<void> => deleteRecord("branch_facilities", id);

/* ---------------------------------------------------------------------------
 * Mesin per cabang.
 * Tarif Rupiah tidak disimpan per mesin: dihitung dari `coins` × `coin_value`
 * cabang, jadi kalau harga coin naik cukup ubah satu angka di tabel branches.
 * ------------------------------------------------------------------------- */

export const getBranchMachines = async (branchId?: string): Promise<BranchMachine[]> => {
	const filters: string[] = ["is_active = true"];
	if (branchId) filters.push(`branch_id = \"${escapeFilterValue(branchId)}\"`);
	const res = await listRecords("branch_machines", {
		page: 1,
		perPage: 300,
		filter: filters.join(" && "),
		sort: "+branch_id,+sort_order",
	});
	return res.items;
};

export const getAllBranchMachines = async (): Promise<BranchMachine[]> => {
	const res = await listRecords("branch_machines", {
		page: 1,
		perPage: 300,
		filter: "is_active = true",
		sort: "+branch_id,+sort_order",
	});
	return res.items;
};

export const saveBranchMachine = (payload: Partial<BranchMachine>): Promise<BranchMachine> => {
	if (payload.id) {
		return updateRecord("branch_machines", payload.id, payload);
	}
	return createRecord("branch_machines", payload);
};

export const deleteBranchMachine = (id: string): Promise<void> => deleteRecord("branch_machines", id);

export const getBranchGallery = async (branchId?: string): Promise<BranchGallery[]> => {
	const filters: string[] = [];
	if (branchId) filters.push(`branch_id = \"${escapeFilterValue(branchId)}\"`);
	const res = await listRecords("branch_gallery", {
		page: 1,
		perPage: 200,
		filter: filters.join(" && "),
		sort: "-created",
	});
	return res.items.map(mapGalleryImage);
};

export const saveBranchGallery = (
	payload: Partial<BranchGallery> | FormData,
	updateId?: string,
): Promise<BranchGallery> => {
	if (payload instanceof FormData && updateId) {
		return updateRecord("branch_gallery", updateId, payload);
	}
	if (!(payload instanceof FormData) && payload.id) {
		return updateRecord("branch_gallery", payload.id, payload);
	}
	return createRecord("branch_gallery", payload);
};

export const deleteBranchGallery = (id: string): Promise<void> => deleteRecord("branch_gallery", id);
