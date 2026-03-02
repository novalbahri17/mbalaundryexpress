import { createRecord, deleteRecord, escapeFilterValue, getRecordById, listRecords, updateRecord } from "@/api/pocketbase";
import type { LoyaltyMember, LoyaltyTransaction } from "@/types/database.types";

export const getLoyaltyMembers = async (): Promise<LoyaltyMember[]> => {
	const res = await listRecords("loyalty_members", {
		page: 1,
		perPage: 500,
		sort: "-points,+name",
	});
	return res.items;
};

export const getLoyaltyMemberById = (id: string): Promise<LoyaltyMember> => getRecordById("loyalty_members", id);
export const createLoyaltyMember = (payload: Partial<LoyaltyMember>): Promise<LoyaltyMember> =>
	createRecord("loyalty_members", payload);
export const updateLoyaltyMember = (id: string, payload: Partial<LoyaltyMember>): Promise<LoyaltyMember> =>
	updateRecord("loyalty_members", id, payload);
export const deleteLoyaltyMember = (id: string): Promise<void> => deleteRecord("loyalty_members", id);

export const getLoyaltyTransactions = async (memberId?: string): Promise<LoyaltyTransaction[]> => {
	const filter = memberId ? `member_id = \"${escapeFilterValue(memberId)}\"` : undefined;
	const res = await listRecords("loyalty_transactions", {
		page: 1,
		perPage: 500,
		filter,
		sort: "-created",
		expand: "member_id,branch_id",
	});
	return res.items;
};

export const createLoyaltyTransaction = async (
	payload: Partial<LoyaltyTransaction>,
): Promise<LoyaltyTransaction> => {
	if (!payload.member_id || typeof payload.points !== "number") {
		throw new Error("member_id dan points wajib diisi");
	}

	const trx = await createRecord("loyalty_transactions", payload);
	const member = await getLoyaltyMemberById(payload.member_id);
	await updateLoyaltyMember(member.id, {
		points: member.points + payload.points,
	});
	return trx;
};


