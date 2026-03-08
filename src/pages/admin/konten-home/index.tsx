import { DeleteOutlined, EditOutlined, EyeOutlined, EyeInvisibleOutlined, PlusOutlined, ReloadOutlined, SaveOutlined, CheckCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import {
	Alert,
	Button,
	Card,
	Col,
	Empty,
	Form,
	Input,
	Modal,
	Popconfirm,
	Row,
	Select,
	Space,
	Spin,
	Switch,
	Tabs,
	Tag,
	Tooltip,
	message,
	Typography,
	Divider,
	Badge,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deletePageContent, getPageContents, saveBulkPageContents } from "@/api/pageContents.api";
import { PAGE_CONTENT_QUERY_KEY } from "@/hooks/usePageContent";
import type { PageContent, PageContentType } from "@/types/database.types";
import { slugify } from "@/utils/slug";

const { Title, Text, Paragraph } = Typography;

type GroupKey = "Hero" | "Statistik" | "Pengumuman" | "Cara Pakai" | "Footer & Kontak" | "SEO" | "Lainnya";

interface KnownField {
	key: string;
	title: string;
	help?: string;
	group: Exclude<GroupKey, "Lainnya">;
	type: PageContentType;
	required?: boolean;
	placeholder?: string;
	options?: Array<{ label: string; value: string }>;
	preview?: "text" | "announcement" | "stat" | "step";
}

interface CustomFormValue {
	namaKonten: string;
	letakKonten: GroupKey;
	jenisIsi: PageContentType;
	isiKonten: string | boolean;
	catatan?: string;
}

// Label yang lebih user-friendly
const GROUP_LABELS: Record<GroupKey, { title: string; desc: string; icon: string }> = {
	Hero: { 
		title: "🏠 Bagian Atas (Hero)", 
		desc: "Tampilan pertama yang dilihat pengunjung",
		icon: "🏠"
	},
	Statistik: { 
		title: "📊 Angka Statistik", 
		desc: "Data jumlah cucian dan rating",
		icon: "📊"
	},
	Pengumuman: { 
		title: "📢 Pengumuman Berjalan", 
		desc: "Info penting yang muncul di atas halaman",
		icon: "📢"
	},
	"Cara Pakai": { 
		title: "📝 Cara Pakai (3 Langkah)", 
		desc: "Penjelasan singkat cara menggunakan laundry",
		icon: "📝"
	},
	"Footer & Kontak": { 
		title: "📞 Footer dan Kontak", 
		desc: "Informasi kontak dan sosial media",
		icon: "📞"
	},
	SEO: { 
		title: "🔍 Google SEO", 
		desc: "Pengaturan tampilan di Google Search",
		icon: "🔍"
	},
	Lainnya: { 
		title: "➕ Konten Tambahan", 
		desc: "Konten kustom lainnya",
		icon: "➕"
	},
};

const GROUP_ORDER: GroupKey[] = ["Hero", "Statistik", "Pengumuman", "Cara Pakai", "Footer & Kontak", "SEO", "Lainnya"];
const GROUP_SET = new Set<GroupKey>(GROUP_ORDER);

// Field yang sudah diketahui dengan deskripsi lebih jelas
const KNOWN_FIELDS: KnownField[] = [
	{
		key: "hero_title",
		title: "Judul Besar Halaman Depan",
		help: "Tulisan paling besar dan mencolok di bagian atas website. Ini yang pertama dilihat pengunjung.",
		group: "Hero",
		type: "text",
		required: true,
		placeholder: "Contoh: Laundry Sendiri, Bersih Maksimal, Harga Pasti",
		preview: "text",
	},
	{
		key: "hero_subtitle",
		title: "Kalimat Penjelasan",
		help: "Kalimat pendek di bawah judul yang menjelaskan keunggulan laundry Anda.",
		group: "Hero",
		type: "text",
		required: true,
		placeholder: "Contoh: Rp 10.000 cuci - Rp 10.000 kering - Cabang siap melayanimu",
		preview: "text",
	},
	{
		key: "hero_cta_primary",
		title: "Teks Tombol UTAMA (Warna Merah)",
		help: "Tombol yang paling mencolok, biasanya untuk ajakan utama seperti 'Pilih Cabang'.",
		group: "Hero",
		type: "text",
		required: true,
		placeholder: "Contoh: Pilih Cabang Terdekat",
	},
	{
		key: "hero_cta_secondary",
		title: "Teks Tombol KEDUA (Warna Putih)",
		help: "Tombol kedua yang lebih ringan, biasanya untuk promo atau info tambahan.",
		group: "Hero",
		type: "text",
		required: true,
		placeholder: "Contoh: Lihat Promo Hari Ini",
	},
	{
		key: "stats_cucian",
		title: "Jumlah Total Cucian",
		help: "Masukkan angka total cucian yang sudah dikerjakan (contoh: 12500).",
		group: "Statistik",
		type: "number",
		required: true,
		placeholder: "Contoh: 12500",
		preview: "stat",
	},
	{
		key: "stats_rating",
		title: "Rating Pelanggan",
		help: "Rating rata-rata dari 1-5 (contoh: 4.9).",
		group: "Statistik",
		type: "number",
		required: true,
		placeholder: "Contoh: 4.9",
		preview: "stat",
	},
	{
		key: "announcement_active",
		title: "Aktifkan Pengumuman?",
		help: "Nyalakan jika ingin menampilkan pengumuman di bagian atas website.",
		group: "Pengumuman",
		type: "boolean",
	},
	{
		key: "announcement_text",
		title: "Isi Pengumuman",
		help: "Teks yang akan muncul berjalan di bagian atas halaman.",
		group: "Pengumuman",
		type: "text",
		placeholder: "Contoh: 🎉 Promo cuci kiloan berlaku sampai Minggu malam!",
		preview: "announcement",
	},
	{
		key: "announcement_color",
		title: "Warna Latar Pengumuman",
		help: "Pilih warna yang sesuai dengan tingkat kepentingan pengumuman.",
		group: "Pengumuman",
		type: "text",
		options: [
			{ label: "🔴 Merah (Penting)", value: "red" },
			{ label: "🔵 Biru (Informasi)", value: "blue" },
			{ label: "🟢 Hijau (Sukses)", value: "teal" },
			{ label: "🟡 Kuning (Perhatian)", value: "amber" },
		],
	},
	{
		key: "how_to_step1_title",
		title: "Langkah 1 - Judul",
		help: "Judul singkat untuk langkah pertama.",
		group: "Cara Pakai",
		type: "text",
		required: true,
		placeholder: "Contoh: Pilih Mesin Kosong",
		preview: "step",
	},
	{
		key: "how_to_step1_desc",
		title: "Langkah 1 - Penjelasan",
		help: "Penjelasan singkat cara kerja langkah pertama.",
		group: "Cara Pakai",
		type: "text",
		required: true,
		placeholder: "Contoh: Cari mesin cuci atau pengering yang tersedia dan kosong",
		preview: "step",
	},
	{
		key: "how_to_step2_title",
		title: "Langkah 2 - Judul",
		help: "Judul singkat untuk langkah kedua.",
		group: "Cara Pakai",
		type: "text",
		required: true,
		placeholder: "Contoh: Bayar dan Mulai",
		preview: "step",
	},
	{
		key: "how_to_step2_desc",
		title: "Langkah 2 - Penjelasan",
		help: "Penjelasan singkat cara kerja langkah kedua.",
		group: "Cara Pakai",
		type: "text",
		required: true,
		placeholder: "Contoh: Scan QRIS atau masukkan koin sesuai tarif yang tertera",
		preview: "step",
	},
	{
		key: "how_to_step3_title",
		title: "Langkah 3 - Judul",
		help: "Judul singkat untuk langkah ketiga.",
		group: "Cara Pakai",
		type: "text",
		required: true,
		placeholder: "Contoh: Tunggu dan Ambil",
		preview: "step",
	},
	{
		key: "how_to_step3_desc",
		title: "Langkah 3 - Penjelasan",
		help: "Penjelasan singkat cara kerja langkah ketiga.",
		group: "Cara Pakai",
		type: "text",
		required: true,
		placeholder: "Contoh: Estimasi 30-40 menit cuci, 20-30 menit kering",
		preview: "step",
	},
	{
		key: "footer_desc",
		title: "Deskripsi Singkat di Footer",
		help: "Penjelasan singkat tentang laundry Anda yang muncul di bagian bawah halaman.",
		group: "Footer & Kontak",
		type: "text",
		required: true,
		placeholder: "Contoh: Laundry self-service modern, mesin bersih, harga transparan.",
	},
	{
		key: "footer_tagline",
		title: "Tagline / Slogan",
		help: "Slogan singkat yang mewakili brand Anda.",
		group: "Footer & Kontak",
		type: "text",
		required: true,
		placeholder: "Contoh: Bersih Itu Mudah, Cepat, dan Terjangkau",
	},
	{
		key: "social_instagram",
		title: "Link Instagram",
		help: "URL lengkap akun Instagram (kosongkan jika belum punya).",
		group: "Footer & Kontak",
		type: "url",
		placeholder: "https://instagram.com/namaakun",
	},
	{
		key: "social_tiktok",
		title: "Link TikTok",
		help: "URL lengkap akun TikTok (kosongkan jika belum punya).",
		group: "Footer & Kontak",
		type: "url",
		placeholder: "https://tiktok.com/@namaakun",
	},
	{
		key: "social_facebook",
		title: "Link Facebook",
		help: "URL lengkap akun Facebook (kosongkan jika belum punya).",
		group: "Footer & Kontak",
		type: "url",
		placeholder: "https://facebook.com/namaakun",
	},
	{
		key: "social_youtube",
		title: "Link YouTube",
		help: "URL lengkap channel YouTube (kosongkan jika belum punya).",
		group: "Footer & Kontak",
		type: "url",
		placeholder: "https://youtube.com/@namaakun",
	},
	{
		key: "whatsapp_cs",
		title: "Nomor WhatsApp",
		help: "Nomor WA untuk customer service. Format: 08xx atau 628xx",
		group: "Footer & Kontak",
		type: "text",
		required: true,
		placeholder: "Contoh: 6281234567890",
	},
	{
		key: "seo_title",
		title: "Judul di Google",
		help: "Judul yang muncul saat website Anda dicari di Google.",
		group: "SEO",
		type: "text",
		required: true,
		placeholder: "Contoh: MBA Laundry Express - Self Service Laundry Terpercaya",
	},
	{
		key: "seo_desc",
		title: "Deskripsi di Google",
		help: "Penjelasan singkat yang muncul di bawah judul di hasil pencarian Google.",
		group: "SEO",
		type: "text",
		required: true,
		placeholder: "Contoh: MBA Laundry Express hadir dengan mesin cuci modern...",
	},
];

const KNOWN_KEY_SET = new Set(KNOWN_FIELDS.map((field) => field.key));

const parseBoolean = (value?: string): boolean => value === "1" || value === "true";

const serializeValue = (value: unknown, type: PageContentType): string => {
	if (type === "boolean") return value ? "1" : "0";
	if (value === undefined || value === null) return "";
	return String(value);
};

const toErrorMessage = (error: unknown): string => {
	if (error instanceof Error) return error.message;
	return "Terjadi kesalahan. Silakan coba lagi.";
};

const normalizeGroup = (value?: string): GroupKey => {
	if (!value) return "Lainnya";
	if (GROUP_SET.has(value as GroupKey)) return value as GroupKey;
	return "Lainnya";
};

const isTextarea = (field: KnownField): boolean =>
	field.key.endsWith("_desc") || field.key === "hero_subtitle" || field.key === "announcement_text" || field.key === "footer_desc";

const customTypeOptions: Array<{ label: string; value: PageContentType }> = [
	{ label: "Teks Biasa", value: "text" },
	{ label: "Angka", value: "number" },
	{ label: "Tautan / Link", value: "url" },
	{ label: "Ya / Tidak", value: "boolean" },
	{ label: "Teks Panjang", value: "richtext" },
	{ label: "JSON", value: "json" },
];

// Komponen Preview sederhana
const PreviewBox = ({ children, type }: { children: React.ReactNode; type: string }) => {
	const bgColors: Record<string, string> = {
		announcement: "bg-gradient-to-r from-blue-500 to-teal-500",
		stat: "bg-white border-2 border-gray-200",
		step: "bg-gray-50 border border-gray-200",
		text: "bg-white border border-gray-200",
	};
	
	return (
		<div className={`mt-3 p-3 rounded-lg ${bgColors[type] || bgColors.text}`}>
			<Text className="text-xs text-gray-500 mb-1 block">👁️ Preview:</Text>
			{children}
		</div>
	);
};

export default function KontenHomeAdminPage() {
	const [form] = Form.useForm<Record<string, string | boolean>>();
	const [customForm] = Form.useForm<CustomFormValue>();
	const queryClient = useQueryClient();

	const [activeGroup, setActiveGroup] = useState<GroupKey>("Hero");
	const [saving, setSaving] = useState(false);
	const [customModalOpen, setCustomModalOpen] = useState(false);
	const [editingCustom, setEditingCustom] = useState<PageContent | null>(null);
	const [showPreview, setShowPreview] = useState(true);
	const [savedGroups, setSavedGroups] = useState<Set<GroupKey>>(new Set());

	const {
		data: rows = [],
		isLoading,
		isFetching,
	} = useQuery<PageContent[]>({
		queryKey: ["admin-page-contents"],
		queryFn: () => getPageContents(),
	});

	const rowByKey = useMemo(
		() =>
			rows.reduce<Record<string, PageContent>>((acc, row) => {
				acc[row.key] = row;
				return acc;
			}, {}),
		[rows],
	);

	const customRows = useMemo(() => rows.filter((row) => !KNOWN_KEY_SET.has(row.key)), [rows]);

	const customRowsByGroup = useMemo(() => {
		return customRows.reduce<Record<GroupKey, PageContent[]>>(
			(acc, row) => {
				const group = normalizeGroup(row.group);
				acc[group].push(row);
				return acc;
			},
			{
				Hero: [],
				Statistik: [],
				Pengumuman: [],
				"Cara Pakai": [],
				"Footer & Kontak": [],
				SEO: [],
				Lainnya: [],
			},
		);
	}, [customRows]);

	const initialValues = useMemo(() => {
		return KNOWN_FIELDS.reduce<Record<string, string | boolean>>((acc, field) => {
			const row = rowByKey[field.key];
			if (field.type === "boolean") {
				acc[field.key] = parseBoolean(row?.value);
			} else {
				acc[field.key] = row?.value ?? "";
			}
			return acc;
		}, {});
	}, [rowByKey]);

	useEffect(() => {
		form.setFieldsValue(initialValues);
	}, [form, initialValues]);

	const knownInActiveGroup = useMemo(() => KNOWN_FIELDS.filter((field) => field.group === activeGroup), [activeGroup]);

	const invalidateAll = async (): Promise<void> => {
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: ["admin-page-contents"] }),
			queryClient.invalidateQueries({ queryKey: [PAGE_CONTENT_QUERY_KEY] }),
			queryClient.invalidateQueries({ queryKey: [PAGE_CONTENT_QUERY_KEY, "map"] }),
			queryClient.invalidateQueries({ queryKey: ["admin-page-content-map"] }),
		]);
	};

	const validateRules = (field: KnownField) => {
		const rules: Array<{
			required?: boolean;
			message?: string;
			validator?: (_: unknown, value: unknown) => Promise<void>;
		}> = [];

		if (field.required && field.type !== "boolean") {
			rules.push({ required: true, message: `${field.title} wajib diisi` });
		}

		if (field.type === "number") {
			rules.push({
				validator: async (_: unknown, value: unknown) => {
					const raw = String(value ?? "").trim();
					if (!raw) return;
					if (!/^-?\d+(\.\d+)?$/.test(raw)) throw new Error("Isi harus angka");
				},
			});
		}

		if (field.type === "url") {
			rules.push({
				validator: async (_: unknown, value: unknown) => {
					const raw = String(value ?? "").trim();
					if (!raw) return;
					try {
						new URL(raw);
					} catch {
						throw new Error("Format link tidak valid");
					}
				},
			});
		}

		if (field.key === "whatsapp_cs") {
			rules.push({
				validator: async (_: unknown, value: unknown) => {
					const raw = String(value ?? "").replace(/\s+/g, "");
					if (!raw) throw new Error("Nomor WhatsApp wajib diisi");
					if (!/^(08\d{8,13}|628\d{7,13})$/.test(raw)) {
						throw new Error("Format WA salah. Gunakan 08xx atau 628xx");
					}
				},
			});
		}

		return rules;
	};

	const saveFields = async (fields: KnownField[], successText: string, groupKey?: GroupKey): Promise<void> => {
		if (fields.length === 0) {
			message.info("Bagian ini tidak punya data utama.");
			return;
		}

		const names = fields.map((field) => field.key);
		const values = (await form.validateFields(names)) as Record<string, unknown>;

		const payload: Array<Partial<PageContent>> = fields.map((field) => ({
			key: field.key,
			value: serializeValue(values[field.key], field.type),
			type: field.type,
			label: field.title,
			group: field.group,
			description: field.help ?? "",
		}));

		setSaving(true);
		try {
			await saveBulkPageContents(payload);
			message.success(successText);
			if (groupKey) {
				setSavedGroups(prev => new Set([...prev, groupKey]));
			}
			await invalidateAll();
		} catch (error) {
			message.error(toErrorMessage(error));
		} finally {
			setSaving(false);
		}
	};

	const saveActiveGroup = async (): Promise<void> => {
		await saveFields(knownInActiveGroup, `✅ Bagian "${GROUP_LABELS[activeGroup].title}" berhasil disimpan!`, activeGroup);
	};

	const saveAll = async (): Promise<void> => {
		await saveFields(KNOWN_FIELDS, "✅ Semua konten berhasil disimpan!");
		setSavedGroups(new Set(GROUP_ORDER));
	};

	const resetForm = (): void => {
		form.setFieldsValue(initialValues);
		setSavedGroups(new Set());
		message.success("Perubahan dibatalkan. Form kembali ke data terakhir.");
	};

	const clearOneField = async (field: KnownField): Promise<void> => {
		const row = rowByKey[field.key];
		try {
			if (row?.id) {
				await deletePageContent(row.id);
			}
			form.setFieldValue(field.key, field.type === "boolean" ? false : "");
			await invalidateAll();
			message.success(`${field.title} dikosongkan.`);
		} catch (error) {
			message.error(toErrorMessage(error));
		}
	};

	const openCreateCustom = () => {
		setEditingCustom(null);
		customForm.setFieldsValue({
			namaKonten: "",
			letakKonten: activeGroup,
			jenisIsi: "text",
			isiKonten: "",
			catatan: "",
		});
		setCustomModalOpen(true);
	};

	const openEditCustom = (row: PageContent) => {
		setEditingCustom(row);
		customForm.setFieldsValue({
			namaKonten: row.label?.trim() || row.key,
			letakKonten: normalizeGroup(row.group),
			jenisIsi: row.type,
			isiKonten: row.type === "boolean" ? parseBoolean(row.value) : row.value,
			catatan: row.description ?? "",
		});
		setCustomModalOpen(true);
	};

	const deleteCustom = async (row: PageContent): Promise<void> => {
		try {
			await deletePageContent(row.id);
			message.success("Konten tambahan berhasil dihapus.");
			await invalidateAll();
		} catch (error) {
			message.error(toErrorMessage(error));
		}
	};

	const customType = Form.useWatch("jenisIsi", customForm) as PageContentType | undefined;

	const saveCustom = async (): Promise<void> => {
		const values = await customForm.validateFields();

		const keyBase = slugify(values.namaKonten || "konten-tambahan");
		const generatedKey = `custom_${keyBase || "item"}_${Date.now().toString().slice(-6)}`;
		const key = editingCustom?.key || generatedKey;

		const payload: Partial<PageContent> = {
			key,
			value: serializeValue(values.isiKonten, values.jenisIsi),
			type: values.jenisIsi,
			label: values.namaKonten.trim(),
			group: values.letakKonten,
			description: values.catatan?.trim() || "",
		};

		try {
			await saveBulkPageContents([payload]);
			message.success(editingCustom ? "Konten tambahan berhasil diperbarui." : "Konten tambahan berhasil ditambahkan.");
			setCustomModalOpen(false);
			customForm.resetFields();
			setEditingCustom(null);
			await invalidateAll();
		} catch (error) {
			message.error(toErrorMessage(error));
		}
	};

	const renderInput = (field: KnownField) => {
		if (field.type === "boolean") {
			return <Switch checkedChildren="Ya" unCheckedChildren="Tidak" className="w-20" />;
		}

		if (field.options && field.options.length > 0) {
			return <Select options={field.options} placeholder={field.placeholder ?? "Pilih"} allowClear className="w-full" />;
		}

		if (isTextarea(field)) {
			return <Input.TextArea rows={3} showCount maxLength={300} placeholder={field.placeholder ?? "Isi di sini"} />;
		}

		return <Input type={field.type === "url" ? "url" : "text"} placeholder={field.placeholder ?? "Isi di sini"} />;
	};

	// Render preview untuk field
	const renderPreview = (field: KnownField, value: unknown) => {
		if (!showPreview || !value || value === "") return null;
		
		const val = String(value);
		
		switch (field.preview) {
			case "announcement":
				return (
					<PreviewBox type="announcement">
						<div className="text-white text-sm font-medium text-center py-1">
							📢 {val}
						</div>
					</PreviewBox>
				);
			case "stat":
				return (
					<PreviewBox type="stat">
						<div className="text-center">
							<div className="text-2xl font-bold text-red-600">{val}</div>
							<div className="text-xs text-gray-500">{field.title}</div>
						</div>
					</PreviewBox>
				);
			case "step":
				return (
					<PreviewBox type="step">
						<div className="text-sm">
							<span className="font-semibold text-gray-800">{val}</span>
						</div>
					</PreviewBox>
				);
			case "text":
				return (
					<PreviewBox type="text">
						<div className="text-sm text-gray-700 italic">&ldquo;{val}&rdquo;</div>
					</PreviewBox>
				);
			default:
				return null;
		}
	};

	// Hitung progress
	const filledFields = useMemo(() => {
		const values = form.getFieldsValue();
		return KNOWN_FIELDS.filter(f => {
			const val = values[f.key];
			if (f.type === "boolean") return val === true;
			return val && String(val).trim() !== "";
		}).length;
	}, [form]);

	const progressPercent = Math.round((filledFields / KNOWN_FIELDS.length) * 100);

	return (
		<div className="space-y-4">
			{/* Header Card */}
			<Card className="shadow-sm">
				<Row gutter={[16, 16]} align="middle">
					<Col xs={24} md={16}>
						<Title level={4} className="!mb-1">
							🎨 Kelola Konten Website
						</Title>
						<Paragraph className="text-gray-500 !mb-0">
							Ubah teks, angka, dan informasi di halaman utama dengan mudah. Tidak perlu coding!
						</Paragraph>
					</Col>
					<Col xs={24} md={8} className="text-right">
						<Space wrap>
							<Tooltip title="Tampilkan/Sembunyikan preview">
								<Button 
									icon={showPreview ? <EyeInvisibleOutlined /> : <EyeOutlined />}
									onClick={() => setShowPreview(!showPreview)}
								>
									{showPreview ? "Sembunyikan Preview" : "Tampilkan Preview"}
								</Button>
							</Tooltip>
						</Space>
					</Col>
				</Row>
				
				<Divider className="!my-4" />
				
				{/* Progress Bar */}
				<div className="bg-gray-100 rounded-lg p-4">
					<div className="flex justify-between items-center mb-2">
						<Text className="text-sm font-medium">
							📊 Progress Pengisian: {filledFields} dari {KNOWN_FIELDS.length} field terisi
						</Text>
						<Badge 
							count={`${progressPercent}%`} 
							style={{ backgroundColor: progressPercent >= 80 ? '#52c41a' : progressPercent >= 50 ? '#faad14' : '#ff4d4f' }}
						/>
					</div>
					<div className="w-full bg-gray-300 rounded-full h-2.5">
						<div 
							className="bg-red-600 h-2.5 rounded-full transition-all duration-500" 
							style={{ width: `${progressPercent}%` }}
						></div>
					</div>
					<Text className="text-xs text-gray-500 mt-2 block">
						{progressPercent < 30 ? "📝 Yuk mulai isi konten website Anda!" : 
						 progressPercent < 70 ? "👍 Bagus! Lanjutkan mengisi konten yang tersisa." : 
						 progressPercent < 100 ? "🎉 Hampir selesai! Tinggal sedikit lagi." : 
						 "✨ Luar biasa! Semua konten sudah terisi."}
					</Text>
				</div>
			</Card>

			{/* Quick Guide */}
			<Alert
				showIcon
				type="info"
				icon={<InfoCircleOutlined />}
				message="Cara Menggunakan (3 Langkah Mudah)"
				description={
					<ol className="list-decimal ml-4 mt-2 space-y-1">
						<li><strong>Pilih Tab</strong> - Klik bagian yang ingin diubah (Hero, Statistik, dll)</li>
						<li><strong>Isi Data</strong> - Ketik teks atau angka di kolom yang tersedia</li>
						<li><strong>Simpan</strong> - Klik tombol "Simpan Bagian Ini" dan selesai!</li>
					</ol>
				}
				className="shadow-sm"
			/>

			{/* Main Content */}
			{isLoading ? (
				<div className="flex min-h-[400px] items-center justify-center">
					<Space direction="vertical" align="center">
						<Spin size="large" />
						<span className="text-sm text-neutral-500">Memuat data konten...</span>
					</Space>
				</div>
			) : (
				<Card className="shadow-sm">
					<Form layout="vertical" form={form} autoComplete="off">
						<Tabs
							activeKey={activeGroup}
							onChange={(key) => setActiveGroup(key as GroupKey)}
							type="card"
							items={GROUP_ORDER.map((group) => ({
								key: group,
								label: (
									<span className="flex items-center gap-2">
										<span>{GROUP_LABELS[group].icon}</span>
										<span className="hidden sm:inline">{GROUP_LABELS[group].title}</span>
										{savedGroups.has(group) && <CheckCircleOutlined className="text-green-500" />}
										{isFetching && activeGroup === group && <Tag color="gold">Sync</Tag>}
									</span>
								),
								children: (
									<div className="space-y-6 pt-4">
										{/* Group Header */}
										<div className="bg-gray-50 rounded-lg p-4 mb-4">
											<Title level={5} className="!mb-1">{GROUP_LABELS[group].title}</Title>
											<Text className="text-gray-500 text-sm">{GROUP_LABELS[group].desc}</Text>
										</div>

										{/* Action Buttons */}
										<div className="flex flex-wrap gap-2 mb-4">
											<Button 
												icon={<ReloadOutlined />} 
												onClick={resetForm}
												disabled={saving}
											>
												Batalkan Perubahan
											</Button>
											<Button 
												type="primary"
												icon={<SaveOutlined />} 
												onClick={() => void saveActiveGroup()} 
												loading={saving}
												size="large"
												className="bg-red-600 hover:bg-red-700"
											>
												💾 Simpan Bagian Ini
											</Button>
										</div>

										{/* Fields Grid */}
										<Row gutter={[16, 16]}>
											{KNOWN_FIELDS.filter((field) => field.group === group).map((field) => {
												const currentValue = form.getFieldValue(field.key);
												const hasValue = field.type === "boolean" 
													? currentValue === true 
													: currentValue && String(currentValue).trim() !== "";
												
												return (
													<Col xs={24} md={12} key={field.key}>
														<Card 
															size="small" 
															className={`h-full border-2 transition-all ${hasValue ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}
														>
															<div className="flex items-start justify-between gap-2 mb-3">
																<div className="flex-1">
																	<div className="flex items-center gap-2">
																		<Text className="font-semibold text-gray-900">
																			{field.title}
																			{field.required && <span className="text-red-500 ml-1">*</span>}
																		</Text>
																		{hasValue && <CheckCircleOutlined className="text-green-500 text-sm" />}
																	</div>
																	{field.help && (
																		<Text className="text-xs text-gray-500 block mt-1">
																			{field.help}
																		</Text>
																	)}
																</div>
																<Popconfirm
																	title="Kosongkan data ini?"
																	description="Nilai akan dihapus. Bisa diisi lagi kapan saja."
																	okText="Kosongkan"
																	cancelText="Batal"
																	onConfirm={() => void clearOneField(field)}
																>
																	<Button 
																		size="small" 
																		danger 
																		type="text" 
																		icon={<DeleteOutlined />}
																	>
																		Hapus
																	</Button>
																</Popconfirm>
															</div>

															<Form.Item
																name={field.key}
																label={field.type === "boolean" ? "Status:" : "Isi:"}
																valuePropName={field.type === "boolean" ? "checked" : "value"}
																rules={validateRules(field)}
																className="!mb-0"
															>
																{renderInput(field)}
															</Form.Item>

															{/* Preview */}
															{renderPreview(field, currentValue)}
														</Card>
													</Col>
												);
											})}
										</Row>

										{/* Custom Content Section */}
										<Divider className="!mt-8" />
										
										<div className="bg-gray-50 rounded-xl p-6">
											<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
												<div>
													<Title level={5} className="!mb-1">➕ Konten Tambahan</Title>
													<Text className="text-gray-500 text-sm">
														Tambahkan informasi kustom sesuai kebutuhan Anda.
													</Text>
												</div>
												<Button 
													type="primary" 
													icon={<PlusOutlined />} 
													onClick={openCreateCustom}
													size="large"
												>
													Tambah Konten Baru
												</Button>
											</div>

											{customRowsByGroup[group].length === 0 ? (
												<Empty 
													image={Empty.PRESENTED_IMAGE_SIMPLE} 
													description="Belum ada konten tambahan di bagian ini." 
												/>
											) : (
												<div className="space-y-3">
													{customRowsByGroup[group].map((row) => (
														<div
															key={row.id}
															className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
														>
															<div className="min-w-0 flex-1">
																<Text className="font-semibold text-gray-900 block truncate">
																	{row.label || "Konten Tanpa Nama"}
																</Text>
																<Text className="text-xs text-gray-500 block truncate">
																	{row.type === "boolean" 
																		? (parseBoolean(row.value) ? "✅ Ya" : "❌ Tidak") 
																		: row.value
																	}
																</Text>
															</div>

															<Space>
																<Button 
																	icon={<EditOutlined />} 
																	onClick={() => openEditCustom(row)}
																>
																	Edit
																</Button>
																<Popconfirm
																	title="Hapus konten ini?"
																	description="Data akan dihapus permanen."
																	okText="Hapus"
																	cancelText="Batal"
																	onConfirm={() => void deleteCustom(row)}
																>
																	<Button danger icon={<DeleteOutlined />}>
																		Hapus
																	</Button>
																</Popconfirm>
															</Space>
														</div>
													))}
												</div>
											)}
										</div>
									</div>
								),
							}))}
						/>
					</Form>
				</Card>
			)}

			{/* Save All Button Fixed at Bottom */}
			<div className="sticky bottom-4 z-10">
				<Card className="shadow-lg border-2 border-red-100">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
						<div>
							<Text className="font-medium">💡 Tips: Simpan setiap bagian setelah selesai mengedit.</Text>
							<Text className="text-xs text-gray-500 block">Atau klik tombol di kanan untuk menyimpan SEMUA sekaligus.</Text>
						</div>
						<Button 
							type="primary" 
							size="large"
							icon={<SaveOutlined />} 
							onClick={() => void saveAll()} 
							loading={saving}
							className="bg-red-600 hover:bg-red-700 min-w-[200px]"
						>
							💾 Simpan SEMUA Konten
						</Button>
					</div>
				</Card>
			</div>

			{/* Custom Content Modal */}
			<Modal
				title={
					<div className="flex items-center gap-2">
						{editingCustom ? <EditOutlined /> : <PlusOutlined />}
						<span>{editingCustom ? "Edit Konten Tambahan" : "Tambah Konten Baru"}</span>
					</div>
				}
				open={customModalOpen}
				onCancel={() => {
					setCustomModalOpen(false);
					setEditingCustom(null);
					customForm.resetFields();
				}}
				onOk={() => void saveCustom()}
				okText={editingCustom ? "Simpan Perubahan" : "Simpan"}
				cancelText="Batal"
				destroyOnHidden
				width={600}
			>
				<Form<CustomFormValue> layout="vertical" form={customForm} autoComplete="off" className="pt-4">
					<Form.Item
						name="namaKonten"
						label="Nama Konten"
						rules={[{ required: true, message: "Nama konten wajib diisi" }]}
						extra="Berikan nama yang mudah dipahami, contoh: 'Banner Promo Ramadhan'"
					>
						<Input placeholder="Contoh: Banner Promo Ramadhan" />
					</Form.Item>

					<Row gutter={16}>
						<Col span={12}>
							<Form.Item
								name="letakKonten"
								label="Letak Konten"
								rules={[{ required: true, message: "Pilih letak konten" }]}
								extra="Pilih bagian halaman"
							>
								<Select options={GROUP_ORDER.map((group) => ({ label: GROUP_LABELS[group].title, value: group }))} />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								name="jenisIsi"
								label="Jenis Isi"
								rules={[{ required: true, message: "Pilih jenis isi" }]}
								extra="Pilih tipe data"
							>
								<Select options={customTypeOptions} />
							</Form.Item>
						</Col>
					</Row>

					{customType === "boolean" ? (
						<Form.Item 
							name="isiKonten" 
							label="Isi Konten" 
							valuePropName="checked" 
							initialValue={false}
						>
							<Switch checkedChildren="Ya" unCheckedChildren="Tidak" />
						</Form.Item>
					) : (
						<Form.Item
							name="isiKonten"
							label="Isi Konten"
							rules={[
								{ required: true, message: "Isi konten wajib diisi" },
								...(customType === "number"
									? [
											{
												validator: async (_: unknown, value: unknown) => {
													const raw = String(value ?? "").trim();
													if (!/^-?\d+(\.\d+)?$/.test(raw)) throw new Error("Isi harus angka");
												},
											},
										]
									: []),
								...(customType === "url"
									? [
											{
												validator: async (_: unknown, value: unknown) => {
													const raw = String(value ?? "").trim();
													try {
														new URL(raw);
													} catch {
														throw new Error("Format link tidak valid");
													}
												},
											},
										]
									: []),
							]}
							extra={customType === "url" ? "Pastikan diawali dengan https://" : undefined}
						>
							{customType === "richtext" || customType === "json" ? (
								<Input.TextArea rows={4} placeholder="Isi konten di sini" />
							) : (
								<Input placeholder="Isi konten di sini" />
							)}
						</Form.Item>
					)}

					<Form.Item 
						name="catatan" 
						label="Catatan (Opsional)"
						extra="Catatan internal untuk admin lain"
					>
						<Input.TextArea rows={2} placeholder="Contoh: Banner ini untuk promo bulan Ramadhan" />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
