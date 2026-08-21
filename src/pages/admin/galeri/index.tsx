import { DeleteOutlined, EditOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Popconfirm, Radio, Space, Table, message, Tabs } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createGallery, deleteGallery, getGallery, updateGallery } from "@/api/gallery.api";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { MultiImageUpload, type UploadingFile } from "@/components/admin/MultiImageUpload";
import { MetronicPage } from "@/components/admin/MetronicPage";
import type { BranchGallery } from "@/types/database.types";
import { resolveImageUrl, sanitizeUrl } from "@/utils/format";
import { useThemeStore } from "@/store/themeStore";

type ImageSourceType = "upload" | "url";

const imageExtensionByType: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
	"image/gif": "gif",
	"image/svg+xml": "svg",
};

async function downloadImageAsFile(url: string): Promise<File> {
	const response = await fetch(url);
	if (!response.ok) throw new Error("Gagal mengambil gambar dari URL");
	const blob = await response.blob();
	if (!blob.type.startsWith("image/")) throw new Error("URL tidak mengarah ke file gambar yang valid");
	const ext = imageExtensionByType[blob.type] ?? "jpg";
	return new File([blob], `gallery-${Date.now()}.${ext}`, { type: blob.type });
}

export default function GaleriAdminPage() {
	const { mode } = useThemeStore();
	const [form] = Form.useForm();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<BranchGallery | null>(null);
	const [sourceType, setSourceType] = useState<ImageSourceType>("upload");
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imageUrl, setImageUrl] = useState("");
	const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [activeTab, setActiveTab] = useState<"single" | "multiple">("single");

	const isDark = mode === "dark";
	const queryClient = useQueryClient();
	const safePreviewUrl = sanitizeUrl(imageUrl);

	const { data: gallery = [], isLoading } = useQuery({
		queryKey: ["admin-gallery"],
		queryFn: () => getGallery(),
	});

	const handleEdit = (record: BranchGallery) => {
		setEditing(record);
		setSourceType("upload");
		setImageFile(null);
		setImageUrl(sanitizeUrl(record.image) ?? "");
		form.setFieldsValue({ caption: record.caption });
		setOpen(true);
		setActiveTab("single");
	};

	const handleDelete = async (id: string) => {
		await deleteGallery(id);
		message.success("Gambar galeri dihapus");
		await queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
	};

	const resetModalState = () => {
		setOpen(false);
		setEditing(null);
		setSourceType("upload");
		setImageFile(null);
		setImageUrl("");
		setUploadingFiles([]);
		setActiveTab("single");
		form.resetFields();
	};

	const openCreateModal = () => {
		setEditing(null);
		setSourceType("upload");
		setImageFile(null);
		setImageUrl("");
		setUploadingFiles([]);
		form.resetFields();
		setOpen(true);
		setActiveTab("single");
	};

	const onSubmitSingle = async () => {
		const values = await form.validateFields();
		const caption = values.caption ?? "";
		let payload: Partial<BranchGallery> | FormData;

		if (sourceType === "upload") {
			if (imageFile) {
				const formData = new FormData();
				formData.append("image", imageFile);
				formData.append("caption", caption);
				payload = formData;
			} else if (editing) {
				payload = { caption };
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

	const onSubmitMultiple = async () => {
		if (uploadingFiles.length === 0) {
			message.error("Silakan pilih minimal 1 gambar");
			return;
		}

		const values = await form.validateFields();
		setIsUploading(true);

		try {
			const uploadPromises = uploadingFiles.map(async (fileData, index) => {
				const formData = new FormData();
				formData.append("image", fileData.file);
				formData.append("caption", values.caption ? `${values.caption} ${index + 1}` : "");
				await createGallery(formData);
			});

			await Promise.all(uploadPromises);
			message.success(`${uploadingFiles.length} gambar berhasil diupload`);
			resetModalState();
			await queryClient.invalidateQueries({ queryKey: ["admin-gallery"] });
		} catch (error) {
			message.error("Gagal upload beberapa gambar");
		} finally {
			setIsUploading(false);
		}
	};

	const onSubmit = async () => {
		if (activeTab === "multiple" && !editing) {
			await onSubmitMultiple();
		} else {
			await onSubmitSingle();
		}
	};

	const columns: ColumnsType<BranchGallery> = [
		{
			title: "Gambar",
			dataIndex: "image",
			width: 100,
			render: (value: string, row) => (
				<img
					src={resolveImageUrl(value, row.caption || "Galeri")}
					alt={row.caption || "galeri"}
					className="h-14 w-24 rounded-lg object-cover"
				/>
			),
		},
		{ title: "Caption", dataIndex: "caption", render: (value?: string) => value || "-" },
		{
			title: "Aksi",
			width: 150,
			render: (_, record) => (
				<Space>
					<Button
						type="text"
						icon={<EditOutlined />}
						className="action-btn action-btn-edit"
						onClick={() => handleEdit(record)}
					>
						Edit
					</Button>
					<Popconfirm
						title="Hapus gambar ini?"
						onConfirm={() => handleDelete(record.id)}
						okText="Hapus"
						cancelText="Batal"
					>
						<Button type="text" danger icon={<DeleteOutlined />} className="action-btn action-btn-delete">
							Hapus
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<MetronicPage
			title="Galeri"
			subtitle="Kelola foto galeri umum"
			actionLabel="Tambah Gambar"
			onAction={openCreateModal}
		>
			<div className="card">
				<div className="table-container">
					<Table
						rowKey="id"
						loading={isLoading}
						columns={columns}
						dataSource={gallery}
						pagination={{ pageSize: 10, showSizeChanger: false }}
					/>
				</div>
			</div>

			<Modal
				title={editing ? "Edit Galeri" : "Tambah Galeri"}
				open={open}
				onCancel={resetModalState}
				onOk={onSubmit}
				okText={activeTab === "multiple" ? `Upload ${uploadingFiles.length} Gambar` : "Simpan"}
				cancelText="Batal"
				width={800}
				confirmLoading={isUploading}
				okButtonProps={{ disabled: activeTab === "multiple" && uploadingFiles.length === 0 }}
				className="metronic-modal"
			>
				{!editing ? (
					<Tabs
						activeKey={activeTab}
						onChange={(key) => setActiveTab(key as "single" | "multiple")}
						className="mb-4"
						items={[
							{ key: "single", label: "Single Upload" },
							{
								key: "multiple",
								label: (
									<span>
										<UploadOutlined /> Multiple Upload
									</span>
								),
							},
						]}
					/>
				) : null}

				{activeTab === "single" || editing ? (
					<SingleUploadForm
						form={form}
						sourceType={sourceType}
						setSourceType={setSourceType}
						imageFile={imageFile}
						setImageFile={setImageFile}
						imageUrl={imageUrl}
						setImageUrl={setImageUrl}
						safePreviewUrl={safePreviewUrl ?? null}
						editing={editing}
					/>
				) : (
					<MultipleUploadForm form={form} uploadingFiles={uploadingFiles} setUploadingFiles={setUploadingFiles} />
				)}
			</Modal>
		</MetronicPage>
	);
}

interface SingleUploadFormProps {
	form: ReturnType<typeof Form.useForm>[0];
	sourceType: ImageSourceType;
	setSourceType: (type: ImageSourceType) => void;
	imageFile: File | null;
	setImageFile: (file: File | null) => void;
	imageUrl: string;
	setImageUrl: (url: string) => void;
	safePreviewUrl: string | null;
	editing?: BranchGallery | null;
}

function SingleUploadForm({
	form,
	sourceType,
	setSourceType,
	imageFile,
	setImageFile,
	imageUrl,
	setImageUrl,
	safePreviewUrl,
	editing,
}: SingleUploadFormProps) {
	return (
		<Form form={form} layout="vertical">
			<Form.Item label="Sumber Gambar">
				<Radio.Group value={sourceType} onChange={(e) => setSourceType(e.target.value as ImageSourceType)}>
					<Radio.Button value="upload">Upload Lokal</Radio.Button>
					<Radio.Button value="url">URL Gambar</Radio.Button>
				</Radio.Group>
			</Form.Item>

			{sourceType === "upload" ? (
				<Form.Item label="Upload Gambar">
					<ImageUpload value={imageFile} onChange={setImageFile} previewUrl={editing?.image} />
				</Form.Item>
			) : (
				<Form.Item label="URL Gambar" validateStatus={imageUrl && !safePreviewUrl ? "error" : ""}>
					<Input
						value={imageUrl}
						onChange={(e) => setImageUrl(e.target.value)}
						placeholder="https://domain.com/image.jpg"
						className="form-input"
					/>
					{safePreviewUrl ? (
						<div className="mt-3 overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
							<img src={safePreviewUrl} alt="Preview" className="h-44 w-full object-cover" />
						</div>
					) : null}
				</Form.Item>
			)}

			<Form.Item label="Caption" name="caption">
				<Input.TextArea rows={3} className="form-input" />
			</Form.Item>
		</Form>
	);
}

interface MultipleUploadFormProps {
	form: ReturnType<typeof Form.useForm>[0];
	uploadingFiles: UploadingFile[];
	setUploadingFiles: React.Dispatch<React.SetStateAction<UploadingFile[]>>;
}

function MultipleUploadForm({ form, uploadingFiles, setUploadingFiles }: MultipleUploadFormProps) {
	return (
		<Form form={form} layout="vertical">
			<div className="p-3 rounded-lg mb-4" style={{ backgroundColor: "var(--info-bg)" }}>
				<p className="text-sm" style={{ color: "var(--info)" }}>
					Tips: Gambar akan otomatis dikompres ke format WebP untuk optimasi performa. Caption akan ditambahkan nomor
					urut.
				</p>
			</div>

			<Form.Item label="Upload Banyak Gambar" required>
				<MultiImageUpload uploadingFiles={uploadingFiles} setUploadingFiles={setUploadingFiles} maxFiles={20} />
			</Form.Item>

			<Form.Item label="Caption Dasar" name="caption">
				<Input.TextArea rows={2} placeholder="Contoh: 'Foto Laundry' akan menjadi 'Foto Laundry 1', dst" className="form-input" />
			</Form.Item>
		</Form>
	);
}
