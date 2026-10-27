import { createRecord, deleteRecord, escapeFilterValue, listRecords, updateRecord } from "@/api/client";
import type { ShiftAssignment, ShiftEmployee, ShiftEvent } from "@/types/database.types";

/**
 * API jadwal shift. Semua koleksi di sini hanya bisa diakses admin,
 * jadi tidak ada data yang perlu disembunyikan dari pembaca publik.
 */

export const listShiftEmployees = async (branchId?: string): Promise<ShiftEmployee[]> => {
	const filter = branchId ? `branch_id = "${escapeFilterValue(branchId)}"` : undefined;
	const res = await listRecords("shift_employees", {
		page: 1,
		perPage: 500,
		sort: "+sort_order,+name",
		filter,
	});
	return res.items;
};

export const createShiftEmployee = (payload: Partial<ShiftEmployee>): Promise<ShiftEmployee> =>
	createRecord("shift_employees", payload);

export const updateShiftEmployee = (id: string, payload: Partial<ShiftEmployee>): Promise<ShiftEmployee> =>
	updateRecord("shift_employees", id, payload);

export const deleteShiftEmployee = (id: string): Promise<void> => deleteRecord("shift_employees", id);

export const listShiftEvents = async (params?: {
	branchId?: string;
	from?: string;
	to?: string;
}): Promise<ShiftEvent[]> => {
	const filters: string[] = [];
	if (params?.branchId) filters.push(`branch_id = "${escapeFilterValue(params.branchId)}"`);
	// Ambil event yang beririsan dengan rentang tanggal, termasuk izin multi-hari.
	if (params?.from) filters.push(`(end_date >= "${escapeFilterValue(params.from)}" || end_date = null)`);
	if (params?.to) filters.push(`date <= "${escapeFilterValue(params.to)}"`);

	const res = await listRecords("shift_events", {
		page: 1,
		perPage: 500,
		sort: "+date",
		filter: filters.join(" && ") || undefined,
	});
	return res.items;
};

export const createShiftEvent = (payload: Partial<ShiftEvent>): Promise<ShiftEvent> =>
	createRecord("shift_events", payload);

export const updateShiftEvent = (id: string, payload: Partial<ShiftEvent>): Promise<ShiftEvent> =>
	updateRecord("shift_events", id, payload);

export const deleteShiftEvent = (id: string): Promise<void> => deleteRecord("shift_events", id);

export const listShiftAssignments = async (params: {
	branchId: string;
	from: string;
	to: string;
}): Promise<ShiftAssignment[]> => {
	const res = await listRecords("shift_assignments", {
		page: 1,
		perPage: 1000,
		sort: "+date",
		filter:
			`branch_id = "${escapeFilterValue(params.branchId)}" && ` +
			`date >= "${escapeFilterValue(params.from)}" && date <= "${escapeFilterValue(params.to)}"`,
	});
	return res.items;
};

export const createShiftAssignment = (payload: Partial<ShiftAssignment>): Promise<ShiftAssignment> =>
	createRecord("shift_assignments", payload);

export const deleteShiftAssignment = (id: string): Promise<void> => deleteRecord("shift_assignments", id);
