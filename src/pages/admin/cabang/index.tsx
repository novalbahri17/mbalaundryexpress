import {
	EditOutlined,
	PlusOutlined,
	DeleteOutlined,
	EyeOutlined,
	ClockCircleOutlined,
	AppstoreOutlined,
	PictureOutlined,
} from "@ant-design/icons";
import {
	Button,
	Form,
	Input,
	InputNumber,
	Modal,
	Popconfirm,
	Select,
	Space,
	Switch,
	Table,
	Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createBranch, deleteBranch, getBranches, updateBranch } from "@/api/branches.api";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { Branch } from "@/types/database.types";
import { resolveImageUrl } from "@/utils/format";
import { slugify } from "@/utils/slug";
import { validateEmail, validatePhone } from "@/utils/validation";

type BranchFormValues = {
	name: string;
	slug: string;
	address: string;
	maps_url?: string;
	maps_embed?: string;
	whatsapp?: string;
	email?: string;
	description?: string;
	price_wash: number;
	price_dry: number;
	sort_order: number;
	status: Branch["status"];
	is_active: boolean;
};

const statusOptions: Array<{ value: Branch["status"]; label: string }> = [
	{ value: "buka", label: "Buka" },
	{ value: "ramai", label: "Ramai" },
	{ value: "tutup", label: "Tutup" },
];

function statusTag(status: Branch["status"]) {
	if (status === "buka") return <Tag color="green">Buka</Tag>;
	if (status === "ramai") return <Tag color="gold">Ramai</Tag>;
	return <Tag color="red">Tutup</Tag>;
}

