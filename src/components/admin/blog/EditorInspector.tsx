import type { Editor } from "@tiptap/react";
import {
	ChevronDown,
	ChevronRight,
	Eye,
	ImageIcon,
	FileText,
	Upload,
	Trash2,
	ListTree,
	Gauge,
	CheckCircle2,
	XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import type { Article, ArticleCategory } from "@/types/database.types";

interface EditorInspectorProps {
	article: Partial<Article>;
	onUpdate: (field: string, value: unknown) => void;
	editor?: Editor | null;
	selectedImageSrc?: string | null;
	selectedImageAttrs?: Record<string, string> | null;
	onImageUpdate?: (attrs: Record<string, unknown>) => void;
}

const categories: { value: ArticleCategory; label: string }[] = [
	{ value: "tips-mencuci", label: "Tips Mencuci" },
	{ value: "tips-kering", label: "Tips Kering" },
	{ value: "perawatan-bahan", label: "Perawatan Bahan" },
	{ value: "noda", label: "Tips Noda" },
	{ value: "umum", label: "Umum" },
	{ value: "berita", label: "Berita" },
	{ value: "promo-info", label: "Promo & Info" },
];

export function EditorInspector({ article, onUpdate, editor, selectedImageSrc, selectedImageAttrs, onImageUpdate }: EditorInspectorProps) {
	const [expandedSections, setExpandedSections] = useState({
		article: true,
		seo: true,
		thumbnail: true,
	});
	const [thumbError, setThumbError] = useState<string | null>(null);
	const [pendingThumbUrl, setPendingThumbUrl] = useState<string | null>(null);
	const thumbInputRef = useRef<HTMLInputElement>(null);

	const toggleSection = (section: keyof typeof expandedSections) => {
		setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
	};

	// Get headings from editor for outline
	const getHeadings = () => {
		if (!editor) return [];
		const headings: { level: number; text: string; pos: number }[] = [];
		editor.state.doc.descendants((node, pos) => {
			if (node.type.name === "heading") {
				headings.push({ level: node.attrs.level, text: node.textContent, pos });
			}
		});
		return headings;
	};

	const headings = getHeadings();

	const scrollToHeading = (pos: number) => {
		if (!editor) return;
		editor.commands.setTextSelection(pos);
		editor.view.dom.scrollIntoView({ behavior: "smooth" });
	};

	const wordCount = editor?.getText().split(/\s+/).filter(Boolean).length || 0;
	const metaTitle = (article.meta_title as string) || "";
	const metaDesc = (article.meta_desc as string) || "";
	const excerpt = (article.excerpt as string) || "";

	// SEO checklist
	const seoChecks = [
		{ label: "Judul terisi", ok: Boolean(article.title?.trim()) },
		{ label: "Slug terisi", ok: Boolean(article.slug?.trim()) },
		{ label: `Meta title (${metaTitle.length}/60)`, ok: metaTitle.length > 0 && metaTitle.length <= 60 },
		{ label: `Meta description (${metaDesc.length}/160)`, ok: metaDesc.length > 0 && metaDesc.length <= 160 },
		{ label: "Thumbnail diatur", ok: Boolean(article.thumbnail) },
		{ label: "Excerpt terisi", ok: excerpt.trim().length > 0 },
		{ label: `Konten ≥ 300 kata (${wordCount})`, ok: wordCount >= 300 },
	];
	const seoScore = Math.round((seoChecks.filter((c) => c.ok).length / seoChecks.length) * 100);

	// File disimpan lokal dulu, baru diupload ke field file `thumbnail` record article saat save.
	// (Field file PocketBase menolak nilai URL string → validation_invalid_file / 400.)
	const handleThumbUpload = (file: File) => {
		setThumbError(null);
		if (file.size > 5 * 1024 * 1024) {
			setThumbError("Ukuran gambar maksimal 5 MB");
			return;
		}
		setPendingThumbUrl((prev) => {
			if (prev) URL.revokeObjectURL(prev);
			return URL.createObjectURL(file);
		});
		onUpdate("thumbnailFile", file);
	};

	// If image is selected, show image settings panel
	if (selectedImageSrc) {
		const effRadius =
			selectedImageAttrs?.radius === "" || selectedImageAttrs?.radius == null ? "12" : selectedImageAttrs.radius;
		return (
			<aside className="editor-inspector">
				<div className="inspector-section">
					<div className="inspector-section-header static highlight">
						<ImageIcon size={14} />
						<span>Pengaturan Gambar</span>
					</div>
					<div className="inspector-section-body">
						<div className="inspector-image-preview">
							<img src={selectedImageSrc} alt="Preview" />
						</div>
						<div className="inspector-field">
							<label>Alt Text</label>
							<input
								type="text"
								placeholder="Deskripsi gambar untuk aksesibilitas..."
								className="inspector-input"
								value={selectedImageAttrs?.alt ?? ""}
								onChange={(e) => onImageUpdate?.({ alt: e.target.value })}
							/>
						</div>
						<div className="inspector-field">
							<label>Judul Gambar (di atas)</label>
							<input
								type="text"
								placeholder="Judul gambar (opsional)..."
								className="inspector-input"
								value={selectedImageAttrs?.title ?? ""}
								onChange={(e) => onImageUpdate?.({ title: e.target.value })}
							/>
						</div>
						<div className="inspector-field">
							<label>Caption (di bawah)</label>
							<input
								type="text"
								placeholder="Caption gambar (opsional)..."
								className="inspector-input"
								value={selectedImageAttrs?.caption ?? ""}
								onChange={(e) => onImageUpdate?.({ caption: e.target.value })}
							/>
						</div>
						<div className="inspector-field">
							<label>Posisi Gambar</label>
							<div className="inspector-btn-group">
								<button
									className={`inspector-btn ${selectedImageAttrs?.align === "left" ? "active" : ""}`}
									onClick={() => onImageUpdate?.({ align: "left" })}
									type="button"
								>
									Kiri
								</button>
								<button
									className={`inspector-btn ${(selectedImageAttrs?.align ?? "center") === "center" ? "active" : ""}`}
									onClick={() => onImageUpdate?.({ align: "center" })}
									type="button"
								>
									Tengah
								</button>
								<button
									className={`inspector-btn ${selectedImageAttrs?.align === "right" ? "active" : ""}`}
									onClick={() => onImageUpdate?.({ align: "right" })}
									type="button"
								>
									Kanan
								</button>
							</div>
						</div>
						<div className="inspector-field">
							<label>Lebar</label>
							<div className="inspector-btn-group">
								<button
									className={`inspector-btn ${selectedImageAttrs?.width === "small" ? "active" : ""}`}
									onClick={() => onImageUpdate?.({ width: "small" })}
									type="button"
								>
									25%
								</button>
								<button
									className={`inspector-btn ${selectedImageAttrs?.width === "medium" ? "active" : ""}`}
									onClick={() => onImageUpdate?.({ width: "medium" })}
									type="button"
								>
									50%
								</button>
								<button
									className={`inspector-btn ${selectedImageAttrs?.width === "large" ? "active" : ""}`}
									onClick={() => onImageUpdate?.({ width: "large" })}
									type="button"
								>
									75%
								</button>
								<button
									className={`inspector-btn ${selectedImageAttrs?.width === "full" ? "active" : ""}`}
									onClick={() => onImageUpdate?.({ width: "full" })}
									type="button"
								>
									100%
								</button>
							</div>
							<div className="inspector-number-row">
								<input
									type="number"
									className="inspector-input"
									placeholder="Custom"
									min={10}
									max={100}
									value={selectedImageAttrs?.width === "custom" ? (selectedImageAttrs?.widthValue ?? "") : ""}
									onChange={(e) => onImageUpdate?.({ width: "custom", widthValue: e.target.value })}
								/>
								<span className="inspector-number-suffix">%</span>
							</div>
						</div>
						<div className="inspector-field">
							<label>Tinggi (px)</label>
							<div className="inspector-number-row">
								<input
									type="number"
									className="inspector-input"
									placeholder="Auto (proporsional)"
									min={0}
									value={selectedImageAttrs?.height ?? ""}
									onChange={(e) => onImageUpdate?.({ height: e.target.value })}
								/>
								<span className="inspector-number-suffix">px</span>
							</div>
						</div>
						<div className="inspector-field">
							<label>Sudut Membulat (px)</label>
							<div className="inspector-btn-group">
								<button
									className={`inspector-btn ${effRadius === "0" ? "active" : ""}`}
									onClick={() => onImageUpdate?.({ radius: "0" })}
									type="button"
								>
									0
								</button>
								<button
									className={`inspector-btn ${effRadius === "6" ? "active" : ""}`}
									onClick={() => onImageUpdate?.({ radius: "6" })}
									type="button"
								>
									6
								</button>
								<button
									className={`inspector-btn ${effRadius === "12" ? "active" : ""}`}
									onClick={() => onImageUpdate?.({ radius: "" })}
									type="button"
								>
									12
								</button>
								<button
									className={`inspector-btn ${effRadius === "20" ? "active" : ""}`}
									onClick={() => onImageUpdate?.({ radius: "20" })}
									type="button"
								>
									20
								</button>
							</div>
							<div className="inspector-number-row">
								<input
									type="number"
									className="inspector-input"
									min={0}
									max={100}
									value={effRadius}
									onChange={(e) => onImageUpdate?.({ radius: e.target.value === "12" ? "" : e.target.value })}
								/>
								<span className="inspector-number-suffix">px</span>
							</div>
						</div>
						<div className="inspector-field">
							<label>Bayangan</label>
							<div className="inspector-btn-group">
								<button
									className={`inspector-btn ${!selectedImageAttrs?.shadow ? "active" : ""}`}
									onClick={() => onImageUpdate?.({ shadow: "" })}
									type="button"
								>
									Tanpa
								</button>
								<button
									className={`inspector-btn ${selectedImageAttrs?.shadow === "sm" ? "active" : ""}`}
									onClick={() => onImageUpdate?.({ shadow: "sm" })}
									type="button"
								>
									Halus
								</button>
								<button
									className={`inspector-btn ${selectedImageAttrs?.shadow === "md" ? "active" : ""}`}
									onClick={() => onImageUpdate?.({ shadow: "md" })}
									type="button"
								>
									Sedang
								</button>
								<button
									className={`inspector-btn ${selectedImageAttrs?.shadow === "lg" ? "active" : ""}`}
									onClick={() => onImageUpdate?.({ shadow: "lg" })}
									type="button"
								>
									Tebal
								</button>
							</div>
						</div>
						<div className="inspector-field">
							<label>Bingkai</label>
							<div className="inspector-number-row">
								<input
									type="number"
									className="inspector-input"
									placeholder="0"
									min={0}
									max={20}
									value={selectedImageAttrs?.borderWidth ?? ""}
									onChange={(e) => onImageUpdate?.({ borderWidth: e.target.value })}
								/>
								<span className="inspector-number-suffix">px</span>
								<input
									type="color"
									className="inspector-color"
									value={selectedImageAttrs?.borderColor || "#e5e7eb"}
									onChange={(e) => onImageUpdate?.({ borderColor: e.target.value })}
									title="Warna bingkai"
								/>
							</div>
						</div>
						<div className="inspector-field">
							<label>Ukuran Tulisan Judul (px)</label>
							<div className="inspector-number-row">
								<input
									type="number"
									className="inspector-input"
									placeholder="14"
									min={8}
									max={60}
									value={selectedImageAttrs?.titleSize ?? ""}
									onChange={(e) => onImageUpdate?.({ titleSize: e.target.value })}
								/>
								<span className="inspector-number-suffix">px</span>
							</div>
						</div>
						<div className="inspector-field">
							<label>Ukuran Tulisan Caption (px)</label>
							<div className="inspector-number-row">
								<input
									type="number"
									className="inspector-input"
									placeholder="13"
									min={8}
									max={40}
									value={selectedImageAttrs?.captionSize ?? ""}
									onChange={(e) => onImageUpdate?.({ captionSize: e.target.value })}
								/>
								<span className="inspector-number-suffix">px</span>
							</div>
						</div>
						<div className="inspector-field">
							<label>Posisi Teks</label>
							<div className="inspector-btn-group">
								<button
									className={`inspector-btn ${(selectedImageAttrs?.textAlign ?? "center") === "left" ? "active" : ""}`}
									onClick={() => onImageUpdate?.({ textAlign: "left" })}
									type="button"
								>
									Kiri
								</button>
								<button
									className={`inspector-btn ${(selectedImageAttrs?.textAlign ?? "center") === "center" ? "active" : ""}`}
									onClick={() => onImageUpdate?.({ textAlign: "center" })}
									type="button"
								>
									Tengah
								</button>
								<button
									className={`inspector-btn ${selectedImageAttrs?.textAlign === "right" ? "active" : ""}`}
									onClick={() => onImageUpdate?.({ textAlign: "right" })}
									type="button"
								>
									Kanan
								</button>
							</div>
						</div>
					</div>
				</div>

				<style>{inspectorStyles}</style>
			</aside>
		);
	}

	return (
		<aside className="editor-inspector">
			{/* SEO Score */}
			<div className="inspector-section">
				<div className="inspector-section-header static">
					<Gauge size={14} />
					<span>Skor SEO</span>
				</div>
				<div className="inspector-section-body">
					<div className="seo-score-bar">
						<div
							className={`seo-score-fill ${seoScore >= 80 ? "good" : seoScore >= 50 ? "mid" : "bad"}`}
							style={{ width: `${seoScore}%` }}
						/>
					</div>
					<div className="seo-score-label">
						<span className={`seo-score-value ${seoScore >= 80 ? "good" : seoScore >= 50 ? "mid" : "bad"}`}>{seoScore}%</span>
						<span>kelengkapan artikel</span>
					</div>
					<div className="seo-checklist">
						{seoChecks.map((check) => (
							<div key={check.label} className={`seo-check-item ${check.ok ? "ok" : "no"}`}>
								{check.ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
								<span>{check.label}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Article Settings */}
			<div className="inspector-section">
				<button className="inspector-section-header" onClick={() => toggleSection("article")} type="button">
					{expandedSections.article ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
					<FileText size={14} />
					<span>Artikel</span>
				</button>
				{expandedSections.article && (
					<div className="inspector-section-body">
						<div className="inspector-stats">
							<div className="stat-item">
								<span className="stat-value">{wordCount}</span>
								<span className="stat-label">Kata</span>
							</div>
							<div className="stat-item">
								<span className="stat-value">{article.read_time || 1}</span>
								<span className="stat-label">Mnt Baca</span>
							</div>
							<div className="stat-item">
								<span className="stat-value">{headings.length}</span>
								<span className="stat-label">Judul</span>
							</div>
						</div>

						<div className="inspector-field">
							<label>Slug URL</label>
							<div className="inspector-slug-wrap">
								<span className="inspector-slug-prefix">/blog/</span>
								<input
									type="text"
									value={article.slug || ""}
									onChange={(e) => onUpdate("slug", e.target.value)}
									placeholder="url-artikel"
									className="inspector-input inspector-input-slug"
								/>
							</div>
						</div>

						<div className="inspector-field">
							<label>Kategori</label>
							<select
								value={article.category || "umum"}
								onChange={(e) => onUpdate("category", e.target.value)}
								className="inspector-select"
							>
								{categories.map((cat) => (
									<option key={cat.value} value={cat.value}>
										{cat.label}
									</option>
								))}
							</select>
						</div>

						<div className="inspector-field">
							<label>Status</label>
							<div className="inspector-status-toggle">
								<button
									type="button"
									className={`status-toggle-btn ${article.status === "draft" ? "active draft" : ""}`}
									onClick={() => onUpdate("status", "draft")}
								>
									Draft
								</button>
								<button
									type="button"
									className={`status-toggle-btn ${article.status === "published" ? "active published" : ""}`}
									onClick={() => onUpdate("status", "published")}
								>
									Published
								</button>
							</div>
						</div>

						<div className="inspector-field">
							<label>
								Excerpt <span className="label-hint">{excerpt.length}/200</span>
							</label>
							<textarea
								value={excerpt}
								onChange={(e) => onUpdate("excerpt", e.target.value)}
								placeholder="Ringkasan singkat artikel untuk ditampilkan di daftar blog..."
								className="inspector-textarea"
								rows={3}
								maxLength={200}
							/>
						</div>
					</div>
				)}
			</div>

			{/* Featured Image */}
			<div className="inspector-section">
				<button className="inspector-section-header" onClick={() => toggleSection("thumbnail")} type="button">
					{expandedSections.thumbnail ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
					<ImageIcon size={14} />
					<span>Gambar Utama</span>
				</button>
				{expandedSections.thumbnail && (
					<div className="inspector-section-body">
						<input
							ref={thumbInputRef}
							type="file"
							accept="image/*"
							style={{ display: "none" }}
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) handleThumbUpload(file);
								e.target.value = "";
							}}
						/>
						{article.thumbnail || pendingThumbUrl ? (
							<div className="inspector-thumbnail-preview">
								<img src={pendingThumbUrl || article.thumbnail} alt="Thumbnail" />
								<div className="thumbnail-overlay">
									<button type="button" className="thumbnail-overlay-btn" onClick={() => thumbInputRef.current?.click()}>
										<Upload size={14} />
										Ganti
									</button>
									<button
										type="button"
										className="thumbnail-overlay-btn danger"
										onClick={() => {
											if (pendingThumbUrl) URL.revokeObjectURL(pendingThumbUrl);
											setPendingThumbUrl(null);
											onUpdate("thumbnailFile", null);
											onUpdate("thumbnail", "");
										}}
									>
										<Trash2 size={14} />
										Hapus
									</button>
								</div>
							</div>
						) : (
							<button type="button" className="inspector-upload-zone" onClick={() => thumbInputRef.current?.click()}>
								<Upload size={20} />
								<span>Klik untuk upload gambar</span>
								<small>PNG, JPG, atau WebP — maks 5 MB</small>
							</button>
						)}
						{pendingThumbUrl && (
							<div className="inspector-hint">Gambar baru akan diupload saat artikel disimpan.</div>
						)}
						{thumbError && <div className="inspector-error">{thumbError}</div>}
					</div>
				)}
			</div>

			{/* SEO */}
			<div className="inspector-section">
				<button className="inspector-section-header" onClick={() => toggleSection("seo")} type="button">
					{expandedSections.seo ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
					<Eye size={14} />
					<span>SEO & Meta</span>
				</button>
				{expandedSections.seo && (
					<div className="inspector-section-body">
						<div className="inspector-field">
							<label>
								Meta Title <span className={`label-hint ${metaTitle.length > 60 ? "over" : ""}`}>{metaTitle.length}/60</span>
							</label>
							<input
								type="text"
								value={metaTitle}
								onChange={(e) => onUpdate("meta_title", e.target.value)}
								placeholder="Judul untuk hasil pencarian Google"
								className="inspector-input"
							/>
						</div>
						<div className="inspector-field">
							<label>
								Meta Description <span className={`label-hint ${metaDesc.length > 160 ? "over" : ""}`}>{metaDesc.length}/160</span>
							</label>
							<textarea
								value={metaDesc}
								onChange={(e) => onUpdate("meta_desc", e.target.value)}
								placeholder="Deskripsi singkat yang muncul di hasil pencarian..."
								className="inspector-textarea"
								rows={3}
							/>
						</div>
						{/* Google preview */}
						<div className="google-preview">
							<div className="google-preview-label">Pratinjau Google</div>
							<div className="google-preview-title">{metaTitle || article.title || "Judul artikel"}</div>
							<div className="google-preview-url">mbalaundryexpress.com/blog/{article.slug || "slug-artikel"}</div>
							<div className="google-preview-desc">{metaDesc || excerpt || "Deskripsi artikel akan muncul di sini..."}</div>
						</div>
					</div>
				)}
			</div>

			{/* Outline */}
			{headings.length > 0 && (
				<div className="inspector-section">
					<div className="inspector-section-header static">
						<ListTree size={14} />
						<span>Outline Artikel</span>
					</div>
					<div className="inspector-section-body">
						<div className="inspector-outline">
							{headings.map((h, idx) => (
								<button
									// biome-ignore lint/suspicious/noArrayIndexKey: outline items
									key={idx}
									className={`inspector-outline-item level-${h.level}`}
									onClick={() => scrollToHeading(h.pos)}
									type="button"
								>
									{h.text || "Tanpa judul"}
								</button>
							))}
						</div>
					</div>
				</div>
			)}

			<style>{inspectorStyles}</style>
		</aside>
	);
}

const inspectorStyles = `
	.editor-inspector {
		width: 300px;
		flex-shrink: 0;
		background: var(--bg-card);
		border-left: 1px solid var(--border);
		overflow-y: auto;
		padding: 12px 0 24px;
	}

	@keyframes inspectorSpin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.editor-inspector .spin {
		animation: inspectorSpin 0.8s linear infinite;
	}

	.inspector-section {
		border-bottom: 1px solid var(--border);
	}

	.inspector-section:last-child {
		border-bottom: none;
	}

	.inspector-section-header {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 12px 16px;
		background: transparent;
		border: none;
		color: var(--text-secondary);
		font-size: 13px;
		font-weight: 600;
		font-family: var(--font-sans);
		cursor: pointer;
		text-align: left;
		transition: background var(--transition-fast);
	}

	.inspector-section-header:hover {
		background: var(--bg-surface);
	}

	.inspector-section-header.static {
		cursor: default;
	}

	.inspector-section-header.static:hover {
		background: transparent;
	}

	.inspector-section-header.highlight {
		background: var(--brand-bg);
		color: var(--brand);
	}

	.inspector-section-header.highlight:hover {
		background: var(--brand-bg);
	}

	.inspector-section-body {
		padding: 4px 16px 16px;
	}

	/* ===== SEO Score ===== */
	.seo-score-bar {
		height: 6px;
		background: var(--bg-surface);
		border-radius: var(--radius-full);
		overflow: hidden;
		margin-bottom: 8px;
	}

	.seo-score-fill {
		height: 100%;
		border-radius: var(--radius-full);
		transition: width var(--transition-base), background var(--transition-base);
	}

	.seo-score-fill.good { background: var(--success); }
	.seo-score-fill.mid { background: var(--warning); }
	.seo-score-fill.bad { background: var(--danger); }

	.seo-score-label {
		display: flex;
		align-items: baseline;
		gap: 6px;
		font-size: 12px;
		color: var(--text-muted);
		margin-bottom: 12px;
	}

	.seo-score-value {
		font-size: 18px;
		font-weight: 700;
	}

	.seo-score-value.good { color: var(--success); }
	.seo-score-value.mid { color: var(--warning); }
	.seo-score-value.bad { color: var(--danger); }

	.seo-checklist {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.seo-check-item {
		display: flex;
		align-items: center;
		gap: 7px;
		font-size: 12px;
		color: var(--text-muted);
	}

	.seo-check-item.ok { color: var(--text-secondary); }
	.seo-check-item.ok svg { color: var(--success); }
	.seo-check-item.no svg { color: var(--text-muted); opacity: 0.5; }

	/* ===== Stats ===== */
	.inspector-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		margin-bottom: 16px;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 10px 8px;
		background: var(--bg-surface);
		border-radius: var(--radius-sm);
	}

	.stat-value {
		font-size: 18px;
		font-weight: 700;
		color: var(--text-primary);
	}

	.stat-label {
		font-size: 10px;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 2px;
	}

	/* ===== Fields ===== */
	.inspector-field {
		margin-bottom: 14px;
	}

	.inspector-field:last-child {
		margin-bottom: 0;
	}

	.inspector-field label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 11px;
		font-weight: 600;
		color: var(--text-muted);
		margin-bottom: 6px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.label-hint {
		font-size: 10.5px;
		font-weight: 500;
		color: var(--text-muted);
		text-transform: none;
		letter-spacing: 0;
	}

	.label-hint.over {
		color: var(--danger);
		font-weight: 700;
	}

	.inspector-input,
	.inspector-select,
	.inspector-textarea {
		width: 100%;
		padding: 8px 10px;
		border: 1px solid var(--border);
		border-radius: var(--radius-xs);
		background: var(--bg-surface);
		color: var(--text-primary);
		font-size: 13px;
		font-family: var(--font-sans);
		outline: none;
		transition: border-color var(--transition-fast), background var(--transition-fast);
	}

	.inspector-input:focus,
	.inspector-select:focus,
	.inspector-textarea:focus {
		border-color: var(--brand);
		background: var(--bg-card);
	}

	.inspector-textarea {
		resize: vertical;
		min-height: 64px;
		line-height: 1.5;
	}

	.inspector-select {
		cursor: pointer;
	}

	/* Slug with prefix */
	.inspector-slug-wrap {
		display: flex;
		align-items: stretch;
		border: 1px solid var(--border);
		border-radius: var(--radius-xs);
		background: var(--bg-surface);
		overflow: hidden;
		transition: border-color var(--transition-fast);
	}

	.inspector-slug-wrap:focus-within {
		border-color: var(--brand);
	}

	.inspector-slug-prefix {
		display: flex;
		align-items: center;
		padding: 0 8px;
		font-size: 12px;
		color: var(--text-muted);
		background: var(--bg-card);
		border-right: 1px solid var(--border);
		white-space: nowrap;
	}

	.inspector-input-slug {
		border: none;
		background: transparent;
		border-radius: 0;
	}

	.inspector-input-slug:focus {
		background: transparent;
	}

	/* Status toggle */
	.inspector-status-toggle {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4px;
		padding: 3px;
		background: var(--bg-surface);
		border-radius: var(--radius-xs);
	}

	.status-toggle-btn {
		padding: 7px 0;
		border: none;
		border-radius: 7px;
		background: transparent;
		font-size: 12px;
		font-weight: 600;
		font-family: var(--font-sans);
		color: var(--text-muted);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.status-toggle-btn:hover {
		color: var(--text-primary);
	}

	.status-toggle-btn.active.draft {
		background: var(--warning-bg);
		color: var(--warning);
	}

	.status-toggle-btn.active.published {
		background: var(--success-bg);
		color: var(--success);
	}

	/* ===== Thumbnail ===== */
	.inspector-upload-zone {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		width: 100%;
		padding: 24px 16px;
		background: var(--bg-surface);
		border: 1.5px dashed var(--border-strong);
		border-radius: var(--radius-sm);
		color: var(--text-muted);
		font-size: 12.5px;
		font-weight: 500;
		font-family: var(--font-sans);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.inspector-upload-zone:hover:not(:disabled) {
		border-color: var(--brand);
		color: var(--brand);
		background: var(--brand-bg);
	}

	.inspector-upload-zone small {
		font-size: 11px;
		opacity: 0.7;
	}

	.inspector-thumbnail-preview {
		position: relative;
		border-radius: var(--radius-sm);
		overflow: hidden;
		border: 1px solid var(--border);
	}

	.inspector-thumbnail-preview img {
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		display: block;
	}

	.thumbnail-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		background: rgba(0, 0, 0, 0.55);
		opacity: 0;
		transition: opacity var(--transition-fast);
	}

	.inspector-thumbnail-preview:hover .thumbnail-overlay {
		opacity: 1;
	}

	.thumbnail-overlay-btn {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 6px 12px;
		background: rgba(255, 255, 255, 0.95);
		border: none;
		border-radius: var(--radius-xs);
		font-size: 12px;
		font-weight: 600;
		font-family: var(--font-sans);
		color: #1a1a1a;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.thumbnail-overlay-btn:hover {
		background: #fff;
	}

	.thumbnail-overlay-btn.danger {
		background: var(--danger);
		color: #fff;
	}

	.thumbnail-overlay-btn.danger:hover {
		opacity: 0.9;
	}

	.inspector-error {
		margin-top: 8px;
		padding: 7px 10px;
		background: var(--danger-bg);
		color: var(--danger);
		border-radius: var(--radius-xs);
		font-size: 12px;
	}

	.inspector-hint {
		margin-top: 8px;
		padding: 7px 10px;
		background: var(--info-bg);
		color: var(--info);
		border-radius: var(--radius-xs);
		font-size: 12px;
	}

	/* ===== Image preview in panel ===== */
	.inspector-image-preview {
		margin-bottom: 14px;
		border-radius: var(--radius-sm);
		overflow: hidden;
		border: 1px solid var(--border);
	}

	.inspector-image-preview img {
		width: 100%;
		display: block;
		max-height: 160px;
		object-fit: cover;
	}

	/* ===== Button group ===== */
	.inspector-btn-group {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 4px;
	}

	.inspector-btn-group:has(> :nth-child(4)) {
		grid-template-columns: repeat(4, 1fr);
	}

	.inspector-btn {
		padding: 7px 0;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-xs);
		font-size: 12px;
		font-weight: 600;
		font-family: var(--font-sans);
		color: var(--text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.inspector-btn:hover {
		border-color: var(--brand);
		color: var(--brand);
		background: var(--brand-bg);
	}

	.inspector-btn.active {
		border-color: var(--brand);
		color: var(--brand);
		background: var(--brand-bg);
	}

	/* ===== Number row (value + suffix + optional color) ===== */
	.inspector-number-row {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 6px;
	}

	.inspector-number-row .inspector-input {
		flex: 1;
	}

	.inspector-number-suffix {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-muted);
		min-width: 18px;
	}

	.inspector-color {
		width: 34px;
		height: 34px;
		flex-shrink: 0;
		padding: 3px;
		border: 1px solid var(--border);
		border-radius: var(--radius-xs);
		background: var(--bg-surface);
		cursor: pointer;
	}

	.inspector-color::-webkit-color-swatch-wrapper {
		padding: 2px;
	}

	.inspector-color::-webkit-color-swatch {
		border: none;
		border-radius: 4px;
	}

	/* ===== Google Preview ===== */
	.google-preview {
		margin-top: 4px;
		padding: 12px;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
	}

	.google-preview-label {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		margin-bottom: 8px;
	}

	.google-preview-title {
		font-size: 15px;
		color: #1a0dab;
		line-height: 1.3;
		margin-bottom: 2px;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	:root.dark .google-preview-title {
		color: #8ab4f8;
	}

	.google-preview-url {
		font-size: 12px;
		color: #006621;
		margin-bottom: 4px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	:root.dark .google-preview-url {
		color: #34a853;
	}

	.google-preview-desc {
		font-size: 12.5px;
		color: var(--text-secondary);
		line-height: 1.45;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* ===== Outline ===== */
	.inspector-outline {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.inspector-outline-item {
		display: block;
		width: 100%;
		padding: 6px 10px;
		background: transparent;
		border: none;
		border-left: 2px solid var(--border);
		border-radius: 0 var(--radius-xs) var(--radius-xs) 0;
		font-size: 12.5px;
		font-family: var(--font-sans);
		color: var(--text-secondary);
		text-align: left;
		cursor: pointer;
		transition: all var(--transition-fast);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.inspector-outline-item:hover {
		background: var(--bg-surface);
		color: var(--text-primary);
		border-left-color: var(--brand);
	}

	.inspector-outline-item.level-3 {
		padding-left: 22px;
		font-size: 12px;
	}

	.inspector-outline-item.level-4 {
		padding-left: 34px;
		font-size: 11.5px;
		color: var(--text-muted);
	}

	/* ===== Responsive ===== */
	@media (max-width: 1024px) {
		.editor-inspector {
			width: 260px;
		}
	}

	@media (max-width: 768px) {
		.editor-inspector {
			display: none;
		}
	}
`;
