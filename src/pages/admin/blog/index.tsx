import { useQuery, useQueryClient } from "@tanstack/react-query";
import { message, Popconfirm, Tooltip } from "antd";
import {
	BookOpen,
	CalendarDays,
	CheckCircle2,
	ExternalLink,
	Eye,
	EyeOff,
	FileText,
	ImageOff,
	LayoutGrid,
	List,
	Pencil,
	Plus,
	Search,
	Trash2,
	TrendingUp,
	Undo2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { createArticle, deleteArticle, getArticles, updateArticle } from "@/api/articles.api";
import { type ArticleEditorData, BlogEditor } from "@/components/admin/blog/BlogEditor";
import type { Article, ArticleCategory } from "@/types/database.types";
import { formatCompact, formatDate } from "@/utils/format";

type StatusFilter = "all" | "published" | "draft";
type ViewMode = "grid" | "table";

const CATEGORY_META: Record<ArticleCategory, { label: string; className: string }> = {
	"tips-mencuci": { label: "Tips Mencuci", className: "cat-teal" },
	"tips-kering": { label: "Tips Kering", className: "cat-blue" },
	"perawatan-bahan": { label: "Perawatan Bahan", className: "cat-violet" },
	noda: { label: "Tips Noda", className: "cat-amber" },
	umum: { label: "Umum", className: "cat-gray" },
	berita: { label: "Berita", className: "cat-brand" },
	"promo-info": { label: "Promo & Info", className: "cat-pink" },
};

const PAGE_SIZE = 12;

const getCategoryMeta = (category: ArticleCategory) => CATEGORY_META[category] ?? CATEGORY_META.umum;

export default function BlogAdminPage() {
	const queryClient = useQueryClient();
	const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const [search, setSearch] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<ArticleCategory | "all">("all");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [page, setPage] = useState(1);

	const { data: articles = [], isLoading } = useQuery({
		queryKey: ["admin-articles"],
		queryFn: () => getArticles(),
	});

	const stats = useMemo(() => {
		const published = articles.filter((item) => item.status === "published").length;
		return {
			total: articles.length,
			published,
			draft: articles.length - published,
			views: articles.reduce((sum, item) => sum + (item.views || 0), 0),
		};
	}, [articles]);

	const filtered = useMemo(() => {
		const query = search.trim().toLowerCase();
		return articles.filter((article) => {
			if (statusFilter !== "all" && article.status !== statusFilter) return false;
			if (categoryFilter !== "all" && article.category !== categoryFilter) return false;
			if (query && !`${article.title} ${article.excerpt ?? ""}`.toLowerCase().includes(query)) return false;
			return true;
		});
	}, [articles, search, categoryFilter, statusFilter]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(page, totalPages);
	const pagedArticles = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

	const hasActiveFilters = search.trim() !== "" || categoryFilter !== "all" || statusFilter !== "all";

	const resetFilters = () => {
		setSearch("");
		setCategoryFilter("all");
		setStatusFilter("all");
		setPage(1);
	};

	const handleEdit = (article: Article) => {
		setSelectedArticle(article);
		setIsCreating(false);
	};

	const handleCreate = () => {
		setSelectedArticle(null);
		setIsCreating(true);
	};

	const handleBack = () => {
		setSelectedArticle(null);
		setIsCreating(false);
	};

	const handleSave = async (data: ArticleEditorData) => {
		setIsSaving(true);
		try {
			// `articles.thumbnail` adalah field file → wajib dikirim sebagai file asli
			// lewat multipart FormData. URL string akan ditolak (400).
			const fd = new FormData();
			fd.append("title", data.title);
			fd.append("slug", data.slug);
			fd.append("content", data.content);
			fd.append("excerpt", data.excerpt);
			fd.append("category", data.category);
			fd.append("status", data.status);
			fd.append("read_time", String(data.read_time));
			fd.append("meta_title", data.meta_title);
			fd.append("meta_desc", data.meta_desc);
			fd.append("views", String(selectedArticle?.views ?? 0));
			if (data.thumbnailFile) {
				fd.append("thumbnail", data.thumbnailFile);
			} else if (!data.thumbnail && selectedArticle?.thumbnail) {
				// gambar utama dihapus → kirim nilai kosong agar file lama terhapus
				fd.append("thumbnail", "");
			}

			if (selectedArticle) {
				await updateArticle(selectedArticle.id, fd);
				message.success("Artikel diperbarui");
			} else {
				await createArticle(fd);
				message.success("Artikel dibuat");
			}
			await queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
			handleBack();
		} catch {
			message.error("Gagal menyimpan artikel");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await deleteArticle(id);
			message.success("Artikel dihapus");
			await queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
		} catch {
			message.error("Gagal menghapus artikel");
		}
	};

	const handleToggleStatus = async (article: Article) => {
		const next = article.status === "published" ? "draft" : "published";
		try {
			await updateArticle(article.id, {
				status: next,
				published_at: next === "published" ? new Date().toISOString() : article.published_at,
			});
			message.success(next === "published" ? "Artikel dipublikasikan" : "Artikel ditarik kembali ke draft");
			await queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
		} catch {
			message.error("Gagal mengubah status artikel");
		}
	};

	if (isCreating || selectedArticle) {
		return (
			<BlogEditor
				article={selectedArticle || undefined}
				onSave={handleSave}
				onCancel={handleBack}
				isSaving={isSaving}
			/>
		);
	}

	return (
		<div className="blog-admin">
			<style>{blogStyles}</style>

			{/* Header */}
			<div className="blog-header">
				<div>
					<h1 className="blog-title">Blog & Artikel</h1>
					<p className="blog-subtitle">Kelola konten blog, tips laundry, berita, dan pengumuman.</p>
				</div>
				<button type="button" className="blog-btn-primary" onClick={handleCreate}>
					<Plus size={16} />
					Tulis Artikel
				</button>
			</div>

			{/* Stats */}
			<div className="blog-stats-grid">
				<div className="blog-stat tone-brand">
					<div className="blog-stat-icon">
						<FileText size={20} />
					</div>
					<div className="blog-stat-info">
						<span className="blog-stat-value">{formatCompact(stats.total)}</span>
						<span className="blog-stat-label">Total Artikel</span>
					</div>
				</div>
				<div className="blog-stat tone-success">
					<div className="blog-stat-icon">
						<CheckCircle2 size={20} />
					</div>
					<div className="blog-stat-info">
						<span className="blog-stat-value">{formatCompact(stats.published)}</span>
						<span className="blog-stat-label">Published</span>
					</div>
				</div>
				<div className="blog-stat tone-warning">
					<div className="blog-stat-icon">
						<EyeOff size={20} />
					</div>
					<div className="blog-stat-info">
						<span className="blog-stat-value">{formatCompact(stats.draft)}</span>
						<span className="blog-stat-label">Draft</span>
					</div>
				</div>
				<div className="blog-stat tone-info">
					<div className="blog-stat-icon">
						<TrendingUp size={20} />
					</div>
					<div className="blog-stat-info">
						<span className="blog-stat-value">{formatCompact(stats.views)}</span>
						<span className="blog-stat-label">Total Views</span>
					</div>
				</div>
			</div>

			{/* Toolbar */}
			<div className="blog-toolbar">
				<div className="blog-search">
					<Search size={15} />
					<input
						type="text"
						placeholder="Cari judul atau ringkasan artikel..."
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
					/>
				</div>

				<select
					className="blog-select"
					value={categoryFilter}
					onChange={(e) => {
						setCategoryFilter(e.target.value as ArticleCategory | "all");
						setPage(1);
					}}
				>
					<option value="all">Semua Kategori</option>
					{Object.entries(CATEGORY_META).map(([value, meta]) => (
						<option key={value} value={value}>
							{meta.label}
						</option>
					))}
				</select>

				<div className="blog-status-tabs">
					{(
						[
							{ value: "all", label: "Semua" },
							{ value: "published", label: "Published" },
							{ value: "draft", label: "Draft" },
						] as const
					).map((tab) => (
						<button
							key={tab.value}
							type="button"
							className={`blog-status-tab ${statusFilter === tab.value ? "active" : ""}`}
							onClick={() => {
								setStatusFilter(tab.value);
								setPage(1);
							}}
						>
							{tab.label}
						</button>
					))}
				</div>

				<div className="blog-view-toggle">
					<Tooltip title="Tampilan kartu">
						<button type="button" className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")}>
							<LayoutGrid size={15} />
						</button>
					</Tooltip>
					<Tooltip title="Tampilan tabel">
						<button type="button" className={viewMode === "table" ? "active" : ""} onClick={() => setViewMode("table")}>
							<List size={15} />
						</button>
					</Tooltip>
				</div>
			</div>

			{/* Content */}
			{isLoading ? (
				<div className="blog-grid">
					{Array.from({ length: 6 }).map((_, idx) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
						<div key={idx} className="blog-skeleton-card">
							<div className="skeleton-thumb" />
							<div className="skeleton-body">
								<div className="skeleton-line w-40" />
								<div className="skeleton-line w-90" />
								<div className="skeleton-line w-70" />
							</div>
						</div>
					))}
				</div>
			) : filtered.length === 0 ? (
				<div className="blog-empty">
					<div className="blog-empty-icon">
						<FileText size={28} />
					</div>
					{hasActiveFilters ? (
						<>
							<h3>Tidak ada artikel yang cocok</h3>
							<p>Coba ubah kata kunci atau reset filter pencarian.</p>
							<button type="button" className="blog-btn-ghost" onClick={resetFilters}>
								Reset Filter
							</button>
						</>
					) : (
						<>
							<h3>Belum ada artikel</h3>
							<p>Mulai tulis artikel pertama untuk blog MBA Laundry Express.</p>
							<button type="button" className="blog-btn-primary" onClick={handleCreate}>
								<Plus size={16} />
								Tulis Artikel Pertama
							</button>
						</>
					)}
				</div>
			) : viewMode === "grid" ? (
				<div className="blog-grid">
					{pagedArticles.map((article) => (
						<ArticleCard
							key={article.id}
							article={article}
							onEdit={() => handleEdit(article)}
							onToggleStatus={() => handleToggleStatus(article)}
							onDelete={() => handleDelete(article.id)}
						/>
					))}
				</div>
			) : (
				<div className="blog-table-card">
					<table className="blog-table">
						<thead>
							<tr>
								<th>Artikel</th>
								<th>Kategori</th>
								<th>Status</th>
								<th>Views</th>
								<th>Tanggal</th>
								<th className="th-actions">Aksi</th>
							</tr>
						</thead>
						<tbody>
							{pagedArticles.map((article) => {
								const meta = getCategoryMeta(article.category);
								return (
									<tr key={article.id}>
										<td>
											<div className="table-article" onClick={() => handleEdit(article)}>
												{article.thumbnail ? (
													<img className="table-thumb" src={article.thumbnail} alt={article.title} loading="lazy" />
												) : (
													<div className="table-thumb table-thumb-empty">
														<ImageOff size={16} />
													</div>
												)}
												<div className="table-article-text">
													<span className="table-title">{article.title}</span>
													<span className="table-excerpt">{article.excerpt || "Belum ada ringkasan"}</span>
												</div>
											</div>
										</td>
										<td>
											<span className={`cat-chip ${meta.className}`}>{meta.label}</span>
										</td>
										<td>
											<span className={`status-pill ${article.status}`}>
												{article.status === "published" ? "Published" : "Draft"}
											</span>
										</td>
										<td className="td-views">{formatCompact(article.views || 0)}</td>
										<td className="td-date">{formatDate(article.published_at || article.created || "")}</td>
										<td>
											<ArticleActions
												article={article}
												onEdit={() => handleEdit(article)}
												onToggleStatus={() => handleToggleStatus(article)}
												onDelete={() => handleDelete(article.id)}
											/>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			{/* Pagination */}
			{!isLoading && filtered.length > 0 && (
				<div className="blog-pagination">
					<span className="blog-pagination-info">
						Menampilkan {pagedArticles.length} dari {filtered.length} artikel
					</span>
					{totalPages > 1 && (
						<div className="blog-pagination-controls">
							<button type="button" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>
								Sebelumnya
							</button>
							<span>
								Halaman {safePage} / {totalPages}
							</span>
							<button type="button" disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>
								Berikutnya
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

// ============ ARTICLE CARD (GRID VIEW) ============
function ArticleCard({
	article,
	onEdit,
	onToggleStatus,
	onDelete,
}: {
	article: Article;
	onEdit: () => void;
	onToggleStatus: () => void;
	onDelete: () => void;
}) {
	const meta = getCategoryMeta(article.category);

	return (
		<article className="article-card">
			<div className="article-card-thumb" onClick={onEdit}>
				{article.thumbnail ? (
					<img src={article.thumbnail} alt={article.title} loading="lazy" />
				) : (
					<div className="thumb-placeholder">
						<ImageOff size={26} />
					</div>
				)}
				<span className={`card-status ${article.status}`}>
					{article.status === "published" ? "Published" : "Draft"}
				</span>
			</div>

			<div className="article-card-body" onClick={onEdit}>
				<div className="card-top-row">
					<span className={`cat-chip ${meta.className}`}>{meta.label}</span>
					<span className="card-date">
						<CalendarDays size={12} />
						{formatDate(article.published_at || article.created || "")}
					</span>
				</div>
				<h3 className="card-title">{article.title}</h3>
				<p className="card-excerpt">{article.excerpt || "Belum ada ringkasan artikel."}</p>
				<div className="card-meta">
					<span>
						<Eye size={13} />
						{formatCompact(article.views || 0)} views
					</span>
					<span>
						<BookOpen size={13} />
						{article.read_time || 1} mnt baca
					</span>
				</div>
			</div>

			<ArticleActions article={article} onEdit={onEdit} onToggleStatus={onToggleStatus} onDelete={onDelete} />
		</article>
	);
}

// ============ SHARED ACTIONS ============
function ArticleActions({
	article,
	onEdit,
	onToggleStatus,
	onDelete,
}: {
	article: Article;
	onEdit: () => void;
	onToggleStatus: () => void;
	onDelete: () => void;
}) {
	const isPublished = article.status === "published";

	return (
		<div className="article-card-actions">
			<Tooltip title="Lihat di website">
				<button
					type="button"
					className="card-action-btn"
					onClick={() => window.open(`/blog/${article.slug}`, "_blank", "noopener,noreferrer")}
				>
					<ExternalLink size={14} />
				</button>
			</Tooltip>
			<Tooltip title="Edit artikel">
				<button type="button" className="card-action-btn" onClick={onEdit}>
					<Pencil size={14} />
				</button>
			</Tooltip>
			<Tooltip title={isPublished ? "Tarik ke draft" : "Publikasikan"}>
				<button type="button" className="card-action-btn" onClick={onToggleStatus}>
					{isPublished ? <Undo2 size={14} /> : <CheckCircle2 size={14} />}
				</button>
			</Tooltip>
			<Popconfirm
				title="Hapus artikel ini?"
				description="Tindakan ini tidak dapat dibatalkan."
				onConfirm={onDelete}
				okText="Hapus"
				okButtonProps={{ danger: true }}
				cancelText="Batal"
			>
				<Tooltip title="Hapus artikel">
					<button type="button" className="card-action-btn danger">
						<Trash2 size={14} />
					</button>
				</Tooltip>
			</Popconfirm>
		</div>
	);
}

// ============ STYLES ============
const blogStyles = `
	.blog-admin {
		max-width: 1400px;
		margin: 0 auto;
	}

	/* ===== HEADER ===== */
	.blog-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 22px;
		flex-wrap: wrap;
	}

	.blog-title {
		font-size: 22px;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
		line-height: 1.2;
	}

	.blog-subtitle {
		font-size: 13px;
		color: var(--text-muted);
		margin: 5px 0 0;
	}

	.blog-btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 18px;
		background: var(--brand);
		color: var(--brand-text);
		border: none;
		border-radius: var(--radius-sm);
		font-size: 13px;
		font-weight: 600;
		font-family: var(--font-sans);
		cursor: pointer;
		transition: background var(--transition-fast);
		box-shadow: 0 4px 14px rgba(198, 40, 40, 0.25);
	}

	.blog-btn-primary:hover {
		background: var(--brand-hover);
	}

	.blog-btn-ghost {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 9px 18px;
		background: transparent;
		color: var(--text-secondary);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-sm);
		font-size: 13px;
		font-weight: 600;
		font-family: var(--font-sans);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.blog-btn-ghost:hover {
		border-color: var(--brand);
		color: var(--brand);
	}

	/* ===== STATS ===== */
	.blog-stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 14px;
		margin-bottom: 20px;
	}

	.blog-stat {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 16px 18px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-card);
	}

	.blog-stat-icon {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 12px;
		flex-shrink: 0;
	}

	.blog-stat.tone-brand .blog-stat-icon { background: var(--brand-bg); color: var(--brand); }
	.blog-stat.tone-success .blog-stat-icon { background: var(--success-bg); color: var(--success); }
	.blog-stat.tone-warning .blog-stat-icon { background: var(--warning-bg); color: var(--warning); }
	.blog-stat.tone-info .blog-stat-icon { background: var(--info-bg); color: var(--info); }

	.blog-stat-info {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.blog-stat-value {
		font-size: 20px;
		font-weight: 700;
		color: var(--text-primary);
		line-height: 1.2;
	}

	.blog-stat-label {
		font-size: 12px;
		color: var(--text-muted);
		margin-top: 2px;
	}

	/* ===== TOOLBAR ===== */
	.blog-toolbar {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
		padding: 12px 14px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-card);
		margin-bottom: 18px;
	}

	.blog-search {
		position: relative;
		flex: 1;
		min-width: 220px;
	}

	.blog-search svg {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--text-muted);
		pointer-events: none;
	}

	.blog-search input {
		width: 100%;
		padding: 9px 12px 9px 36px;
		background: var(--bg-surface);
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		font-size: 13px;
		font-family: var(--font-sans);
		color: var(--text-primary);
		outline: none;
		transition: all var(--transition-fast);
	}

	.blog-search input::placeholder {
		color: var(--text-muted);
	}

	.blog-search input:focus {
		border-color: var(--brand);
		background: var(--bg-card);
	}

	.blog-select {
		padding: 9px 12px;
		background: var(--bg-surface);
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		font-size: 13px;
		font-family: var(--font-sans);
		color: var(--text-secondary);
		outline: none;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.blog-select:focus {
		border-color: var(--brand);
	}

	.blog-status-tabs {
		display: flex;
		gap: 2px;
		padding: 3px;
		background: var(--bg-surface);
		border-radius: var(--radius-sm);
	}

	.blog-status-tab {
		padding: 7px 14px;
		background: transparent;
		border: none;
		border-radius: 8px;
		font-size: 12.5px;
		font-weight: 600;
		font-family: var(--font-sans);
		color: var(--text-muted);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.blog-status-tab:hover {
		color: var(--text-primary);
	}

	.blog-status-tab.active {
		background: var(--bg-card);
		color: var(--text-primary);
		box-shadow: var(--shadow-card);
	}

	.blog-view-toggle {
		display: flex;
		gap: 2px;
		padding: 3px;
		background: var(--bg-surface);
		border-radius: var(--radius-sm);
	}

	.blog-view-toggle button {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		background: transparent;
		border: none;
		border-radius: 8px;
		color: var(--text-muted);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.blog-view-toggle button:hover {
		color: var(--text-primary);
	}

	.blog-view-toggle button.active {
		background: var(--bg-card);
		color: var(--brand);
		box-shadow: var(--shadow-card);
	}

	/* ===== GRID & CARDS ===== */
	.blog-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 16px;
	}

	.article-card {
		display: flex;
		flex-direction: column;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-card);
		transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
	}

	.article-card:hover {
		transform: translateY(-3px);
		box-shadow: var(--shadow-card-hover);
		border-color: var(--border-strong);
	}

	.article-card-thumb {
		position: relative;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		background: var(--bg-surface);
		cursor: pointer;
	}

	.article-card-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform var(--transition-slow);
	}

	.article-card:hover .article-card-thumb img {
		transform: scale(1.05);
	}

	.thumb-placeholder {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
		color: var(--text-muted);
		opacity: 0.5;
	}

	.card-status {
		position: absolute;
		top: 10px;
		left: 10px;
		padding: 3px 10px;
		border-radius: var(--radius-full);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.02em;
		backdrop-filter: blur(6px);
	}

	.card-status.published {
		background: rgba(22, 163, 74, 0.9);
		color: #fff;
	}

	.card-status.draft {
		background: rgba(202, 138, 4, 0.9);
		color: #fff;
	}

	.article-card-body {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 15px 16px 13px;
		flex: 1;
		cursor: pointer;
	}

	.card-top-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.card-date {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 11.5px;
		color: var(--text-muted);
	}

	.cat-chip {
		display: inline-flex;
		align-items: center;
		padding: 3px 10px;
		border-radius: var(--radius-full);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.02em;
		white-space: nowrap;
	}

	.cat-teal { background: rgba(15, 118, 110, 0.12); color: var(--accent-teal); }
	.cat-blue { background: var(--info-bg); color: var(--info); }
	.cat-violet { background: rgba(124, 58, 237, 0.12); color: var(--accent-violet); }
	.cat-amber { background: var(--warning-bg); color: var(--warning); }
	.cat-gray { background: var(--bg-surface); color: var(--text-muted); }
	.cat-brand { background: var(--brand-bg); color: var(--brand); }
	.cat-pink { background: rgba(236, 72, 153, 0.12); color: #db2777; }

	.card-title {
		font-size: 15.5px;
		font-weight: 700;
		line-height: 1.4;
		color: var(--text-primary);
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-excerpt {
		font-size: 13px;
		line-height: 1.55;
		color: var(--text-muted);
		margin: 0;
		flex: 1;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-meta {
		display: flex;
		align-items: center;
		gap: 14px;
		padding-top: 10px;
		margin-top: auto;
		border-top: 1px solid var(--border);
		font-size: 12px;
		color: var(--text-muted);
	}

	.card-meta span {
		display: inline-flex;
		align-items: center;
		gap: 5px;
	}

	.article-card-actions {
		display: flex;
		align-items: stretch;
		border-top: 1px solid var(--border);
		background: var(--bg-card);
	}

	.card-action-btn {
		flex: 1;
		display: grid;
		place-items: center;
		padding: 10px 0;
		background: transparent;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.card-action-btn + .card-action-btn {
		border-left: 1px solid var(--border);
	}

	.card-action-btn:hover {
		background: var(--bg-surface);
		color: var(--text-primary);
	}

	.card-action-btn.danger:hover {
		background: var(--danger-bg);
		color: var(--danger);
	}

	/* ===== TABLE VIEW ===== */
	.blog-table-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-card);
		overflow-x: auto;
	}

	.blog-table {
		width: 100%;
		border-collapse: collapse;
		min-width: 760px;
	}

	.blog-table th {
		text-align: left;
		padding: 12px 16px;
		font-size: 11.5px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
		background: var(--bg-surface);
		border-bottom: 1px solid var(--border);
	}

	.blog-table th.th-actions {
		width: 190px;
	}

	.blog-table td {
		padding: 12px 16px;
		font-size: 13px;
		color: var(--text-secondary);
		border-bottom: 1px solid var(--border);
		vertical-align: middle;
	}

	.blog-table tbody tr:last-child td {
		border-bottom: none;
	}

	.blog-table tbody tr {
		transition: background var(--transition-fast);
	}

	.blog-table tbody tr:hover {
		background: var(--bg-surface);
	}

	.table-article {
		display: flex;
		align-items: center;
		gap: 12px;
		cursor: pointer;
		max-width: 380px;
	}

	.table-thumb {
		width: 60px;
		height: 42px;
		border-radius: 8px;
		object-fit: cover;
		flex-shrink: 0;
	}

	.table-thumb-empty {
		display: grid;
		place-items: center;
		background: var(--bg-surface);
		color: var(--text-muted);
		opacity: 0.6;
	}

	.table-article-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.table-title {
		font-weight: 600;
		color: var(--text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.table-excerpt {
		font-size: 12px;
		color: var(--text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.status-pill {
		display: inline-flex;
		padding: 3px 10px;
		border-radius: var(--radius-full);
		font-size: 11px;
		font-weight: 700;
	}

	.status-pill.published {
		background: var(--success-bg);
		color: var(--success);
	}

	.status-pill.draft {
		background: var(--warning-bg);
		color: var(--warning);
	}

	.td-views {
		font-weight: 600;
		color: var(--text-primary);
	}

	.td-date {
		white-space: nowrap;
	}

	.blog-table .article-card-actions {
		border: none;
		background: transparent;
		border-radius: var(--radius-sm);
		overflow: hidden;
		width: max-content;
	}

	.blog-table .card-action-btn {
		width: 36px;
		flex: none;
		padding: 8px 0;
	}

	.blog-table .card-action-btn + .card-action-btn {
		border-left: none;
	}

	/* ===== SKELETON ===== */
	.blog-skeleton-card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.skeleton-thumb {
		aspect-ratio: 16 / 9;
		background: linear-gradient(90deg, var(--bg-surface) 25%, var(--border) 50%, var(--bg-surface) 75%);
		background-size: 200% 100%;
		animation: blogShimmer 1.4s infinite;
	}

	.skeleton-body {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.skeleton-line {
		height: 12px;
		border-radius: 6px;
		background: linear-gradient(90deg, var(--bg-surface) 25%, var(--border) 50%, var(--bg-surface) 75%);
		background-size: 200% 100%;
		animation: blogShimmer 1.4s infinite;
	}

	.skeleton-line.w-40 { width: 40%; }
	.skeleton-line.w-70 { width: 70%; }
	.skeleton-line.w-90 { width: 90%; }

	@keyframes blogShimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	/* ===== EMPTY STATE ===== */
	.blog-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 64px 24px;
		background: var(--bg-card);
		border: 1px dashed var(--border-strong);
		border-radius: var(--radius-lg);
	}

	.blog-empty-icon {
		display: grid;
		place-items: center;
		width: 60px;
		height: 60px;
		border-radius: var(--radius-full);
		background: var(--bg-surface);
		color: var(--text-muted);
		margin-bottom: 16px;
	}

	.blog-empty h3 {
		font-size: 16px;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0 0 6px;
	}

	.blog-empty p {
		font-size: 13px;
		color: var(--text-muted);
		margin: 0 0 18px;
		max-width: 340px;
	}

	/* ===== PAGINATION ===== */
	.blog-pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
		margin-top: 18px;
	}

	.blog-pagination-info {
		font-size: 12.5px;
		color: var(--text-muted);
	}

	.blog-pagination-controls {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 12.5px;
		color: var(--text-secondary);
	}

	.blog-pagination-controls button {
		padding: 7px 14px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		font-size: 12.5px;
		font-weight: 600;
		font-family: var(--font-sans);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.blog-pagination-controls button:hover:not(:disabled) {
		border-color: var(--brand);
		color: var(--brand);
	}

	.blog-pagination-controls button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	/* ===== RESPONSIVE ===== */
	@media (max-width: 1100px) {
		.blog-stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 640px) {
		.blog-stats-grid {
			grid-template-columns: 1fr;
		}
	}
`;
