import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, message } from "antd";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteBranchGallery, getBranchGallery, saveBranchGallery } from "@/api/branches.api";
import { BranchContextHeader } from "@/components/admin/BranchContextHeader";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { BranchGallery, GalleryType } from "@/types/database.types";
import { resolveImageUrl } from "@/utils/format";

const galleryTypes: Array<{ label: string; value: GalleryType }> = [
	{ value: "interior", label: "Interior" },
	{ value: "exterior", label: "Eksterior" },
	{ value: "mesin", label: "Mesin" },
	{ value: "fasilitas", label: "Fasilitas" },
	{ value: "umum", label: "Umum" },
];

type GaleriFormValues = {
	caption?: string;
	type: GalleryType;
	sort_order: number;
};

export default function CabangGaleriPage() {
	const { id } = useParams();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<BranchGallery | null>(null);
	const [form] = Form.useForm<GaleriFormValues>();
	const [imageFile, setImageFile] = useState<File | null>(null);
	const queryClient = useQueryClient();

	const { data = [], isLoading } = useQuery({
		queryKey: ["branch-gallery", id],
		queryFn: () => getBranchGallery(id),
		enabled: Boolean(id),
	});

	const onSubmit = async (): Promise<void> => {
		if (!id) return;
		const values = await form.validateFields();

		if (!editing && !imageFile) {
			message.error("Gambar wajib diisi");
			return;
		}

		if (imageFile) {
			const formData = new FormData();
			if (editing?.id) formData.append("id", editing.id);
			formData.append("branch_id", id);
			formData.append("caption", values.caption ?? "");
			formData.append("type", values.type);
			formData.append("sort_order", String(values.sort_order ?? 0));
			formData.append("image", imageFile);
			await saveBranchGallery(formData, editing?.id);
		} else {
			await saveBranchGallery({
				id: editing?.id,
				branch_id: id,
				caption: values.caption,
				type: values.type,
				sort_order: values.sort_order ?? 0,
			});
		}

		message.success("Galeri tersimpan");
		setOpen(false);
		setEditing(null);
		setImageFile(null);
		form.resetFields();
		await queryClient.invalidateQueries({ queryKey: ["branch-gallery", id] });
	};

	return (
		<div className="space-y-4">
			<BranchContextHeader branchId={id} activeTab="galeri" />

			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold">Kelola Galeri Cabang</h1>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => {
						setEditing(null);
						setImageFile(null);
						form.setFieldsValue({ type: "umum", sort_order: 0, caption: "" });
						setOpen(true);
					}}
				>
					Tambah Gambar
				</Button>
			</div>
			<Table
				rowKey="id"
				loading={isLoading}
				dataSource={data}
				columns={[
					{
						title: "Gambar",
						dataIndex: "image",
						render: (value: string, row: BranchGallery) => (
							<img
								src={resolveImageUrl(value, row.caption || "Galeri Cabang")}
								alt={row.caption || "galeri"}
								className="h-14 w-24 rounded object-cover"
							/>
						),
					},
					{ title: "Caption", dataIndex: "caption", render: (value?: string) => value || "-" },
					{
						title: "Tipe",
						dataIndex: "type",
						render: (value: GalleryType) => (
							<Tag>
								{galleryTypes.find((item) => item.value === value)?.label || value}
							</Tag>
						),
					},
					{ title: "Urutan", dataIndex: "sort_order" },
					{
						title: "Aksi",
						render: (_, record: BranchGallery) => (
							<Space>
								<Button
									type="link"
									icon={<EditOutlined />}
									onClick={() => {
										setEditing(record);
										setImageFile(null);
										form.setFieldsValue({
											caption: record.caption,
											type: record.type,
											sort_order: record.sort_order,
										});
										setOpen(true);
									}}
								>
									Edit
								</Button>
								<Popconfirm
									title="Hapus gambar ini?"
									okText="Hapus"
									cancelText="Batal"
									onConfirm={async () => {
										await deleteBranchGallery(record.id);
										message.success("Gambar dihapus");
										await queryClient.invalidateQueries({ queryKey: ["branch-gallery", id] });
									}}
								>
									<Button type="link" danger icon={<DeleteOutlined />}>
										Hapus
									</Button>
								</Popconfirm>
							</Space>
						),
					},
				]}
			/>
			<Modal
				title={editing ? "Edit Gambar Galeri" : "Tambah Gambar Galeri"}
				open={open}
				onCancel={() => setOpen(false)}
				onOk={() => void onSubmit()}
				destroyOnHidden
			>
				<Form layout="vertical" form={form} initialValues={{ type: "umum", sort_order: 0 }}>
					<Form.Item label="Gambar">
						<ImageUpload value={imageFile} onChange={setImageFile} previewUrl={editing?.image} />
					</Form.Item>
					<Form.Item label="Caption" name="caption">
						<Input />
					</Form.Item>
					<Form.Item label="Tipe" name="type" rules={[{ required: true }]}>
						<Select options={galleryTypes} />
					</Form.Item>
					<Form.Item label="Sort Order" name="sort_order">
						<InputNumber className="w-full" min={0} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
