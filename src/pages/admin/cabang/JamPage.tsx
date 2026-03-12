import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Modal, Popconfirm, Select, Space, Switch, Table, TimePicker, message } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteBranchHour, getBranchHours, saveBranchHour } from "@/api/branches.api";
import { BranchContextHeader } from "@/components/admin/BranchContextHeader";
import type { BranchHour, DayName } from "@/types/database.types";

const days: DayName[] = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"];

type JamFormValues = {
	day: DayName;
	open_time?: Dayjs;
	close_time?: Dayjs;
	is_closed: boolean;
};

export default function CabangJamPage() {
	const { id } = useParams();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<BranchHour | null>(null);
	const [form] = Form.useForm<JamFormValues>();
	const queryClient = useQueryClient();

	const { data = [], isLoading } = useQuery({
		queryKey: ["branch-hours", id],
		queryFn: () => getBranchHours(id ?? ""),
		enabled: Boolean(id),
	});

	const onSubmit = async (): Promise<void> => {
		if (!id) return;
		const values = await form.validateFields();
		const existingSameDay = data.find((item) => item.day === values.day);
		const targetId = editing?.id ?? existingSameDay?.id;

		await saveBranchHour({
			id: targetId,
			branch_id: id,
			day: values.day,
			open_time: values.open_time?.format("HH:mm:ss"),
			close_time: values.close_time?.format("HH:mm:ss"),
			is_closed: values.is_closed,
		} as Partial<BranchHour>);
		message.success("Jam operasional tersimpan");
		setOpen(false);
		setEditing(null);
		form.resetFields();
		await queryClient.invalidateQueries({ queryKey: ["branch-hours", id] });
	};

	return (
		<div className="space-y-4">
			<BranchContextHeader branchId={id} activeTab="jam" />

			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold">Kelola Jam Operasional</h1>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => {
						setEditing(null);
						form.setFieldsValue({
							day: "senin",
							open_time: dayjs("07:00", "HH:mm"),
							close_time: dayjs("23:00", "HH:mm"),
							is_closed: false,
						});
						setOpen(true);
					}}
				>
					Tambah Jadwal
				</Button>
			</div>

			<Table
				rowKey="id"
				loading={isLoading}
				dataSource={data}
				columns={[
					{
						title: "Hari",
						dataIndex: "day",
						render: (value: DayName) => value.charAt(0).toUpperCase() + value.slice(1),
					},
					{ title: "Buka", dataIndex: "open_time", render: (value?: string) => value?.slice(0, 5) ?? "-" },
					{ title: "Tutup", dataIndex: "close_time", render: (value?: string) => value?.slice(0, 5) ?? "-" },
					{ title: "Status", dataIndex: "is_closed", render: (value: boolean) => (value ? "Tutup" : "Buka") },
					{
						title: "Aksi",
						render: (_, record: BranchHour) => (
							<Space>
								<Button
									type="link"
									icon={<EditOutlined />}
									onClick={() => {
										setEditing(record);
										form.setFieldsValue({
											day: record.day,
											open_time: record.open_time ? dayjs(record.open_time, "HH:mm:ss") : undefined,
											close_time: record.close_time ? dayjs(record.close_time, "HH:mm:ss") : undefined,
											is_closed: record.is_closed,
										});
										setOpen(true);
									}}
								>
									Edit
								</Button>
								<Popconfirm
									title="Hapus jadwal ini?"
									okText="Hapus"
									cancelText="Batal"
									onConfirm={async () => {
										await deleteBranchHour(record.id);
										message.success("Jadwal dihapus");
										await queryClient.invalidateQueries({ queryKey: ["branch-hours", id] });
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
				title={editing ? "Edit Jadwal" : "Tambah Jadwal"}
				open={open}
				onCancel={() => setOpen(false)}
				onOk={() => void onSubmit()}
				destroyOnClose
			>
				<Form layout="vertical" form={form} initialValues={{ day: "senin", is_closed: false }}>
					<Form.Item label="Hari" name="day" rules={[{ required: true }]}>
						<Select options={days.map((day) => ({ value: day, label: day.charAt(0).toUpperCase() + day.slice(1) }))} />
					</Form.Item>
					<Form.Item label="Jam Buka" name="open_time">
						<TimePicker className="w-full" format="HH:mm" />
					</Form.Item>
					<Form.Item label="Jam Tutup" name="close_time">
						<TimePicker className="w-full" format="HH:mm" />
					</Form.Item>
					<Form.Item label="Tutup (Libur)" name="is_closed" valuePropName="checked">
						<Switch />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
