import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Modal, Select, Space, Table, message } from "antd";
import { useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createArticle, deleteArticle, getArticles, updateArticle } from "@/api/articles.api";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { Article, ArticleCategory } from "@/types/database.types";
import { slugify } from "@/utils/slug";

const categories: ArticleCategory[] = [
	"tips-mencuci",
	"tips-kering",
	"perawatan-bahan",
	"noda",
	"umum",
	"berita",
	"promo-info",
];

export default function BlogAdminPage() {
	const [form] = Form.useForm();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Article | null>(null);
	const queryClient = useQueryClient();

	const { data: articles = [], isLoading } = useQuery({
		queryKey: ["admin-articles"],
		queryFn: () => getArticles(),
	});

	const columns: ColumnsType<Article> = [
		{ title: "Judul", dataIndex: "title" },
		{ title: "Kategori", dataIndex: "category" },
		{ title: "Status", dataIndex: "status" },
		{ title: "Views", dataIndex: "views" },
		{
			title: "Aksi",
			render: (_, record) => (
				<Space>
					<Button
						type="link"
						onClick={() => {
							setEditing(record);
							form.setFieldsValue(record);
							setOpen(true);
						}}
					>
						Edit
					</Button>
					<Button
						type="link"
						danger
						onClick={async () => {
							await deleteArticle(record.id);
							message.success("Artikel dihapus");
							await queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
						}}
					>
						Hapus
					</Button>
				</Space>
			),
		},
	];

	const submit = async (): Promise<void> => {
		const values = await form.validateFields();
		const payload: Partial<Article> = {
			...values,
			slug: values.slug || slugify(values.title),
			read_time: values.read_time,
			views: editing?.views ?? 0,
		};
		if (editing) {
			await updateArticle(editing.id, payload);
			message.success("Artikel diperbarui");
		} else {
			await createArticle(payload);
			message.success("Artikel dibuat");
		}
		setOpen(false);
		setEditing(null);
		form.resetFields();
		await queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold">CRUD Artikel</h1>
				<Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
					Tambah Artikel
				</Button>
			</div>
			<Table rowKey="id" loading={isLoading} columns={columns} dataSource={articles} />
			<Modal
				open={open}
				title={editing ? "Edit Artikel" : "Tambah Artikel"}
				onCancel={() => setOpen(false)}
				onOk={() => void submit()}
				width={920}
				destroyOnClose
			>
				<Form form={form} layout="vertical" initialValues={{ status: "draft", category: "umum", read_time: 5 }}>
					<div className="grid gap-3 md:grid-cols-2">
						<Form.Item label="Judul" name="title" rules={[{ required: true }]}>
							<Input onChange={(event) => form.setFieldValue("slug", slugify(event.target.value))} />
						</Form.Item>
						<Form.Item label="Slug" name="slug" rules={[{ required: true }]}>
							<Input />
						</Form.Item>
					</div>
					<div className="grid gap-3 md:grid-cols-3">
						<Form.Item label="Kategori" name="category">
							<Select options={categories.map((category) => ({ value: category, label: category }))} />
						</Form.Item>
						<Form.Item label="Status" name="status">
							<Select
								options={[
									{ value: "draft", label: "draft" },
									{ value: "published", label: "published" },
								]}
							/>
						</Form.Item>
						<Form.Item label="Read Time (menit)" name="read_time">
							<InputNumber className="w-full" min={1} />
						</Form.Item>
					</div>
					<Form.Item label="Thumbnail URL" name="thumbnail">
						<Input />
					</Form.Item>
					<Form.Item label="Excerpt" name="excerpt">
						<Input.TextArea rows={3} />
					</Form.Item>
					<Form.Item label="Content" name="content" rules={[{ required: true }]}>
						<RichTextEditor />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
