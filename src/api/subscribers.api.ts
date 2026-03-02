import { createRecord, deleteRecord, escapeFilterValue, listRecords, updateRecord } from "@/api/pocketbase";
import type { Subscriber } from "@/types/database.types";

export const getSubscribers = async (): Promise<Subscriber[]> => {
	const res = await listRecords("subscribers", {
		page: 1,
		perPage: 500,
		sort: "-created",
	});
	return res.items;
};

export const findSubscriberByPhone = async (phone: string): Promise<Subscriber | null> => {
	const res = await listRecords("subscribers", {
		page: 1,
		perPage: 1,
		filter: `phone = \"${escapeFilterValue(phone)}\"`,
	});
	return res.items[0] ?? null;
};

export const subscribePromo = async (payload: Pick<Subscriber, "phone" | "branch_id">): Promise<Subscriber> => {
	const existing = await findSubscriberByPhone(payload.phone);
	if (existing) {
		if (!existing.is_active) {
			return updateRecord("subscribers", existing.id, { is_active: true, branch_id: payload.branch_id });
		}
		return existing;
	}
	return createRecord("subscribers", {
		phone: payload.phone,
		branch_id: payload.branch_id,
		is_active: true,
		source: "landing-page",
	});
};

export const unsubscribePromo = async (id: string): Promise<Subscriber> =>
	updateRecord("subscribers", id, { is_active: false });

export const deleteSubscriber = (id: string): Promise<void> => deleteRecord("subscribers", id);


