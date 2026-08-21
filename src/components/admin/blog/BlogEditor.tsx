import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Extension, type NodeViewProps } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import {
	Bold,
	Italic,
	Underline as UnderlineIcon,
	Strikethrough,
	List,
	ListOrdered,
	Quote,
	Link2,
	ImageIcon,
	Heading2,
	Heading3,
	Undo,
	Redo,
	AlignLeft,
	AlignCenter,
	AlignRight,
	Trash2,
	ArrowLeft,
	Pilcrow,
	Text,
	AlertCircle,
	Megaphone,
	BookOpen,
	Shirt,
	Sparkles,
	CheckCircle2,
	Loader2,
	CloudUpload,
	CircleDot,
	Type,
	RemoveFormatting,
} from "lucide-react";
import { useCallback, useEffect, useState, useRef, type CSSProperties } from "react";
import { EditorInspector } from "@/components/admin/blog/EditorInspector";
import { SlashCommand } from "./SlashCommand";
import { TemplatePicker } from "./TemplatePicker";
import type { Article, ArticleCategory } from "@/types/database.types";
import { pb } from "@/api/pocketbase";

interface BlogEditorProps {
	article?: Partial<Article>;
	onSave: (data: ArticleEditorData) => Promise<void>;
	onCancel: () => void;
	isSaving?: boolean;
}

export interface ArticleEditorData {
	title: string;
	slug: string;
	content: string;
	excerpt: string;
	thumbnail: string;
	thumbnailFile?: File | null;
	category: ArticleCategory;
	status: "draft" | "published";
	read_time: number;
	meta_title: string;
	meta_desc: string;
}

// ============ ARTICLE TEMPLATES ============
export interface ArticleTemplate {
	id: string;
	name: string;
	description: string;
	icon: React.ReactNode;
	content: string;
}

export const ARTICLE_TEMPLATES: ArticleTemplate[] = [
	{
		id: "promo",
		name: "Artikel Promo",
		description: "Promo spesial, diskon, atau penawaran menarik",
		icon: <Megaphone size={22} />,
		content: `<h2>Promo Spesial untuk Anda!</h2>
<p>Kami hadirkan promo spesial yang sayang untuk dilewatkan. Segera manfaatkan kesempatan ini sebelum periode promo berakhir.</p>
<h3>Detail Promo</h3>
<ul>
<li>Diskon hingga 50%</li>
<li>Berlaku untuk semua layanan</li>
<li>Syarat dan ketentuan berlaku</li>
</ul>
<blockquote>Jangan sampai kehabisan! Promo terbatas waktu.</blockquote>
<p>Untuk informasi lebih lanjut, hubungi kami di nomor yang tersedia.</p>`,
	},
	{
		id: "pengumuman",
		name: "Pengumuman Libur",
		description: "Informasi penutupan atau hari libur",
		icon: <AlertCircle size={22} />,
		content: `<h2>Pengumuman Penting</h2>
<p>Dengan ini kami sampaikan bahwa layanan kami akan ditutup untuk sementara waktu.</p>
<h3>Jadwal Penutupan</h3>
<p><strong>Mulai:</strong> [Tanggal Mulai]</p>
<p><strong>Selesai:</strong> [Tanggal Selesai]</p>
<h3>Informasi Tambahan</h3>
<p>Kami akan kembali beroperasi seperti biasa pada tanggal yang telah ditentukan. Mohon pengertian seluruh pelanggan setia.</p>
<p>Terima kasih atas pengertian dan dukungan berkelanjutan.</p>`,
	},
	{
		id: "edukasi",
		name: "Edukasi Laundry",
		description: "Tips dan panduan perawatan laundry",
		icon: <BookOpen size={22} />,
		content: `<h2>Panduan Perawatan Pakaian</h2>
<p>Perawatan yang tepat akan memperpanjang umur pakaian kesayangan Anda. Berikut beberapa tips yang bisa Anda terapkan.</p>
<h3>Tips Dasar Pencucian</h3>
<ul>
<li>Pisahkan pakaian berdasarkan warna</li>
<li>Periksa label perawatan terlebih dahulu</li>
<li>Gunakan deterjen secukupnya</li>
<li>Jangan overloaded mesin cuci</li>
</ul>
<h3>Perawatan Berdasarkan Bahan</h3>
<p>Setiap jenis bahan memerlukan treatment yang berbeda. Berikut panduannya:</p>
<ul>
<li><strong>Kapas:</strong> Cocok untuk pencucian regular dengan air hangat</li>
<li><strong>Polyester:</strong> Mudah kering, hindari suhu terlalu tinggi</li>
<li><strong>Sutra:</strong> Sebaiknya dry clean atau cuci tangan</li>
</ul>
<blockquote>Tips: Selalu balik pakaian sebelum dicuci untuk menjaga warna dan tekstur.</blockquote>`,
	},
	{
		id: "tips",
		name: "Tips Perawatan Baju",
		description: "Tips praktis merawat pakaian sehari-hari",
		icon: <Shirt size={22} />,
		content: `<h2>Tips Praktis Perawatan Pakaian</h2>
<p>Berikut tips harian yang bisa membantu Anda merawat pakaian dengan lebih baik.</p>
<h3>Sebelum Mencuci</h3>
<ul>
<li>Balik pakaian berwarna gelap</li>
<li>Tutup resleting dan tombol</li>
<li>Kosongkan semua saku</li>
</ul>
<h3>Saat Mengeringkan</h3>
<p>Hindari penjemuran langsung di bawah terik matahari untuk pakaian berwarna. Sebaiknya jemur di tempat yang teduh namun tetap memiliki sirkulasi udara baik.</p>
<h3>Penyimpanan</h3>
<p>Gunakan hanger yang sesuai dengan bentuk pakaian untuk menghindari peregangan. Untuk pakaian musim dingin, pastikan sudah benar-benar kering sebelum disimpan.</p>`,
	},
	{
		id: "cabang",
		name: "Update Cabang Baru",
		description: "Pengumuman cabang atau layanan baru",
		icon: <Sparkles size={22} />,
		content: `<h2>Kami Hadir Lebih Dekat dengan Anda!</h2>
<p>Dengan senang hati kami informasikan bahwa cabang baru telah resmi beroperasi. Kehadiran cabang ini adalah komitmen kami untuk melayani Anda lebih baik.</p>
<h3>Informasi Cabang Baru</h3>
<ul>
<li><strong>Alamat:</strong> [Alamat Lengkap]</li>
<li><strong>Jam Operasional:</strong> [Hari & Jam]</li>
<li><strong>Kontak:</strong> [Nomor Telepon]</li>
</ul>
<h3>Layanan yang Tersedia</h3>
<p>Cabang ini menyediakan layanan lengkap termasuk laundry reguler, dry clean, dan layanan express.</p>
<h3>Promo Pembukaan</h2>
<p>Untuk perayaan pembukaan, kami menyediakan promo eksklusif untuk pelanggan pertama. Jangan sampai ketinggalan!</p>`,
	},
	{
		id: "blank",
		name: "Kosong",
		description: "Mulai dari nol dengan dokumen kosong",
		icon: <Text size={22} />,
		content: "",
	},
];

