import { createShiftEmployee, deleteShiftEmployee, updateShiftEmployee } from "@/api/shift.api";
import { SHIFT_META, REGULAR_SHIFTS, allowedRegularShifts } from "@/lib/shiftScheduler";
import type { ShiftEmployee, ShiftKind } from "@/types/database.types";
import { Button, Empty, Input, Popconfirm, Switch, Tag, Tooltip, message } from "antd";
import { Check, Pencil, Trash2, UserPlus, X } from "lucide-react";
import { useState } from "react";

interface EmployeePanelProps {
	branchId?: string;
	employees: ShiftEmployee[];
	loading: boolean;
	onChanged: () => void;
}

const ALL: ShiftKind[] = [...REGULAR_SHIFTS];

/**
 * Tampilan aturan shift seorang karyawan sebagai 3 tombol yang bisa diklik.
 * Hijau = boleh, abu-abu = tidak boleh.
 */
function ShiftToggles({
	value,
	disabled,
	onChange,
	size = "md",
}: {
	value: ShiftKind[];
	disabled?: boolean;
	onChange: (next: ShiftKind[]) => void;
	size?: "md" | "sm";
}) {
	return (
		<div className="flex items-center gap-1">
			{ALL.map((shift) => {
				const meta = SHIFT_META[shift];
				const on = value.includes(shift);
				return (
					<Tooltip
						key={shift}
						title={`${on ? "Klik untuk melarang" : "Klik untuk mengizinkan"} shift ${meta.label} (${meta.start}–${meta.end})`}
					>
						<button
							type="button"
							disabled={disabled}
							onClick={() => {
								const next = on ? value.filter((s) => s !== shift) : [...value, shift];
								// Minimal satu shift harus tersisa.
								if (next.length === 0) {
									message.warning("Minimal satu shift harus diizinkan.");
									return;
								}
								onChange(REGULAR_SHIFTS.filter((s) => next.includes(s)));
							}}
							className={`inline-flex items-center gap-1 rounded-md font-semibold transition-all ${
								size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[11px]"
							} ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:brightness-95"}`}
							style={
								on
									? { background: meta.bg, color: meta.color, border: `1px solid ${meta.color}66` }
									: {
											background: "transparent",
											color: "var(--text-muted)",
											border: "1px dashed var(--border-strong)",
											textDecoration: "line-through",
										}
							}
						>
							<span>{meta.emoji}</span>
							<span>{meta.label}</span>
							{size === "md" && (on ? <Check size={10} /> : <X size={10} />)}
						</button>
					</Tooltip>
				);
			})}
		</div>
	);
}

