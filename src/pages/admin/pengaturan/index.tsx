import { Alert, Button, Card, Col, Form, Input, Row, Switch, DatePicker, Upload, message, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { UploadOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CrudManager } from "@/components/admin/CrudManager";
import { getPageContentValueMap, saveBulkPageContents } from "@/api/pageContents.api";
import { deleteSiteSetting, getSiteSettings, saveBulkSettings, upsertSiteSetting } from "@/api/settings.api";
import { PAGE_CONTENT_QUERY_KEY } from "@/hooks/usePageContent";
import { SITE_SETTINGS_QUERY_KEY } from "@/hooks/useSiteSettings";
import type { SiteSetting } from "@/types/database.types";
import { normalizeHexColor, validateHexColor } from "@/utils/validation";
import { AnnouncementCard, type AnnouncementType } from "@/components/public/home/AnnouncementModal";

const DEFAULT_LIGHT_BG = "#FAFAFA";
const DEFAULT_DARK_BG = "#0A0A0F";

type LandingAppearanceForm = {
	landing_bg_color_light: string;
	landing_bg_color_dark: string;
};

type AnnouncementFormValues = {
	announcement_active: boolean;
	announcement_text: string;
	announcement_image_file?: any;
	announcement_dates?: [dayjs.Dayjs, dayjs.Dayjs] | null;
	announcement_type: AnnouncementType;
	announcement_recurring: string;
	announcement_frequency: string;
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

const fileToBase64 = (file: File): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
	});

const columns: ColumnsType<SiteSetting> = [
	{ title: "Key", dataIndex: "key" },
	{
		title: "Value",
		dataIndex: "value",
		render: (value: string, record: SiteSetting) => {
			if (record.key === "landing_bg_color_light" || record.key === "landing_bg_color_dark") {
				const normalized = normalizeHexColor(
					value,
					record.key === "landing_bg_color_dark" ? DEFAULT_DARK_BG : DEFAULT_LIGHT_BG,
				);
				return (
					<div className="flex items-center gap-2">
						<span className="h-4 w-4 rounded border border-neutral-300" style={{ backgroundColor: normalized }} />
						<span>{normalized}</span>
					</div>
				);
			}
			return value;
		},
	},
	{ title: "Deskripsi", dataIndex: "description" },
];

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

