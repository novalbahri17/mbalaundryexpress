import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import { CrudManager } from "@/components/admin/CrudManager";
import { createSpinReward, deleteSpinReward, getSpinPlays, getSpinRewards, updateSpinReward } from "@/api/spin.api";
import type { SpinPlay, SpinReward } from "@/types/database.types";

const rewardColumns: ColumnsType<SpinReward> = [
	{ title: "Nama", dataIndex: "name" },
	{ title: "Tipe", dataIndex: "reward_type" },
	{ title: "Probabilitas", dataIndex: "probability" },
	{ title: "Aktif", dataIndex: "is_active", render: (value: boolean) => (value ? "Ya" : "Tidak") },
];

const playColumns: ColumnsType<SpinPlay> = [
	{ title: "Phone", dataIndex: "phone" },
	{ title: "Winner", dataIndex: "is_winner", render: (value: boolean) => (value ? "Ya" : "Tidak") },
	{ title: "Played At", dataIndex: "played_at" },
];

export default function SpinAdminPage() {
	const { data: plays = [], isLoading } = useQuery({ queryKey: ["admin-spin-plays"], queryFn: getSpinPlays });

	return (
		<div className="space-y-6">
			<CrudManager<SpinReward>
				title="Kelola Spin & Menang"
				queryKey="admin-spin-rewards"
				fetcher={getSpinRewards}
				createItem={createSpinReward}
				updateItem={updateSpinReward}
				deleteItem={deleteSpinReward}
				columns={rewardColumns}
				fields={[
					{ name: "name", label: "Nama Reward", type: "text", required: true },
					{ name: "description", label: "Deskripsi", type: "textarea" },
					{ name: "reward_type", label: "Tipe Reward", type: "select", options: ["voucher", "diskon", "hadiah", "zonk"].map((value) => ({ value, label: value })), required: true },
					{ name: "reward_value", label: "Nilai Reward", type: "text" },
					{ name: "probability", label: "Probabilitas", type: "number", required: true },
					{ name: "stock", label: "Stok", type: "number" },
					{ name: "is_active", label: "Aktif", type: "switch" },
				]}
			/>

			<div>
				<h2 className="mb-3 text-lg font-bold">Riwayat Spin</h2>
				<Table rowKey="id" loading={isLoading} dataSource={plays} columns={playColumns} />
			</div>
		</div>
	);
}

