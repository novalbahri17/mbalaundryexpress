import { createShiftEvent, deleteShiftEvent } from "@/api/shift.api";
import type { ShiftEmployee, ShiftEvent, ShiftEventType } from "@/types/database.types";
import { Button, Checkbox, DatePicker, Empty, Popconfirm, Select, Tag, Tooltip, message } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { CalendarOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { eventTypeColor, eventTypeLabel, formatDateShort } from "@/lib/shiftScheduler";

interface EventPanelProps {
	branchId?: string;
	employees: ShiftEmployee[];
	events: ShiftEvent[];
	onChanged: () => void;
}

export function EventPanel({ branchId, employees, events, onChanged }: EventPanelProps) {
	const [employeeId, setEmployeeId] = useState<string>();
	const [type, setType] = useState<ShiftEventType>("izin");
	const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
	const [backupAvailable, setBackupAvailable] = useState(true);
	const [saving, setSaving] = useState(false);
	const [busyId, setBusyId] = useState<string | null>(null);

	const activeEmployees = employees.filter((e) => e.status === "active" && e.role !== "backup");

	const handleAdd = async () => {
		if (!branchId) {
			message.warning("Pilih cabang dulu.");
			return;
		}
		if (!employeeId) {
			message.warning("Pilih karyawan dulu.");
			return;
		}
		if (!range?.[0]) {
			message.warning("Pilih tanggal mulai.");
			return;
		}

		const start = range[0].format("YYYY-MM-DD");
		const end = range[1] ? range[1].format("YYYY-MM-DD") : null;

		setSaving(true);
		try {
			await createShiftEvent({
				employee_id: employeeId,
				branch_id: branchId,
				date: start,
				end_date: end && end !== start ? end : null,
				type,
				backup_available: backupAvailable,
				note: null,
			});
			message.success(`${eventTypeLabel[type]} tersimpan — jadwal otomatis dihitung ulang.`);
			setRange(null);
			onChanged();
		} catch (err) {
			message.error((err as Error)?.message || "Gagal menyimpan absensi.");
		} finally {
			setSaving(false);
		}
	};

	const remove = async (ev: ShiftEvent) => {
		setBusyId(ev.id);
		try {
			await deleteShiftEvent(ev.id);
			onChanged();
		} catch (err) {
			message.error((err as Error)?.message || "Gagal menghapus.");
		} finally {
			setBusyId(null);
		}
	};

	const nameOf = (id: string) => employees.find((e) => e.id === id)?.name ?? "Karyawan";
	const sorted = [...events].sort((a, b) => (a.date < b.date ? 1 : -1));

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center gap-2">
				<Select
					className="!min-w-[170px]"
					placeholder="Pilih karyawan"
					value={employeeId}
					onChange={setEmployeeId}
					options={activeEmployees.map((e) => ({ value: e.id, label: e.name }))}
					showSearch
					optionFilterProp="label"
				/>
				<Select
					className="!min-w-[110px]"
					value={type}
					onChange={(v) => setType(v as ShiftEventType)}
					options={[
						{ value: "izin", label: "Izin" },
						{ value: "sakit", label: "Sakit" },
						{ value: "libur", label: "Libur" },
						{ value: "resign", label: "Resign" },
					]}
				/>
				<DatePicker.RangePicker
					value={range}
					onChange={(v) => setRange(v as [Dayjs | null, Dayjs | null] | null)}
					format="DD/MM/YYYY"
					placeholder={["Mulai", "Selesai (opsional)"]}
					className="!w-[260px]"
				/>
				<Tooltip title="Apakah Mbak Koperasi / anak magang siap menggantikan di tanggal ini?">
					<Checkbox checked={backupAvailable} onChange={(e) => setBackupAvailable(e.target.checked)}>
						<span className="text-[12px]">Backup tersedia</span>
					</Checkbox>
				</Tooltip>
				<Button type="primary" icon={<Plus size={14} />} loading={saving} onClick={handleAdd}>
					Catat
				</Button>
			</div>

			{sorted.length === 0 ? (
				<Empty description="Belum ada catatan izin/sakit/libur" image={Empty.PRESENTED_IMAGE_SIMPLE} />
			) : (
				<div className="max-h-[240px] space-y-2 overflow-y-auto pr-1">
					{sorted.map((ev) => (
						<div
							key={ev.id}
							className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2"
						>
							<CalendarOff size={14} className="shrink-0 text-[var(--text-muted)]" />
							<Tag color={eventTypeColor[ev.type]} className="!m-0">
								{eventTypeLabel[ev.type]}
							</Tag>
							<span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-[var(--text-primary)]">
								{nameOf(ev.employee_id)}
							</span>
							<span className="shrink-0 text-[11px] text-[var(--text-secondary)]">
								{formatDateShort(ev.date)}
								{ev.end_date && ev.end_date !== ev.date ? ` – ${formatDateShort(ev.end_date)}` : ""}
							</span>
							<Tag color={ev.backup_available ? "green" : "default"} className="!m-0 !text-[10px]">
								{ev.backup_available ? "Backup siap" : "Tanpa backup"}
							</Tag>
							<Popconfirm
								title="Hapus catatan ini?"
								okText="Hapus"
								cancelText="Batal"
								okButtonProps={{ danger: true }}
								onConfirm={() => remove(ev)}
							>
								<Button type="text" size="small" danger icon={<Trash2 size={13} />} loading={busyId === ev.id} />
							</Popconfirm>
						</div>
					))}
				</div>
			)}
		</div>
	);
}