import { Button, Card, Form, Input, message } from "antd";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPageContents, saveBulkPageContents } from "@/api/pageContents.api";

const groups: Record<string, string[]> = {
	Hero: ["hero_title", "hero_subtitle", "hero_cta_primary", "hero_cta_secondary"],
	Statistik: ["stats_cucian", "stats_rating"],
	Pengumuman: ["announcement_active", "announcement_text", "announcement_color"],
	"Cara Pakai": ["how_to_step1_title", "how_to_step1_desc", "how_to_step2_title", "how_to_step2_desc", "how_to_step3_title", "how_to_step3_desc"],
	"Footer & Kontak": ["footer_desc", "footer_tagline", "social_instagram", "social_tiktok", "social_facebook", "social_youtube", "whatsapp_cs"],
	SEO: ["seo_title", "seo_desc"],
};

export default function KontenHomeAdminPage() {
	const [form] = Form.useForm();
	const queryClient = useQueryClient();
	const { data: rows = [] } = useQuery({
		queryKey: ["admin-page-contents"],
		queryFn: () => getPageContents(),
	});

	useEffect(() => {
		if (rows.length > 0) {
			const initial = rows.reduce<Record<string, string>>((acc, item) => {
				acc[item.key] = item.value;
				return acc;
			}, {});
			form.setFieldsValue(initial);
		}
	}, [form, rows]);

	const save = async (): Promise<void> => {
		const values = await form.validateFields();
		const payload = Object.entries(values).map(([key, value]) => ({ key, value: String(value) }));
		await saveBulkPageContents(payload);
		message.success("Konten home berhasil disimpan");
		await queryClient.invalidateQueries({ queryKey: ["admin-page-contents"] });
	};

	return (
		<div className="space-y-4">
			<h1 className="text-xl font-bold">Edit Konten Home</h1>
			<Form layout="vertical" form={form}>
				{Object.entries(groups).map(([groupName, keys]) => (
					<Card key={groupName} title={groupName} className="mb-4">
						<div className="grid gap-3 md:grid-cols-2">
							{keys.map((key) => (
								<Form.Item key={key} label={key} name={key}>
									<Input />
								</Form.Item>
							))}
						</div>
					</Card>
				))}
				<Button type="primary" onClick={() => void save()}>Simpan Semua</Button>
			</Form>
		</div>
	);
}




