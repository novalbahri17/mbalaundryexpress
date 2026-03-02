import { Button, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteSubscriber, getSubscribers, unsubscribePromo } from "@/api/subscribers.api";
import type { Subscriber } from "@/types/database.types";

export default function SubscribersAdminPage() {
	const queryClient = useQueryClient();
	const { data: subscribers = [], isLoading } = useQuery({ queryKey: ["admin-subscribers"], queryFn: getSubscribers });

	const columns: ColumnsType<Subscriber> = [
		{ title: "Phone", dataIndex: "phone" },
		{ title: "Branch", dataIndex: "branch_id" },
		{ title: "Source", dataIndex: "source" },
		{ title: "Status", dataIndex: "is_active", render: (value: boolean) => (value ? <Tag color="green">Aktif</Tag> : <Tag>Nonaktif</Tag>) },
		{ title: "Created", dataIndex: "created" },
		{
			title: "Aksi",
			render: (_, record) => (
				<Space>
					<Button type="link" onClick={async () => {
						await unsubscribePromo(record.id);
						await queryClient.invalidateQueries({ queryKey: ["admin-subscribers"] });
					}}>Nonaktifkan</Button>
					<Button type="link" danger onClick={async () => {
						await deleteSubscriber(record.id);
						await queryClient.invalidateQueries({ queryKey: ["admin-subscribers"] });
					}}>Hapus</Button>
				</Space>
			),
		},
	];

	return (
		<div>
			<h1 className="mb-4 text-xl font-bold">Daftar Subscriber</h1>
			<Table rowKey="id" loading={isLoading} columns={columns} dataSource={subscribers} />
		</div>
	);
}