export default function PengaturanAdminPage() {
	const [appearanceForm] = Form.useForm<LandingAppearanceForm>();
	const [announcementForm] = Form.useForm<AnnouncementFormValues>();
	const [modulesForm] = Form.useForm<ModulesFormValues>();
	const queryClient = useQueryClient();

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

		announcementForm.setFieldsValue({
			announcement_active: pageContentMap.announcement_active === "true" || pageContentMap.announcement_active === "1",
			announcement_text: pageContentMap.announcement_text ?? "",
			announcement_type: (pageContentMap.announcement_type as AnnouncementType) || "info",
			announcement_recurring: pageContentMap.announcement_recurring || "none",
			announcement_frequency: pageContentMap.announcement_frequency || "session",
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
	}, [
		appearanceForm,
		announcementForm,
		modulesForm,
		pageContentMap.landing_bg_color_dark,
		pageContentMap.landing_bg_color_light,
		pageContentMap.announcement_active,
		pageContentMap.announcement_text,
		pageContentMap.announcement_start,
		pageContentMap.announcement_end,
		pageContentMap.announcement_type,
		pageContentMap.announcement_recurring,
		pageContentMap.announcement_frequency,
		pageContentMap.module_cabang,
		pageContentMap.module_promo,
		pageContentMap.module_galeri,
		pageContentMap.module_harga,
		pageContentMap.module_carapakai,
		pageContentMap.module_blog,
		pageContentMap.module_loker,
		pageContentMap.module_kemitraan,
		pageContentMap.module_kontak,
		settingsMap.landing_bg_color_dark,
		settingsMap.landing_bg_color_light,
	]);

	const lightPreview = normalizeHexColor(Form.useWatch("landing_bg_color_light", appearanceForm), DEFAULT_LIGHT_BG);
	const darkPreview = normalizeHexColor(Form.useWatch("landing_bg_color_dark", appearanceForm), DEFAULT_DARK_BG);

	// Watch values for Smart Preview
	const liveText = Form.useWatch("announcement_text", announcementForm);
	const liveType = Form.useWatch("announcement_type", announcementForm);
	const liveImageFile: any = Form.useWatch("announcement_image_file", announcementForm);
	const previewImage = liveImageFile?.fileList?.[0]?.thumbUrl || pageContentMap.announcement_image || undefined;

	const applyTemplate = (type: AnnouncementType) => {
		const templates = {
			promo: {
				text: "🎉 Diskon Spesial Hari Ini! Cuci 5Kg Gratis 1Kg. Yuk buruan mampir sebelum kehabisan mesin!",
				type: "promo",
			},
			libur: {
				text: "Mohon maaf, kami tutup sementara dalam rangka libur nasional. Kami akan buka kembali segera.",
				type: "libur",
			},
			maintenance: {
				text: "Mohon maaf, sistem operasional kami sedang dalam perbaikan rutin. Silakan cek berkala.",
				type: "maintenance",
			},
			info: { text: "Halo pelanggan setia MBA Laundry! Jangan lupa ambil cucian Anda tepat waktu ya.", type: "info" },
		};

		const tpl = templates[type] || templates.info;
		announcementForm.setFieldsValue({
			announcement_text: tpl.text,
			announcement_type: tpl.type as AnnouncementType,
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

		// Focus back
		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(start + tagStart.length, start + tagStart.length + selected.length);
		}, 0);
	};

	const saveAnnouncement = async () => {
		const values = await announcementForm.validateFields();

		let imageUrl = pageContentMap.announcement_image ?? "";
		if (values.announcement_image_file?.file) {
			imageUrl = await fileToBase64(values.announcement_image_file.file as File);
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
				description: "URL/Base64 banner",
				group: "announcement",
			},
			{
				key: "announcement_type",
				value: values.announcement_type ?? "info",
				type: "text",
				label: "Tipe Pengumuman",
				description: "Warna dan tema",
				group: "announcement",
			},
			{
				key: "announcement_recurring",
				value: values.announcement_recurring ?? "none",
				type: "text",
				label: "Jadwal Berulang",
				description: "Penayangan rutin",
				group: "announcement",
			},
			{
				key: "announcement_frequency",
				value: values.announcement_frequency ?? "session",
				type: "text",
				label: "Frekuensi Tampil",
				description: "Berapa sering muncul",
				group: "announcement",
			},
		]);

		message.success("Pengumuman berhasil disimpan");
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: ["admin-page-content-map"] }),
			queryClient.invalidateQueries({ queryKey: [PAGE_CONTENT_QUERY_KEY] }),
			queryClient.invalidateQueries({ queryKey: [PAGE_CONTENT_QUERY_KEY, "map"] }),
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
			queryClient.invalidateQueries({ queryKey: [PAGE_CONTENT_QUERY_KEY, "map"] }),
			queryClient.invalidateQueries({ queryKey: [SITE_SETTINGS_QUERY_KEY] }),
			queryClient.invalidateQueries({ queryKey: [SITE_SETTINGS_QUERY_KEY, "map"] }),
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
			value: (values as any)[key] ? "true" : "false",
			type: "boolean",
			label: `Modul ${key.replace("module_", "")}`,
			description: `Visibilitas modul ${key.replace("module_", "")}`,
			group: "modules",
		}));

		await saveBulkPageContents(payload);
		message.success("Visibilitas modul berhasil diperbarui");
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: ["admin-page-content-map"] }),
			queryClient.invalidateQueries({ queryKey: [PAGE_CONTENT_QUERY_KEY] }),
			queryClient.invalidateQueries({ queryKey: [PAGE_CONTENT_QUERY_KEY, "map"] }),
		]);
	};

	return (
		<div className="space-y-4">
			<div className="admin-page-shell">
				<div className="admin-page-head">
					<div>
						<h1 className="admin-page-title">Pengaturan Global</h1>
						<p className="admin-page-subtitle">Atur tampilan landing dan konfigurasi sistem dari dashboard admin.</p>
					</div>
				</div>
				<div className="admin-page-body space-y-4">
					<Card title="Manajemen Modul & Halaman Publik" className="shadow-sm border-ruby-200">
						<Alert
							showIcon
							type="info"
							message="Pengaturan Visibilitas Global"
							description="Matikan switch di bawah jika Anda tidak ingin menampilkan halaman atau menu tersebut di Landing Page Publik."
							className="mb-6"
						/>
						<Form form={modulesForm} layout="horizontal">
							<Row gutter={[24, 16]}>
								<Col xs={24} sm={12} md={8} xl={6}>
									<Form.Item name="module_cabang" valuePropName="checked" className="mb-0">
										<Switch checkedChildren="Cabang On" unCheckedChildren="Cabang Off" />
									</Form.Item>
								</Col>
								<Col xs={24} sm={12} md={8} xl={6}>
									<Form.Item name="module_promo" valuePropName="checked" className="mb-0">
										<Switch checkedChildren="Promo On" unCheckedChildren="Promo Off" />
									</Form.Item>
								</Col>
								<Col xs={24} sm={12} md={8} xl={6}>
									<Form.Item name="module_harga" valuePropName="checked" className="mb-0">
										<Switch checkedChildren="Harga On" unCheckedChildren="Harga Off" />
									</Form.Item>
								</Col>
								<Col xs={24} sm={12} md={8} xl={6}>
									<Form.Item name="module_carapakai" valuePropName="checked" className="mb-0">
										<Switch checkedChildren="Cara Pakai On" unCheckedChildren="Cara Pakai Off" />
									</Form.Item>
								</Col>
								<Col xs={24} sm={12} md={8} xl={6}>
									<Form.Item name="module_galeri" valuePropName="checked" className="mb-0">
										<Switch checkedChildren="Galeri On" unCheckedChildren="Galeri Off" />
									</Form.Item>
								</Col>
								<Col xs={24} sm={12} md={8} xl={6}>
									<Form.Item name="module_blog" valuePropName="checked" className="mb-0">
										<Switch checkedChildren="Blog On" unCheckedChildren="Blog Off" />
									</Form.Item>
								</Col>
								<Col xs={24} sm={12} md={8} xl={6}>
									<Form.Item name="module_loker" valuePropName="checked" className="mb-0">
										<Switch checkedChildren="Loker On" unCheckedChildren="Loker Off" />
									</Form.Item>
								</Col>
								<Col xs={24} sm={12} md={8} xl={6}>
									<Form.Item name="module_kemitraan" valuePropName="checked" className="mb-0">
										<Switch checkedChildren="Kemitraan On" unCheckedChildren="Kemitraan Off" />
									</Form.Item>
								</Col>
								<Col xs={24} sm={12} md={8} xl={6}>
									<Form.Item name="module_kontak" valuePropName="checked" className="mb-0">
										<Switch checkedChildren="Kontak On" unCheckedChildren="Kontak Off" />
									</Form.Item>
								</Col>
							</Row>
							<div className="mt-6 border-t border-neutral-100 pt-4 dark:border-neutral-800">
								<Button type="primary" onClick={() => void saveModules()}>
									Simpan Pengaturan Visibilitas
								</Button>
							</div>
						</Form>
					</Card>

					<Card title="Pengumuman (Popup Modal)" className="shadow-sm">
						<Row gutter={24}>
							<Col xs={24} lg={14}>
								<div className="mb-6 rounded-lg border border-ruby-200 bg-ruby-50 p-4 dark:border-ruby-900/50 dark:bg-ruby-900/20">
									<div className="mb-2 text-sm font-semibold text-ruby-700 dark:text-ruby-400">
										✨ Magic Templates (Jalur Cepat)
									</div>
									<div className="flex flex-wrap gap-2">
										<Button size="small" onClick={() => applyTemplate("promo")}>
											🎁 Mode Promo
										</Button>
										<Button size="small" onClick={() => applyTemplate("libur")}>
											🔒 Mode Libur
										</Button>
										<Button size="small" onClick={() => applyTemplate("maintenance")}>
											🔧 Mode Maintenance
										</Button>
										<Button size="small" onClick={() => applyTemplate("info")}>
											ℹ️ Mode Info
										</Button>
									</div>
								</div>

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
														{ label: "ℹ️ Standar Info (Biru)", value: "info" },
														{ label: "🎉 Promo Spesial (Emas)", value: "promo" },
														{ label: "🔒 Libur / Tutup (Merah)", value: "libur" },
														{ label: "🔧 Maintenance (Oranye)", value: "maintenance" },
													]}
												/>
											</Form.Item>
										</Col>
									</Row>

									<Form.Item label="Isi Pengumuman" className="mb-2">
										<div className="mb-2 flex flex-wrap gap-2 items-center rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800">
											<span className="text-xs font-semibold text-neutral-500 mr-1">Toolbar:</span>
											<Button size="small" onClick={() => insertTag("<b>", "</b>")} className="font-bold">
												B
											</Button>
											<Button size="small" onClick={() => insertTag("<i>", "</i>")} className="italic">
												I
											</Button>
											<Button
												size="small"
												onClick={() => insertTag('<a href="#" className="underline text-blue-300">', "</a>")}
											>
												🔗 Link
											</Button>
											<div className="w-px h-4 bg-neutral-300 mx-1" />
											<Button size="small" onClick={() => insertTag('<span className="text-sm">', "</span>")}>
												T-Kecil
											</Button>
											<Button size="small" onClick={() => insertTag('<span className="text-xl font-bold">', "</span>")}>
												T-Besar
											</Button>
											<div className="w-px h-4 bg-neutral-300 mx-1" />
											<Button
												size="small"
												type="primary"
												ghost
												onClick={() => insertTag("{Nama Pelanggan}", "")}
												className="border-dashed"
											>
												&#123;Nama Pelanggan&#125;
											</Button>
										</div>
										<Form.Item name="announcement_text" noStyle>
											<Input.TextArea
												id="announcement_text"
												rows={5}
												placeholder="Ketik pengumuman di sini..."
												className="font-mono text-sm"
											/>
										</Form.Item>
										<div className="mt-1 text-xs text-neutral-400">Dukung tag HTML dasar dan variabel otomatis.</div>
									</Form.Item>

									<Row gutter={16}>
										<Col xs={24} md={12}>
											<Form.Item name="announcement_recurring" label="Tayang Berulang Mingguan">
												<Select
													options={[
														{ label: "Tidak (Muncul Tiap Hari)", value: "none" },
														{ label: "Hanya Hari Jumat (Promo Jumat)", value: "friday" },
														{ label: "Hanya Akhir Pekan (Sabtu & Minggu)", value: "weekend" },
													]}
												/>
											</Form.Item>
										</Col>
										<Col xs={24} md={12}>
											<Form.Item name="announcement_dates" label="Jadwal Tayang Khusus">
												<DatePicker.RangePicker showTime format="YYYY-MM-DD HH:mm" className="w-full" />
											</Form.Item>
										</Col>
									</Row>

									<Row gutter={16}>
										<Col xs={24} md={12}>
											<Form.Item name="announcement_frequency" label="Frekuensi Tampil (Logic)">
												<Select
													options={[
														{ label: "🔥 Setiap Refresh (Penting/Urgent)", value: "always" },
														{ label: "🕒 Sekali per Sesi Browser (Normal)", value: "session" },
														{ label: "🛑 Sekali Saja (Sampai klik 'Paham')", value: "once" },
													]}
												/>
											</Form.Item>
										</Col>
										<Col xs={24} md={12}>
											<Form.Item name="announcement_image_file" label="Banner/Gambar Opsional">
												<Upload maxCount={1} beforeUpload={() => false} listType="picture">
													<Button icon={<UploadOutlined />}>Pilih Gambar</Button>
												</Upload>
												{pageContentMap.announcement_image &&
													!announcementForm.getFieldValue("announcement_image_file") && (
														<div className="mt-2 text-xs text-emerald-600">
															Terpasang: Banner/Gambar sudah tersimpan di server.
														</div>
													)}
											</Form.Item>
										</Col>
									</Row>

									<Button
										type="primary"
										onClick={() => void saveAnnouncement()}
										style={{ backgroundColor: "#F97316", borderColor: "#ea580c" }}
										className="w-full sm:w-auto"
									>
										Simpan Pengumuman
									</Button>

									{/* Mock Stats Tracker */}
									<div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
										<div className="mb-3 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
											📊 Statistik Pengumuman (Pratinjau)
										</div>
										<Row gutter={16}>
											<Col xs={12}>
												<div className="rounded-lg bg-white p-3 shadow-sm dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
													<div className="text-xs text-neutral-500">Total Dilihat</div>
													<div className="text-xl font-bold text-sky-600">
														1,245 <span className="text-xs font-normal text-neutral-400">kali</span>
													</div>
												</div>
											</Col>
											<Col xs={12}>
												<div className="rounded-lg bg-white p-3 shadow-sm dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
													<div className="text-xs text-neutral-500">Klik "Paham"</div>
													<div className="text-xl font-bold text-emerald-600">
														890 <span className="text-xs font-normal text-neutral-400">user</span>
													</div>
												</div>
											</Col>
										</Row>
										<div className="mt-2 text-[10px] text-neutral-400 italic">
											*Statistik ini menggunakan UI Mockup. Tracking log per user membutuhkan plugin backend tambahan.
										</div>
									</div>
								</Form>
							</Col>

							<Col xs={24} lg={10}>
								<div className="h-full rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800 flex flex-col items-center">
									<h4 className="mb-4 w-full font-semibold text-neutral-600 dark:text-neutral-400">
										👀 Smart Live Preview
									</h4>
									<div className="flex w-full flex-1 items-center justify-center pointer-events-none relative pt-10 pb-4">
										{/* Scale down to fit the parent container seamlessly */}
										<div className="w-[125%] max-w-sm origin-top scale-[0.8]">
											<AnnouncementCard
												text={liveText || "Ketik sesuatu untuk melihat pratinjau langsung di sini..."}
												type={(liveType as AnnouncementType) || "info"}
												image={previewImage}
											/>
										</div>
									</div>
									<p className="mt-4 text-center text-xs text-neutral-400">
										Preview animasi icon dan gradient langsung memantulkan tema yang sedang aktif.
									</p>
								</div>
							</Col>
						</Row>
					</Card>

					<Card title="Tampilan Landing Page" className="shadow-sm">
						<Form form={appearanceForm} layout="vertical" autoComplete="off">
							<Row gutter={16}>
								<Col xs={24} md={12}>
									<Form.Item
										name="landing_bg_color_light"
										label="Background Light Mode"
										rules={[hexRule]}
										extra="Format HEX, contoh: #FFFBF1"
									>
										<Input placeholder="#FAFAFA" />
									</Form.Item>
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
								</Col>
							</Row>

							<Row gutter={16} className="mb-4">
								<Col xs={24} md={12}>
									<div className="rounded-xl border border-neutral-200 p-3">
										<p className="mb-2 text-xs font-semibold text-neutral-600">Preview Light</p>
										<div
											className="h-16 rounded-lg border border-neutral-200"
											style={{ backgroundColor: lightPreview }}
										/>
										<p className="mt-2 text-xs font-mono text-neutral-600">{lightPreview}</p>
									</div>
								</Col>
								<Col xs={24} md={12}>
									<div className="rounded-xl border border-neutral-200 p-3">
										<p className="mb-2 text-xs font-semibold text-neutral-600">Preview Dark</p>
										<div
											className="h-16 rounded-lg border border-neutral-700"
											style={{ backgroundColor: darkPreview }}
										/>
										<p className="mt-2 text-xs font-mono text-neutral-600 dark:text-neutral-300">{darkPreview}</p>
									</div>
								</Col>
							</Row>

							<Button type="primary" onClick={() => void saveLandingAppearance()}>
								Simpan Warna Landing
							</Button>
						</Form>
					</Card>
				</div>
			</div>

			<CrudManager<SiteSetting>
				title="Pengaturan Lainnya"
				queryKey="admin-site-settings"
				fetcher={getSiteSettings}
				createItem={upsertSiteSetting}
				updateItem={(_, payload) => upsertSiteSetting(payload)}
				deleteItem={deleteSiteSetting}
				columns={columns}
				fields={[
					{ name: "key", label: "Key", type: "text", required: true },
					{ name: "value", label: "Value", type: "text", required: true },
					{ name: "description", label: "Deskripsi", type: "textarea" },
				]}
			/>
		</div>
	);
}
