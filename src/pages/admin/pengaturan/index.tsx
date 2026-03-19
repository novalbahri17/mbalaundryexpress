import { Alert, Button, Card, Col, Form, Input, Row, Switch, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CrudManager } from "@/components/admin/CrudManager";
import { getPageContentValueMap, saveBulkPageContents } from "@/api/pageContents.api";
import { deleteSiteSetting, getSiteSettings, saveBulkSettings, upsertSiteSetting } from "@/api/settings.api";
import { PAGE_CONTENT_QUERY_KEY } from "@/hooks/usePageContent";
import { SITE_SETTINGS_QUERY_KEY } from "@/hooks/useSiteSettings";
import type { SiteSetting } from "@/types/database.types";
import { normalizeHexColor, validateHexColor } from "@/utils/validation";

const DEFAULT_LIGHT_BG = "#FAFAFA";
const DEFAULT_DARK_BG = "#0A0A0F";

type LandingAppearanceForm = {
	landing_bg_color_light: string;
	landing_bg_color_dark: string;
};

type AnnouncementFormValues = {
	announcement_active: boolean;
	announcement_text: string;
};

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
		});
	}, [
		appearanceForm,
		announcementForm,
		pageContentMap.landing_bg_color_dark,
		pageContentMap.landing_bg_color_light,
		pageContentMap.announcement_active,
		pageContentMap.announcement_text,
		settingsMap.landing_bg_color_dark,
		settingsMap.landing_bg_color_light,
	]);

	const lightPreview = normalizeHexColor(Form.useWatch("landing_bg_color_light", appearanceForm), DEFAULT_LIGHT_BG);
	const darkPreview = normalizeHexColor(Form.useWatch("landing_bg_color_dark", appearanceForm), DEFAULT_DARK_BG);

	const saveAnnouncement = async () => {
		const values = await announcementForm.validateFields();
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
						<Form form={announcementForm} layout="vertical">
							<Form.Item name="announcement_active" label="Tampilkan Pengumuman di Halaman Utama" valuePropName="checked">
								<Switch checkedChildren="Aktif" unCheckedChildren="Mati" />
							</Form.Item>
							<Form.Item name="announcement_text" label="Isi Pengumuman" extra="Bisa berisi info diskon, libur, atau waktu operasional khusus">
								<Input.TextArea rows={4} placeholder="Contoh: Terkait libur Lebaran, seluruh cabang MBA Laundry tutup dari tanggal..." />
							</Form.Item>
							<Button type="primary" onClick={() => void saveAnnouncement()}>Simpan Pengumuman</Button>
						</Form>
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
