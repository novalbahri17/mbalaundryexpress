import { CheckOutlined, CloseOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Rate, Select, Space, Table, Tabs, message } from "antd";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { approveTestimonial, createTestimonial, deleteTestimonial, getTestimonials, rejectTestimonial, updateTestimonial } from "@/api/testimonials.api";
import type { Testimonial } from "@/types/database.types";

export default function TestimoniAdminPage() {
	const [form] = Form.useForm();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Testimonial | null>(null);
	const [tab, setTab] = useState("pending");
	const queryClient = useQueryClient();

	const { data: testimonials = [], isLoading } = useQuery({ queryKey: ["admin-testimonials"], queryFn: () => getTestimonials({ limit: 500 }) });

	const filtered = useMemo(() => {
		if (tab === "approved") return testimonials.filter((item) => item.is_approved);
		if (tab === "rejected") return testimonials.filter((item) => !item.is_approved && item.comment.startsWith("[REJECTED]"));
		return testimonials.filter((item) => !item.is_approved && !item.comment.startsWith("[REJECTED]"));
	}, [tab, testimonials]);

	const columns = [
		{ title: "Nama", dataIndex: "customer_name" },
		{ title: "Rating", dataIndex: "rating", render: (value: number) => <Rate disabled value={value} /> },
		{ title: "Komentar", dataIndex: "comment", render: (value: string) => value.replace("[REJECTED]", "").trim() },
		{ title: "Sumber", dataIndex: "source" },
		{
			title: "Aksi",
			render: (_: unknown, record: Testimonial) => (
				<Space>
					<Button type="link" icon={<CheckOutlined />} onClick={async () => {
						await approveTestimonial(record.id);
						if (record.comment.startsWith("[REJECTED]")) {
							await updateTestimonial(record.id, { comment: record.comment.replace("[REJECTED]", "").trim() });
						}
						await queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
					}}>Approve</Button>
					<Button type="link" danger icon={<CloseOutlined />} onClick={async () => {
						await rejectTestimonial(record.id);
						if (!record.comment.startsWith("[REJECTED]")) {
							await updateTestimonial(record.id, { comment: `[REJECTED] ${record.comment}` });
						}
						await queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
					}}>Tolak</Button>
					<Button type="link" onClick={() => {
						setEditing(record);
						form.setFieldsValue(record);
						setOpen(true);
					}}>Edit</Button>
					<Button type="link" danger icon={<DeleteOutlined />} onClick={async () => {
						await deleteTestimonial(record.id);
						message.success("Testimoni dihapus");
						await queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
					}}>Delete</Button>
				</Space>
			),
		},
	];

	const submit = async (): Promise<void> => {
		const values = await form.validateFields();
		if (editing) {
			await updateTestimonial(editing.id, values);
			message.success("Testimoni diperbarui");
		} else {
			await createTestimonial({ ...values, source: values.source ?? "manual", is_approved: false });
			message.success("Testimoni ditambahkan");
		}
		setOpen(false);
		setEditing(null);
		form.resetFields();
		await queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold">Manage Testimoni</h1>
				<Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>Tambah Manual</Button>
			</div>
			<Tabs
				activeKey={tab}
				onChange={setTab}
				items={[
					{ key: "pending", label: "Menunggu Approve" },
					{ key: "approved", label: "Approved" },
					{ key: "rejected", label: "Ditolak" },
				]}
			/>
			<Table rowKey="id" loading={isLoading} columns={columns} dataSource={filtered} />
			<Modal open={open} title={editing ? "Edit Testimoni" : "Tambah Testimoni"} onCancel={() => setOpen(false)} onOk={() => void submit()} destroyOnHidden>
				<Form form={form} layout="vertical" initialValues={{ rating: 5, source: "manual" }}>
					<Form.Item label="Nama Pelanggan" name="customer_name" rules={[{ required: true }]}><Input /></Form.Item>
					<Form.Item label="Rating" name="rating" rules={[{ required: true }]}><Rate /></Form.Item>
					<Form.Item label="Komentar" name="comment" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
					<Form.Item label="Photo URL" name="photo"><Input /></Form.Item>
					<Form.Item label="Source" name="source"><Select options={["website", "google", "instagram", "manual"].map((value) => ({ label: value, value }))} /></Form.Item>
				</Form>
			</Modal>
		</div>
	);
}

