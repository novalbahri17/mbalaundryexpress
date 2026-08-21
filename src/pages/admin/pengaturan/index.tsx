import {
	Alert,
	Button,
	Card,
	Col,
	Form,
	Input,
	Row,
	Switch,
	DatePicker,
	Upload,
	message,
	Select,
	Popconfirm,
	Tag,
	Modal,
	Divider,
	Typography,
	Space,
} from "antd";
import { useThemeStore } from "@/store/themeStore";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
	UploadOutlined,
	DeleteOutlined,
	LinkOutlined,
	LockOutlined,
	LogoutOutlined,
	ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPageContentValueMap, saveBulkPageContents } from "@/api/pageContents.api";
import { getSiteSettings, saveBulkSettings } from "@/api/settings.api";
import { PAGE_CONTENT_QUERY_KEY } from "@/hooks/usePageContent";
import { SITE_SETTINGS_QUERY_KEY } from "@/hooks/useSiteSettings";
import { MetronicPage } from "@/components/admin/MetronicPage";
import { normalizeHexColor, validateHexColor } from "@/utils/validation";
import { AnnouncementCard, type AnnouncementType } from "@/components/public/home/AnnouncementModal";
import { pb } from "@/api/pocketbase";
import { useNavigate } from "react-router-dom";
import { Tabs, TabPanel } from "@/design-system/components/Tabs";

const { Text } = Typography;
const { confirm } = Modal;

const DEFAULT_LIGHT_BG = "#FAFAFA";
const DEFAULT_DARK_BG = "#0A0A0F";

type LandingAppearanceForm = {
	landing_bg_color_light: string;
	landing_bg_color_dark: string;
};

type AnnouncementFormValues = {
	announcement_active: boolean;
	announcement_title?: string;
	announcement_text: string;
	announcement_image_file?: {
		fileList: Array<{
			originFileObj?: File;
			thumbUrl?: string;
		}>;
	};
	announcement_image_url?: string;
	announcement_dates?: [dayjs.Dayjs, dayjs.Dayjs] | null;
	announcement_type: AnnouncementType;
	announcement_recurring: string;
	announcement_frequency: string;
	announcement_cta_label?: string;
	announcement_cta_url?: string;
};

type ModulesFormValues = {
	module_cabang: boolean;
	module_promo: boolean;
	module_galeri: boolean;
	module_harga: boolean;
	module_carapakai: boolean;
	module_blog: boolean;
	module_loker: boolean;
	module_kemitraan: boolean;
	module_kontak: boolean;
};

type SecurityFormValues = {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
};

const hexRule = {
	validator: async (_: unknown, value: string) => {
		const raw = value?.trim() ?? "";
		if (!raw) {
			throw new Error("Warna wajib diisi");
		}
		const withHash = raw.startsWith("#") ? raw : `#${raw}`;
		if (!validateHexColor(withHash)) {
			throw new Error("Format HEX tidak valid. Contoh: #FFFBF1");
		}
	},
};

const TYPE_TITLES: Record<AnnouncementType, string> = {
	info: "Informasi",
	promo: "Promo Spesial!",
	libur: "Pengumuman Libur",
	maintenance: "Perbaikan Sistem",
};

