import {
	createRecord,
	deleteRecord,
	escapeFilterValue,
	fileUrl,
	getRecordById,
	listRecords,
	updateRecord,
} from "@/api/client";
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
		// Promo tanpa end_date = tanpa tenggat waktu, jadi selalu dianggap aktif.
		filters.push(`(end_date = null || end_date >= \"${nowIso()}\")`);
	}
	if (params?.showOnHome) filters.push("show_on_home = true");

	const res = await listRecords("promos", {
		page: params?.page,
		perPage: params?.perPage ?? 20,
		filter: filters.join(" && "),
		sort: "+priority,-created",
	});

	// Lampirkan nama cabang untuk promo non-global, supaya kartu promo di
	// halaman publik bisa menyebut cabang mana promo itu berlaku.
	const allLinks = await listRecords("promo_branches", { page: 1, perPage: 500 });
	const branchRecords = await listRecords("branches", { page: 1, perPage: 500 });
	const branchNameById = new Map(branchRecords.items.map((b) => [b.id, b.name]));
	const branchNamesByPromo = new Map<string, string[]>();
	for (const link of allLinks.items) {
		const name = branchNameById.get(link.branch_id);
		if (!name) continue;
		const list = branchNamesByPromo.get(link.promo_id) ?? [];
		list.push(name);
		branchNamesByPromo.set(link.promo_id, list);
	}
	const withBranches = (promo: Promo): Promo =>
		promo.is_global
			? { ...promo, branch_names: [] }
			: { ...promo, branch_names: branchNamesByPromo.get(promo.id) ?? [] };

	if (!params?.branchId) {
		return { items: res.items.map(mapPromoImage).map(withBranches), totalItems: res.totalItems };
	}

	const relation = await listRecords("promo_branches", {
		page: 1,
		perPage: 500,
		filter: `branch_id = \"${escapeFilterValue(params.branchId)}\"`,
	});
	const promoIds = new Set(relation.items.map((item) => item.promo_id));
	const filtered = res.items
		.filter((promo) => promo.is_global || promoIds.has(promo.id))
		.map(mapPromoImage)
		.map(withBranches);
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

/** Semua relasi promo-cabang dalam sekali request. */
export const listPromoBranchLinks = async (): Promise<PromoBranch[]> => {
	const res = await listRecords("promo_branches", { page: 1, perPage: 500 });
	return res.items;
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
	const promos = await getPromos({ status: "published", activeOnly: true, showOnHome: true, perPage: 50, page: 1 });
	// Promo bertenggat diprioritaskan, promo tanpa tenggat tampil paling belakang.
	const withDeadline = promos.items.filter((promo) => Boolean(promo.end_date));
	const evergreen = promos.items.filter((promo) => !promo.end_date);
	return withDeadline[0] ?? evergreen[0] ?? null;
};

export const expirePromos = async (): Promise<void> => {
	const expired = await listRecords("promos", {
		page: 1,
		perPage: 500,
		filter: `status != \"expired\" && end_date != null && end_date < \"${nowIso()}\"`,
	});

	for (const promo of expired.items) {
		await updateRecord("promos", promo.id, { status: "expired", is_active: false });
	}
};