// ============ IMAGE FIGURE NODE VIEW ============
const IMAGE_WIDTH_MAP: Record<string, string> = {
	small: "25%",
	medium: "50%",
	large: "75%",
	full: "100%",
};

const IMAGE_SHADOW_MAP: Record<string, string> = {
	sm: "0 2px 8px rgba(0, 0, 0, 0.10)",
	md: "0 4px 24px rgba(0, 0, 0, 0.12)",
	lg: "0 12px 40px rgba(0, 0, 0, 0.18)",
};

const IMAGE_DEFAULT_RADIUS = 12;
const IMAGE_DEFAULT_TITLE_SIZE = 14;
const IMAGE_DEFAULT_CAPTION_SIZE = 13;

function ImageFigureNodeView({ node, editor, getPos, updateAttributes, selected }: NodeViewProps) {
	const attrs = node.attrs as Record<string, string>;
	const {
		src,
		alt,
		align,
		width,
		widthValue,
		height,
		caption,
		title,
		radius,
		shadow,
		borderWidth,
		borderColor,
		titleSize,
		captionSize,
		textAlign,
	} = attrs;

	const figureWidth = width === "custom" ? `${Number(widthValue) || 50}%` : IMAGE_WIDTH_MAP[width] || "50%";

	const figureStyle: CSSProperties = {
		width: figureWidth,
		margin: align === "left" ? "24px auto 24px 0" : align === "right" ? "24px 0 24px auto" : "24px auto",
	};

	const radiusPx = radius !== "" && radius != null ? Number(radius) : IMAGE_DEFAULT_RADIUS;
	const mediaStyle: CSSProperties = {
		borderRadius: `${radiusPx}px`,
		boxShadow: IMAGE_SHADOW_MAP[shadow] || "none",
		border: borderWidth ? `${Number(borderWidth)}px solid ${borderColor || "var(--border)"}` : "none",
	};

	const imgStyle: CSSProperties = {
		width: "100%",
		height: height ? `${Number(height)}px` : "auto",
		objectFit: height ? "cover" : undefined,
		display: "block",
		margin: 0,
		cursor: "pointer",
	};

	const textAutoAlign = (textAlign || "center") as CSSProperties["textAlign"];
	const titleStyle: CSSProperties = {
		fontSize: `${Number(titleSize) || IMAGE_DEFAULT_TITLE_SIZE}px`,
		textAlign: textAutoAlign,
	};
	const captionStyle: CSSProperties = {
		fontSize: `${Number(captionSize) || IMAGE_DEFAULT_CAPTION_SIZE}px`,
		textAlign: textAutoAlign,
	};

	const selectNode = () => {
		const pos = getPos();
		if (typeof pos === "number") {
			editor.commands.setNodeSelection(pos);
		}
	};

	return (
		<NodeViewWrapper as="figure" className={`editor-figure${selected ? " is-selected" : ""}`} style={figureStyle}>
			<input
				className="editor-figure-title"
				style={titleStyle}
				value={title || ""}
				placeholder="Judul gambar (di atas)..."
				onChange={(e) => updateAttributes({ title: e.target.value })}
			/>
			<div className="editor-figure-media" style={mediaStyle}>
				<img src={src} alt={alt || ""} style={imgStyle} className="editor-image" onClick={selectNode} />
			</div>
			<input
				className="editor-figure-caption"
				style={captionStyle}
				value={caption || ""}
				placeholder="Caption gambar..."
				onChange={(e) => updateAttributes({ caption: e.target.value })}
			/>
		</NodeViewWrapper>
	);
}

// Small numeric input used by the image formatting bar (Word-style values).
function BubbleNumber({
	value,
	onChange,
	placeholder,
	suffix,
	min,
	max,
	title,
}: {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	suffix?: string;
	min?: number;
	max?: number;
	title?: string;
}) {
	return (
		<span className="bubble-number" title={title}>
			<input
				type="number"
				className="bubble-number-input"
				value={value}
				placeholder={placeholder}
				min={min}
				max={max}
				onChange={(e) => onChange(e.target.value)}
			/>
			{suffix ? <span className="bubble-number-suffix">{suffix}</span> : null}
		</span>
	);
}

// ============ CUSTOM IMAGE EXTENSION ============
const CaptionedImage = Image.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			align: {
				default: "center",
				parseHTML: (element) => element.getAttribute("data-align") || "center",
				renderHTML: (attributes) => ({ "data-align": attributes.align }),
			},
			width: {
				default: "medium",
				parseHTML: (element) => element.getAttribute("data-width") || "medium",
				renderHTML: (attributes) => ({ "data-width": attributes.width }),
			},
			caption: {
				default: "",
				parseHTML: (element) => element.getAttribute("data-caption") || "",
				renderHTML: (attributes) => ({ "data-caption": attributes.caption }),
			},
			title: {
				default: "",
				parseHTML: (element) => element.getAttribute("data-title") || "",
				renderHTML: (attributes) => ({ "data-title": attributes.title }),
			},
			widthValue: {
				default: "",
				parseHTML: (element) => element.getAttribute("data-width-value") || "",
				renderHTML: (attributes) => (attributes.widthValue ? { "data-width-value": attributes.widthValue } : {}),
			},
			height: {
				default: "",
				parseHTML: (element) => element.getAttribute("data-height") || "",
				renderHTML: (attributes) => (attributes.height ? { "data-height": attributes.height } : {}),
			},
			radius: {
				default: "",
				parseHTML: (element) => {
					const value = element.getAttribute("data-radius");
					if (value != null) return value;
					// Backward compat: old data-rounded="false" means square corners
					return element.getAttribute("data-rounded") === "false" ? "0" : "";
				},
				renderHTML: (attributes) =>
					attributes.radius !== "" && attributes.radius != null ? { "data-radius": attributes.radius } : {},
			},
			shadow: {
				default: "",
				parseHTML: (element) => {
					const value = element.getAttribute("data-shadow") || "";
					// Backward compat: old boolean values → new levels
					if (value === "true") return "md";
					if (value === "false") return "";
					return value;
				},
				renderHTML: (attributes) => (attributes.shadow ? { "data-shadow": attributes.shadow } : {}),
			},
			borderWidth: {
				default: "",
				parseHTML: (element) => {
					const value = element.getAttribute("data-border-width");
					if (value != null) return value;
					// Backward compat: old data-border="true" means a 1px frame
					return element.getAttribute("data-border") === "true" ? "1" : "";
				},
				renderHTML: (attributes) => (attributes.borderWidth ? { "data-border-width": attributes.borderWidth } : {}),
			},
			borderColor: {
				default: "",
				parseHTML: (element) => element.getAttribute("data-border-color") || "",
				renderHTML: (attributes) => (attributes.borderColor ? { "data-border-color": attributes.borderColor } : {}),
			},
			titleSize: {
				default: "",
				parseHTML: (element) => element.getAttribute("data-title-size") || "",
				renderHTML: (attributes) => (attributes.titleSize ? { "data-title-size": attributes.titleSize } : {}),
			},
			captionSize: {
				default: "",
				parseHTML: (element) => element.getAttribute("data-caption-size") || "",
				renderHTML: (attributes) => (attributes.captionSize ? { "data-caption-size": attributes.captionSize } : {}),
			},
			textAlign: {
				default: "center",
				parseHTML: (element) => element.getAttribute("data-text-align") || "center",
				renderHTML: (attributes) => ({ "data-text-align": attributes.textAlign }),
			},
		};
	},
	addNodeView() {
		return ReactNodeViewRenderer(ImageFigureNodeView);
	},
});

