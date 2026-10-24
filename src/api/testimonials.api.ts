import {
	createRecord,
	deleteRecord,
	escapeFilterValue,
	fileUrl,
	getRecordById,
	listRecords,
	updateRecord,
} from "@/api/client";
import type { Testimonial } from "@/types/database.types";

const isDirectUrl = (value?: string): boolean =>
	Boolean(
		value &&
			(value.startsWith("http://") ||
				value.startsWith("https://") ||
				value.startsWith("/") ||
				value.startsWith("data:image/") ||
				value.startsWith("blob:")),
	);

const mapPhoto = (row: Testimonial): Testimonial => {
	if (!row.photo || isDirectUrl(row.photo)) return row;
	return {
		...row,
		photo: fileUrl("testimonials", { id: row.id }, row.photo) ?? row.photo,
	};
};

export const getTestimonials = async (params?: {
	approvedOnly?: boolean;
	branchId?: string;
	limit?: number;
}): Promise<Testimonial[]> => {
	const filters: string[] = [];
	if (params?.approvedOnly) filters.push("is_approved = true");
	if (params?.branchId) filters.push(`branch_id = \"${escapeFilterValue(params.branchId)}\"`);
	const res = await listRecords("testimonials", {
		page: 1,
		perPage: params?.limit ?? 100,
		filter: filters.join(" && "),
		sort: "-created",
	});
	return res.items.map(mapPhoto);
};

export const getTestimonialById = async (id: string): Promise<Testimonial> => {
	const row = await getRecordById("testimonials", id);
	return mapPhoto(row);
};
export const createTestimonial = (payload: Partial<Testimonial> | FormData): Promise<Testimonial> =>
	createRecord("testimonials", payload);
export const updateTestimonial = (id: string, payload: Partial<Testimonial> | FormData): Promise<Testimonial> =>
	updateRecord("testimonials", id, payload);
export const deleteTestimonial = (id: string): Promise<void> => deleteRecord("testimonials", id);

export const approveTestimonial = (id: string): Promise<Testimonial> =>
	updateRecord("testimonials", id, { is_approved: true });
export const rejectTestimonial = (id: string): Promise<Testimonial> =>
	updateRecord("testimonials", id, { is_approved: false });
