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
 * Nilai tersimpan untuk sebuah kunci.
 *
 * Isian yang dikosongkan disimpan sebagai satu spasi, jadi isi yang hanya
 * berisi spasi dianggap KOSONG (memakai teks bawaan).
 */
const savedValue = (content: Record<string, string>, key: string): string => (content[key] ?? "").trim();

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
	const [showFilled, setShowFilled] = useState(true);

	const sections = useMemo(() => buildLandingSections(text), [text]);

	const tabs = useMemo(() => sections.map((section) => ({ id: section.id, label: section.title })), [sections]);

	// Isi form dengan nilai tersimpan. Field kosong dibiarkan kosong agar
	// placeholder (teks bawaan) yang tampil.
	useEffect(() => {
		if (isLoading) return;
		const initial: Record<string, string> = {};
		for (const section of sections) {
			for (const field of section.fields) {
				initial[field.key] = savedValue(content, field.key);
			}
		}
		form.setFieldsValue(initial);
	}, [content, form, isLoading, sections]);

	const filledCount = useMemo(
		() => sections.flatMap((section) => section.fields).filter((field) => savedValue(content, field.key)).length,
		[sections, content],
	);
	const totalCount = useMemo(() => sections.reduce((acc, section) => acc + section.fields.length, 0), [sections]);

	// Daftar teks yang SUDAH terisi di database, lengkap dengan isinya, supaya
	// admin tahu bagian mana yang sudah diubah dan mana yang masih teks bawaan.
	const filledFields = useMemo(() => {
		const list: Array<{
			sectionId: string;
			sectionTitle: string;
			key: string;
			label: string;
			value: string;
		}> = [];
		for (const section of sections) {
			for (const field of section.fields) {
				const value = savedValue(content, field.key);
				if (!value) continue;
				list.push({
					sectionId: section.id,
					sectionTitle: section.title,
					key: field.key,
					label: field.label,
					value,
				});
			}
		}
		return list;
	}, [sections, content]);

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

				{/* Ringkasan teks yang sudah terisi — biar kelihatan mana yang sudah diubah. */}
				<div
					className="mb-5 rounded-xl border p-4"
					style={{ borderColor: "var(--border)", background: "var(--card-bg, transparent)" }}
				>
					<button
						type="button"
						onClick={() => setShowFilled((value) => !value)}
						className="flex w-full items-center justify-between gap-3 text-left"
					>
						<span className="text-sm font-semibold" style={{ color: "var(--text-main)" }}>
							Teks yang sudah terisi di landing page ({filledFields.length})
						</span>
						<span className="text-xs" style={{ color: "var(--text-muted)" }}>
							{showFilled ? "Sembunyikan" : "Tampilkan"}
						</span>
					</button>

					{showFilled &&
						(filledFields.length === 0 ? (
							<p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
								Belum ada teks yang diubah. Semua bagian masih memakai teks bawaan.
							</p>
						) : (
							<div className="mt-3 space-y-2">
								{filledFields.map((item) => (
									<div key={item.key} className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--border)" }}>
										<div className="flex flex-wrap items-center gap-2">
											<Tag color="blue" style={{ marginInlineEnd: 0 }}>
												{item.sectionTitle}
											</Tag>
											<Text strong style={{ fontSize: 13 }}>
												{item.label}
											</Text>
											<button
												type="button"
												className="text-xs underline"
												style={{ color: "var(--brand, #C62828)" }}
												onClick={() => setActiveTab(item.sectionId)}
											>
												buka tab
											</button>
										</div>
										<div className="mt-1 whitespace-pre-wrap text-sm" style={{ color: "var(--text-muted)" }}>
											{item.value}
										</div>
									</div>
								))}
							</div>
						))}
				</div>

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
								{section.fields.map((field) => {
									const value = savedValue(content, field.key);
									const isFilled = Boolean(value);
									return (
										<Form.Item
											key={field.key}
											name={field.key}
											label={
												<span className="inline-flex items-center gap-2">
													{field.label}
													{isFilled ? (
														<Tag color="green" style={{ marginInlineEnd: 0 }}>
															Sudah diisi
														</Tag>
													) : null}
												</span>
											}
											className={field.kind === "textarea" ? "md:col-span-2" : undefined}
											extra={
												isFilled ? (
													<span style={{ fontSize: 12 }}>
														Sudah diisi: <span style={{ color: "var(--text-main)" }}>{value}</span>
													</span>
												) : (
													<span style={{ fontSize: 12 }}>Tampil sekarang (teks bawaan): {field.defaultValue}</span>
												)
											}
										>
											{field.kind === "textarea" ? (
												<Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} placeholder={field.defaultValue} />
											) : (
												<Input placeholder={field.defaultValue} />
											)}
										</Form.Item>
									);
								})}
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