// ============ FONT SIZE EXTENSION ============
declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		fontSize: {
			setFontSize: (size: string) => ReturnType;
			unsetFontSize: () => ReturnType;
		};
	}
}

const FontSize = Extension.create({
	name: "fontSize",
	addOptions() {
		return { types: ["textStyle"] };
	},
	addGlobalAttributes() {
		return [
			{
				types: this.options.types,
				attributes: {
					fontSize: {
						default: null,
						parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, "") || null,
						renderHTML: (attributes) => {
							if (!attributes.fontSize) return {};
							return { style: `font-size: ${attributes.fontSize}` };
						},
					},
				},
			},
		];
	},
	addCommands() {
		return {
			setFontSize:
				(size: string) =>
				({ chain }) =>
					chain().setMark("textStyle", { fontSize: size }).run(),
			unsetFontSize:
				() =>
				({ chain }) =>
					chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
		};
	},
});

// ============ UPLOAD HANDLER ============
async function uploadImageToPocketBase(file: File): Promise<string> {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("type", "article-image");

	const record = await pb.collection("branding_files").create(formData);
	return pb.files.getURL(record, record.file);
}

const slugify = (value: string) =>
	value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");

// ============ MAIN EDITOR COMPONENT ============
export function BlogEditor({ article, onSave, onCancel, isSaving }: BlogEditorProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const editorRef = useRef<HTMLDivElement>(null);
	const titleRef = useRef<HTMLInputElement>(null);

	// State
	const [title, setTitle] = useState(article?.title || "");
	const [slug, setSlug] = useState(article?.slug || "");
	const [slugTouched, setSlugTouched] = useState(Boolean(article?.slug));
	const [excerpt, setExcerpt] = useState(article?.excerpt || "");
	const [thumbnail, setThumbnail] = useState(article?.thumbnail || "");
	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
	const [category, setCategory] = useState<ArticleCategory>(article?.category || "umum");
	const [status, setStatus] = useState<"draft" | "published">(article?.status || "draft");
	const [readTime, setReadTime] = useState(article?.read_time || 1);
	const [metaTitle, setMetaTitle] = useState(article?.meta_title || "");
	const [metaDesc, setMetaDesc] = useState(article?.meta_desc || "");
	const [isDirty, setIsDirty] = useState(false);
	const [showSlashMenu, setShowSlashMenu] = useState(false);
	const [slashMenuPos, setSlashMenuPos] = useState({ top: 0, left: 0 });
	const [showTemplatePicker, setShowTemplatePicker] = useState(!article);
	const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
	const [selectedImageAttrs, setSelectedImageAttrs] = useState<Record<string, string> | null>(null);
	const [imageUploadProgress, setImageUploadProgress] = useState(false);
	const [imageUploadError, setImageUploadError] = useState<string | null>(null);
	const [wordCount, setWordCount] = useState(0);
	const [charCount, setCharCount] = useState(0);
	const [currentFontSize, setCurrentFontSize] = useState("default");

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: { levels: [2, 3, 4] },
			}),
			Underline,
			TextStyle,
			FontSize,
			Link.configure({ openOnClick: false, HTMLAttributes: { class: "editor-link" } }),
			CaptionedImage.configure({ HTMLAttributes: { class: "editor-image" } }),
			Placeholder.configure({ placeholder: "Mulai menulis artikel Anda di sini... Ketik '/' untuk menyisipkan blok." }),
			TextAlign.configure({ types: ["heading", "paragraph"] }),
		],
		content: article?.content || "",
		onUpdate: ({ editor: e }) => {
			setIsDirty(true);
			const text = e.getText();
			const words = text.split(/\s+/).filter(Boolean).length;
			setWordCount(words);
			setCharCount(text.replace(/\s/g, "").length);
			setReadTime(Math.max(1, Math.ceil(words / 200)));
		},
		onSelectionUpdate: ({ editor: e }) => {
			const { selection } = e.state;
			const node = e.state.doc.nodeAt(selection.from);
			if (node?.type.name === "image") {
				setSelectedImageSrc(node.attrs.src);
				setSelectedImageAttrs(node.attrs as Record<string, string>);
			} else {
				setSelectedImageSrc(null);
				setSelectedImageAttrs(null);
			}
			const fontSize = e.getAttributes("textStyle").fontSize;
			setCurrentFontSize(fontSize || "default");
		},
	});

	// Initialize counts once editor is ready
	useEffect(() => {
		if (!editor) return;
		const text = editor.getText();
		const words = text.split(/\s+/).filter(Boolean).length;
		setWordCount(words);
		setCharCount(text.replace(/\s/g, "").length);
		setReadTime(Math.max(1, Math.ceil(words / 200)));
	}, [editor]);

	// Auto-generate slug from title (only until user edits slug manually)
	useEffect(() => {
		if (!slugTouched && title) {
			setSlug(slugify(title));
		}
	}, [title, slugTouched]);

	// Focus title on mount for new articles
	useEffect(() => {
		if (!article?.title) {
			const t = setTimeout(() => titleRef.current?.focus(), 80);
			return () => clearTimeout(t);
		}
	}, [article?.title]);

	// Warn on unsaved changes
	useEffect(() => {
		const handler = (e: BeforeUnloadEvent) => {
			if (isDirty) {
				e.preventDefault();
				e.returnValue = "";
			}
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [isDirty]);

	// Handle slash command
	useEffect(() => {
		if (!editor) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ignore keystrokes inside inputs (e.g. the image caption field) and other
			// contentEditable regions that are not the editor itself.
			const target = e.target as HTMLElement | null;
			if (target) {
				const tag = target.tagName;
				const isFormField = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
				const isForeignEditable = target.isContentEditable && !editor.view.dom.contains(target);
				if (isFormField || isForeignEditable) return;
			}
			if (e.key === "/" && !showSlashMenu && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
				const { from } = editor.state.selection;
				const coords = editor.view.coordsAtPos(from);
				setSlashMenuPos({ top: coords.bottom + 8, left: coords.left });
				setShowSlashMenu(true);
			}
			if (e.key === "Escape") setShowSlashMenu(false);
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [editor, showSlashMenu]);

	const handleImageUpload = useCallback(
		async (file: File) => {
			if (!editor) return;
			setImageUploadProgress(true);
			setImageUploadError(null);
			try {
				const url = await uploadImageToPocketBase(file);
				editor.chain().focus().setImage({ src: url, alt: file.name }).run();
			} catch {
				setImageUploadError("Gagal mengupload gambar. Coba lagi.");
			} finally {
				setImageUploadProgress(false);
			}
		},
		[editor],
	);

	// Handle drag and drop
	useEffect(() => {
		if (!editorRef.current) return;
		const handleDragOver = (e: DragEvent) => {
			e.preventDefault();
			if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
		};
		const handleDrop = async (e: DragEvent) => {
			e.preventDefault();
			const files = e.dataTransfer?.files;
			if (files?.length) {
				const file = files[0];
				if (file.type.startsWith("image/")) {
					await handleImageUpload(file);
				}
			}
		};
		const el = editorRef.current;
		el.addEventListener("dragover", handleDragOver);
		el.addEventListener("drop", handleDrop);
		return () => {
			el.removeEventListener("dragover", handleDragOver);
			el.removeEventListener("drop", handleDrop);
		};
	}, [editor, handleImageUpload]);

	// Handle paste
	useEffect(() => {
		if (!editor) return;
		const handlePaste = async (e: ClipboardEvent) => {
			const items = e.clipboardData?.items;
			if (!items) return;
			for (const item of items) {
				if (item.type.startsWith("image/")) {
					e.preventDefault();
					const file = item.getAsFile();
					if (file) await handleImageUpload(file);
					break;
				}
			}
		};
		document.addEventListener("paste", handlePaste);
		return () => document.removeEventListener("paste", handlePaste);
	}, [editor, handleImageUpload]);

	const insertBlock = useCallback(
		(type: string) => {
			if (!editor) return;
			setShowSlashMenu(false);
			switch (type) {
				case "heading2":
					editor.chain().focus().toggleHeading({ level: 2 }).run();
					break;
				case "heading3":
					editor.chain().focus().toggleHeading({ level: 3 }).run();
					break;
				case "heading4":
					editor.chain().focus().toggleHeading({ level: 4 }).run();
					break;
				case "bulletList":
					editor.chain().focus().toggleBulletList().run();
					break;
				case "orderedList":
					editor.chain().focus().toggleOrderedList().run();
					break;
				case "blockquote":
					editor.chain().focus().toggleBlockquote().run();
					break;
				case "divider":
					editor.chain().focus().setHorizontalRule().run();
					break;
				case "image":
					fileInputRef.current?.click();
					break;
				case "link": {
					const url = window.prompt("Masukkan URL:");
					if (url) editor.chain().focus().setLink({ href: url }).run();
					break;
				}
				default:
					editor.chain().focus().setParagraph().run();
			}
		},
		[editor],
	);

	const applyTemplate = (template: ArticleTemplate) => {
		if (!editor) return;
		setShowTemplatePicker(false);
		if (template.content) {
			editor.commands.setContent(template.content);
			const text = editor.getText();
			const words = text.split(/\s+/).filter(Boolean).length;
			setWordCount(words);
			setCharCount(text.replace(/\s/g, "").length);
			setReadTime(Math.max(1, Math.ceil(words / 200)));
		}
		setIsDirty(true);
		setTimeout(() => titleRef.current?.focus(), 50);
	};

	const handleSave = async (publishStatus?: "draft" | "published") => {
		if (!editor || !title.trim()) return;
		const finalStatus = publishStatus || status;
		const data: ArticleEditorData = {
			title,
			slug: slug || slugify(title),
			content: editor.getHTML(),
			excerpt,
			thumbnail,
			thumbnailFile,
			category,
			status: finalStatus,
			read_time: readTime,
			meta_title: metaTitle,
			meta_desc: metaDesc,
		};
		await onSave(data);
		setIsDirty(false);
	};

	const handleCancel = () => {
		if (isDirty) {
			const ok = window.confirm("Ada perubahan yang belum disimpan. Yakin ingin keluar?");
			if (!ok) return;
		}
		onCancel();
	};

	// Toolbar button config
	const toolbarButtons: Array<
		| { type: "sep" }
		| { icon: React.ReactNode; action: () => void; active?: boolean; title: string; disabled?: boolean }
	> = [
		{ icon: <Bold size={16} />, action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive("bold"), title: "Tebal (Ctrl+B)" },
		{ icon: <Italic size={16} />, action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive("italic"), title: "Miring (Ctrl+I)" },
		{ icon: <UnderlineIcon size={16} />, action: () => editor?.chain().focus().toggleUnderline().run(), active: editor?.isActive("underline"), title: "Garis Bawah (Ctrl+U)" },
		{ icon: <Strikethrough size={16} />, action: () => editor?.chain().focus().toggleStrike().run(), active: editor?.isActive("strike"), title: "Coret" },
		{ type: "sep" },
		{ icon: <Heading2 size={16} />, action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive("heading", { level: 2 }), title: "Judul 2" },
		{ icon: <Heading3 size={16} />, action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), active: editor?.isActive("heading", { level: 3 }), title: "Judul 3" },
		{ icon: <Type size={16} />, action: () => editor?.chain().focus().setParagraph().run(), active: editor?.isActive("paragraph"), title: "Paragraf" },
		{ type: "sep" },
		{ icon: <List size={16} />, action: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive("bulletList"), title: "Daftar Poin" },
		{ icon: <ListOrdered size={16} />, action: () => editor?.chain().focus().toggleOrderedList().run(), active: editor?.isActive("orderedList"), title: "Daftar Nomor" },
		{ icon: <Quote size={16} />, action: () => editor?.chain().focus().toggleBlockquote().run(), active: editor?.isActive("blockquote"), title: "Kutipan" },
		{ type: "sep" },
		{ icon: <AlignLeft size={16} />, action: () => editor?.chain().focus().setTextAlign("left").run(), active: editor?.isActive({ textAlign: "left" }), title: "Rata Kiri" },
		{ icon: <AlignCenter size={16} />, action: () => editor?.chain().focus().setTextAlign("center").run(), active: editor?.isActive({ textAlign: "center" }), title: "Rata Tengah" },
		{ icon: <AlignRight size={16} />, action: () => editor?.chain().focus().setTextAlign("right").run(), active: editor?.isActive({ textAlign: "right" }), title: "Rata Kanan" },
		{ type: "sep" },
		{
			icon: <Link2 size={16} />,
			action: () => {
				const url = window.prompt("Masukkan URL:");
				if (url) editor?.chain().focus().setLink({ href: url }).run();
			},
			active: editor?.isActive("link"),
			title: "Sisipkan Link",
		},
		{
			icon: <ImageIcon size={16} />,
			action: () => fileInputRef.current?.click(),
			active: false,
			title: "Upload Gambar",
		},
		{ icon: <RemoveFormatting size={16} />, action: () => editor?.chain().focus().clearNodes().unsetAllMarks().run(), active: false, title: "Hapus Format" },
		{ type: "sep" },
		{ icon: <Undo size={16} />, action: () => editor?.chain().focus().undo().run(), active: false, title: "Undo (Ctrl+Z)", disabled: !editor?.can().undo() },
		{ icon: <Redo size={16} />, action: () => editor?.chain().focus().redo().run(), active: false, title: "Redo (Ctrl+Y)", disabled: !editor?.can().redo() },
	];

	const changeImageAttr = (attrs: Record<string, unknown>) => {
		if (!editor || !selectedImageSrc) return;
		editor.state.doc.descendants((node, pos) => {
			if (node.type.name === "image" && node.attrs.src === selectedImageSrc) {
				// Update attributes in place via a transaction. Do NOT use .focus() or
				// setNodeSelection here: stealing focus would pull typing out of the
				// Inspector input fields and replace the selected image with that text.
				editor.view.dispatch(
					editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs }),
				);
				// Keep local attr state in sync (setNodeMarkup doesn't fire onSelectionUpdate)
				setSelectedImageAttrs({ ...(node.attrs as Record<string, string>), ...(attrs as Record<string, string>) });
			}
		});
	};

	// Effective radius for preset chips (empty = default 12px)
	const effRadius =
		selectedImageAttrs?.radius === "" || selectedImageAttrs?.radius == null ? "12" : selectedImageAttrs.radius;

	return (
		<div className="blog-editor">
			<style>{editorStyles}</style>

			{/* Hidden file input for image upload */}
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				style={{ display: "none" }}
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) handleImageUpload(file);
					e.target.value = "";
				}}
			/>

			{/* Top Action Bar */}
			<header className="editor-topbar">
				<div className="editor-topbar-left">
					<button className="editor-back-btn" onClick={handleCancel} type="button">
						<ArrowLeft size={16} />
						<span>Kembali</span>
					</button>
					<div className="editor-divider" />
					<div className="editor-status-indicators">
						{imageUploadProgress && (
							<span className="status-indicator uploading">
								<Loader2 size={12} className="spin" />
								Mengupload...
							</span>
						)}
						{imageUploadError && <span className="status-indicator error">{imageUploadError}</span>}
						{isSaving ? (
							<span className="status-indicator saving">
								<Loader2 size={12} className="spin" />
								Menyimpan...
							</span>
						) : isDirty ? (
							<span className="status-indicator unsaved">
								<CircleDot size={12} />
								Belum disimpan
							</span>
						) : (
							<span className="status-indicator saved">
								<CheckCircle2 size={12} />
								Tersimpan
							</span>
						)}
					</div>
				</div>

				<div className="editor-topbar-center">
					<span className={`status-badge ${status}`}>
						<span className="status-dot" />
						{status === "published" ? "Published" : "Draft"}
					</span>
				</div>

				<div className="editor-topbar-right">
					<button
						className="editor-action-btn secondary"
						onClick={() => handleSave("draft")}
						disabled={isSaving || !title.trim()}
						type="button"
					>
						<CloudUpload size={15} />
						<span>Simpan Draft</span>
					</button>
					<button
						className="editor-action-btn primary"
						onClick={() => handleSave("published")}
						disabled={isSaving || !title.trim()}
						type="button"
					>
						{isSaving ? <Loader2 size={15} className="spin" /> : <CheckCircle2 size={15} />}
						<span>{status === "published" ? "Perbarui" : "Publikasikan"}</span>
					</button>
				</div>
			</header>

			{/* Main Editor Layout */}
			<div className="editor-layout">
				{/* Main Content */}
				<div className="editor-main" ref={editorRef}>
					<div className="editor-paper">
						{/* Title Area */}
						<div className="editor-title-area">
							<input
								ref={titleRef}
								type="text"
								className="editor-title-input"
								placeholder="Judul artikel yang menarik..."
								value={title}
								maxLength={160}
								onChange={(e) => {
									setTitle(e.target.value);
									setIsDirty(true);
								}}
							/>
							<div className="editor-title-meta">
								<span className="meta-item">
									<Pilcrow size={13} />
									{readTime} mnt baca
								</span>
								<span className="meta-dot">•</span>
								<span className="meta-item">{wordCount} kata</span>
								<span className="meta-dot">•</span>
								<span className="meta-item meta-cat">
									{category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
								</span>
							</div>
						</div>

						{/* Floating Toolbar */}
						<div className="editor-toolbar-floating">
							<div className="toolbar-inner">
								{toolbarButtons.map((btn, idx) =>
									"type" in btn && btn.type === "sep" ? (
										// biome-ignore lint/suspicious/noArrayIndexKey: toolbar separators
										<span key={`sep-${idx}`} className="toolbar-sep" />
									) : (
										<button
											// biome-ignore lint/suspicious/noArrayIndexKey: toolbar buttons
											key={`btn-${idx}`}
											className={`toolbar-btn ${"active" in btn && btn.active ? "active" : ""}`}
											onClick={"action" in btn ? btn.action : undefined}
											title={"title" in btn ? btn.title : undefined}
											disabled={"disabled" in btn ? btn.disabled : false}
											type="button"
										>
											{"icon" in btn ? btn.icon : null}
										</button>
									),
								)}
								<span className="toolbar-sep" />
								<select
									className="toolbar-fontsize"
									title="Ukuran Font"
									value={currentFontSize}
									onChange={(e) => {
										const value = e.target.value;
										if (!editor) return;
										if (value === "default") {
											editor.chain().focus().unsetFontSize().run();
										} else {
											editor.chain().focus().setFontSize(value).run();
										}
									}}
								>
									<option value="default">Normal</option>
									<option value="13px">Kecil</option>
									<option value="18px">Besar</option>
									<option value="22px">Sangat Besar</option>
									<option value="28px">Raksasa</option>
								</select>
							</div>
						</div>

						{/* Image Controls (when image selected) — in-flow bar, no portal (avoids React removeChild crash) */}
						{selectedImageSrc && editor && (
							<div className="image-bubble-menu image-bubble-inline">
								<div className="image-bubble-inner">
									<span className="bubble-label">Posisi</span>
									<button
										className={`bubble-btn ${selectedImageAttrs?.align === "left" ? "active" : ""}`}
										onClick={() => changeImageAttr({ align: "left" })}
										title="Kiri"
										type="button"
									>
										<AlignLeft size={14} />
									</button>
									<button
										className={`bubble-btn ${(selectedImageAttrs?.align ?? "center") === "center" ? "active" : ""}`}
										onClick={() => changeImageAttr({ align: "center" })}
										title="Tengah"
										type="button"
									>
										<AlignCenter size={14} />
									</button>
									<button
										className={`bubble-btn ${selectedImageAttrs?.align === "right" ? "active" : ""}`}
										onClick={() => changeImageAttr({ align: "right" })}
										title="Kanan"
										type="button"
									>
										<AlignRight size={14} />
									</button>
									<span className="bubble-sep" />
									<span className="bubble-label">Lebar</span>
									<button
										className={`bubble-btn bubble-btn-sm ${selectedImageAttrs?.width === "small" ? "active" : ""}`}
										onClick={() => changeImageAttr({ width: "small" })}
										title="Kecil (25%)"
										type="button"
									>
										S
									</button>
									<button
										className={`bubble-btn bubble-btn-sm ${selectedImageAttrs?.width === "medium" ? "active" : ""}`}
										onClick={() => changeImageAttr({ width: "medium" })}
										title="Sedang (50%)"
										type="button"
									>
										M
									</button>
									<button
										className={`bubble-btn bubble-btn-sm ${selectedImageAttrs?.width === "large" ? "active" : ""}`}
										onClick={() => changeImageAttr({ width: "large" })}
										title="Besar (75%)"
										type="button"
									>
										L
									</button>
									<button
										className={`bubble-btn bubble-btn-sm ${selectedImageAttrs?.width === "full" ? "active" : ""}`}
										onClick={() => changeImageAttr({ width: "full" })}
										title="Penuh (100%)"
										type="button"
									>
										⛶
									</button>
									<BubbleNumber
										value={selectedImageAttrs?.width === "custom" ? (selectedImageAttrs?.widthValue ?? "") : ""}
										onChange={(v) => changeImageAttr({ width: "custom", widthValue: v })}
										placeholder="…"
										suffix="%"
										min={10}
										max={100}
										title="Lebar custom (persen)"
									/>
									<span className="bubble-sep" />
									<span className="bubble-label">Tinggi</span>
									<BubbleNumber
										value={selectedImageAttrs?.height ?? ""}
										onChange={(v) => changeImageAttr({ height: v })}
										placeholder="auto"
										suffix="px"
										min={0}
										title="Tinggi custom (px) — kosong = proporsional"
									/>
								</div>
								<div className="image-bubble-inner">
									<span className="bubble-label">Sudut</span>
									<button
										className={`bubble-btn bubble-btn-sm ${effRadius === "0" ? "active" : ""}`}
										onClick={() => changeImageAttr({ radius: "0" })}
										title="Tanpa sudut membulat"
										type="button"
									>
										0
									</button>
									<button
										className={`bubble-btn bubble-btn-sm ${effRadius === "6" ? "active" : ""}`}
										onClick={() => changeImageAttr({ radius: "6" })}
										title="Radius 6px"
										type="button"
									>
										6
									</button>
									<button
										className={`bubble-btn bubble-btn-sm ${effRadius === "12" ? "active" : ""}`}
										onClick={() => changeImageAttr({ radius: "" })}
										title="Radius 12px (default)"
										type="button"
									>
										12
									</button>
									<button
										className={`bubble-btn bubble-btn-sm ${effRadius === "20" ? "active" : ""}`}
										onClick={() => changeImageAttr({ radius: "20" })}
										title="Radius 20px"
										type="button"
									>
										20
									</button>
									<BubbleNumber
										value={effRadius}
										onChange={(v) => changeImageAttr({ radius: v === "12" ? "" : v })}
										suffix="px"
										min={0}
										max={100}
										title="Radius custom (px)"
									/>
									<span className="bubble-sep" />
									<span className="bubble-label">Bayangan</span>
									<button
										className={`bubble-btn bubble-btn-sm ${!selectedImageAttrs?.shadow ? "active" : ""}`}
										onClick={() => changeImageAttr({ shadow: "" })}
										title="Tanpa bayangan"
										type="button"
									>
										–
									</button>
									<button
										className={`bubble-btn bubble-btn-sm ${selectedImageAttrs?.shadow === "sm" ? "active" : ""}`}
										onClick={() => changeImageAttr({ shadow: "sm" })}
										title="Bayangan halus"
										type="button"
									>
										S
									</button>
									<button
										className={`bubble-btn bubble-btn-sm ${selectedImageAttrs?.shadow === "md" ? "active" : ""}`}
										onClick={() => changeImageAttr({ shadow: "md" })}
										title="Bayangan sedang"
										type="button"
									>
										M
									</button>
									<button
										className={`bubble-btn bubble-btn-sm ${selectedImageAttrs?.shadow === "lg" ? "active" : ""}`}
										onClick={() => changeImageAttr({ shadow: "lg" })}
										title="Bayangan tebal"
										type="button"
									>
										L
									</button>
									<span className="bubble-sep" />
									<span className="bubble-label">Bingkai</span>
									<BubbleNumber
										value={selectedImageAttrs?.borderWidth ?? ""}
										onChange={(v) => changeImageAttr({ borderWidth: v })}
										placeholder="0"
										suffix="px"
										min={0}
										max={20}
										title="Ketebalan bingkai (px) — 0/kosong = tanpa"
									/>
									<input
										type="color"
										className="bubble-color"
										value={selectedImageAttrs?.borderColor || "#e5e7eb"}
										onChange={(e) => changeImageAttr({ borderColor: e.target.value })}
										title="Warna bingkai"
									/>
								</div>
								<div className="image-bubble-inner">
									<span className="bubble-label">Judul</span>
									<BubbleNumber
										value={selectedImageAttrs?.titleSize ?? ""}
										onChange={(v) => changeImageAttr({ titleSize: v })}
										placeholder="14"
										suffix="px"
										min={8}
										max={60}
										title="Ukuran tulisan judul gambar (px)"
									/>
									<span className="bubble-label">Caption</span>
									<BubbleNumber
										value={selectedImageAttrs?.captionSize ?? ""}
										onChange={(v) => changeImageAttr({ captionSize: v })}
										placeholder="13"
										suffix="px"
										min={8}
										max={40}
										title="Ukuran tulisan caption (px)"
									/>
									<span className="bubble-sep" />
									<span className="bubble-label">Teks</span>
									<button
										className={`bubble-btn ${(selectedImageAttrs?.textAlign ?? "center") === "left" ? "active" : ""}`}
										onClick={() => changeImageAttr({ textAlign: "left" })}
										title="Judul & caption rata kiri"
										type="button"
									>
										<AlignLeft size={14} />
									</button>
									<button
										className={`bubble-btn ${(selectedImageAttrs?.textAlign ?? "center") === "center" ? "active" : ""}`}
										onClick={() => changeImageAttr({ textAlign: "center" })}
										title="Judul & caption rata tengah"
										type="button"
									>
										<AlignCenter size={14} />
									</button>
									<button
										className={`bubble-btn ${selectedImageAttrs?.textAlign === "right" ? "active" : ""}`}
										onClick={() => changeImageAttr({ textAlign: "right" })}
										title="Judul & caption rata kanan"
										type="button"
									>
										<AlignRight size={14} />
									</button>
									<span className="bubble-sep" />
									<button
										className="bubble-btn bubble-btn-danger"
										onClick={() => {
											if (!editor || !selectedImageSrc) return;
											editor.state.doc.descendants((node, pos) => {
												if (node.type.name === "image" && node.attrs.src === selectedImageSrc) {
													editor.chain().focus().setNodeSelection(pos).deleteNode(node.type).run();
												}
											});
											setSelectedImageSrc(null);
										}}
										title="Hapus Gambar"
										type="button"
									>
										<Trash2 size={14} />
									</button>
								</div>
							</div>
						)}

						{/* Editor Content */}
						<div className="editor-content-area">
							<EditorContent editor={editor} className="editor-content" />
						</div>
					</div>

					{/* Footer stats bar */}
					<div className="editor-footer-stats">
						<span>{wordCount} kata</span>
						<span className="meta-dot">•</span>
						<span>{charCount} karakter</span>
						<span className="meta-dot">•</span>
						<span>{readTime} mnt baca</span>
					</div>

					{/* Slash Command Menu */}
					{showSlashMenu && (
						<SlashCommand position={slashMenuPos} onSelect={insertBlock} onClose={() => setShowSlashMenu(false)} />
					)}

					{/* Template Picker */}
					{showTemplatePicker && (
						<TemplatePicker onSelect={applyTemplate} onClose={() => setShowTemplatePicker(false)} />
					)}
				</div>

				{/* Inspector Sidebar */}
				<EditorInspector
					article={{
						title,
						slug,
						excerpt,
						thumbnail,
						category,
						status,
						read_time: readTime,
						meta_title: metaTitle,
						meta_desc: metaDesc,
					}}
					onUpdate={(field, value) => {
						setIsDirty(true);
						switch (field) {
							case "slug":
								setSlugTouched(true);
								setSlug(value as string);
								break;
							case "excerpt":
								setExcerpt(value as string);
								break;
							case "thumbnail":
								setThumbnail(value as string);
								break;
							case "thumbnailFile":
								setThumbnailFile(value as File | null);
								break;
							case "category":
								setCategory(value as ArticleCategory);
								break;
							case "status":
								setStatus(value as "draft" | "published");
								break;
							case "read_time":
								setReadTime(Number(value));
								break;
							case "meta_title":
								setMetaTitle(value as string);
								break;
							case "meta_desc":
								setMetaDesc(value as string);
								break;
						}
					}}
					editor={editor}
					selectedImageSrc={selectedImageSrc}
					selectedImageAttrs={selectedImageAttrs}
					onImageUpdate={(attrs) => changeImageAttr(attrs)}
				/>
			</div>
		</div>
	);
}

