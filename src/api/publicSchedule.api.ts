import { request } from "@/api/client";
import type { ShiftKind } from "@/types/database.types";

export interface PublicScheduleSlot {
	date: string;
	employee_id?: string | null;
	employee_name: string;
	shift: ShiftKind;
	start_time: string;
	end_time: string;
	hours: number;
	is_backup: boolean;
	is_emergency: boolean;
	note?: string | null;
}

export interface PublicScheduleEmployee {
	id: string;
	name: string;
	role: string;
	allowed_shifts?: ShiftKind[] | null;
}

export type SchedulePopupFrequency = "always" | "session" | "daily" | "weekly" | "once";
export type SchedulePopupScope = "branch" | "global";

export interface SchedulePopupImage {
	id: string;
	url: string;
}

export interface SchedulePopupConfig {
	enabled: boolean;
	scope?: SchedulePopupScope;
	scopeLabel?: string;
	title: string;
	content: string;
	frequency: SchedulePopupFrequency;
	targetBranchIds?: string[];
	images: SchedulePopupImage[];
	updatedAt: string;
}

export interface PublicScheduleResponse {
	branch: {
		id: string;
		name: string;
		slug: string;
		address: string;
	};
	logoUrl?: string;
	popup?: SchedulePopupConfig | null;
	popups?: SchedulePopupConfig[];
	todayKey: string;
	dayOfWeek: number;
	isWeekend: boolean;
	currentWeek: {
		from: string;
		to: string;
	};
	nextWeek: {
		from: string;
		to: string;
	} | null;
	assignments: PublicScheduleSlot[];
	employees: PublicScheduleEmployee[];
	events: {
		employee_id: string;
		date: string;
		end_date?: string | null;
		type: string;
		note?: string | null;
	}[];
	generatedAtWib: string;
}

export const getPublicSchedule = async (slug: string, token: string): Promise<PublicScheduleResponse> => {
	return request<PublicScheduleResponse>(`/public/schedule/${slug}/${token}`);
};