export default function CabangAdminPage() {
	const [form] = Form.useForm<BranchFormValues>();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Branch | null>(null);
	const [coverFile, setCoverFile] = useState<File | null>(null);
	const queryClient = useQueryClient();

	const { data: branchRes, isLoading } = useQuery({
		queryKey: ["admin-branches"],
		queryFn: () => getBranches({ activeOnly: false, perPage: 500 }),
	});

	const rows = branchRes?.items ?? [];

	const columns: ColumnsType<Branch> = [
		{
			title: "Cover",
			dataIndex: "cover_image",
			width: 100,
			render: (value: string | undefined, row) => (
				<img
					src={resolveImageUrl(value, row.name)}
					alt={row.name}
					className="h-12 w-20 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
				/>
			),
		},
		{ title: "Nama", dataIndex: "name" },
		{ title: "Slug", dataIndex: "slug" },
		{ title: "Status", dataIndex: "status", render: (value: Branch["status"]) => statusTag(value) },
		{
			title: "Harga",
			render: (_, record) => (
				<div className="text-xs">
					<div>Cuci: Rp {record.price_wash.toLocaleString("id-ID")}</div>
					<div>Kering: Rp {record.price_dry.toLocaleString("id-ID")}</div>
				</div>
			),
		},
		{
			title: "Aktif",
			dataIndex: "is_active",
			render: (value: boolean) => (value ? <Tag color="blue">Aktif</Tag> : <Tag>Tidak Aktif</Tag>),
		},
		{
			title: "Kelola Sub-Halaman",
			key: "manage",
			width: 340,
			render: (_, record) => (
				<div className="flex flex-wrap gap-2">
					<Link
						to={`/admin/cabang/${record.id}/jam`}
						className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition-all hover:-translate-y-px hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-brand-500/50 dark:hover:text-brand-400"
					>
						<ClockCircleOutlined />
						<span>Jam</span>
					</Link>
					<Link
						to={`/admin/cabang/${record.id}/fasilitas`}
						className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition-all hover:-translate-y-px hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-brand-500/50 dark:hover:text-brand-400"
					>
						<AppstoreOutlined />
						<span>Fasilitas</span>
					</Link>
					<Link
						to={`/admin/cabang/${record.id}/galeri`}
						className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition-all hover:-translate-y-px hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-brand-500/50 dark:hover:text-brand-400"
					>
						<PictureOutlined />
						<span>Galeri</span>
					</Link>
					<Link
						to={`/cabang/${record.slug}`}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition-all hover:-translate-y-px hover:border-blue-300 hover:bg-blue-100 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:border-blue-400/60 dark:hover:bg-blue-500/20"
					>
						<EyeOutlined />
						<span>Preview</span>
					</Link>
				</div>
			),
		},
		{
			title: "Aksi",
			key: "actions",
			render: (_, record) => (
				<Space>
					<Button
						type="link"
						icon={<EditOutlined />}
						onClick={() => {
							setEditing(record);
							setCoverFile(null);
							form.setFieldsValue({
								name: record.name,
								slug: record.slug,
								address: record.address,
								maps_url: record.maps_url,
								maps_embed: record.maps_embed,
								whatsapp: record.whatsapp,
								email: record.email,
								description: record.description,
								price_wash: record.price_wash,
								price_dry: record.price_dry,
								sort_order: record.sort_order,
								status: record.status,
								is_active: record.is_active,
							});
							setOpen(true);
						}}
					>
						Edit
					</Button>
					<Popconfirm
						title="Hapus cabang ini?"
						description="Data jam, fasilitas, galeri, dan relasi cabang akan ikut terhapus."
						okText="Hapus"
						cancelText="Batal"
						onConfirm={async () => {
							try {
								await deleteBranch(record.id);
								toast.success("Cabang berhasil dihapus.");
								await queryClient.invalidateQueries({ queryKey: ["admin-branches"] });
							} catch (error) {
								const text = error instanceof Error ? error.message : "Gagal menghapus cabang";
								toast.error(text);
							}
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

	const buildPayload = async (): Promise<Partial<Branch> | FormData> => {
		const values = await form.validateFields();
		const normalizedSlug = values.slug || slugify(values.name);

		if (!coverFile) {
			return {
				...values,
				slug: normalizedSlug,
			};
		}

		const formData = new FormData();
		formData.append("name", values.name);
		formData.append("slug", normalizedSlug);
		formData.append("address", values.address);
		formData.append("maps_url", values.maps_url ?? "");
		formData.append("maps_embed", values.maps_embed ?? "");
		formData.append("whatsapp", values.whatsapp ?? "");
		formData.append("email", values.email ?? "");
		formData.append("description", values.description ?? "");
		formData.append("price_wash", String(values.price_wash));
		formData.append("price_dry", String(values.price_dry));
		formData.append("sort_order", String(values.sort_order));
		formData.append("status", values.status);
		formData.append("is_active", values.is_active ? "true" : "false");
		formData.append("cover_image", coverFile);
		return formData;
	};

	const onSubmit = async (): Promise<void> => {
		try {
			const payload = await buildPayload();
			if (editing) {
				await updateBranch(editing.id, payload);
				toast.success("Cabang berhasil diperbarui.");
			} else {
				await createBranch(payload);
				toast.success("Cabang berhasil ditambahkan.");
			}
			setOpen(false);
			setEditing(null);
			setCoverFile(null);
			form.resetFields();
			await queryClient.invalidateQueries({ queryKey: ["admin-branches"] });
		} catch (error) {
			const text = error instanceof Error ? error.message : "Gagal menyimpan cabang";
			toast.error(text);
		}
	};

	return (
		<div className="admin-page-shell">
			<div className="admin-page-head">
				<div>
					<h1 className="admin-page-title">Cabang</h1>
					<p className="admin-page-subtitle">Kelola daftar cabang, harga, dan sub-halaman operasional.</p>
				</div>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					size="large"
					onClick={() => {
						setEditing(null);
						setCoverFile(null);
						form.resetFields();
						form.setFieldsValue({
							price_wash: 10000,
							price_dry: 10000,
							sort_order: 0,
							status: "buka",
							is_active: true,
						});
						setOpen(true);
					}}
				>
					Tambah Cabang
				</Button>
			</div>

			<div className="admin-page-body admin-data-table">
				<Table rowKey="id" loading={isLoading} columns={columns} dataSource={rows} pagination={{ pageSize: 10, showSizeChanger: false }} />
			</div>

			<Modal
				title={editing ? "Edit Cabang" : "Tambah Cabang"}
				open={open}
				className="admin-modal"
				onCancel={() => setOpen(false)}
				onOk={() => void onSubmit()}
				okText={editing ? "Simpan Perubahan" : "Buat Cabang"}
				cancelText="Batal"
				okButtonProps={{ className: "admin-soft-btn" }}
				cancelButtonProps={{ className: "admin-soft-btn" }}
				destroyOnHidden
				width={920}
			>
				<Form
					layout="vertical"
					form={form}
					initialValues={{ status: "buka", is_active: true, price_wash: 10000, price_dry: 10000, sort_order: 0 }}
				>
					<div className="grid gap-3 md:grid-cols-2">
						<Form.Item label="Nama Cabang" name="name" rules={[{ required: true, message: "Nama cabang wajib diisi" }]}>
							<Input
								onChange={(event) => {
									if (!editing) form.setFieldValue("slug", slugify(event.target.value));
								}}
							/>
						</Form.Item>
						<Form.Item label="Slug" name="slug" rules={[{ required: true, message: "Slug wajib diisi" }]}>
							<Input />
						</Form.Item>
					</div>

					<Form.Item label="Alamat" name="address" rules={[{ required: true, message: "Alamat wajib diisi" }]}>
						<Input.TextArea rows={2} />
					</Form.Item>

					<div className="grid gap-3 md:grid-cols-2">
						<Form.Item
							label="Maps URL"
							name="maps_url"
							rules={[
								{
									validator: (_, value: string | undefined) => {
										if (!value) return Promise.resolve();
										return /^https?:\/\//i.test(value)
											? Promise.resolve()
											: Promise.reject(new Error("Maps URL harus diawali http:// atau https://"));
									},
								},
							]}
						>
							<Input placeholder="https://maps.app.goo.gl/..." />
						</Form.Item>
						<Form.Item label="WhatsApp Cabang" name="whatsapp" rules={[{ validator: (_, value: string | undefined) => (!value || validatePhone(value) ? Promise.resolve() : Promise.reject(new Error("Format WA tidak valid"))) }]}>
							<Input placeholder="08xxxx / 628xxxx" />
						</Form.Item>
					</div>

					<Form.Item label="Maps Embed Iframe" name="maps_embed">
						<Input.TextArea rows={3} placeholder="<iframe ...></iframe>" />
					</Form.Item>

					<Form.Item label="Email Cabang" name="email" rules={[{ validator: (_, value: string | undefined) => (!value || validateEmail(value) ? Promise.resolve() : Promise.reject(new Error("Format email tidak valid"))) }]}>
						<Input type="email" />
					</Form.Item>

					<Form.Item label="Cover Cabang">
						<ImageUpload value={coverFile} onChange={setCoverFile} previewUrl={editing?.cover_image} />
					</Form.Item>

					<Form.Item label="Deskripsi Cabang" name="description">
						<RichTextEditor />
					</Form.Item>

					<div className="grid gap-3 md:grid-cols-3">
						<Form.Item label="Harga Cuci" name="price_wash" rules={[{ required: true }]}>
							<InputNumber className="w-full" min={0} step={500} />
						</Form.Item>
						<Form.Item label="Harga Kering" name="price_dry" rules={[{ required: true }]}>
							<InputNumber className="w-full" min={0} step={500} />
						</Form.Item>
						<Form.Item label="Sort Order" name="sort_order">
							<InputNumber className="w-full" min={0} />
						</Form.Item>
					</div>

					<div className="grid gap-3 md:grid-cols-2">
						<Form.Item label="Status Operasional" name="status" rules={[{ required: true }]}>
							<Select options={statusOptions} />
						</Form.Item>
						<Form.Item label="Cabang Aktif" name="is_active" valuePropName="checked">
							<Switch />
						</Form.Item>
					</div>
				</Form>
			</Modal>
		</div>
	);
}
