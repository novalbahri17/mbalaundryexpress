import { useQuery } from "@tanstack/react-query";
import { getPageContentValueMap, getPageContents } from "@/api/pageContents.api";

export const PAGE_CONTENT_QUERY_KEY = "page-contents";

export const usePageContent = (group?: string) =>
	useQuery({
		queryKey: [PAGE_CONTENT_QUERY_KEY, group],
		queryFn: () => getPageContents(group),
		staleTime: 60_000,
	});

export const usePageContentMap = () =>
	useQuery({
		queryKey: [PAGE_CONTENT_QUERY_KEY, "map"],
		queryFn: getPageContentValueMap,
		staleTime: 60_000,
	});

