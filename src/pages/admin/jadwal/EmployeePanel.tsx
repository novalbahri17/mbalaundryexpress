import {
	createShiftEmployee,
	deleteShiftEmployee,
	updateShiftEmployee,
} from "@/api/shift.api";
import type { ShiftEmployee } from "@/types/database.types";
import { Button, Checkbox, Empty, Input, Popconfirm, Switch, Tag, Tooltip, message } from "antd";
import { Moon, Plus, Trash2, UserX } from "lucide-react";
import { useState } from "react";

interface EmployeePanelProps {
	branchId?: string;
	employees: ShiftEmployee[];
	loading: boolean;
	onChanged: () => void;
}

export function EmployeePanel({ branchId, employees, loading, onChanged }: EmployeePanelProps) {
	const [name, setName] = useState("");
	const [canNight, setCanNight] = useState(true);
	const [saving, setSaving] = useState(false);
	const [busyId, setBusyId] = useState<string | null>(null);

	const crew = employees.filter((e) => e.role !== "backup");
	const backups = employees.filter((e) => e.role === "backup");

	const handleAdd = async (role: "crew" | "backup") => {
		const trimmed = name.trim();
		if (!trimmed) {
			message.warning("Nama karyawan wajib diisi.");
			return;
		}
		if (!branchId) {
			message.warning("Pilih cabang dulu.");
			return;
		}
		setSaving(true);
		try {
			await createShiftEmployee({
				branch_id: branchId,
				name: trimmed,
				role,
				status: "active",
				can_night: role === "backup" ? false : canNight,
				sort_order: employees.length + 1,
			});
			message.success(`${trimmed} ditambahkan.`);
			setName("");
			onChanged();
		} catch (err) {
			message.error((err as Error)?.message || "Gagal menambah karyawan.");
		} finally {
			setSaving(false);
		}
	};

	const patch = async (emp: ShiftEmployee, payload: Partial<ShiftEmployee>) => {
		setBusyId(emp.id);
		try {
			await updateShiftEmployee(emp.id, payload);
			onChanged();
		} catch (err) {
			message.error((err as Error)?.message || "Gagal memperbarui karyawan.");
		} finally {
			setBusyId(null);
		}
	};

	const remove = async (emp: ShiftEmployee) => {
		setBusyId(emp.id);
		try {
			await deleteShiftEmployee(emp.id);
			message.success(`${emp.name} dihapus.`);
			onChanged();
		} catch (err) {
			message.error((err as Error)?.message || "Gagal menghapus.");
		} finally {
			setBusyId(null);
		}
	};

	const renderRow = (emp: ShiftEmployee) => {
		const resigned = emp.status === "resigned";
		return (
			<div
				key={emp.id}
				className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2"
			>
				<span
					className="min-w-[110px] flex-1 truncate text-[13px] font-semibold"
					style={{ color: resigned ? "var(--text-muted)" : "var(--text-primary)", textDecoration: resigned ? "line-through" : "none" }}
				>
					{emp.name}
				</span>

				{emp.role === "backup" ? (
					<Tag color="purple" className="!m-0">
						Backup
					</Tag>
				) : (
					<Tooltip title="Matikan kalau karyawan ini HANYA boleh Pagi & Siang (tidak pernah Malam).">
						<div className="flex items-center gap-1.5">
							<Checkbox
								checked={emp.can_night}
								disabled={busyId === emp.id || resigned}
								onChange={(e) => patch(emp, { can_night: e.target.checked })}
							>
								<span className="inline-flex items-center gap-1 text-[11px]">
									<Moon size={11} /> Bisa Malam
								</span>
							</Checkbox>
						</div>
					</Tooltip>
				)}

				<Tooltip title={resigned ? "Aktifkan lagi" : "Tandai resign (keluar dari rotasi)"}>
					<div className="flex items-center gap-1.5">
						<UserX size={13} className="text-[var(--text-muted)]" />
						<Switch
							size="small"
							checked={resigned}
							loading={busyId === emp.id}
							onChange={(checked) => patch(emp, { status: checked ? "resigned" : "active" })}
						/>
					</div>
				</Tooltip>

				<Popconfirm
					title="Hapus karyawan?"
					description="Riwayat absensi tetap tersimpan, tapi nama ini hilang dari daftar."
					okText="Hapus"
					cancelText="Batal"
					okButtonProps={{ danger: true }}
					onConfirm={() => remove(emp)}
				>
					<Button type="text" size="small" danger icon={<Trash2 size={14} />} loading={busyId === emp.id} />
				</Popconfirm>
			</div>
		);
	};

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap gap-2">
				<Input
					placeholder="Nama karyawan baru…"
					value={name}
					onChange={(e) => setName(e.target.value)}
					onPressEnter={() => handleAdd("crew")}
					className="!max-w-[240px]"
					size="middle"
				/>
				<Checkbox checked={canNight} onChange={(e) => setCanNight(e.target.checked)}>
					<span className="text-[12px]">Bisa shift Malam</span>
				</Checkbox>
				<Button type="primary" icon={<Plus size={14} />} loading={saving} onClick={() => handleAdd("crew")}>
					Tambah
				</Button>
				<Button icon={<Plus size={14} />} loading={saving} onClick={() => handleAdd("backup")}>
					Tambah sebagai Backup
				</Button>
			</div>

			{loading ? (
				<div className="py-6 text-center text-[12px] text-[var(--text-muted)]">Memuat karyawan…</div>
			) : employees.length === 0 ? (
				<Empty description="Belum ada karyawan di cabang ini" image={Empty.PRESENTED_IMAGE_SIMPLE} />
			) : (
				<div className="space-y-4">
					<div>
						<p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
							Karyawan Reguler ({crew.filter((e) => e.status === "active").length} aktif)
						</p>
						<div className="space-y-2">
							{crew.length === 0 ? (
								<p className="text-[12px] text-[var(--text-muted)]">Belum ada karyawan reguler.</p>
							) : (
								crew.map(renderRow)
							)}
						</div>
					</div>

					<div>
						<p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
							Staf Backup (Mbak Koperasi / Anak Magang)
						</p>
						<div className="space-y-2">
							{backups.length === 0 ? (
								<p className="text-[12px] text-[var(--text-muted)]">
									Belum ada staf backup. Tambahkan supaya sistem bisa menutup slot saat ada yang izin.
								</p>
							) : (
								backups.map(renderRow)
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