// ============ EDITOR STYLES ============
const editorStyles = `
	.blog-editor {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 64px);
		background: var(--bg-app);
	}

	@keyframes editorSpin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.spin {
		animation: editorSpin 0.8s linear infinite;
	}

	/* ===== Top Bar ===== */
	.editor-topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 60px;
		padding: 0 20px;
		background: var(--bg-card);
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
		gap: 16px;
	}

	.editor-topbar-left,
	.editor-topbar-right {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 1;
	}

	.editor-topbar-right {
		justify-content: flex-end;
	}

	.editor-topbar-center {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.editor-divider {
		width: 1px;
		height: 24px;
		background: var(--border);
	}

	.editor-status-indicators {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.status-indicator {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		font-weight: 500;
		padding: 4px 10px;
		border-radius: var(--radius-full);
	}

	.status-indicator.saving { color: var(--warning); background: var(--warning-bg); }
	.status-indicator.unsaved { color: var(--text-muted); background: var(--bg-surface); }
	.status-indicator.saved { color: var(--success); background: var(--success-bg); }
	.status-indicator.uploading { color: var(--info); background: var(--info-bg); }
	.status-indicator.error { color: var(--danger); background: var(--danger-bg); }

	.editor-back-btn {
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 8px 14px;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		font-size: 13px;
		font-weight: 500;
		font-family: var(--font-sans);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.editor-back-btn:hover {
		background: var(--bg-surface);
		color: var(--text-primary);
		border-color: var(--border-strong);
	}

	.status-badge {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 5px 14px;
		border-radius: var(--radius-full);
		font-size: 12px;
		font-weight: 600;
	}

	.status-badge .status-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: currentColor;
	}

	.status-badge.draft {
		background: var(--warning-bg);
		color: var(--warning);
	}

	.status-badge.published {
		background: var(--success-bg);
		color: var(--success);
	}

	.editor-action-btn {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 9px 16px;
		border-radius: var(--radius-sm);
		font-size: 13px;
		font-weight: 600;
		font-family: var(--font-sans);
		cursor: pointer;
		transition: all var(--transition-fast);
		border: none;
	}

	.editor-action-btn.secondary {
		background: var(--bg-surface);
		color: var(--text-secondary);
		border: 1px solid var(--border);
	}

	.editor-action-btn.secondary:hover:not(:disabled) {
		background: var(--bg-card);
		color: var(--text-primary);
		border-color: var(--border-strong);
	}

	.editor-action-btn.primary {
		background: var(--brand);
		color: var(--brand-text);
		box-shadow: 0 2px 8px rgba(198, 40, 40, 0.25);
	}

	.editor-action-btn.primary:hover:not(:disabled) {
		background: var(--brand-hover);
	}

	.editor-action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* ===== Layout ===== */
	.editor-layout {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	/* ===== Main Editor ===== */
	.editor-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		position: relative;
		padding: 32px 40px 0;
	}

	.editor-paper {
		width: 100%;
		max-width: 780px;
		margin: 0 auto;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-card);
		padding: 40px 48px 56px;
	}

	/* ===== Title Area ===== */
	.editor-title-area {
		margin-bottom: 24px;
		padding-bottom: 20px;
		border-bottom: 1px solid var(--border);
	}

	.editor-title-input {
		width: 100%;
		font-size: 34px;
		font-weight: 700;
		border: none;
		background: transparent;
		color: var(--text-primary);
		outline: none;
		padding: 0;
		line-height: 1.25;
		margin-bottom: 14px;
		font-family: var(--font-sans);
		letter-spacing: -0.01em;
	}

	.editor-title-input::placeholder {
		color: var(--text-muted);
		opacity: 0.6;
	}

	.editor-title-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.meta-item {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 12.5px;
		color: var(--text-muted);
	}

	.meta-item.meta-cat {
		color: var(--brand);
		font-weight: 600;
	}

	.meta-dot {
		color: var(--text-muted);
		opacity: 0.5;
		font-size: 12px;
	}

	/* ===== Floating Toolbar ===== */
	.editor-toolbar-floating {
		position: sticky;
		top: 0;
		z-index: 20;
		padding: 4px 0 12px;
		margin: 0 -8px 16px;
		background: var(--bg-card);
	}

	.toolbar-inner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 2px;
		padding: 6px;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		box-shadow: var(--shadow-card);
		width: fit-content;
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		background: transparent;
		color: var(--text-secondary);
		border-radius: var(--radius-xs);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.toolbar-btn:hover:not(:disabled) {
		background: var(--bg-card);
		color: var(--text-primary);
	}

	.toolbar-btn.active {
		background: var(--brand-bg);
		color: var(--brand);
	}

	.toolbar-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.toolbar-sep {
		width: 1px;
		height: 20px;
		background: var(--border);
		margin: 0 4px;
	}

	.toolbar-fontsize {
		height: 32px;
		padding: 0 8px;
		border: 1px solid var(--border);
		background: var(--bg-card);
		color: var(--text-secondary);
		border-radius: var(--radius-xs);
		font-size: 12px;
		font-weight: 600;
		font-family: var(--font-sans);
		cursor: pointer;
		outline: none;
		transition: all var(--transition-fast);
	}

	.toolbar-fontsize:hover,
	.toolbar-fontsize:focus {
		border-color: var(--border-strong);
		color: var(--text-primary);
	}

	/* ===== Editor Content ===== */
	.editor-content-area {
		flex: 1;
	}

	.editor-content .ProseMirror {
		outline: none;
		min-height: 420px;
	}

	.editor-content .ProseMirror p.is-editor-empty:first-child::before {
		content: attr(data-placeholder);
		color: var(--text-muted);
		opacity: 0.6;
		pointer-events: none;
		float: left;
		height: 0;
	}

	.editor-content .ProseMirror h2 {
		font-size: 26px;
		font-weight: 700;
		margin: 36px 0 14px;
		color: var(--text-primary);
		line-height: 1.3;
		letter-spacing: -0.01em;
	}

	.editor-content .ProseMirror h3 {
		font-size: 20px;
		font-weight: 600;
		margin: 28px 0 12px;
		color: var(--text-primary);
		line-height: 1.4;
	}

	.editor-content .ProseMirror h4 {
		font-size: 16px;
		font-weight: 600;
		margin: 22px 0 8px;
		color: var(--text-primary);
	}

	.editor-content .ProseMirror p {
		margin: 14px 0;
		line-height: 1.8;
		color: var(--text-primary);
		font-size: 16px;
	}

	.editor-content .ProseMirror ul,
	.editor-content .ProseMirror ol {
		margin: 16px 0;
		padding-left: 26px;
	}

	.editor-content .ProseMirror li {
		margin: 6px 0;
		line-height: 1.7;
		font-size: 16px;
		color: var(--text-primary);
	}

	.editor-content .ProseMirror blockquote {
		margin: 24px 0;
		padding: 16px 22px;
		border-left: 4px solid var(--brand);
		background: var(--brand-bg);
		border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
		color: var(--text-secondary);
		font-style: italic;
		font-size: 16px;
	}

	.editor-content .ProseMirror blockquote p {
		margin: 0;
	}

	.editor-content .ProseMirror hr {
		border: none;
		border-top: 2px solid var(--border);
		margin: 36px 0;
	}

	.editor-content .ProseMirror a,
	.editor-content .ProseMirror .editor-link {
		color: var(--brand);
		text-decoration: underline;
		cursor: pointer;
	}

	.editor-content .ProseMirror code {
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 2px 5px;
		font-size: 0.9em;
		color: var(--brand);
	}

	/* ===== Image Figure (NodeView) ===== */
	.editor-content .ProseMirror .editor-figure {
		display: block;
		padding: 0;
	}

	.editor-content .ProseMirror .editor-figure.is-selected .editor-figure-media,
	.editor-content .ProseMirror .editor-figure.ProseMirror-selectednode .editor-figure-media {
		outline: 2px solid var(--brand);
		outline-offset: 2px;
	}

	.editor-content .ProseMirror .editor-figure-media {
		position: relative;
		overflow: hidden;
		transition: border-radius var(--transition-fast), box-shadow var(--transition-fast);
	}

	.editor-content .ProseMirror .editor-figure-title {
		display: block;
		width: 100%;
		margin-bottom: 10px;
		padding: 4px 8px;
		background: transparent;
		border: 1px dashed transparent;
		border-radius: var(--radius-xs);
		font-size: 14px;
		font-weight: 700;
		text-align: center;
		color: var(--text-primary);
		font-family: var(--font-sans);
		outline: none;
		transition: all var(--transition-fast);
	}

	.editor-content .ProseMirror .editor-figure-title::placeholder {
		color: var(--text-muted);
		opacity: 0.6;
		font-weight: 500;
	}

	.editor-content .ProseMirror .editor-figure-title:hover,
	.editor-content .ProseMirror .editor-figure-title:focus {
		border-color: var(--border);
		background: var(--bg-surface);
	}

	.editor-content .ProseMirror .editor-figure-caption {
		display: block;
		width: 100%;
		margin-top: 2px;
		padding: 4px 8px;
		background: transparent;
		border: 1px dashed transparent;
		border-radius: var(--radius-xs);
		font-size: 13px;
		font-style: italic;
		text-align: center;
		color: var(--text-muted);
		font-family: var(--font-sans);
		outline: none;
		transition: all var(--transition-fast);
	}

	.editor-content .ProseMirror .editor-figure-caption::placeholder {
		color: var(--text-muted);
		opacity: 0.6;
	}

	.editor-content .ProseMirror .editor-figure-caption:hover,
	.editor-content .ProseMirror .editor-figure-caption:focus {
		border-color: var(--border);
		background: var(--bg-surface);
		color: var(--text-secondary);
	}

	/* ===== Image Bubble Menu (inline bar, no portal) ===== */
	.image-bubble-menu {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 6px;
		box-shadow: var(--shadow-dropdown);
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.image-bubble-inline {
		position: sticky;
		top: 56px;
		z-index: 19;
		width: fit-content;
		margin: 0 0 12px;
		animation: bubbleBarIn 0.15s ease-out;
	}

	@keyframes bubbleBarIn {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.image-bubble-inner {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.bubble-label {
		font-size: 11px;
		color: var(--text-muted);
		font-weight: 600;
		padding: 0 4px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.bubble-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: none;
		background: transparent;
		color: var(--text-secondary);
		border-radius: var(--radius-xs);
		cursor: pointer;
		transition: all var(--transition-fast);
		font-size: 11px;
		font-weight: 600;
	}

	.bubble-btn:hover {
		background: var(--bg-surface);
		color: var(--text-primary);
	}

	.bubble-btn.active {
		background: var(--brand-bg);
		color: var(--brand);
	}

	.bubble-btn-danger:hover {
		background: var(--danger-bg);
		color: var(--danger);
	}

	.bubble-sep {
		width: 1px;
		height: 20px;
		background: var(--border);
		margin: 0 4px;
	}

	.bubble-number {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		padding: 0 4px;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-xs);
		height: 28px;
		transition: border-color var(--transition-fast);
	}

	.bubble-number:focus-within {
		border-color: var(--brand);
	}

	.bubble-number-input {
		width: 44px;
		border: none;
		background: transparent;
		color: var(--text-primary);
		font-size: 12px;
		font-weight: 600;
		font-family: var(--font-sans);
		outline: none;
		padding: 0 2px;
		-moz-appearance: textfield;
		appearance: textfield;
	}

	.bubble-number-input::-webkit-outer-spin-button,
	.bubble-number-input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.bubble-number-input::placeholder {
		color: var(--text-muted);
		opacity: 0.6;
		font-weight: 500;
	}

	.bubble-number-suffix {
		font-size: 10.5px;
		color: var(--text-muted);
		font-weight: 600;
	}

	.bubble-color {
		width: 28px;
		height: 28px;
		padding: 2px;
		border: 1px solid var(--border);
		border-radius: var(--radius-xs);
		background: var(--bg-surface);
		cursor: pointer;
	}

	.bubble-color::-webkit-color-swatch-wrapper {
		padding: 2px;
	}

	.bubble-color::-webkit-color-swatch {
		border: none;
		border-radius: 4px;
	}

	/* ===== Footer Stats ===== */
	.editor-footer-stats {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 16px 0 24px;
		font-size: 12px;
		color: var(--text-muted);
	}

	/* ===== Responsive ===== */
	@media (max-width: 1200px) {
		.editor-main {
			padding: 24px 24px 0;
		}
		.editor-paper {
			padding: 32px 32px 44px;
		}
	}

	@media (max-width: 1024px) {
		.editor-main {
			padding: 16px 16px 0;
		}
		.editor-paper {
			padding: 24px 22px 36px;
		}
		.editor-title-input {
			font-size: 28px;
		}
	}

	@media (max-width: 768px) {
		.editor-topbar {
			padding: 10px 12px;
			flex-wrap: wrap;
			height: auto;
		}
		.editor-action-btn span {
			display: none;
		}
		.editor-back-btn span {
			display: none;
		}
		.editor-title-input {
			font-size: 24px;
		}
		.editor-content .ProseMirror .editor-figure {
			width: 100% !important;
		}
	}
`;
