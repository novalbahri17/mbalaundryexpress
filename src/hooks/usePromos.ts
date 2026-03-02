import { useQuery } from "@tanstack/react-query";
import { getPromos } from "@/api/promos.api";

export const PROMOS_QUERY_KEY = "promos";

export const usePromos = (options?: {
	showOnHome?: boolean;
	activeOnly?: boolean;
	branchId?: string;
}) =>
	useQuery({
		queryKey: [PROMOS_QUERY_KEY, options],
		queryFn: async () => {
			const res = await getPromos({
				showOnHome: options?.showOnHome,
				activeOnly: options?.activeOnly,
				status: "published",
				branchId: options?.branchId,
				perPage: 50,
			});
			return res.items;
		},
		staleTime: 60_000,
	});

