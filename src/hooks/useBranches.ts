import { useQuery } from "@tanstack/react-query";
import { getBranches } from "@/api/branches.api";

export const BRANCHES_QUERY_KEY = "branches";

export const useBranches = (options?: { activeOnly?: boolean; search?: string }) =>
	useQuery({
		queryKey: [BRANCHES_QUERY_KEY, options],
		queryFn: async () => {
			const res = await getBranches({
				activeOnly: options?.activeOnly,
				search: options?.search,
				perPage: 200,
			});
			return res.items;
		},
		staleTime: 60_000,
	});

