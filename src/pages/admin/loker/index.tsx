import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
	Button,
	Form,
	Image,
	Input,
	InputNumber,
	Modal,
	Popconfirm,
	Radio,
	Select,
	Space,
	Switch,
	Table,
	Tag,
	message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createJob, deleteJob, getJobs, updateJob } from "@/api/jobs.api";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { MetronicPage } from "@/components/admin/MetronicPage";
import type { Job } from "@/types/database.types";
import { resolveImageUrl, sanitizeUrl } from "@/utils/format";
import { useThemeStore } from "@/store/themeStore";

type ImageSourceType = "upload" | "url";

type JobFormValues = {
	title: string;
	description: string;
	requirements?: string;
	benefits?: string;
	type: Job["type"];
	salary_min?: number;
	salary_max?: number;
	show_salary: boolean;
	is_open: boolean;
	whatsapp_apply?: string;
};

const imageExtensionByType: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
	"image/gif": "gif",
	"image/svg+xml": "svg",
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
	return new File([blob], `job-${Date.now()}.${ext}`, { type: blob.type });
}

export default function LokerAdminPage() {
	const { mode } = useThemeStore();
	const [form] = Form.useForm<JobFormValues>();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Job | null>(null);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [sourceType, setSourceType] = useState<ImageSourceType>("upload");
	const [imageUrl, setImageUrl] = useState("");
	const queryClient = useQueryClient();

	const isDark = mode === "dark";
	const safePreviewUrl = sanitizeUrl(imageUrl);

	const { data: jobs = [], isLoading } = useQuery({
		queryKey: ["admin-jobs"],
		queryFn: () => getJobs(),
	});

	const openCreateModal = () => {
		setEditing(null);
		setImageFile(null);
		setSourceType("upload");
		setImageUrl("");
		form.resetFields();
		form.setFieldsValue({
			type: "full-time",
			is_open: true,
			show_salary: false,
		});
		setOpen(true);
	};

	const openEditModal = (record: Job) => {
		setEditing(record);
		setImageFile(null);
		setSourceType("upload");
		setImageUrl(sanitizeUrl(record.image) ?? "");
		form.resetFields();
		form.setFieldsValue({
			title: record.title,
			description: record.description,
			requirements: record.requirements,
			benefits: record.benefits,
			type: record.type,
			salary_min: record.salary_min,
			salary_max: record.salary_max,
			show_salary: record.show_salary,
			is_open: record.is_open,
			whatsapp_apply: record.whatsapp_apply,
		});
		setOpen(true);
	};

	const handleCloseModal = () => {
		setOpen(false);
		setEditing(null);
		setImageFile(null);
		setSourceType("upload");
		setImageUrl("");
		form.resetFields();
	};

	const appendBaseFields = (formData: FormData, values: JobFormValues): void => {
		formData.append("title", values.title);
		formData.append("description", values.description || "");
		formData.append("requirements", values.requirements || "");
		formData.append("benefits", values.benefits || "");
		formData.append("type", values.type);
		formData.append("salary_min", String(values.salary_min ?? ""));
		formData.append("salary_max", String(values.salary_max ?? ""));
		formData.append("show_salary", values.show_salary ? "true" : "false");
		formData.append("is_open", values.is_open ? "true" : "false");
		formData.append("whatsapp_apply", values.whatsapp_apply || "");
	};

	const buildPayload = async (): Promise<Partial<Job> | FormData> => {
		const values = await form.validateFields();

		if (sourceType === "upload" && imageFile) {
			const formData = new FormData();
			appendBaseFields(formData, values);
			formData.append("image", imageFile);
			return formData;
		}

		if (sourceType === "url") {
			const safeUrl = sanitizeUrl(imageUrl);
			if (!safeUrl) {
				throw new Error("URL gambar tidak valid");
			}
			const fileFromUrl = await downloadImageAsFile(safeUrl);
			const formData = new FormData();
			appendBaseFields(formData, values);
			formData.append("image", fileFromUrl);
			return formData;
		}

		return {
			title: values.title,
			description: values.description,
			requirements: values.requirements,
			benefits: values.benefits,
			type: values.type,
			salary_min: values.salary_min,
			salary_max: values.salary_max,
			show_salary: values.show_salary,
			is_open: values.is_open,
			whatsapp_apply: values.whatsapp_apply,
		};
	};

	const onSubmit = async (): Promise<void> => {
		try {
			const payload = await buildPayload();

			if (editing) {
				await updateJob(editing.id, payload);
				message.success("Lowongan berhasil diperbarui");
			} else {
				await createJob(payload);
				message.success("Lowongan berhasil dibuat");
			}

			handleCloseModal();
			await queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
		} catch (error) {
			message.error(error instanceof Error ? error.message : "Gagal menyimpan lowongan");
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await deleteJob(id);
			message.success("Lowongan dihapus");
			await queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
		} catch {
			message.error("Gagal menghapus lowongan");
		}
	};

	const columns: ColumnsType<Job> = [
		{ title: "Posisi", dataIndex: "title" },
		{ title: "Tipe", dataIndex: "type" },
		{
			title: "Gambar",
			dataIndex: "image",
			width: 100,
			render: (image: string, record) =>
				image ? (
					<img
						src={resolveImageUrl(image, record.title)}
						alt={record.title}
						className="h-12 w-20 rounded object-cover"
					/>
				) : (
					<span style={{ color: "var(--text-muted)" }}>-</span>
				),
		},
		{
			title: "Terbuka",
			dataIndex: "is_open",
			render: (value: boolean) => (
				<Tag color={value ? "green" : "red"}>{value ? "Aktif" : "Tutup"}</Tag>
			),
		},
		{
			title: "Gaji",
			render: (_, record) => {
				if (!record.show_salary) return "-";
				const min = record.salary_min ? `Rp ${record.salary_min.toLocaleString("id-ID")}` : "-";
				const max = record.salary_max ? `Rp ${record.salary_max.toLocaleString("id-ID")}` : "-";
				return `${min} - ${max}`;
			},
		},
		{
			title: "Aksi",
			width: 150,
			render: (_, record) => (
				<Space>
					<Button
						type="text"
						icon={<EditOutlined />}
						className="action-btn action-btn-edit"
						onClick={() => openEditModal(record)}
					>
						Edit
					</Button>
					<Popconfirm
						title="Hapus lowongan ini?"
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
			title="Lowongan Kerja"
			subtitle="Kelola lowongan kerja dan karir"
			actionLabel="Tambah Loker"
			onAction={openCreateModal}
		>
			<div className="card">
				<div className="table-container">
					<Table
						rowKey="id"
						columns={columns}
						dataSource={jobs}
						loading={isLoading}
						pagination={{ pageSize: 10, showSizeChanger: false }}
					/>
				</div>
			</div>

			<Modal
				title={editing ? "Edit Lowongan" : "Tambah Lowongan Baru"}
				open={open}
				onCancel={handleCloseModal}
				onOk={() => void onSubmit()}
				okText={editing ? "Simpan Perubahan" : "Simpan"}
				cancelText="Batal"
				destroyOnClose
				width={700}
				className="metronic-modal"
			>
				<Form
					form={form}
					layout="vertical"
					autoComplete="off"
					initialValues={{ type: "full-time", is_open: true, show_salary: false }}
				>
					<Form.Item label="Sumber Gambar">
						<Radio.Group value={sourceType} onChange={(event) => setSourceType(event.target.value as ImageSourceType)}>
							<Radio.Button value="upload">Upload Lokal</Radio.Button>
							<Radio.Button value="url">URL Gambar</Radio.Button>
						</Radio.Group>
					</Form.Item>

					<Form.Item label="Poster / Gambar Lowongan">
						{sourceType === "upload" ? (
							<>
								<ImageUpload
									value={imageFile}
									onChange={setImageFile}
									previewUrl={editing?.image ? resolveImageUrl(editing.image, editing.title) : undefined}
								/>
								<p className="mt-2 text-xs text-gray-500">Tips: ukuran gambar 1200x630px untuk tampilan terbaik.</p>
							</>
						) : (
							<div className="space-y-3">
								<Input
									value={imageUrl}
									onChange={(event) => setImageUrl(event.target.value)}
									placeholder="https://domain.com/poster-loker.jpg"
									className="form-input"
								/>
								{safePreviewUrl ? (
									<div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
										<img src={safePreviewUrl} alt="Preview URL" className="h-44 w-full object-cover" />
									</div>
								) : null}
							</div>
						)}
					</Form.Item>

					<Form.Item label="Judul Posisi" name="title" rules={[{ required: true, message: "Judul wajib diisi" }]}>
						<Input placeholder="Contoh: Staff Laundry, Kasir, Admin" className="form-input" />
					</Form.Item>

					<div className="form-grid">
						<Form.Item label="Tipe Pekerjaan" name="type" rules={[{ required: true }]}>
							<Select
								className="form-input"
								options={[
									{ value: "full-time", label: "Full Time" },
									{ value: "part-time", label: "Part Time" },
									{ value: "freelance", label: "Freelance" },
									{ value: "magang", label: "Magang" },
								]}
							/>
						</Form.Item>

						<Form.Item label="WhatsApp Lamaran" name="whatsapp_apply">
							<Input placeholder="6281234567890" className="form-input" />
						</Form.Item>
					</div>

					<Form.Item label="Deskripsi Pekerjaan" name="description" rules={[{ required: true, message: "Deskripsi wajib diisi" }]}>
						<Input.TextArea rows={4} placeholder="Jelaskan tugas dan tanggung jawab pekerjaan..." className="form-input" />
					</Form.Item>

					<Form.Item label="Kualifikasi / Requirements" name="requirements">
						<Input.TextArea rows={3} placeholder="Syarat-syarat yang dibutuhkan..." className="form-input" />
					</Form.Item>

					<Form.Item label="Benefit" name="benefits">
						<Input.TextArea rows={3} placeholder="Keuntungan yang didapat..." className="form-input" />
					</Form.Item>

					<div className="form-grid">
						<Form.Item label="Gaji Minimum" name="salary_min">
							<InputNumber className="form-input w-full" min={0} placeholder="5000000" />
						</Form.Item>

						<Form.Item label="Gaji Maksimum" name="salary_max">
							<InputNumber className="form-input w-full" min={0} placeholder="8000000" />
						</Form.Item>
					</div>

					<div className="form-grid">
						<Form.Item label="Tampilkan Gaji" name="show_salary" valuePropName="checked">
							<Switch checkedChildren="Ya" unCheckedChildren="Tidak" />
						</Form.Item>

						<Form.Item label="Lowongan Aktif" name="is_open" valuePropName="checked">
							<Switch checkedChildren="Buka" unCheckedChildren="Tutup" />
						</Form.Item>
					</div>
				</Form>
			</Modal>
		</MetronicPage>
	);
}
