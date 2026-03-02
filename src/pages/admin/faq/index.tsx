import type { ColumnsType } from "antd/es/table";
import { CrudManager } from "@/components/admin/CrudManager";
import { createFaq, deleteFaq, getFaqs, updateFaq } from "@/api/faqs.api";
import type { Faq } from "@/types/database.types";

const columns: ColumnsType<Faq> = [
	{ title: "Pertanyaan", dataIndex: "question" },
	{ title: "Kategori", dataIndex: "category" },
	{ title: "Urutan", dataIndex: "sort_order" },
	{ title: "Aktif", dataIndex: "is_active", render: (value: boolean) => (value ? "Ya" : "Tidak") },
];

export default function FaqAdminPage() {
	return (
		<CrudManager<Faq>
			title="CRUD FAQ"
			queryKey="admin-faqs"
			fetcher={() => getFaqs()}
			createItem={createFaq}
			updateItem={updateFaq}
			deleteItem={deleteFaq}
			columns={columns}
			fields={[
				{ name: "question", label: "Pertanyaan", type: "textarea", required: true },
				{ name: "answer", label: "Jawaban", type: "textarea", required: true },
				{
					name: "category",
					label: "Kategori",
					type: "select",
					options: ["harga", "mesin", "waktu", "pembayaran", "keamanan", "barang-hilang", "umum"].map((value) => ({ value, label: value })),
					required: true,
				},
				{ name: "sort_order", label: "Urutan", type: "number" },
				{ name: "is_active", label: "Aktif", type: "switch" },
			]}
		/>
	);
}

