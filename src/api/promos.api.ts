import {
	createRecord,
	deleteRecord,
	escapeFilterValue,
	fileUrl,
	getRecordById,
	listRecords,
	updateRecord,
} from "@/api/pocketbase";
import type { Promo, PromoBranch } from "@/types/database.types";

const nowIso = (): string => new Date().toISOString();

const isDirectUrl = (value?: string): boolean =>
	Boolean(
		value &&
			(value.startsWith("http://") ||
				value.startsWith("https://") ||
				value.startsWith("/") ||
				value.startsWith("data:image/") ||
				value.startsWith("blob:")),
	);

const mapPromoImage = (promo: Promo): Promo => {
	if (!promo.image || isDirectUrl(promo.image)) return promo;
	return {
		...promo,
		image: fileUrl("promos", { id: promo.id }, promo.image) ?? promo.image,
	};
};

export const getPromos = async (params?: {
	status?: Promo["status"];
	activeOnly?: boolean;
	showOnHome?: boolean;
	branchId?: string;
	page?: number;
	perPage?: number;
}): Promise<{ items: Promo[]; totalItems: number }> => {
	const filters: string[] = [];
	if (params?.status) filters.push(`status = \"${escapeFilterValue(params.status)}\"`);
	if (params?.activeOnly) {
		filters.push("is_active = true");
		filters.push(`start_date <= \"${nowIso()}\"`);
		filters.push(`end_date >= \"${nowIso()}\"`);
	}
	if (params?.showOnHome) filters.push("show_on_home = true");

	const res = await listRecords("promos", {
		page: params?.page,
		perPage: params?.perPage ?? 20,
		filter: filters.join(" && "),
		sort: "+priority,+end_date",
	});

	if (!params?.branchId) {
		return { items: res.items.map(mapPromoImage), totalItems: res.totalItems };
	}

	const relation = await listRecords("promo_branches", {
		page: 1,
		perPage: 500,
		filter: `branch_id = \"${escapeFilterValue(params.branchId)}\"`,
	});
	const promoIds = new Set(relation.items.map((item) => item.promo_id));
	const filtered = res.items.filter((promo) => promo.is_global || promoIds.has(promo.id)).map(mapPromoImage);
	return { items: filtered, totalItems: filtered.length };
};

export const getPromoById = async (id: string): Promise<Promo> => {
	const row = await getRecordById("promos", id);
	return mapPromoImage(row);
};
export const createPromo = (payload: Partial<Promo> | FormData): Promise<Promo> => createRecord("promos", payload);
export const updatePromo = (id: string, payload: Partial<Promo> | FormData): Promise<Promo> =>
	updateRecord("promos", id, payload);
export const deletePromo = (id: string): Promise<void> => deleteRecord("promos", id);

export const setPromoBranches = async (promoId: string, branchIds: string[]): Promise<void> => {
	const current = await listRecords("promo_branches", {
		page: 1,
		perPage: 500,
		filter: `promo_id = \"${escapeFilterValue(promoId)}\"`,
	});
	const currentIds = new Set(current.items.map((item) => item.branch_id));
	const incoming = new Set(branchIds);

	for (const item of current.items) {
		if (!incoming.has(item.branch_id)) {
			await deleteRecord("promo_branches", item.id);
		}
	}

	for (const branchId of incoming) {
		if (!currentIds.has(branchId)) {
			await createRecord("promo_branches", { promo_id: promoId, branch_id: branchId } satisfies Partial<PromoBranch>);
		}
	}
};

export const getPromoBranches = async (promoId: string): Promise<PromoBranch[]> => {
	const res = await listRecords("promo_branches", {
		page: 1,
		perPage: 500,
		filter: `promo_id = \"${escapeFilterValue(promoId)}\"`,
	});
	return res.items;
};

export const getTopValidPromo = async (): Promise<Promo | null> => {
	const promos = await getPromos({ status: "published", activeOnly: true, showOnHome: true, perPage: 1, page: 1 });
	return promos.items[0] ?? null;
};

export const expirePromos = async (): Promise<void> => {
	const expired = await listRecords("promos", {
		page: 1,
		perPage: 500,
		filter: `status != \"expired\" && end_date < \"${nowIso()}\"`,
	});

	for (const promo of expired.items) {
		await updateRecord("promos", promo.id, { status: "expired", is_active: false });
	}
};
