import type { ColumnsType } from "antd/es/table";
import { CrudManager } from "@/components/admin/CrudManager";
import { createJob, deleteJob, getJobs, updateJob } from "@/api/jobs.api";
import type { Job } from "@/types/database.types";

const columns: ColumnsType<Job> = [
	{ title: "Posisi", dataIndex: "title" },
	{ title: "Tipe", dataIndex: "type" },
	{ title: "Terbuka", dataIndex: "is_open", render: (value: boolean) => (value ? "Ya" : "Tidak") },
	{ title: "Gaji Min", dataIndex: "salary_min" },
	{ title: "Gaji Max", dataIndex: "salary_max" },
];

export default function LokerAdminPage() {
	return (
		<CrudManager<Job>
			title="CRUD Loker"
			queryKey="admin-jobs"
			fetcher={() => getJobs()}
			createItem={createJob}
			updateItem={updateJob}
			deleteItem={deleteJob}
			columns={columns}
			fields={[
				{ name: "title", label: "Judul", type: "text", required: true },
				{ name: "description", label: "Deskripsi", type: "textarea", required: true },
				{ name: "requirements", label: "Kualifikasi", type: "textarea" },
				{ name: "benefits", label: "Benefit", type: "textarea" },
				{ name: "type", label: "Tipe", type: "select", options: ["full-time", "part-time", "freelance", "magang"].map((value) => ({ value, label: value })), required: true },
				{ name: "salary_min", label: "Gaji Min", type: "number" },
				{ name: "salary_max", label: "Gaji Max", type: "number" },
				{ name: "show_salary", label: "Tampilkan Gaji", type: "switch" },
				{ name: "is_open", label: "Lowongan Aktif", type: "switch" },
				{ name: "whatsapp_apply", label: "WA Apply", type: "text" },
			]}
		/>
	);
}

