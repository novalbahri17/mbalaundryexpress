import { createRecord, deleteRecord, escapeFilterValue, fileUrl, listRecords, updateRecord } from "@/api/pocketbase";
import type { BranchGallery, GalleryType } from "@/types/database.types";

const isDirectUrl = (value?: string): boolean =>
	Boolean(
		value &&
			(value.startsWith("http://") ||
				value.startsWith("https://") ||
				value.startsWith("/") ||
				value.startsWith("data:image/") ||
				value.startsWith("blob:")),
	);

const mapGalleryImage = (item: BranchGallery): BranchGallery => {
	if (!item.image || isDirectUrl(item.image)) return item;
	return {
		...item,
		image: fileUrl("branch_gallery", { id: item.id }, item.image) ?? item.image,
	};
};

export const getGallery = async (params?: { type?: GalleryType; branchId?: string }): Promise<BranchGallery[]> => {
	const filters: string[] = [];
	if (params?.type) filters.push(`type = \"${escapeFilterValue(params.type)}\"`);
	if (params?.branchId) {
		filters.push(`branch_id = \"${escapeFilterValue(params.branchId)}\"`);
	}
	const res = await listRecords("branch_gallery", {
		page: 1,
		perPage: 500,
		filter: filters.join(" && "),
		sort: "+sort_order,-created",
	});
	return res.items.map(mapGalleryImage);
};

export const createGallery = (payload: Partial<BranchGallery> | FormData): Promise<BranchGallery> =>
	createRecord("branch_gallery", payload);
export const updateGallery = (id: string, payload: Partial<BranchGallery> | FormData): Promise<BranchGallery> =>
	updateRecord("branch_gallery", id, payload);
export const deleteGallery = (id: string): Promise<void> => deleteRecord("branch_gallery", id);