export default function PengaturanAdminPage() {
	const { mode } = useThemeStore();
	const navigate = useNavigate();
	const [appearanceForm] = Form.useForm<LandingAppearanceForm>();
	const [announcementForm] = Form.useForm<AnnouncementFormValues>();
	const [modulesForm] = Form.useForm<ModulesFormValues>();
	const [securityForm] = Form.useForm<SecurityFormValues>();
	const queryClient = useQueryClient();
	const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
	const [isFormsReady, setIsFormsReady] = useState(false);
	const [securityModalOpen, setSecurityModalOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("umum");

	const isDark = mode === "dark";
	const [adminEmail, setAdminEmail] = useState("");
	const [whatsappNumber, setWhatsappNumber] = useState("");
	const [newLoginEmail, setNewLoginEmail] = useState("");
	const [emailChangePassword, setEmailChangePassword] = useState("");

	const { data: rows = [] } = useQuery({
		queryKey: ["admin-site-settings"],
		queryFn: getSiteSettings,
	});
	const { data: pageContentMap = {} } = useQuery({
		queryKey: ["admin-page-content-map"],
		queryFn: getPageContentValueMap,
	});

	const settingsMap = useMemo(
		() =>
			rows.reduce<Record<string, string>>((acc, item) => {
				acc[item.key] = item.value;
				return acc;
			}, {}),
		[rows],
	);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsFormsReady(true);
		}, 100);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (!isFormsReady) return;

		appearanceForm.setFieldsValue({
			landing_bg_color_light: normalizeHexColor(
				settingsMap.landing_bg_color_light ?? pageContentMap.landing_bg_color_light,
				DEFAULT_LIGHT_BG,
			),
			landing_bg_color_dark: normalizeHexColor(
				settingsMap.landing_bg_color_dark ?? pageContentMap.landing_bg_color_dark,
				DEFAULT_DARK_BG,
			),
		});

		const hasImage = Boolean(pageContentMap.announcement_image?.trim());
		const isUrl =
			hasImage &&
			(pageContentMap.announcement_image?.startsWith("http://") ||
				pageContentMap.announcement_image?.startsWith("https://") ||
				pageContentMap.announcement_image?.startsWith("/"));

		if (hasImage && isUrl) {
			setImageMode("url");
		}

		announcementForm.setFieldsValue({
			announcement_active: pageContentMap.announcement_active === "true" || pageContentMap.announcement_active === "1",
			announcement_title: pageContentMap.announcement_title?.trim() || "",
			announcement_text: pageContentMap.announcement_text ?? "",
			announcement_type: (pageContentMap.announcement_type as AnnouncementType) || "info",
			announcement_recurring: pageContentMap.announcement_recurring || "none",
			announcement_frequency: pageContentMap.announcement_frequency || "session",
			announcement_image_url: isUrl ? pageContentMap.announcement_image : "",
			announcement_cta_label: pageContentMap.announcement_cta_label?.trim() || "",
			announcement_cta_url: pageContentMap.announcement_cta_url?.trim() || "",
			announcement_dates:
				pageContentMap.announcement_start && pageContentMap.announcement_end
					? [dayjs(pageContentMap.announcement_start), dayjs(pageContentMap.announcement_end)]
					: undefined,
		});

		modulesForm.setFieldsValue({
			module_cabang: pageContentMap.module_cabang !== "false",
			module_promo: pageContentMap.module_promo !== "false",
			module_galeri: pageContentMap.module_galeri !== "false",
			module_harga: pageContentMap.module_harga !== "false",
			module_carapakai: pageContentMap.module_carapakai !== "false",
			module_blog: pageContentMap.module_blog !== "false",
			module_loker: pageContentMap.module_loker !== "false",
			module_kemitraan: pageContentMap.module_kemitraan !== "false",
			module_kontak: pageContentMap.module_kontak !== "false",
		});

		setAdminEmail(settingsMap.admin_email || pb.authStore.model?.email || "");
		setWhatsappNumber(settingsMap.whatsapp_cs || pageContentMap.whatsapp_cs || settingsMap.whatsapp_number || pageContentMap.whatsapp_number || "");
	}, [isFormsReady, appearanceForm, announcementForm, modulesForm, pageContentMap, settingsMap]);

	const lightPreview = normalizeHexColor(Form.useWatch("landing_bg_color_light", appearanceForm), DEFAULT_LIGHT_BG);
	const darkPreview = normalizeHexColor(Form.useWatch("landing_bg_color_dark", appearanceForm), DEFAULT_DARK_BG);

	const liveTitle = Form.useWatch("announcement_title", announcementForm);
	const liveText = Form.useWatch("announcement_text", announcementForm);
	const liveType: AnnouncementType = Form.useWatch("announcement_type", announcementForm) || "info";
	const liveCtaLabel = Form.useWatch("announcement_cta_label", announcementForm);
	const liveCtaUrl = Form.useWatch("announcement_cta_url", announcementForm);
	const liveImageFile = Form.useWatch("announcement_image_file", announcementForm) as
		| AnnouncementFormValues["announcement_image_file"]
		| undefined;
	const liveImageUrl = Form.useWatch("announcement_image_url", announcementForm);

	const previewImage =
		liveImageFile?.fileList?.[0]?.thumbUrl ||
		(imageMode === "url" ? liveImageUrl : undefined) ||
		(imageMode === "upload" ? undefined : pageContentMap.announcement_image) ||
		undefined;

	const applyTemplate = (type: AnnouncementType) => {
		const templates: Record<AnnouncementType, { title: string; text: string }> = {
			promo: {
				title: "Promo Spesial Hari Ini!",
				text: "Diskon Cuci 5Kg Gratis 1Kg. Yuk buruan mampir sebelum kehabisan mesin!",
			},
			libur: {
				title: "Pengumuman Libur",
				text: "Mohon maaf, kami tutup sementara dalam rangka libur nasional. Kami akan buka kembali segera.",
			},
			maintenance: {
				title: "Perbaikan Sistem",
				text: "Mohon maaf, sistem operasional kami sedang dalam perbaikan rutin. Silakan cek berkala.",
			},
			info: {
				title: "Informasi",
				text: "Halo pelanggan setia MBA Laundry! Jangan lupa ambil cucian Anda tepat waktu ya.",
			},
		};

		const tpl = templates[type];
		announcementForm.setFieldsValue({
			announcement_title: tpl.title,
			announcement_text: tpl.text,
			announcement_type: type,
			announcement_active: true,
		});
	};

	const insertTag = (tagStart: string, tagEnd: string) => {
		const textarea = document.getElementById("announcement_text") as HTMLTextAreaElement | null;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const text = announcementForm.getFieldValue("announcement_text") || "";

		const before = text.substring(0, start);
		const selected = text.substring(start, end);
		const after = text.substring(end);

		const newText = `${before}${tagStart}${selected}${tagEnd}${after}`;
		announcementForm.setFieldValue("announcement_text", newText);

		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(start + tagStart.length, start + tagStart.length + selected.length);
		}, 0);
	};

	const handleRemoveImage = async () => {
		announcementForm.setFieldsValue({
			announcement_image_file: undefined,
			announcement_image_url: "",
		});

		try {
			const existing = await pb.collection("branding_files").getFullList({
				filter: 'type = "announcement"',
			});
			for (const record of existing) {
				await pb.collection("branding_files").delete(record.id);
			}
		} catch (_e) {
			// Ignore error
		}

		await saveBulkPageContents([
			{
				key: "announcement_image",
				value: "",
				type: "text",
				label: "Banner Pengumuman",
				description: "URL banner",
				group: "announcement",
			},
		]);
		await queryClient.invalidateQueries({
			queryKey: ["admin-page-content-map"],
		});
		await queryClient.invalidateQueries({ queryKey: [PAGE_CONTENT_QUERY_KEY] });
		message.success("Gambar banner berhasil dihapus");
	};

	const uploadAnnouncementImage = async (file: File): Promise<string> => {
		try {
			const existing = await pb.collection("branding_files").getFullList({
				filter: 'type = "announcement"',
			});
			for (const record of existing) {
				await pb.collection("branding_files").delete(record.id);
			}
		} catch (_e) {
			// Ignore error
		}

		const record = await pb.collection("branding_files").create({
			type: "announcement",
			file: file,
		});

		return pb.files.getURL(record, record.file);
	};

	const saveAnnouncement = async () => {
		const values = await announcementForm.validateFields();

		let imageUrl = pageContentMap.announcement_image ?? "";

		if (imageMode === "url") {
			imageUrl = values.announcement_image_url?.trim() ?? "";
		} else {
			const uploadedFile = values.announcement_image_file?.fileList?.[0]?.originFileObj;
			if (uploadedFile) {
				imageUrl = await uploadAnnouncementImage(uploadedFile);
			}
		}

		await saveBulkPageContents([
			{
				key: "announcement_active",
				value: values.announcement_active ? "true" : "false",
				type: "boolean",
				label: "Status Pengumuman",
				description: "Status pengumuman (aktif/tidak)",
				group: "announcement",
			},
			{
				key: "announcement_title",
				value: values.announcement_title?.trim() ?? "",
				type: "text",
				label: "Judul Pengumuman",
				description: "Judul popup pengumuman (opsional, default mengikuti tipe)",
				group: "announcement",
			},
			{
				key: "announcement_text",
				value: values.announcement_text ?? "",
				type: "text",
				label: "Teks Pengumuman",
				description: "Isi teks pengumuman",
				group: "announcement",
			},
			{
				key: "announcement_start",
				value: values.announcement_dates?.[0]?.toISOString() ?? "",
				type: "text",
				label: "Mulai Tayang",
				description: "Waktu mulai",
				group: "announcement",
			},
			{
				key: "announcement_end",
				value: values.announcement_dates?.[1]?.toISOString() ?? "",
				type: "text",
				label: "Selesai Tayang",
				description: "Waktu selesai",
				group: "announcement",
			},
			{
				key: "announcement_image",
				value: imageUrl,
				type: "text",
				label: "Banner Pengumuman",
				description: "URL atau Base64 banner header modal",
				group: "announcement",
			},
			{
				key: "announcement_type",
				value: values.announcement_type ?? "info",
				type: "text",
				label: "Tipe Pengumuman",
				description: "Warna dan tema modal",
				group: "announcement",
			},
			{
				key: "announcement_recurring",
				value: values.announcement_recurring ?? "none",
				type: "text",
				label: "Jadwal Berulang",
				description: "Penayangan rutin mingguan",
				group: "announcement",
			},
			{
				key: "announcement_frequency",
				value: values.announcement_frequency ?? "session",
				type: "text",
				label: "Frekuensi Tampil",
				description: "Seberapa sering modal muncul",
				group: "announcement",
			},
			{
				key: "announcement_cta_label",
				value: values.announcement_cta_label?.trim() ?? "",
				type: "text",
				label: "Label Tombol Aksi",
				description: "Teks tombol CTA opsional (kosongkan jika tidak perlu)",
				group: "announcement",
			},
			{
				key: "announcement_cta_url",
				value: values.announcement_cta_url?.trim() ?? "",
				type: "text",
				label: "URL Tombol Aksi",
				description: "Link tujuan tombol CTA",
				group: "announcement",
			},
		]);

		message.success("Pengumuman berhasil disimpan!");

		if (imageMode === "upload" && values.announcement_image_file?.fileList?.[0]?.originFileObj) {
			announcementForm.setFieldValue("announcement_image_file", undefined);
		}

		await Promise.all([
			queryClient.invalidateQueries({ queryKey: ["admin-page-content-map"] }),
			queryClient.invalidateQueries({ queryKey: [PAGE_CONTENT_QUERY_KEY] }),
			queryClient.invalidateQueries({
				queryKey: [PAGE_CONTENT_QUERY_KEY, "map"],
			}),
		]);
	};

	const saveLandingAppearance = async (): Promise<void> => {
		const values = await appearanceForm.validateFields();
		const lightColor = normalizeHexColor(values.landing_bg_color_light, DEFAULT_LIGHT_BG);
		const darkColor = normalizeHexColor(values.landing_bg_color_dark, DEFAULT_DARK_BG);

		await Promise.all([
			saveBulkSettings([
				{
					key: "landing_bg_color_light",
					value: lightColor,
					description: "Warna background landing page saat light mode (HEX)",
				},
				{
					key: "landing_bg_color_dark",
					value: darkColor,
					description: "Warna background landing page saat dark mode (HEX)",
				},
			]),
			saveBulkPageContents([
				{
					key: "landing_bg_color_light",
					value: lightColor,
					type: "text",
					label: "Landing Background Light",
					description: "Warna background landing page light mode",
					group: "landing-style",
				},
				{
					key: "landing_bg_color_dark",
					value: darkColor,
					type: "text",
					label: "Landing Background Dark",
					description: "Warna background landing page dark mode",
					group: "landing-style",
				},
			]),
		]);

		message.success("Warna background landing berhasil disimpan");
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] }),
			queryClient.invalidateQueries({ queryKey: ["admin-page-content-map"] }),
			queryClient.invalidateQueries({ queryKey: [PAGE_CONTENT_QUERY_KEY] }),
			queryClient.invalidateQueries({
				queryKey: [PAGE_CONTENT_QUERY_KEY, "map"],
			}),
			queryClient.invalidateQueries({ queryKey: [SITE_SETTINGS_QUERY_KEY] }),
			queryClient.invalidateQueries({
				queryKey: [SITE_SETTINGS_QUERY_KEY, "map"],
			}),
		]);
	};

	const saveModules = async () => {
		const values = await modulesForm.validateFields();
		const keys = [
			"module_cabang",
			"module_promo",
			"module_galeri",
			"module_harga",
			"module_carapakai",
			"module_blog",
			"module_loker",
			"module_kemitraan",
			"module_kontak",
		];

		const payload = keys.map((key) => ({
			key,
			value: (values as Record<string, boolean>)[key] ? "true" : "false",
			type: "boolean" as const,
			label: `Modul ${key.replace("module_", "")}`,
			description: `Visibilitas modul ${key.replace("module_", "")}`,
			group: "modules",
		}));

		await saveBulkPageContents(payload);
		message.success("Visibilitas modul berhasil diperbarui");
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: ["admin-page-content-map"] }),
			queryClient.invalidateQueries({ queryKey: [PAGE_CONTENT_QUERY_KEY] }),
			queryClient.invalidateQueries({
				queryKey: [PAGE_CONTENT_QUERY_KEY, "map"],
			}),
		]);
	};

	const saveContactInfo = async () => {
		// Save email and WhatsApp to settings/pagecontents only
		// Note: Actual login email change is done in Keamanan tab with password verification
		await saveBulkSettings([
			{
				key: "admin_email",
				value: adminEmail,
				description: "Email admin untuk notifikasi",
			},
			{
				key: "whatsapp_cs",
				value: whatsappNumber,
				description: "Nomor WhatsApp landing page (format: 628xxxxx)",
			},
		]);

		await saveBulkPageContents([
			{
				key: "whatsapp_cs",
				value: whatsappNumber,
				type: "text",
				label: "Nomor WhatsApp",
				description: "Nomor WhatsApp untuk chat di landing page",
				group: "contact",
			},
		]);

		message.success("Informasi kontak berhasil disimpan");
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] }),
			queryClient.invalidateQueries({ queryKey: ["admin-page-content-map"] }),
			queryClient.invalidateQueries({ queryKey: [PAGE_CONTENT_QUERY_KEY] }),
			queryClient.invalidateQueries({ queryKey: [SITE_SETTINGS_QUERY_KEY] }),
		]);
	};

	const handleChangeEmail = async () => {
		if (!newLoginEmail || newLoginEmail === pb.authStore.model?.email) {
			message.error("Email baru tidak boleh kosong atau sama dengan email saat ini");
			return;
		}

		if (!emailChangePassword) {
			message.error("Password saat ini wajib diisi untuk konfirmasi");
			return;
		}

		try {
			const currentEmail = pb.authStore.model?.email || "";
			const userId = pb.authStore.model?.id || "";

			// Re-authenticate with current credentials to get fresh token
			await pb.collection("_superusers").authWithPassword(currentEmail, emailChangePassword);

			// PocketBase v0.23+ requires emailSelector for email updates
			await pb.collection("_superusers").update(userId, {
				email: newLoginEmail,
				emailSelector: currentEmail,
			});

			message.success("Email login berhasil diubah! Silakan login ulang dengan email baru.");
			setNewLoginEmail("");
			setEmailChangePassword("");
			setTimeout(() => {
				handleLogout();
			}, 2000);
		} catch (_error: unknown) {
			const err = _error as { message?: string; status?: number; data?: Record<string, unknown> };
			// Log full error for debugging
			console.error("Email update error details:", JSON.stringify(err, null, 2));
			const serverMessage = (err as { data?: { message?: string } })?.data?.message || err?.message;
			message.error(`Gagal mengubah email: ${serverMessage || "Pastikan email valid dan belum terdaftar."}`);
		}
	};

	const handleChangePassword = async () => {
		const values = await securityForm.validateFields();

		if (values.newPassword !== values.confirmPassword) {
			message.error("Password baru dan konfirmasi tidak cocok!");
			return;
		}

		try {
			const adminEmail = pb.authStore.model?.email;
			if (!adminEmail) {
				message.error("Tidak dapat mendapatkan email admin");
				return;
			}

			await pb.collection("_superusers").authWithPassword(adminEmail, values.currentPassword);

			await pb.collection("_superusers").update(pb.authStore.model?.id ?? "", {
				password: values.newPassword,
				passwordConfirm: values.newPassword,
			});

			message.success("Password berhasil diubah!");
			securityForm.resetFields();
			setSecurityModalOpen(false);
		} catch (_error) {
			message.error("Password saat ini salah atau terjadi kesalahan!");
		}
	};

	const handleLogout = () => {
		confirm({
			title: "Konfirmasi Logout",
			icon: <ExclamationCircleOutlined />,
			content: "Apakah Anda yakin ingin keluar dari sistem?",
			okText: "Ya, Logout",
			okType: "danger",
			cancelText: "Batal",
			onOk() {
				pb.authStore.clear();
				message.success("Berhasil logout");
				navigate("/admin/login");
			},
		});
	};

	const hasExistingImage = Boolean(pageContentMap.announcement_image?.trim());

	const tabs = [
		{ id: "umum", label: "Umum" },
		{ id: "landing", label: "Landing Page" },
		{ id: "popup", label: "Popup" },
		{ id: "kontak", label: "Kontak" },
		{ id: "keamanan", label: "Keamanan" },
	];

	return (
		<MetronicPage
			title="Pengaturan"
			subtitle="Kelola konfigurasi sistem dan tampilan landing page"
		>
			{/* Tab Navigation */}
			<div className="mb-6">
				<Tabs
					tabs={tabs}
					activeTab={activeTab}
					onChange={setActiveTab}
					variant="underline"
					size="md"
				/>
			</div>

			{/* ====== TAB: UMUM ====== */}
			<TabPanel id="umum" activeTab={activeTab}>
				<Card
					title="Visibilitas Halaman"
					className="card"
					style={{ borderColor: "var(--border)" }}
				>
					<h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
						Manajemen Modul &amp; Halaman Publik
					</h3>
					<p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
						Matikan switch jika tidak ingin menampilkan halaman tersebut di Landing Page Publik.
					</p>

					<Form form={modulesForm} layout="horizontal">
						<Row gutter={[24, 16]}>
							{[
								{ name: "module_cabang", on: "Cabang On", off: "Cabang Off" },
								{ name: "module_promo", on: "Promo On", off: "Promo Off" },
								{ name: "module_harga", on: "Harga On", off: "Harga Off" },
								{ name: "module_carapakai", on: "Cara Pakai On", off: "Cara Pakai Off" },
								{ name: "module_galeri", on: "Galeri On", off: "Galeri Off" },
								{ name: "module_blog", on: "Blog On", off: "Blog Off" },
								{ name: "module_loker", on: "Locker On", off: "Locker Off" },
								{ name: "module_kemitraan", on: "Kemitraan On", off: "Kemitraan Off" },
								{ name: "module_kontak", on: "Kontak On", off: "Kontak Off" },
							].map((mod) => (
								<Col key={mod.name} xs={24} sm={12} md={8} xl={6}>
									<Form.Item name={mod.name} valuePropName="checked" className="mb-0">
										<Switch checkedChildren={mod.on} unCheckedChildren={mod.off} />
									</Form.Item>
								</Col>
							))}
						</Row>

						<div className="mt-6 pt-4 flex justify-end" style={{ borderTop: "1px solid var(--border)" }}>
							<Button type="primary" onClick={() => void saveModules()}>
								Simpan Pengaturan
							</Button>
						</div>
					</Form>
				</Card>
			</TabPanel>

			{/* ====== TAB: LANDING PAGE ====== */}
			<TabPanel id="landing" activeTab={activeTab}>
				<Card
					title="Tampilan Landing Page"
					className="card"
					style={{ borderColor: "var(--border)" }}
				>
					<h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
						Warna Background
					</h3>
					<p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
						Atur warna background landing page untuk mode terang dan gelap.
					</p>

					<Form form={appearanceForm} layout="vertical" autoComplete="off">
						<Row gutter={24}>
							<Col xs={24} md={12}>
								<Form.Item
									name="landing_bg_color_light"
									label="Background Light Mode"
									rules={[hexRule]}
									extra="Format HEX, contoh: #FFFBF1"
								>
									<Input placeholder="#FAFAFA" />
								</Form.Item>

								<div className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
									<p className="mb-2 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Preview Light</p>
									<div className="h-16 rounded-lg" style={{ backgroundColor: lightPreview }} />
									<p className="mt-2 text-xs font-mono" style={{ color: "var(--text-muted)" }}>{lightPreview}</p>
								</div>
							</Col>
							<Col xs={24} md={12}>
								<Form.Item
									name="landing_bg_color_dark"
									label="Background Dark Mode"
									rules={[hexRule]}
									extra="Format HEX, contoh: #0A0A0F"
								>
									<Input placeholder="#0A0A0F" />
								</Form.Item>

								<div className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
									<p className="mb-2 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Preview Dark</p>
									<div className="h-16 rounded-lg" style={{ backgroundColor: darkPreview }} />
									<p className="mt-2 text-xs font-mono" style={{ color: "var(--text-muted)" }}>{darkPreview}</p>
								</div>
							</Col>
						</Row>

						<div className="mt-6 pt-4 flex justify-end" style={{ borderTop: "1px solid var(--border)" }}>
							<Button type="primary" onClick={() => void saveLandingAppearance()}>
								Simpan Pengaturan
							</Button>
						</div>
					</Form>
				</Card>
			</TabPanel>

			{/* ====== TAB: POPUP ====== */}
			<TabPanel id="popup" activeTab={activeTab}>
				<Row gutter={24}>
					{/* Left: Form */}
					<Col xs={24} lg={14}>
						{/* PRESET BLOCK */}
						<Card className="card mb-4" style={{ borderColor: "var(--border)" }}>
							<h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
								Magic Templates
							</h3>
							<p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
								 mulai cepat dengan template siap pakai.
							</p>
							<div className="flex flex-wrap gap-2">
								{(["promo", "libur", "maintenance", "info"] as AnnouncementType[]).map((t) => (
									<Button key={t} onClick={() => applyTemplate(t)}>
										{t === "promo" && "Mode Promo"}
										{t === "libur" && "Mode Libur"}
										{t === "maintenance" && "Mode Maintenance"}
										{t === "info" && "Mode Info"}
									</Button>
								))}
							</div>
						</Card>

						{/* KONTEN BLOCK */}
						<Card className="card mb-4" style={{ borderColor: "var(--border)" }}>
							<h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
								Konten Pengumuman
							</h3>
							<p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
								Judul, teks, dan tema popup yang akan ditampilkan kepada pengunjung.
							</p>

							<Form form={announcementForm} layout="vertical">
								<Row gutter={16}>
									<Col xs={24} sm={12}>
										<Form.Item name="announcement_active" label="Status Penayangan" valuePropName="checked">
											<Switch checkedChildren="Aktif" unCheckedChildren="Mati" />
										</Form.Item>
									</Col>
									<Col xs={24} sm={12}>
										<Form.Item name="announcement_type" label="Tema Tampilan">
											<Select
												options={[
													{ label: "Informasi (Biru)", value: "info" },
													{ label: "Promo (Oranye)", value: "promo" },
													{ label: "Libur (Merah)", value: "libur" },
													{ label: "Maintenance (Abu)", value: "maintenance" },
												]}
											/>
										</Form.Item>
									</Col>
								</Row>

								<Form.Item
									name="announcement_title"
									label="Judul Pengumuman"
									extra="Kosongkan untuk menggunakan judul default sesuai tema"
								>
									<Input placeholder={TYPE_TITLES[liveType]} />
								</Form.Item>

								<Form.Item label="Isi Pengumuman" className="mb-2">
									<div className="mb-2 flex flex-wrap gap-2">
										<span className="text-xs" style={{ color: "var(--text-muted)" }}>Format:</span>
										<Button size="small" onClick={() => insertTag("<b>", "</b>")}>Bold</Button>
										<Button size="small" onClick={() => insertTag("<i>", "</i>")}>Italic</Button>
										<Button size="small" onClick={() => insertTag("<u>", "</u>")}>Underline</Button>
										<Button size="small" onClick={() => insertTag('<a href="#">', "</a>")}>Link</Button>
										<Button size="small" onClick={() => insertTag("<br/>", "")}>New Line</Button>
									</div>
									<Form.Item name="announcement_text" noStyle>
										<Input.TextArea
											id="announcement_text"
											rows={5}
											placeholder="Tulis pengumuman di sini... HTML diperbolehkan."
										/>
									</Form.Item>
								</Form.Item>
							</Form>
						</Card>

						{/* JADWAL BLOCK */}
						<Card className="card mb-4" style={{ borderColor: "var(--border)" }}>
							<h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
								Jadwal Tayang
							</h3>
							<p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
								Atur kapan popup mulai dan selesai ditampilkan.
							</p>

							<Form form={announcementForm} layout="vertical">
								<Row gutter={16}>
									<Col xs={24} sm={12}>
										<Form.Item name="announcement_dates" label="Periode Tayang">
											<DatePicker.RangePicker
												showTime
												format="DD MMM YYYY HH:mm"
												className="w-full"
												placeholder={["Mulai", "Selesai"]}
											/>
										</Form.Item>
									</Col>
									<Col xs={24} sm={12}>
										<Form.Item name="announcement_recurring" label="Pengulangan">
											<Select
												options={[
													{ label: "Sekali (tidak berulang)", value: "none" },
													{ label: "Setiap Senin", value: "monday" },
													{ label: "Setiap Akhir Pekan", value: "weekend" },
													{ label: "Setiap Hari", value: "daily" },
												]}
											/>
										</Form.Item>
									</Col>
								</Row>
							</Form>
						</Card>

						{/* MEDIA & CTA BLOCK */}
						<Card className="card mb-4" style={{ borderColor: "var(--border)" }}>
							<h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
								Media &amp; CTA
							</h3>
							<p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
								Gambar header dan tombol aksi opsional untuk popup.
							</p>

							<Form form={announcementForm} layout="vertical">
								<Form.Item label="Banner/Gambar Header">
									<div className="mb-2 flex gap-2">
										<Button
											size="small"
											type={imageMode === "upload" ? "primary" : "default"}
											icon={<UploadOutlined />}
											onClick={() => setImageMode("upload")}
										>
											Upload File
										</Button>
										<Button
											size="small"
											type={imageMode === "url" ? "primary" : "default"}
											icon={<LinkOutlined />}
											onClick={() => setImageMode("url")}
										>
											URL Gambar
										</Button>
									</div>

									<div style={{ display: imageMode === "upload" ? "block" : "none" }}>
										<Form.Item name="announcement_image_file" noStyle>
											<Upload maxCount={1} beforeUpload={() => false} listType="picture" accept="image/*">
												<Button icon={<UploadOutlined />}>Pilih Gambar</Button>
											</Upload>
										</Form.Item>
									</div>

									<div style={{ display: imageMode === "url" ? "block" : "none" }}>
										<Form.Item name="announcement_image_url" noStyle>
											<Input
												placeholder="https://example.com/gambar.jpg"
												prefix={<LinkOutlined style={{ color: "var(--text-muted)" }} />}
											/>
										</Form.Item>
									</div>

									{hasExistingImage && (
										<div className="mt-2 flex items-center justify-between rounded-lg px-3 py-1.5" style={{ backgroundColor: "var(--success-bg)" }}>
											<span className="text-xs" style={{ color: "var(--success)" }}>
												Banner aktif tersimpan
											</span>
											<Popconfirm
												title="Hapus gambar banner?"
												description="Tampilan header modal akan kembali ke gradien warna."
												onConfirm={() => void handleRemoveImage()}
												okText="Hapus"
												cancelText="Batal"
											>
												<Button type="text" danger size="small" icon={<DeleteOutlined />} className="text-xs">
													Hapus
												</Button>
											</Popconfirm>
										</div>
									)}
								</Form.Item>

								<div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-surface)" }}>
									<div className="mb-3 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
										Tombol Aksi (CTA)
										<Tag color="default" className="ml-1 font-normal">Opsional</Tag>
									</div>
									<Row gutter={12}>
										<Col xs={24} sm={12}>
											<Form.Item name="announcement_cta_label" label="Label Tombol" className="mb-3">
												<Input placeholder="Contoh: Lihat Promo" />
											</Form.Item>
										</Col>
										<Col xs={24} sm={12}>
											<Form.Item name="announcement_cta_url" label="URL Tujuan" className="mb-3">
												<Input placeholder="https://..." prefix={<LinkOutlined style={{ color: "var(--text-muted)" }} />} />
											</Form.Item>
										</Col>
									</Row>
								</div>

								<div className="mt-6 pt-4 flex justify-end" style={{ borderTop: "1px solid var(--border)" }}>
									<Button type="primary" onClick={() => void saveAnnouncement()}>
										Simpan Pengaturan
									</Button>
								</div>
							</Form>
						</Card>
					</Col>

					{/* Right: Sticky Preview */}
					<Col xs={24} lg={10}>
						<div
							className="rounded-xl border p-4 sticky top-4"
							style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-surface)" }}
						>
							<h4 className="mb-1 font-semibold" style={{ color: "var(--text-secondary)" }}>Smart Live Preview</h4>
							<p className="mb-4 text-xs" style={{ color: "var(--text-muted)" }}>
								Preview memantulkan tema, judul, dan tombol aksi secara langsung.
							</p>
							<div className="flex flex-1 items-start justify-center pointer-events-none relative">
								<div className="w-[125%] max-w-sm origin-top scale-[0.78]">
									<AnnouncementCard
										title={liveTitle || undefined}
										text={liveText || "Ketik sesuatu untuk melihat pratinjau langsung di sini..."}
										type={liveType}
										image={previewImage}
										ctaLabel={liveCtaLabel || undefined}
										ctaUrl={liveCtaUrl || "#"}
									/>
								</div>
							</div>

							<div className="mt-4 flex flex-wrap gap-2">
								<Tag color="blue">Tema: {liveType}</Tag>
								{liveTitle && <Tag color="green">Judul Custom</Tag>}
								{liveCtaLabel && <Tag color="orange">CTA: {liveCtaLabel}</Tag>}
								{previewImage && <Tag color="purple">Banner</Tag>}
							</div>
						</div>
					</Col>
				</Row>
			</TabPanel>

			{/* ====== TAB: KONTAK ====== */}
			<TabPanel id="kontak" activeTab={activeTab}>
				<Card
					title="Kontak &amp; Informasi"
					className="card"
					style={{ borderColor: "var(--border)" }}
				>
					<h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
						Informasi Kontak Landing Page
					</h3>
					<p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
						Email ini untuk notifikasi saja. Untuk mengubah email login, gunakan tab Keamanan.
					</p>

					<Form layout="vertical">
						<Row gutter={16}>
							<Col xs={24} md={12}>
								<Form.Item label="Email Notifikasi">
									<Input
										value={adminEmail}
										onChange={(e) => setAdminEmail(e.target.value)}
										placeholder="admin@mba-laundry.com"
										type="email"
									/>
								</Form.Item>
							</Col>
							<Col xs={24} md={12}>
								<Form.Item label="Nomor WhatsApp Landing Page">
									<Input
										value={whatsappNumber}
										onChange={(e) => setWhatsappNumber(e.target.value)}
										placeholder="6281234567890"
									/>
									<p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
										Format: 628xxxxx (tanpa spasi/tanda hubung)
									</p>
								</Form.Item>
							</Col>
						</Row>

						<div className="mt-6 pt-4 flex justify-end" style={{ borderTop: "1px solid var(--border)" }}>
							<Button type="primary" onClick={() => void saveContactInfo()}>
								Simpan Informasi
							</Button>
						</div>
					</Form>
				</Card>
			</TabPanel>

			{/* ====== TAB: KEAMANAN ====== */}
			<TabPanel id="keamanan" activeTab={activeTab}>
				{/* Ganti Email */}
				<Card className="card mb-4" style={{ borderColor: "var(--border)" }}>
					<h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
						Ganti Email Login
					</h3>
					<p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
						Ubah email yang digunakan untuk login ke panel admin. Masukkan password Anda untuk konfirmasi.
					</p>

					<Form layout="vertical">
						<Row gutter={16}>
							<Col xs={24} md={12}>
								<Form.Item label="Email Login Saat Ini">
									<Input value={pb.authStore.model?.email || ""} disabled />
								</Form.Item>
							</Col>
							<Col xs={24} md={12}>
								<Form.Item label="Email Baru">
									<Input
										value={newLoginEmail}
										onChange={(e) => setNewLoginEmail(e.target.value)}
										placeholder="admin baru@mba-laundry.com"
										type="email"
									/>
								</Form.Item>
							</Col>
							<Col xs={24} md={12}>
								<Form.Item label="Password Saat Ini (Konfirmasi)">
									<Input.Password
										placeholder="Masukkan password Anda"
										prefix={<LockOutlined style={{ color: "var(--text-muted)" }} />}
										value={emailChangePassword}
										onChange={(e) => setEmailChangePassword(e.target.value)}
									/>
								</Form.Item>
							</Col>
						</Row>

						<div className="mt-6 pt-4 flex justify-end" style={{ borderTop: "1px solid var(--border)" }}>
							<Button type="primary" onClick={() => void handleChangeEmail()}>
								Simpan Email Baru
							</Button>
						</div>
					</Form>
				</Card>

				{/* Ganti Password */}
				<Card className="card mb-4" style={{ borderColor: "var(--border)" }}>
					<h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
						Ganti Password
					</h3>
					<p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
						Perbarui password login admin secara berkala untuk keamanan.
					</p>

					<div className="flex justify-start">
						<Button icon={<LockOutlined />} onClick={() => setSecurityModalOpen(true)}>
							Buka Form Ganti Password
						</Button>
					</div>
				</Card>

				{/* Danger Zone */}
				<Card
					className="card"
					style={{ borderColor: "var(--danger)", backgroundColor: "var(--danger-bg)" }}
				>
					<h3 className="text-base font-semibold mb-1" style={{ color: "var(--danger)" }}>
						Danger Zone
					</h3>
					<p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
						Aksi sensitif yang mempengaruhi sesi login secara keseluruhan.
					</p>

					<Popconfirm
						title="Logout dari Semua Sesi?"
						description="Anda akan keluar dari semua perangkat yang terhubung. Login ulang diperlukan setelahnya."
						okText="Ya, Logout Semua"
						cancelText="Batal"
						onConfirm={() => void handleLogout()}
					>
						<Button danger icon={<LogoutOutlined />}>
							Logout dari Semua Sesi
						</Button>
					</Popconfirm>
				</Card>
			</TabPanel>

			{/* Security Modal */}
			<Modal
				title="Ganti Password"
				open={securityModalOpen}
				onCancel={() => {
					setSecurityModalOpen(false);
					securityForm.resetFields();
				}}
				footer={[
					<Button key="cancel" onClick={() => setSecurityModalOpen(false)}>
						Batal
					</Button>,
					<Button key="submit" type="primary" onClick={() => void handleChangePassword()}>
						Simpan Password Baru
					</Button>,
				]}
			>
				<Form form={securityForm} layout="vertical">
					<Form.Item
						name="currentPassword"
						label="Password Saat Ini"
						rules={[{ required: true, message: "Password saat ini wajib diisi" }]}
					>
						<Input.Password prefix={<LockOutlined />} placeholder="Masukkan password saat ini" />
					</Form.Item>
					<Divider />
					<Form.Item
						name="newPassword"
						label="Password Baru"
						rules={[
							{ required: true, message: "Password baru wajib diisi" },
							{ min: 8, message: "Password minimal 8 karakter" },
						]}
					>
						<Input.Password prefix={<LockOutlined />} placeholder="Masukkan password baru" />
					</Form.Item>
					<Form.Item
						name="confirmPassword"
						label="Konfirmasi Password Baru"
						rules={[{ required: true, message: "Konfirmasi password wajib diisi" }]}
					>
						<Input.Password prefix={<LockOutlined />} placeholder="Ulangi password baru" />
					</Form.Item>
				</Form>
			</Modal>
		</MetronicPage>
	);
}
