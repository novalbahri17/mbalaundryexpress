import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import {
	Button,
	DatePicker,
	Form,
	Input,
	InputNumber,
	Modal,
	Radio,
	Select,
	Space,
	Switch,
	Table,
	Tag,
	message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createPromo, deletePromo, getPromoBranches, getPromos, setPromoBranches, updatePromo } from "@/api/promos.api";
import type { Promo } from "@/types/database.types";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { useBranches } from "@/hooks/useBranches";
import { slugify } from "@/utils/slug";

export default function PromoAdminPage() {
	const [form] = Form.useForm();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Promo | null>(null);
	const [isGlobal, setIsGlobal] = useState(true);
	const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const queryClient = useQueryClient();
	const { data: branches = [] } = useBranches({ activeOnly: false });

	const { data: promos = [], isLoading } = useQuery({
		queryKey: ["admin-promos"],
		queryFn: async () => {
			const res = await getPromos({ perPage: 500 });
			return res.items;
		},
	});

	const columns: ColumnsType<Promo> = [
		{ title: "Judul", dataIndex: "title" },
		{
			title: "Status",
			dataIndex: "status",
			render: (value: Promo["status"]) => (
				<Tag color={value === "published" ? "green" : value === "draft" ? "orange" : "default"}>{value}</Tag>
			),
		},
		{ title: "Global", dataIndex: "is_global", render: (value: boolean) => (value ? "Ya" : "Tidak") },
		{ title: "Prioritas", dataIndex: "priority" },
		{
			title: "Periode",
			render: (_, record) =>
				`${dayjs(record.start_date).format("DD/MM/YYYY HH:mm")} - ${dayjs(record.end_date).format("DD/MM/YYYY HH:mm")}`,
		},
		{
			title: "Aksi",
			render: (_, record) => (
				<Space>
					<Button
						type="link"
						onClick={async () => {
							setEditing(record);
							setIsGlobal(record.is_global);
							const promoBranches = await getPromoBranches(record.id);
							setSelectedBranches(promoBranches.map((item) => item.branch_id));
							form.setFieldsValue({
								...record,
								start_date: dayjs(record.start_date),
								end_date: dayjs(record.end_date),
								distribution_mode: record.is_global ? "global" : "branch",
							});
							setOpen(true);
						}}
					>
						Edit
					</Button>
					<Button type="link" icon={<EyeOutlined />}>
						Preview
					</Button>
					<Button
						type="link"
						danger
						onClick={async () => {
							await deletePromo(record.id);
							message.success("Promo dihapus");
							await queryClient.invalidateQueries({ queryKey: ["admin-promos"] });
						}}
					>
						Hapus
					</Button>
				</Space>
			),
		},
	];

	const buildPayload = async (): Promise<Partial<Promo> | FormData> => {
		const values = await form.validateFields();
		if (!imageFile) {
			return {
				title: values.title,
				slug: values.slug || slugify(values.title),
				description: values.description,
				terms: values.terms,
				start_date: values.start_date.toISOString(),
				end_date: values.end_date.toISOString(),
				is_active: values.is_active,
				show_on_home: values.show_on_home,
				is_global: values.distribution_mode === "global",
				priority: values.priority,
				status: values.status,
			};
		}

		const formData = new FormData();
		formData.append("title", values.title);
		formData.append("slug", values.slug || slugify(values.title));
		formData.append("description", values.description);
		formData.append("terms", values.terms || "");
		formData.append("start_date", values.start_date.toISOString());
		formData.append("end_date", values.end_date.toISOString());
		formData.append("is_active", values.is_active ? "true" : "false");
		formData.append("show_on_home", values.show_on_home ? "true" : "false");
		formData.append("is_global", values.distribution_mode === "global" ? "true" : "false");
		formData.append("priority", String(values.priority ?? 0));
		formData.append("status", values.status);
		formData.append("image", imageFile);
		return formData;
	};

	const savePromo = async (status: Promo["status"]): Promise<void> => {
		form.setFieldValue("status", status);
		const payload = await buildPayload();

		let saved: Promo;
		if (editing) {
			saved = await updatePromo(editing.id, payload);
		} else {
			saved = await createPromo(payload);
		}

		const mode = form.getFieldValue("distribution_mode");
		if (mode !== "global") {
			await setPromoBranches(saved.id, selectedBranches);
		}

		setOpen(false);
		setEditing(null);
		setSelectedBranches([]);
		setImageFile(null);
		form.resetFields();
		message.success(status === "published" ? "Promo berhasil dipublish" : "Promo tersimpan sebagai draft");
		await queryClient.invalidateQueries({ queryKey: ["admin-promos"] });
	};

	return (
		<div className="admin-page-shell">
			<div className="admin-page-head">
				<div>
					<h1 className="admin-page-title">Promo</h1>
					<p className="admin-page-subtitle">Kelola campaign promo global maupun per cabang secara terstruktur.</p>
				</div>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					size="large"
					onClick={() => {
						setEditing(null);
						setIsGlobal(true);
						setSelectedBranches([]);
						setImageFile(null);
						form.setFieldsValue({
							priority: 0,
							show_on_home: true,
							is_active: true,
							distribution_mode: "global",
							status: "draft",
						});
						setOpen(true);
					}}
				>
					Tambah Promo
				</Button>
			</div>

			<div className="admin-page-body admin-data-table">
				<Table
					rowKey="id"
					columns={columns}
					dataSource={promos}
					loading={isLoading}
					pagination={{ pageSize: 10, showSizeChanger: false }}
				/>
			</div>

			<Modal
				title={editing ? "Edit Promo" : "Tambah Promo"}
				open={open}
				className="admin-modal"
				onCancel={() => setOpen(false)}
				footer={null}
				width={920}
				destroyOnClose
			>
				<Form
					form={form}
					layout="vertical"
					initialValues={{
						priority: 0,
						show_on_home: true,
						is_active: true,
						distribution_mode: "global",
						status: "draft",
					}}
				>
					<div className="grid gap-3 md:grid-cols-2">
						<Form.Item label="Judul" name="title" rules={[{ required: true }]}>
							<Input onChange={(event) => form.setFieldValue("slug", slugify(event.target.value))} />
						</Form.Item>
						<Form.Item label="Slug" name="slug" rules={[{ required: true }]}>
							<Input />
						</Form.Item>
					</div>

					<Form.Item label="Gambar Promo">
						<ImageUpload value={imageFile} onChange={setImageFile} previewUrl={editing?.image} />
					</Form.Item>

					<Form.Item label="Deskripsi" name="description" rules={[{ required: true }]}>
						<RichTextEditor />
					</Form.Item>
					<Form.Item label="Syarat & Ketentuan" name="terms">
						<Input.TextArea rows={4} />
					</Form.Item>

					<div className="grid gap-3 md:grid-cols-2">
						<Form.Item label="Tanggal Mulai" name="start_date" rules={[{ required: true }]}>
							<DatePicker showTime className="w-full" />
						</Form.Item>
						<Form.Item label="Tanggal Berakhir" name="end_date" rules={[{ required: true }]}>
							<DatePicker showTime className="w-full" />
						</Form.Item>
					</div>

					<Form.Item label="Priority" name="priority">
						<InputNumber className="w-full" min={0} />
					</Form.Item>

					<div className="grid gap-3 md:grid-cols-2">
						<Form.Item label="Tampilkan di Home" name="show_on_home" valuePropName="checked">
							<Switch />
						</Form.Item>
						<Form.Item label="Status Aktif" name="is_active" valuePropName="checked">
							<Switch />
						</Form.Item>
					</div>

					<Form.Item label="Distribusi Cabang" name="distribution_mode">
						<Radio.Group
							onChange={(event) => {
								const mode = event.target.value as "global" | "branch";
								setIsGlobal(mode === "global");
							}}
						>
							<Space direction="vertical">
								<Radio value="global">Semua Cabang (Global)</Radio>
								<Radio value="branch">Cabang Tertentu</Radio>
							</Space>
						</Radio.Group>
					</Form.Item>

					{!isGlobal ? (
						<Form.Item label="Pilih Cabang">
							<Select
								mode="multiple"
								value={selectedBranches}
								onChange={setSelectedBranches}
								options={branches.map((branch) => ({ value: branch.id, label: branch.name }))}
							/>
						</Form.Item>
					) : null}

					<Form.Item name="status" hidden>
						<Input />
					</Form.Item>

					<div className="flex flex-wrap justify-end gap-2">
						<Button className="admin-soft-btn" onClick={() => void savePromo("draft")}>
							Simpan Draft
						</Button>
						<Button className="admin-soft-btn" type="default" icon={<EyeOutlined />}>
							Preview
						</Button>
						<Button className="admin-soft-btn" type="primary" onClick={() => void savePromo("published")}>
							Publish Sekarang
						</Button>
					</div>
				</Form>
			</Modal>
		</div>
	);
}
