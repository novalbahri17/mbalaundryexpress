import { createRecord, deleteRecord, escapeFilterValue, fileUrl, listRecords, updateRecord } from "@/api/client";
import type { BranchGallery } from "@/types/database.types";

// Helper to get absolute URL for gallery image
const getGalleryImageUrl = (item: BranchGallery): string | undefined => {
	if (!item.image) return undefined;

	// If already a full URL, return as-is
	if (item.image.startsWith("http")) return item.image;

	// Generate URL dari API server kita sendiri
	const url = fileUrl("branch_gallery", { id: item.id }, item.image);

	// If URL is relative, make it absolute
	if (url && url.startsWith("/") && typeof window !== "undefined") {
		return `${window.location.origin}${url}`;
	}

	return url;
};

const mapGalleryImage = (item: BranchGallery): BranchGallery => {
	const imageUrl = getGalleryImageUrl(item);
	return {
		...item,
		image: imageUrl ?? item.image,
	};
};

export const getGallery = async (params?: { branchId?: string }): Promise<BranchGallery[]> => {
	const filters: string[] = [];
	if (params?.branchId) {
		filters.push(`branch_id = "${escapeFilterValue(params.branchId)}"`);
	}
	const res = await listRecords("branch_gallery", {
		page: 1,
		perPage: 500,
		filter: filters.join(" && ") || undefined,
		sort: "-created",
	});
	return res.items.map(mapGalleryImage);
};

export const createGallery = (payload: Partial<BranchGallery> | FormData): Promise<BranchGallery> =>
	createRecord("branch_gallery", payload);
export const updateGallery = (id: string, payload: Partial<BranchGallery> | FormData): Promise<BranchGallery> =>
	updateRecord("branch_gallery", id, payload);
export const deleteGallery = (id: string): Promise<void> => deleteRecord("branch_gallery", id);
