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
				const normalized = normalizeHexColor(value, record.key === "landing_bg_color_dark" ? DEFAULT_DARK_BG : DEFAULT_LIGHT_BG);
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
			announcement_dates:
				pageContentMap.announcement_start && pageContentMap.announcement_end
					? [dayjs(pageContentMap.announcement_start), dayjs(pageContentMap.announcement_end)]
					: undefined,
		});
	}, [
		appearanceForm,
		announcementForm,
		pageContentMap.landing_bg_color_dark,
		pageContentMap.landing_bg_color_light,
		pageContentMap.announcement_active,
		pageContentMap.announcement_text,
		pageContentMap.announcement_start,
		pageContentMap.announcement_end,
		pageContentMap.announcement_type,
		pageContentMap.announcement_recurring,
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
			promo: { text: "🎉 Diskon Spesial Hari Ini! Cuci 5Kg Gratis 1Kg. Yuk buruan mampir sebelum kehabisan mesin!", type: "promo" },
			libur: { text: "Mohon maaf, kami tutup sementara dalam rangka libur nasional. Kami akan buka kembali segera.", type: "libur" },
			maintenance: { text: "Mohon maaf, sistem operasional kami sedang dalam perbaikan rutin. Silakan cek berkala.", type: "maintenance" },
			info: { text: "Halo pelanggan setia MBA Laundry! Jangan lupa ambil cucian Anda tepat waktu ya.", type: "info" }
		};

		const tpl = templates[type] || templates.info;
		announcementForm.setFieldsValue({
			announcement_text: tpl.text,
			announcement_type: tpl.type as AnnouncementType,
			announcement_active: true
		});
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
					<Alert
						showIcon
						type="info"
						message="Custom Background Landing"
						description="Isi warna HEX. Anda bisa pakai #FFFBF1 untuk light mode sesuai contoh Anda."
					/>

					<Card title="Pengumuman (Popup Modal)" className="shadow-sm">
						<Row gutter={24}>
							<Col xs={24} lg={14}>
								<div className="mb-6 rounded-lg border border-ruby-200 bg-ruby-50 p-4 dark:border-ruby-900/50 dark:bg-ruby-900/20">
									<div className="mb-2 text-sm font-semibold text-ruby-700 dark:text-ruby-400">✨ Magic Templates (Jalur Cepat)</div>
									<div className="flex flex-wrap gap-2">
										<Button size="small" onClick={() => applyTemplate("promo")}>🎁 Mode Promo</Button>
										<Button size="small" onClick={() => applyTemplate("libur")}>🔒 Mode Libur</Button>
										<Button size="small" onClick={() => applyTemplate("maintenance")}>🔧 Mode Maintenance</Button>
										<Button size="small" onClick={() => applyTemplate("info")}>ℹ️ Mode Info</Button>
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
												<Select options={[
													{ label: "ℹ️ Standar Info (Biru)", value: "info" },
													{ label: "🎉 Promo Spesial (Emas)", value: "promo" },
													{ label: "🔒 Libur / Tutup (Merah)", value: "libur" },
													{ label: "🔧 Maintenance (Oranye)", value: "maintenance" },
												]} />
											</Form.Item>
										</Col>
									</Row>

									<Form.Item name="announcement_text" label="Isi Pengumuman" extra="Bisa berisi info diskon, libur, atau waktu operasional khusus">
										<Input.TextArea rows={4} placeholder="Contoh: Terkait libur Lebaran, seluruh cabang MBA Laundry tutup dari tanggal..." />
									</Form.Item>

									<Row gutter={16}>
										<Col xs={24} md={12}>
											<Form.Item name="announcement_recurring" label="Tayang Berulang Mingguan">
												<Select options={[
													{ label: "Tidak (Muncul Tiap Hari)", value: "none" },
													{ label: "Hanya Hari Jumat (Promo Jumat)", value: "friday" },
													{ label: "Hanya Akhir Pekan (Sabtu & Minggu)", value: "weekend" },
												]} />
											</Form.Item>
										</Col>
										<Col xs={24} md={12}>
											<Form.Item name="announcement_dates" label="Jadwal Tayang Khusus" extra="Prioritas utama waktu tampil modal">
												<DatePicker.RangePicker showTime format="YYYY-MM-DD HH:mm" className="w-full" />
											</Form.Item>
										</Col>
									</Row>

									<Form.Item name="announcement_image_file" label="Banner/Gambar Opsional">
										<Upload maxCount={1} beforeUpload={() => false} listType="picture">
											<Button icon={<UploadOutlined />}>Pilih Gambar</Button>
										</Upload>
										{pageContentMap.announcement_image && !announcementForm.getFieldValue("announcement_image_file") && (
											<div className="mt-2 text-xs text-emerald-600">Terpasang: Banner/Gambar sudah tersimpan di server.</div>
										)}
									</Form.Item>

									<Button type="primary" onClick={() => void saveAnnouncement()} style={{ backgroundColor: "#F97316", borderColor: "#ea580c" }}>
										Simpan Pengumuman
									</Button>
								</Form>
							</Col>

							<Col xs={24} lg={10}>
								<div className="h-full rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800 flex flex-col items-center">
									<h4 className="mb-4 w-full font-semibold text-neutral-600 dark:text-neutral-400">👀 Smart Live Preview</h4>
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