export function EmployeePanel({ branchId, employees, loading, onChanged }: EmployeePanelProps) {
	const [name, setName] = useState("");
	const [newShifts, setNewShifts] = useState<ShiftKind[]>(ALL);
	const [isNew, setIsNew] = useState(false);
	const [saving, setSaving] = useState(false);
	const [busyId, setBusyId] = useState<string | null>(null);

	// State edit nama karyawan
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingName, setEditingName] = useState("");

	const startEditName = (emp: ShiftEmployee) => {
		setEditingId(emp.id);
		setEditingName(emp.name);
	};

	const saveEditName = async (emp: ShiftEmployee) => {
		const trimmed = editingName.trim();
		if (!trimmed) {
			message.warning("Nama karyawan tidak boleh kosong.");
			return;
		}
		if (trimmed === emp.name) {
			setEditingId(null);
			return;
		}
		await patch(emp, { name: trimmed });
		message.success(`Nama karyawan diperbarui menjadi "${trimmed}".`);
		setEditingId(null);
	};

	const handleAdd = async () => {
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
			const today = new Date().toISOString().slice(0, 10);
			await createShiftEmployee({
				branch_id: branchId,
				name: trimmed,
				role: "crew",
				status: "active",
				allowed_shifts: newShifts,
				can_night: newShifts.includes("malam"),
				sort_order: employees.length + 1,
				is_new: isNew,
				joined_date: isNew ? today : null,
			});
			message.success(`${trimmed} ditambahkan.`);
			setName("");
			setIsNew(false);
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
		const allowed = allowedRegularShifts(emp);
		const restricted = allowed.length < 3;

		return (
			<div
				key={emp.id}
				className="flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2"
				style={{
					borderColor: restricted ? "#F59E0B88" : "var(--border)",
					background: resigned ? "var(--bg-surface)" : "var(--bg-card)",
					opacity: resigned ? 0.65 : 1,
				}}
			>
				<div className="flex min-w-[150px] flex-1 items-center gap-2">
					<span
						className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
						style={{
							background: "var(--brand-bg)",
							color: "var(--brand)",
						}}
					>
						{emp.name.slice(0, 1).toUpperCase()}
					</span>

					{editingId === emp.id ? (
						<div className="flex items-center gap-1">
							<Input
								size="small"
								value={editingName}
								onChange={(e) => setEditingName(e.target.value)}
								onPressEnter={() => saveEditName(emp)}
								onKeyDown={(e) => {
									if (e.key === "Escape") setEditingId(null);
								}}
								autoFocus
								disabled={busyId === emp.id}
								className="!w-[130px] !text-[12px]"
							/>
							<Button
								type="text"
								size="small"
								icon={<Check size={13} className="text-green-600" />}
								loading={busyId === emp.id}
								onClick={() => saveEditName(emp)}
								title="Simpan nama"
							/>
							<Button
								type="text"
								size="small"
								icon={<X size={13} className="text-red-500" />}
								onClick={() => setEditingId(null)}
								title="Batal"
							/>
						</div>
					) : (
						<div className="flex items-center gap-1.5 min-w-0">
							<span
								className="truncate text-[13px] font-semibold cursor-pointer hover:underline"
								onClick={() => !resigned && startEditName(emp)}
								title={resigned ? undefined : "Klik untuk edit nama"}
								style={{
									color: resigned ? "var(--text-muted)" : "var(--text-primary)",
									textDecoration: resigned ? "line-through" : "none",
								}}
							>
								{emp.name}
							</span>
							{!resigned && (
								<Tooltip title="Edit nama karyawan">
									<button
										type="button"
										onClick={() => startEditName(emp)}
										className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors p-0.5"
									>
										<Pencil size={11} />
									</button>
								</Tooltip>
							)}
						</div>
					)}

					{resigned && (
						<Tag color="error" className="!m-0 !text-[10px] font-bold">
							RESIGN
						</Tag>
					)}
					{!resigned && emp.is_new && (
						<Tooltip title="Klik untuk mengakhiri masa orientasi anak baru">
							<Tag
								color="processing"
								className="cursor-pointer !m-0 !text-[10px] font-bold"
								onClick={() => patch(emp, { is_new: false })}
							>
								BARU (WAJIB PAGI)
							</Tag>
						</Tooltip>
					)}
					{!resigned && !emp.is_new && (
						<Tooltip title="Tandai sebagai anak baru (wajib masuk pagi 1 minggu)">
							<button
								type="button"
								className="cursor-pointer text-[10px] text-[var(--text-muted)] underline hover:text-[var(--brand)]"
								onClick={() =>
									patch(emp, {
										is_new: true,
										joined_date: new Date().toISOString().slice(0, 10),
									})
								}
							>
								+ Anak Baru
							</button>
						</Tooltip>
					)}
				</div>

				<ShiftToggles
					value={allowed}
					disabled={busyId === emp.id || resigned}
					onChange={(next) => patch(emp, { allowed_shifts: next, can_night: next.includes("malam") })}
				/>

				<Tooltip title={resigned ? "Aktifkan lagi" : "Tandai resign (keluar dari jadwal setelah tanggal resign)"}>
					<Switch
						size="small"
						checked={resigned}
						loading={busyId === emp.id}
						checkedChildren="Resign"
						unCheckedChildren="Aktif"
						onChange={(checked) => patch(emp, { status: checked ? "resigned" : "active" })}
					/>
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

	const activeCount = employees.filter((e) => e.status === "active").length;

	return (
		<div className="space-y-4">
			{/* Form tambah */}
			<div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-3">
				<p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
					1. Tulis nama & pilih shift yang boleh diambil
				</p>
				<div className="flex flex-wrap items-center gap-2">
					<Input
						placeholder="Nama karyawan baru…"
						value={name}
						onChange={(e) => setName(e.target.value)}
						onPressEnter={handleAdd}
						className="!min-w-[180px] !flex-1"
					/>
					<ShiftToggles value={newShifts} onChange={setNewShifts} />
				</div>
				<div className="mt-2 flex flex-wrap items-center gap-3">
					<label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
						<input
							type="checkbox"
							checked={isNew}
							onChange={(e) => setIsNew(e.target.checked)}
							className="rounded border-[var(--border)]"
						/>
						<span>Anak Baru (Wajib Masuk Pagi minimal 1 minggu pertama)</span>
					</label>
				</div>
				<div className="mt-2 flex flex-wrap items-center gap-2">
					<Button type="primary" icon={<UserPlus size={14} />} loading={saving} onClick={handleAdd}>
						Tambah Karyawan
					</Button>
					<span className="text-[11px] text-[var(--text-muted)]">
						Staf backup (Mbak Koperasi) otomatis aktif lewat tombol di atas. Tidak perlu ditambah manual.
					</span>
				</div>
			</div>

			{/* Daftar karyawan */}
			{loading ? (
				<div className="py-6 text-center text-[12px] text-[var(--text-muted)]">Memuat karyawan…</div>
			) : employees.length === 0 ? (
				<Empty description="Belum ada karyawan di cabang ini" image={Empty.PRESENTED_IMAGE_SIMPLE} />
			) : (
				<div className="space-y-2">
					<p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
						Daftar Karyawan ({activeCount} aktif)
					</p>
					<p className="mb-2 text-[11px] text-[var(--text-muted)]">
						Klik tombol shift untuk mengizinkan / melarang. Contoh: klik 🌅 Pagi & ☀️ Sore sampai tercoret jika orang itu{" "}
						<strong>hanya bisa Malam</strong>.
					</p>
					<div className="space-y-2">{employees.map(renderRow)}</div>
				</div>
			)}
		</div>
	);
}
