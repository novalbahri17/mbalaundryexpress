import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Radio, Select, Space, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteGallery, getGallery, createGallery, updateGallery } from "@/api/gallery.api";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { BranchGallery, GalleryType } from "@/types/database.types";
import { resolveImageUrl, sanitizeUrl } from "@/utils/format";

type GaleriFormValues = {
	caption?: string;
	type: GalleryType;
	sort_order?: number;
};

type ImageSourceType = "upload" | "url";

const galleryTypeOptions: Array<{ label: string; value: GalleryType }> = [
	{ label: "Interior", value: "interior" },
	{ label: "Eksterior", value: "exterior" },
	{ label: "Mesin", value: "mesin" },
	{ label: "Fasilitas", value: "fasilitas" },
	{ label: "Umum", value: "umum" },
];

const imageExtensionByType: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
	"image/gif": "gif",
	"image/svg+xml": "svg",
};

const mapLabelByType: Record<GalleryType, string> = {
	interior: "Interior",
	exterior: "Eksterior",
	mesin: "Mesin",
	fasilitas: "Fasilitas",
	umum: "Umum",
};

async function downloadImageAsFile(url: string): Promise<File> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error("Gagal mengambil gambar dari URL");
	}

	const blob = await response.blob();
	if (!blob.type.startsWith("image/")) {
		throw new Error("URL tidak mengarah ke file gambar yang valid");
	}

	const ext = imageExtensionByType[blob.type] ?? "jpg";
	return new File([blob], `gallery-${Date.now()}.${ext}`, { type: blob.type });
}

export default function GaleriAdminPage() {
	const [form] = Form.useForm<GaleriFormValues>();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<BranchGallery | null>(null);
	const [sourceType, setSourceType] = useState<ImageSourceType>("upload");
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imageUrl, setImageUrl] = useState("");
	const queryClient = useQueryClient();
	const safePreviewUrl = sanitizeUrl(imageUrl);

	const { data = [], isLoading } = useQuery({
		queryKey: ["admin-gallery"],
		queryFn: () => getGallery(),
	});

	const columns: ColumnsType<BranchGallery> = [
		{
			title: "Gambar",
			dataIndex: "image",
			render: (value: string, row) => (
				<img
					src={resolveImageUrl(value, row.caption || "Galeri")}
					alt={row.caption || "galeri"}
					className="h-14 w-24 rounded object-cover"
				/>
			),
		},
		{ title: "Caption", dataIndex: "caption", render: (value?: string) => value || "-" },
		{
			title: "Tipe",
			dataIndex: "type",
			render: (value: GalleryType) => <Tag>{mapLabelByType[value] ?? value}</Tag>,
		},
		{ title: "Urutan", dataIndex: "sort_order", width: 100 },
		{
			title: "Aksi",
			render: (_, row) => (
				<Space>
					<Button
						type="link"
						icon={<EditOutlined />}
						onClick={() => {
							setEditing(row);
							setSourceType("upload");
							setImageFile(null);
							setImageUrl(sanitizeUrl(row.image) ?? "");
							form.setFieldsValue({
								caption: row.caption,
								type: row.type,
								sort_order: row.sort_order,
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
							await deleteGallery(row.id);
							message.success("Gambar galeri dihapus");
							await queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
						}}
					>
						<Button type="link" danger icon={<DeleteOutlined />}>
							Hapus
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	const resetModalState = (): void => {
		setOpen(false);
		setEditing(null);
		setSourceType("upload");
		setImageFile(null);
		setImageUrl("");
		form.resetFields();
	};

	const openCreateModal = (): void => {
		setEditing(null);
		setSourceType("upload");
		setImageFile(null);
		setImageUrl("");
		form.resetFields();
		form.setFieldsValue({ type: "umum", sort_order: 0 });
		setOpen(true);
	};

	const onSubmit = async (): Promise<void> => {
		const values = await form.validateFields();
		const caption = values.caption ?? "";
		const sortOrder = values.sort_order ?? 0;

		let payload: Partial<BranchGallery> | FormData;

		if (sourceType === "upload") {
			if (imageFile) {
				const formData = new FormData();
				formData.append("image", imageFile);
				formData.append("caption", caption);
				formData.append("type", values.type);
				formData.append("sort_order", String(sortOrder));
				payload = formData;
			} else if (editing) {
				payload = {
					caption,
					type: values.type,
					sort_order: sortOrder,
				};
			} else {
				message.error("Silakan upload gambar terlebih dahulu");
				return;
			}
		} else {
			const safeUrl = sanitizeUrl(imageUrl);
			if (!safeUrl) {
				message.error("URL gambar tidak valid");
				return;
			}
			const fileFromUrl = await downloadImageAsFile(safeUrl);
			const formData = new FormData();
			formData.append("image", fileFromUrl);
			formData.append("caption", caption);
			formData.append("type", values.type);
			formData.append("sort_order", String(sortOrder));
			payload = formData;
		}

		if (editing) {
			await updateGallery(editing.id, payload);
			message.success("Galeri berhasil diperbarui");
		} else {
			await createGallery(payload);
			message.success("Galeri berhasil ditambahkan");
		}

		resetModalState();
		await queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold">CRUD Galeri Umum</h1>
				<Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
					Tambah Data
				</Button>
			</div>

			<Table rowKey="id" loading={isLoading} columns={columns} dataSource={data} />

			<Modal
				title={editing ? "Edit Galeri Umum" : "Tambah Galeri Umum"}
				open={open}
				onCancel={resetModalState}
				onOk={() => void onSubmit()}
				destroyOnHidden
			>
				<Form form={form} layout="vertical" initialValues={{ type: "umum", sort_order: 0 }}>
					<Form.Item label="Sumber Gambar">
						<Radio.Group
							value={sourceType}
							onChange={(event) => {
								const nextSource = event.target.value as ImageSourceType;
								setSourceType(nextSource);
							}}
						>
							<Radio.Button value="upload">Upload Lokal</Radio.Button>
							<Radio.Button value="url">URL Gambar</Radio.Button>
						</Radio.Group>
					</Form.Item>

					{sourceType === "upload" ? (
						<Form.Item label="Upload Gambar">
							<ImageUpload value={imageFile} onChange={setImageFile} previewUrl={editing?.image} />
						</Form.Item>
					) : (
						<Form.Item
							label="URL Gambar"
							required
							validateStatus={imageUrl && !safePreviewUrl ? "error" : ""}
							help={imageUrl && !safePreviewUrl ? "Gunakan URL http(s) yang valid" : undefined}
						>
							<Input
								value={imageUrl}
								onChange={(event) => setImageUrl(event.target.value)}
								placeholder="https://domain.com/image.jpg"
							/>
							{safePreviewUrl ? (
								<div className="mt-3 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
									<img src={safePreviewUrl} alt="Preview URL" className="h-44 w-full object-cover" />
								</div>
							) : null}
						</Form.Item>
					)}

					<Form.Item label="Caption" name="caption">
						<Input.TextArea rows={3} />
					</Form.Item>

					<Form.Item
						label="Tipe"
						name="type"
						rules={[{ required: true, message: "Tipe wajib dipilih" }]}
					>
						<Select options={galleryTypeOptions} />
					</Form.Item>

					<Form.Item label="Urutan" name="sort_order">
						<InputNumber className="w-full" min={0} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
