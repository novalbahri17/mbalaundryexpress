import {
	CheckOutlined,
	CloseOutlined,
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	StarOutlined,
} from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Modal, message, Rate, Select, Space, Table, Tabs } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import {
	approveTestimonial,
	createTestimonial,
	deleteTestimonial,
	getTestimonials,
	rejectTestimonial,
	updateTestimonial,
} from "@/api/testimonials.api";
import { MetronicPage } from "@/components/admin/MetronicPage";
import { TableEmptyState, TableErrorState } from "@/components/admin/QueryState";
import { useThemeStore } from "@/store/themeStore";
import type { Testimonial } from "@/types/database.types";

export default function TestimoniAdminPage() {
	const { mode } = useThemeStore();
	const [form] = Form.useForm();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Testimonial | null>(null);

	const isDark = mode === "dark";
	const [tab, setTab] = useState("pending");
	const queryClient = useQueryClient();

	const {
		data: testimonials = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["admin-testimonials"],
		queryFn: () => getTestimonials({ limit: 500 }),
	});

	const filtered = useMemo(() => {
		if (tab === "approved") return testimonials.filter((item) => item.is_approved);
		if (tab === "rejected")
			return testimonials.filter((item) => !item.is_approved && item.comment.startsWith("[REJECTED]"));
		return testimonials.filter((item) => !item.is_approved && !item.comment.startsWith("[REJECTED]"));
	}, [tab, testimonials]);

	const handleApprove = async (record: Testimonial) => {
		await approveTestimonial(record.id);
		if (record.comment.startsWith("[REJECTED]")) {
			await updateTestimonial(record.id, { comment: record.comment.replace("[REJECTED]", "").trim() });
		}
		await queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
		message.success("Testimoni berhasil diapprove");
	};

	const handleReject = async (record: Testimonial) => {
		await rejectTestimonial(record.id);
		if (!record.comment.startsWith("[REJECTED]")) {
			await updateTestimonial(record.id, { comment: `[REJECTED] ${record.comment}` });
		}
		await queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
		message.success("Testimoni ditolak");
	};

	const handleDelete = async (id: string) => {
		await deleteTestimonial(id);
		message.success("Testimoni dihapus");
		await queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
	};

	const handleEdit = (record: Testimonial) => {
		setEditing(record);
		form.setFieldsValue({
			...record,
			comment: record.comment.replace("[REJECTED]", "").trim(),
		});
		setOpen(true);
	};

	const handleSubmit = async () => {
		const values = await form.validateFields();
		if (editing) {
			await updateTestimonial(editing.id, values);
			message.success("Testimoni berhasil diperbarui");
		} else {
			await createTestimonial({ ...values, source: values.source ?? "manual", is_approved: false });
			message.success("Testimoni berhasil dibuat");
		}
		setOpen(false);
		setEditing(null);
		form.resetFields();
		await queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
	};

	const columns: ColumnsType<Testimonial> = [
		{
			title: "Nama",
			dataIndex: "customer_name",
			render: (text: string) => <span className="font-medium">{text}</span>,
		},
		{
			title: "Rating",
			dataIndex: "rating",
			render: (value: number) => <Rate disabled value={value} />,
		},
		{
			title: "Komentar",
			dataIndex: "comment",
			render: (value: string) => (
				<span className="max-w-xs truncate block" style={{ color: "var(--text-secondary)" }}>
					{value.replace("[REJECTED]", "").trim()}
				</span>
			),
		},
		{ title: "Sumber", dataIndex: "source" },
		{
			title: "Aksi",
			width: 200,
			render: (_, record) => (
				<Space>
					{!record.is_approved && !tab === "pending" && (
						<Button
							type="text"
							icon={<CheckOutlined />}
							className="action-btn bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
							onClick={() => handleApprove(record)}
						>
							Approve
						</Button>
					)}
					{!record.comment.startsWith("[REJECTED]") && (
						<Button
							type="text"
							icon={<CloseOutlined />}
							className="action-btn bg-amber-50 text-amber-600 hover:bg-amber-100"
							onClick={() => handleReject(record)}
						>
							Tolak
						</Button>
					)}
					<Button
						type="text"
						icon={<EditOutlined />}
						className="action-btn action-btn-edit"
						onClick={() => handleEdit(record)}
					>
						Edit
					</Button>
					<Button
						type="text"
						danger
						icon={<DeleteOutlined />}
						className="action-btn action-btn-delete"
						onClick={() => handleDelete(record.id)}
					>
						Hapus
					</Button>
				</Space>
			),
		},
	];

	return (
		<MetronicPage
			title="Testimoni"
			subtitle="Kelola testimoni dan review pelanggan"
			actionLabel="Tambah Testimoni"
			onAction={() => {
				setEditing(null);
				form.resetFields();
				setOpen(true);
			}}
		>
			<div className="card">
				<div className="card-header" style={{ padding: 0, border: "none" }}>
					<Tabs
						activeKey={tab}
						onChange={setTab}
						className="px-5 pt-4"
						items={[
							{ key: "pending", label: "Menunggu Approve" },
							{ key: "approved", label: "Approved" },
							{ key: "rejected", label: "Ditolak" },
						]}
					/>
				</div>
				<div className="table-container">
					{isError ? (
						<TableErrorState title="Gagal memuat testimoni" error={error} onRetry={() => void refetch()} />
					) : (
						<Table
							rowKey="id"
							loading={isLoading}
							columns={columns}
							dataSource={filtered}
							pagination={{ pageSize: 10, showSizeChanger: false }}
							locale={{
								emptyText: (
									<TableEmptyState
										title="Belum ada testimoni."
										hint="Testimoni yang diisi pelanggan akan muncul di sini untuk disetujui."
									/>
								),
							}}
						/>
					)}
				</div>
			</div>

			<Modal
				title={editing ? "Edit Testimoni" : "Tambah Testimoni"}
				open={open}
				onCancel={() => {
					setOpen(false);
					setEditing(null);
					form.resetFields();
				}}
				onOk={handleSubmit}
				okText={editing ? "Simpan" : "Buat"}
				cancelText="Batal"
				width={600}
				className="metronic-modal"
			>
				<Form form={form} layout="vertical">
					<Form.Item label="Nama Pelanggan" name="customer_name" rules={[{ required: true }]}>
						<Input className="form-input" />
					</Form.Item>

					<Form.Item label="Rating" name="rating" rules={[{ required: true }]}>
						<Rate />
					</Form.Item>

					<Form.Item label="Komentar" name="comment" rules={[{ required: true }]}>
						<Input.TextArea rows={4} className="form-input" />
					</Form.Item>

					<div className="form-grid">
						<Form.Item label="Photo URL" name="photo">
							<Input className="form-input" placeholder="https://..." />
						</Form.Item>

						<Form.Item label="Sumber" name="source">
							<Select
								options={["website", "google", "instagram", "manual"].map((value) => ({
									label: value,
									value,
								}))}
							/>
						</Form.Item>
					</div>
				</Form>
			</Modal>
		</MetronicPage>
	);
}
