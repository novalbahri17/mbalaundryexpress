import { SaveOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Form, Input, message, Space, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { saveBulkPageContents } from "@/api/pageContents.api";
import { MetronicPage } from "@/components/admin/MetronicPage";
import { TabPanel, Tabs } from "@/design-system/components/Tabs";
import { PAGE_CONTENT_QUERY_KEY, usePageContentMap } from "@/hooks/usePageContent";
import { usePublicText } from "@/hooks/usePublicText";
import { buildLandingSections } from "@/lib/landingText";
import { useLocaleStore } from "@/store/localeStore";

const { Text } = Typography;

/**
 * Editor teks landing page.
 *
 * Semua isian disimpan ke `page_contents` dengan key `landing_*` dan
 * `group: "landing"`. Landing page publik membaca nilai ini lewat
 * `useLandingText()`; kalau kosong, otomatis pakai teks bawaan.
 */
export default function TeksLandingAdminPage() {
	const text = usePublicText();
	const locale = useLocaleStore((state) => state.locale);
	const { data: content = {}, isLoading } = usePageContentMap();
	const queryClient = useQueryClient();
	const [form] = Form.useForm<Record<string, string>>();
	const [activeTab, setActiveTab] = useState("hero");
	const [saving, setSaving] = useState(false);

	const sections = useMemo(() => buildLandingSections(text), [text]);

	const tabs = useMemo(() => sections.map((section) => ({ id: section.id, label: section.title })), [sections]);

	// Isi form dengan nilai tersimpan. Field kosong dibiarkan kosong agar
	// placeholder (teks bawaan) yang tampil.
	useEffect(() => {
		if (isLoading) return;
		const initial: Record<string, string> = {};
		for (const section of sections) {
			for (const field of section.fields) {
				initial[field.key] = content[field.key] ?? "";
			}
		}
		form.setFieldsValue(initial);
	}, [content, form, isLoading, sections]);

	const filledCount = useMemo(
		() => sections.flatMap((section) => section.fields).filter((field) => content[field.key]?.trim()).length,
		[sections, content],
	);
	const totalCount = useMemo(() => sections.reduce((acc, section) => acc + section.fields.length, 0), [sections]);

	const handleSave = async () => {
		setSaving(true);
		try {
			const values = form.getFieldsValue(true) as Record<string, string>;
			const rows = sections.flatMap((section) =>
				section.fields.map((field) => ({
					key: field.key,
					value: (values[field.key] ?? "").trim() || " ",
					type: "text" as const,
					label: `${section.title} — ${field.label}`,
					description: `Teks landing page: ${field.label}`,
					group: "landing",
				})),
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
		const cleared: Record<string, string> = {};
		for (const field of section.fields) {
			cleared[field.key] = "";
		}
		form.setFieldsValue(cleared);
		message.info("Isian dikosongkan. Klik Simpan untuk memakai teks bawaan.");
	};

	return (
		<MetronicPage
			title="Teks Landing Page"
			subtitle="Ubah tulisan yang tampil di halaman depan tanpa mengubah kode. Kosongkan isian untuk memakai teks bawaan."
		>
			<Card className="card" style={{ borderColor: "var(--border)" }}>
				<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
					<Space size={8} wrap>
						<Tag color="blue">{locale === "en" ? "Mode bahasa: EN" : "Mode bahasa: ID"}</Tag>
						<Text type="secondary" style={{ fontSize: 13 }}>
							{filledCount} dari {totalCount} teks sudah diubah. Versi bahasa Inggris dibuat otomatis.
						</Text>
					</Space>
				</div>

				<Alert
					type="info"
					showIcon
					className="mb-5"
					message="Tips"
					description="Biarkan kosong untuk memakai teks bawaan. Setelah disimpan, teks baru langsung tampil di landing page (mungkin perlu refresh)."
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
						<Button onClick={handleResetSection}>Kosongkan Bagian Ini</Button>
						<Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => void handleSave()}>
							Simpan Teks
						</Button>
					</div>
				</Form>
			</Card>
		</MetronicPage>
	);
}
