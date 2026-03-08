import { createRecord, deleteRecord, escapeFilterValue, listRecords, pb, updateRecord } from "@/api/pocketbase";
import type { BranchGallery, GalleryType } from "@/types/database.types";

// Helper to get absolute URL for gallery image
const getGalleryImageUrl = (item: BranchGallery): string | undefined => {
	if (!item.image) return undefined;
	
	// If already a full URL, return as-is
	if (item.image.startsWith("http")) return item.image;
	
	// Generate URL using PocketBase SDK
	const url = pb.files.getURL(
		{ id: item.id, collectionId: "", collectionName: "branch_gallery" },
		item.image
	);
	
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
