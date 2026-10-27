import { SaveOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Form, Input, message, Space, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { saveBulkPageContents } from "@/api/pageContents.api";
import { MetronicPage } from "@/components/admin/MetronicPage";
import { TabPanel, Tabs } from "@/design-system/components/Tabs";
import { PAGE_CONTENT_QUERY_KEY, usePageContentMap } from "@/hooks/usePageContent";
import { buildLandingSections } from "@/lib/landingText";
import { PUBLIC_TEXT } from "@/locales/public";
import { useLocaleStore } from "@/store/localeStore";

const { Text } = Typography;

/**
 * Editor teks landing page.
 *
 * Semua isian disimpan ke `page_contents` dengan key `landing_*` dan
 * `group: "landing"`. Landing page publik membaca nilai ini lewat
 * `useLandingText()`; kalau kosong, otomatis pakai teks bawaan.
 *
 * Isian sengaja diisi dengan teks yang SEKARANG tampil di landing page
 * (nilai tersimpan, atau teks bawaan kalau belum pernah diubah), jadi tinggal
 * diedit langsung tanpa harus mengetik ulang.
 */
export default function TeksLandingAdminPage() {
	const locale = useLocaleStore((state) => state.locale);
	const { data: content = {}, isLoading } = usePageContentMap();
	const queryClient = useQueryClient();
	const [form] = Form.useForm<Record<string, string>>();
	const [activeTab, setActiveTab] = useState("hero");
	const [saving, setSaving] = useState(false);

	// Sumber teks yang diedit selalu versi Indonesia (teks asli). Versi Inggris
	// dibuat otomatis oleh penerjemah, jadi admin tidak perlu mengisinya.
	const sections = useMemo(() => buildLandingSections(PUBLIC_TEXT.id), []);

	const tabs = useMemo(() => sections.map((section) => ({ id: section.id, label: section.title })), [sections]);

	// Tampilkan teks yang sedang aktif di landing page: nilai tersimpan kalau ada,
	// kalau belum pernah diubah pakai teks bawaan.
	useEffect(() => {
		if (isLoading) return;
		const initial: Record<string, string> = {};
		for (const section of sections) {
			for (const field of section.fields) {
				const stored = content[field.key]?.trim();
				initial[field.key] = stored && stored.length > 0 ? stored : field.defaultValue;
			}
		}
		form.setFieldsValue(initial);
	}, [content, form, isLoading, sections]);

	const allFields = useMemo(() => sections.flatMap((section) => section.fields), [sections]);

	// Hitung teks yang benar-benar berbeda dari bawaan. Nilai bawaan yang
	// tersimpan ulang tidak dianggap "diubah".
	const filledCount = useMemo(
		() =>
			allFields.filter((field) => {
				const stored = content[field.key]?.trim();
				return Boolean(stored) && stored !== field.defaultValue.trim();
			}).length,
		[allFields, content],
	);
	const totalCount = allFields.length;

	const handleSave = async () => {
		setSaving(true);
		try {
			const values = form.getFieldsValue(true) as Record<string, string>;
			const rows = sections.flatMap((section) =>
				section.fields.map((field) => {
					const typed = (values[field.key] ?? "").trim();
					// Sama dengan teks bawaan → simpan kosong supaya landing page
					// memakai bawaan (dan tidak terhitung sebagai "diubah").
					const value = typed === field.defaultValue.trim() ? "" : typed;
					return {
						key: field.key,
						value: value || " ",
						type: "text" as const,
						label: `${section.title} — ${field.label}`,
						description: `Teks landing page: ${field.label}`,
						group: "landing",
					};
				}),
			);
			await saveBulkPageContents(rows);
			await queryClient.invalidateQueries({ queryKey: [PAGE_CONTENT_QUERY_KEY] });
			message.success("Teks landing page berhasil disimpan");
		} catch (error) {
			message.error(error instanceof Error ? error.message : "Gagal menyimpan teks landing page");
		} finally {
			setSaving(false);
		}
	};

	const handleResetSection = () => {
		const section = sections.find((item) => item.id === activeTab);
		if (!section) return;
		const restored: Record<string, string> = {};
		for (const field of section.fields) {
			restored[field.key] = field.defaultValue;
		}
		form.setFieldsValue(restored);
		message.info("Bagian ini dikembalikan ke teks bawaan. Klik Simpan Teks untuk menerapkan.");
	};

	return (
		<MetronicPage
			title="Teks Landing Page"
			subtitle="Isian di bawah sudah berisi teks yang tampil di halaman depan. Tinggal edit bagian yang mau diubah, lalu klik Simpan Teks."
		>
			<Card className="card" style={{ borderColor: "var(--border)" }}>
				<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
					<Space size={8} wrap>
						<Tag color="blue">{locale === "en" ? "Mode bahasa: EN" : "Mode bahasa: ID"}</Tag>
						<Text type="secondary" style={{ fontSize: 13 }}>
							{filledCount} dari {totalCount} teks sudah diubah dari bawaan. Versi bahasa Inggris dibuat otomatis.
						</Text>
					</Space>
				</div>

				<Alert
					type="info"
					showIcon
					className="mb-5"
					message="Teks yang tampil sekarang sudah terisi otomatis"
					description="Nilai di setiap kolom adalah teks yang sedang aktif di landing page. Ubah seperlunya lalu simpan — tidak perlu mengetik ulang. Versi bahasa Inggris dibuat otomatis."
				/>

				<div className="mb-5">
					<Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underline" size="md" />
				</div>

				<Form form={form} layout="vertical" disabled={isLoading}>
					{sections.map((section) => (
						<TabPanel key={section.id} id={section.id} activeTab={activeTab}>
							{section.description && (
								<p className="mb-4 text-sm" style={{ color: "var(--text-muted)" }}>
									{section.description}
								</p>
							)}
							<div className="grid gap-4 md:grid-cols-2">
								{section.fields.map((field) => (
									<Form.Item
										key={field.key}
										name={field.key}
										label={field.label}
										className={field.kind === "textarea" ? "md:col-span-2" : undefined}
										extra={field.hint}
									>
										{field.kind === "textarea" ? (
											<Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} placeholder={field.defaultValue} />
										) : (
											<Input placeholder={field.defaultValue} />
										)}
									</Form.Item>
								))}
							</div>
						</TabPanel>
					))}

					<div className="mt-4 flex flex-wrap justify-end gap-2 border-t pt-4" style={{ borderColor: "var(--border)" }}>
						<Button onClick={handleResetSection}>Kembalikan Teks Bawaan</Button>
						<Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => void handleSave()}>
							Simpan Teks
						</Button>
					</div>
				</Form>
			</Card>
		</MetronicPage>
	);
}
