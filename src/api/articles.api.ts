import {
	createRecord,
	deleteRecord,
	escapeFilterValue,
	fileUrl,
	getRecordById,
	listRecords,
	updateRecord,
} from "@/api/client";
import type { Article } from "@/types/database.types";

const isDirectUrl = (value?: string): boolean =>
	Boolean(
		value &&
			(value.startsWith("http://") ||
				value.startsWith("https://") ||
				value.startsWith("/") ||
				value.startsWith("data:image/") ||
				value.startsWith("blob:")),
	);

const mapThumbnail = (article: Article): Article => {
	if (!article.thumbnail || isDirectUrl(article.thumbnail)) return article;
	return {
		...article,
		thumbnail: fileUrl("articles", { id: article.id }, article.thumbnail) ?? article.thumbnail,
	};
};

export const getArticles = async (params?: {
	publishedOnly?: boolean;
	limit?: number;
	category?: Article["category"];
	search?: string;
}): Promise<Article[]> => {
	const filters: string[] = [];
	if (params?.publishedOnly) filters.push('status = "published"');
	if (params?.category) filters.push(`category = \"${escapeFilterValue(params.category)}\"`);
	if (params?.search) {
		const safeSearch = escapeFilterValue(params.search);
		filters.push(`(title ~ \"${safeSearch}\" || excerpt ~ \"${safeSearch}\")`);
	}
	const res = await listRecords("articles", {
		page: 1,
		perPage: params?.limit ?? 50,
		filter: filters.join(" && "),
		sort: "-published_at,-created",
	});
	return res.items.map(mapThumbnail);
};

export const getArticleById = async (id: string): Promise<Article> => {
	const row = await getRecordById("articles", id);
	return mapThumbnail(row);
};

export const getArticleBySlug = async (slug: string): Promise<Article | null> => {
	const res = await listRecords("articles", {
		page: 1,
		perPage: 1,
		filter: `slug = \"${escapeFilterValue(slug)}\" && status = \"published\"`,
	});
	return res.items[0] ? mapThumbnail(res.items[0]) : null;
};

export const createArticle = (payload: Partial<Article> | FormData): Promise<Article> =>
	createRecord("articles", payload);
export const updateArticle = (id: string, payload: Partial<Article> | FormData): Promise<Article> =>
	updateRecord("articles", id, payload);
export const deleteArticle = (id: string): Promise<void> => deleteRecord("articles", id);

export const incrementArticleViews = async (id: string, currentViews: number): Promise<void> => {
	await updateRecord("articles", id, { views: currentViews + 1 });
};
