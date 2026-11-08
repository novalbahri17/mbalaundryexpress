import { createShiftEvent, deleteShiftEvent, updateShiftEmployee } from "@/api/shift.api";
import type { ShiftEmployee, ShiftEvent, ShiftEventType } from "@/types/database.types";
import { Alert, Button, Checkbox, DatePicker, Empty, Modal, Popconfirm, Select, Tag, Tooltip, message } from "antd";
import type { Dayjs } from "dayjs";
import { ArrowRightLeft, CalendarOff, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { eventTypeColor, eventTypeLabel, formatDateShort, parseBkoTarget } from "@/lib/shiftScheduler";

interface BranchOption {
	id: string;
	name: string;
}

interface EventPanelProps {
	branchId?: string;
	branchName?: string;
	branches?: BranchOption[];
	employees: ShiftEmployee[];
	allEmployees?: ShiftEmployee[];
	events: ShiftEvent[];
	onChanged: () => void;
}

export function EventPanel({
	branchId,
	branchName,
	branches = [],
	employees,
	allEmployees = [],
	events,
	onChanged,
}: EventPanelProps) {
	const [employeeId, setEmployeeId] = useState<string>();
	const [type, setType] = useState<ShiftEventType>("izin");
	const [targetBranchId, setTargetBranchId] = useState<string>();
	const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
	const [backupAvailable, setBackupAvailable] = useState(true);
	const [saving, setSaving] = useState(false);
	const [busyId, setBusyId] = useState<string | null>(null);

	// State untuk modal "Pinjam Karyawan Cabang Lain (BKO)"
	const [borrowModalOpen, setBorrowModalOpen] = useState(false);
	const [borrowOriginBranchId, setBorrowOriginBranchId] = useState<string>();
	const [borrowEmployeeId, setBorrowEmployeeId] = useState<string>();
	const [borrowRange, setBorrowRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
	const [borrowSaving, setBorrowSaving] = useState(false);

	const activeEmployees = employees.filter((e) => e.status === "active" && e.role !== "backup");
	const otherBranches = useMemo(() => branches.filter((b) => b.id !== branchId), [branches, branchId]);

	const employeesInBorrowOrigin = useMemo(() => {
		if (!borrowOriginBranchId) return [];
		return allEmployees.filter(
			(e) => e.branch_id === borrowOriginBranchId && e.status === "active" && e.role !== "backup",
		);
	}, [allEmployees, borrowOriginBranchId]);

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

		if (type === "bantuan" && !targetBranchId) {
			message.warning("Pilih cabang tujuan yang akan dibantu.");
			return;
		}

		const start = range[0].format("YYYY-MM-DD");
		const end = range[1] ? range[1].format("YYYY-MM-DD") : null;
		const targetName = branches.find((b) => b.id === targetBranchId)?.name || "";
		const note = type === "bantuan" ? `BKO:${targetBranchId}:${targetName}` : null;

		setSaving(true);
		try {
			await createShiftEvent({
				employee_id: employeeId,
				branch_id: branchId,
				date: start,
				end_date: end && end !== start ? end : null,
				type,
				backup_available: type === "bantuan" ? true : backupAvailable,
				note,
			});
			if (type === "resign") {
				await updateShiftEmployee(employeeId, { status: "resigned" });
			}
			message.success(`${eventTypeLabel[type]} tersimpan — jadwal otomatis dihitung ulang.`);
			setRange(null);
			setTargetBranchId(undefined);
			onChanged();
		} catch (err) {
			message.error((err as Error)?.message || "Gagal menyimpan absensi.");
		} finally {
			setSaving(false);
		}
	};

	const handleBorrowSubmit = async () => {
		if (!branchId) {
			message.warning("Cabang aktif belum dipilih.");
			return;
		}
		if (!borrowOriginBranchId) {
			message.warning("Pilih cabang asal karyawan.");
			return;
		}
		if (!borrowEmployeeId) {
			message.warning("Pilih karyawan yang ingin dipinjam.");
			return;
		}
		if (!borrowRange?.[0]) {
			message.warning("Pilih tanggal penugasan BKO.");
			return;
		}

		const start = borrowRange[0].format("YYYY-MM-DD");
		const end = borrowRange[1] ? borrowRange[1].format("YYYY-MM-DD") : null;
		const curBranchName = branchName || branches.find((b) => b.id === branchId)?.name || "";

		setBorrowSaving(true);
		try {
			await createShiftEvent({
				employee_id: borrowEmployeeId,
				branch_id: borrowOriginBranchId,
				date: start,
				end_date: end && end !== start ? end : null,
				type: "bantuan",
				backup_available: true,
				note: `BKO:${branchId}:${curBranchName}`,
			});
			message.success(
				`Karyawan bantuan berhasil ditugaskan ke ${curBranchName}! Cabang asal otomatis di-cover Mbak Koperasi.`,
			);
			setBorrowModalOpen(false);
			setBorrowOriginBranchId(undefined);
			setBorrowEmployeeId(undefined);
			setBorrowRange(null);
			onChanged();
		} catch (err) {
			message.error((err as Error)?.message || "Gagal mencatat pinjaman BKO.");
		} finally {
			setBorrowSaving(false);
		}
	};

	const remove = async (ev: ShiftEvent) => {
		setBusyId(ev.id);
		try {
			await deleteShiftEvent(ev.id);
			message.success("Catatan dihapus.");
			onChanged();
		} catch (err) {
			message.error((err as Error)?.message || "Gagal menghapus.");
		} finally {
			setBusyId(null);
		}
	};

	const nameOf = (id: string) => {
		const found = allEmployees.find((e) => e.id === id) || employees.find((e) => e.id === id);
		return found?.name ?? "Karyawan";
	};

	// Filter event yang relevan: event cabang ini ATAU event BKO yang ditugaskan ke cabang ini
	const relevantEvents = useMemo(() => {
		return events.filter((ev) => {
			if (ev.branch_id === branchId) return true;
			if (ev.type === "bantuan") {
				const bko = parseBkoTarget(ev.note);
				if (bko && bko.branchId === branchId) return true;
			}
			return false;
		});
	}, [events, branchId]);

	const sorted = [...relevantEvents].sort((a, b) => (a.date < b.date ? 1 : -1));

	return (
		<div className="space-y-3">
			{/* Baris Form Catat Izin / BKO */}
			<div className="flex flex-wrap items-center gap-2">
				<Select
					className="!min-w-[160px]"
					placeholder="Pilih karyawan"
					value={employeeId}
					onChange={setEmployeeId}
					options={activeEmployees.map((e) => ({ value: e.id, label: e.name }))}
					showSearch
					optionFilterProp="label"
				/>
				<Select
					className="!min-w-[130px]"
					value={type}
					onChange={(v) => setType(v as ShiftEventType)}
					options={[
						{ value: "izin", label: "Izin" },
						{ value: "sakit", label: "Sakit" },
						{ value: "libur", label: "Libur" },
						{ value: "bantuan", label: "Tugas BKO ke Cabang Lain" },
						{ value: "resign", label: "Resign" },
					]}
				/>

				{type === "bantuan" && (
					<Select
						className="!min-w-[170px]"
						placeholder="Pilih cabang tujuan"
						value={targetBranchId}
						onChange={setTargetBranchId}
						options={otherBranches.map((b) => ({ value: b.id, label: `Bantu ${b.name}` }))}
					/>
				)}

				<DatePicker.RangePicker
					value={range}
					onChange={(v) => setRange(v as [Dayjs | null, Dayjs | null] | null)}
					format="DD/MM/YYYY"
					placeholder={["Mulai", "Selesai (opsional)"]}
					className="!w-[230px]"
				/>

				{type !== "bantuan" ? (
					<Tooltip title="Centang hanya kalau di tanggal itu TIDAK ada Mbak Koperasi / anak magang yang bisa masuk. Kalau staf backup terdaftar, sistem otomatis memakai mereka.">
						<Checkbox checked={!backupAvailable} onChange={(e) => setBackupAvailable(!e.target.checked)}>
							<span className="text-[12px]">Backup tidak bisa datang</span>
						</Checkbox>
					</Tooltip>
				) : (
					<span className="text-[11px] text-[var(--text-muted)]">(Cabang ini otomatis di-cover Mbak Koperasi)</span>
				)}

				<Button type="primary" icon={<Plus size={14} />} loading={saving} onClick={handleAdd}>
					Catat
				</Button>

				{otherBranches.length > 0 && (
					<Button icon={<ArrowRightLeft size={13} />} onClick={() => setBorrowModalOpen(true)} className="!ml-auto">
						+ Pinjam Karyawan Cabang Lain (BKO)
					</Button>
				)}
			</div>

			{/* Daftar Event / Absensi */}
			{sorted.length === 0 ? (
				<Empty description="Belum ada catatan izin / sakit / libur / BKO" image={Empty.PRESENTED_IMAGE_SIMPLE} />
			) : (
				<div className="max-h-[250px] space-y-2 overflow-y-auto pr-1">
					{sorted.map((ev) => {
						const isIncomingBko = ev.type === "bantuan" && ev.branch_id !== branchId;
						const bkoTarget = parseBkoTarget(ev.note);
						const originBranchName = branches.find((b) => b.id === ev.branch_id)?.name || "Cabang Lain";

						return (
							<div
								key={ev.id}
								className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2"
								style={
									isIncomingBko
										? { borderLeft: "3px solid #2563EB", background: "rgba(37, 99, 235, 0.03)" }
										: ev.type === "bantuan"
											? { borderLeft: "3px solid #9333EA", background: "rgba(147, 51, 234, 0.03)" }
											: undefined
								}
							>
								<CalendarOff size={14} className="shrink-0 text-[var(--text-muted)]" />

								{isIncomingBko ? (
									<Tag color="blue" className="!m-0 font-semibold">
										BKO Masuk (dari {originBranchName})
									</Tag>
								) : ev.type === "bantuan" ? (
									<Tag color="purple" className="!m-0 font-semibold">
										BKO Keluar (ke {bkoTarget?.branchName || "Cabang Lain"})
									</Tag>
								) : (
									<Tag color={eventTypeColor[ev.type]} className="!m-0">
										{eventTypeLabel[ev.type]}
									</Tag>
								)}

								<span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-[var(--text-primary)]">
									{nameOf(ev.employee_id)}
								</span>

								<span className="shrink-0 text-[11px] text-[var(--text-secondary)]">
									{formatDateShort(ev.date)}
									{ev.end_date && ev.end_date !== ev.date ? ` – ${formatDateShort(ev.end_date)}` : ""}
								</span>

								{!isIncomingBko && ev.type !== "bantuan" && (
									<Tag color={ev.backup_available ? "default" : "red"} className="!m-0 !text-[10px]">
										{ev.backup_available ? "Backup otomatis" : "Tanpa backup"}
									</Tag>
								)}

								{ev.type === "bantuan" && !isIncomingBko && (
									<Tag color="green" className="!m-0 !text-[10px]">
										Di-cover Mbak Koperasi
									</Tag>
								)}

								<Popconfirm
									title="Hapus catatan ini?"
									description={
										isIncomingBko
											? "Catatan BKO di cabang asal karyawan juga akan dibatalkan."
											: "Jadwal shift akan otomatis dihitung ulang."
									}
									okText="Hapus"
									cancelText="Batal"
									okButtonProps={{ danger: true }}
									onConfirm={() => remove(ev)}
								>
									<Button type="text" size="small" danger icon={<Trash2 size={13} />} loading={busyId === ev.id} />
								</Popconfirm>
							</div>
						);
					})}
				</div>
			)}

			{/* Modal Pinjam Karyawan Cabang Lain (BKO) */}
			<Modal
				title={
					<div className="flex items-center gap-2">
						<ArrowRightLeft size={16} className="text-[var(--brand)]" />
						<span>Pinjam Karyawan Cabang Lain (BKO)</span>
					</div>
				}
				open={borrowModalOpen}
				onCancel={() => setBorrowModalOpen(false)}
				onOk={handleBorrowSubmit}
				confirmLoading={borrowSaving}
				okText={`Tugaskan ke ${branchName || "Cabang Ini"}`}
				cancelText="Batal"
			>
				<div className="space-y-3 py-2">
					<Alert
						type="info"
						showIcon
						message="Bantuan Antar-Cabang (BKO)"
						description={`Karyawan yang dipinjam akan menjaga di ${branchName || "cabang ini"}. Posisi mereka di cabang asalnya akan otomatis dijaga oleh Mbak Koperasi / Anak Magang di cabang asal tersebut.`}
					/>

					<div>
						<label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
							1. Pilih Cabang Asal
						</label>
						<Select
							className="!w-full"
							placeholder="Pilih cabang asal karyawan..."
							value={borrowOriginBranchId}
							onChange={(v) => {
								setBorrowOriginBranchId(v);
								setBorrowEmployeeId(undefined);
							}}
							options={otherBranches.map((b) => ({ value: b.id, label: b.name }))}
						/>
					</div>

					<div>
						<label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
							2. Pilih Karyawan yang Ingin Dipinjam
						</label>
						<Select
							className="!w-full"
							placeholder={borrowOriginBranchId ? "Pilih karyawan..." : "Pilih cabang asal terlebih dahulu"}
							disabled={!borrowOriginBranchId}
							value={borrowEmployeeId}
							onChange={setBorrowEmployeeId}
							options={employeesInBorrowOrigin.map((e) => ({
								value: e.id,
								label: `${e.name} (${e.allowed_shifts?.join(", ") || "semua shift"})`,
							}))}
						/>
					</div>

					<div>
						<label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
							3. Tanggal Penugasan BKO
						</label>
						<DatePicker.RangePicker
							className="!w-full"
							value={borrowRange}
							onChange={(v) => setBorrowRange(v as [Dayjs | null, Dayjs | null] | null)}
							format="DD/MM/YYYY"
							placeholder={["Tanggal Mulai", "Tanggal Selesai (opsional)"]}
						/>
					</div>
				</div>
			</Modal>
		</div>
	);
}
