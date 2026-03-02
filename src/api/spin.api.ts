import { createRecord, deleteRecord, listRecords, updateRecord } from "@/api/pocketbase";
import type { SpinPlay, SpinReward } from "@/types/database.types";

export const getSpinRewards = async (): Promise<SpinReward[]> => {
	const res = await listRecords("spin_rewards", {
		page: 1,
		perPage: 100,
		sort: "-is_active,-probability,+name",
	});
	return res.items;
};

export const createSpinReward = (payload: Partial<SpinReward>): Promise<SpinReward> =>
	createRecord("spin_rewards", payload);
export const updateSpinReward = (id: string, payload: Partial<SpinReward>): Promise<SpinReward> =>
	updateRecord("spin_rewards", id, payload);
export const deleteSpinReward = (id: string): Promise<void> => deleteRecord("spin_rewards", id);

export const getSpinPlays = async (): Promise<SpinPlay[]> => {
	const res = await listRecords("spin_plays", {
		page: 1,
		perPage: 500,
		sort: "-played_at,-created",
		expand: "reward_id,branch_id",
	});
	return res.items;
};

export const createSpinPlay = (payload: Partial<SpinPlay>): Promise<SpinPlay> => createRecord("spin_plays", payload);

