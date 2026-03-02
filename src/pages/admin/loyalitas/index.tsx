import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import { CrudManager } from "@/components/admin/CrudManager";
import { createLoyaltyMember, deleteLoyaltyMember, getLoyaltyMembers, getLoyaltyTransactions, updateLoyaltyMember } from "@/api/loyalty.api";
import type { LoyaltyMember, LoyaltyTransaction } from "@/types/database.types";

const memberColumns: ColumnsType<LoyaltyMember> = [
	{ title: "Nama", dataIndex: "name" },
	{ title: "Phone", dataIndex: "phone" },
	{ title: "Poin", dataIndex: "points" },
	{ title: "Level", dataIndex: "level" },
	{ title: "Aktif", dataIndex: "is_active", render: (value: boolean) => (value ? "Ya" : "Tidak") },
];

const trxColumns: ColumnsType<LoyaltyTransaction> = [
	{ title: "Member ID", dataIndex: "member_id" },
	{ title: "Tipe", dataIndex: "type" },
	{ title: "Poin", dataIndex: "points" },
	{ title: "Deskripsi", dataIndex: "description" },
	{ title: "Waktu", dataIndex: "created" },
];

export default function LoyalitasAdminPage() {
	const { data: transactions = [], isLoading } = useQuery({ queryKey: ["admin-loyalty-transactions"], queryFn: () => getLoyaltyTransactions() });

	return (
		<div className="space-y-6">
			<CrudManager<LoyaltyMember>
				title="Kelola Member Loyalitas"
				queryKey="admin-loyalty-members"
				fetcher={getLoyaltyMembers}
				createItem={createLoyaltyMember}
				updateItem={updateLoyaltyMember}
				deleteItem={deleteLoyaltyMember}
				columns={memberColumns}
				fields={[
					{ name: "name", label: "Nama", type: "text", required: true },
					{ name: "phone", label: "Phone", type: "text", required: true },
					{ name: "email", label: "Email", type: "text" },
					{ name: "points", label: "Poin", type: "number", required: true },
					{ name: "level", label: "Level", type: "select", options: ["bronze", "silver", "gold", "platinum"].map((value) => ({ value, label: value })), required: true },
					{ name: "is_active", label: "Aktif", type: "switch" },
				]}
			/>

			<div>
				<h2 className="mb-3 text-lg font-bold">Riwayat Transaksi Poin</h2>
				<Table rowKey="id" loading={isLoading} dataSource={transactions} columns={trxColumns} />
			</div>
		</div>
	);
}



