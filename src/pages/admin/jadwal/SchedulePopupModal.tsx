import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Input, Modal, Segmented, Select, Spin, Switch, Tag, Tooltip, message } from "antd";
import { ArrowLeft, ArrowRight, Eye, Globe, ImagePlus, Megaphone, Store, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createRecord, deleteRecord, fileUrl, getFirstRecord } from "@/api/client";
import { logAdminActivity } from "@/api/logs.api";
import type {
	SchedulePopupConfig,
	SchedulePopupFrequency,
	SchedulePopupImage,
	SchedulePopupScope,
} from "@/api/publicSchedule.api";
import { upsertSiteSetting } from "@/api/settings.api";
import { ScheduleAnnouncementPopup } from "@/components/public/ScheduleAnnouncementPopup";
import type { Branch } from "@/types/database.types";

const GLOBAL_POPUP_KEY = "schedule_popup_global";
const LEGACY_POPUP_KEY = "schedule_popup_config";
const branchPopupKey = (branchId: string) => `schedule_popup_branch_${branchId}`;

export const DEFAULT_POPUP_CONFIG: SchedulePopupConfig = {
	enabled: false,
	title: "",
	content: "",
	frequency: "daily",
	images: [],
	updatedAt: "",
};

const FREQUENCY_OPTIONS: Array<{ value: SchedulePopupFrequency; label: string; hint: string }> = [
	{
		value: "always",
		label: "Setiap Kali Buka Halaman",
		hint: "Pop-up selalu muncul setiap kali karyawan membuka atau me-refresh link jadwal.",
	},
	{
		value: "daily",
		label: "1 Hari Sekali",
		hint: "Muncul maksimal 1 kali per hari (otomatis muncul lagi keesokan harinya).",
	},
	{
		value: "weekly",
		label: "1 Minggu Sekali",
		hint: "Muncul maksimal 1 kali setiap 7 hari setelah ditutup karyawan.",
	},
	{
		value: "session",
		label: "Sekali per Sesi Browser",
		hint: "Tidak muncul lagi selama tab/browser masih terbuka, muncul lagi saat dibuka ulang.",
	},
	{
		value: "once",
		label: "Sekali Saja (Per Pengumuman)",
		hint: "Hanya muncul 1 kali per perangkat sampai Anda menyimpan pembaruan baru.",
	},
];

const parseStoredConfig = (raw?: string | null): SchedulePopupConfig => {
	if (!raw) return DEFAULT_POPUP_CONFIG;
	try {
		const parsed = JSON.parse(raw) as Partial<SchedulePopupConfig>;
		return {
			enabled: Boolean(parsed.enabled),
			title: parsed.title ?? "",
			content: parsed.content ?? "",
			frequency: parsed.frequency ?? "daily",
			images: Array.isArray(parsed.images) ? parsed.images : [],
			updatedAt: parsed.updatedAt ?? "",
		};
	} catch {
		return DEFAULT_POPUP_CONFIG;
	}
};

export function useSchedulePopupConfig(scope: SchedulePopupScope, branchId?: string) {
	return useQuery({
		queryKey: ["schedule-popup-config", scope, scope === "branch" ? branchId : "global"],
		enabled: scope === "global" || Boolean(branchId),
		queryFn: async (): Promise<SchedulePopupConfig> => {
			if (scope === "branch") {
				if (!branchId) return DEFAULT_POPUP_CONFIG;
				const rec = await getFirstRecord("site_settings", `key = "${branchPopupKey(branchId)}"`).catch(() => null);
				return parseStoredConfig(rec?.value);
			}
			const globalRec = await getFirstRecord("site_settings", `key = "${GLOBAL_POPUP_KEY}"`).catch(() => null);
			if (globalRec?.value) return parseStoredConfig(globalRec.value);
			const legacyRec = await getFirstRecord("site_settings", `key = "${LEGACY_POPUP_KEY}"`).catch(() => null);
			return parseStoredConfig(legacyRec?.value);
		},
	});
}

export function useSchedulePopupStatus(branchId?: string) {
	const branchQuery = useSchedulePopupConfig("branch", branchId);
	const globalQuery = useSchedulePopupConfig("global");
	return {
		branchEnabled: Boolean(branchQuery.data?.enabled),
		globalEnabled: Boolean(globalQuery.data?.enabled),
		anyEnabled: Boolean(branchQuery.data?.enabled || globalQuery.data?.enabled),
	};
}

interface SchedulePopupModalProps {
	open: boolean;
	onClose: () => void;
	branches: Branch[];
	activeBranchId?: string;
}

export function SchedulePopupModal({ open, onClose, branches, activeBranchId }: SchedulePopupModalProps) {
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const [scope, setScope] = useState<SchedulePopupScope>("branch");
	const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(activeBranchId);

	useEffect(() => {
		if (open) {
			setScope("branch");
			setSelectedBranchId(activeBranchId || branches[0]?.id);
		}
	}, [open, activeBranchId, branches]);

	const effectiveBranchId = selectedBranchId || activeBranchId || branches[0]?.id;
	const targetBranch = branches.find((b) => b.id === effectiveBranchId);

	const branchQuery = useSchedulePopupConfig("branch", effectiveBranchId);
	const globalQuery = useSchedulePopupConfig("global");

	const activeQuery = scope === "branch" ? branchQuery : globalQuery;
	const savedConfig = activeQuery.data;
	const isLoading = activeQuery.isLoading;

	const [enabled, setEnabled] = useState(false);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [frequency, setFrequency] = useState<SchedulePopupFrequency>("daily");
	const [images, setImages] = useState<SchedulePopupImage[]>([]);
	const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
	const [uploading, setUploading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [previewOpen, setPreviewOpen] = useState(false);

	useEffect(() => {
		if (!open || !savedConfig) return;
		setEnabled(savedConfig.enabled);
		setTitle(savedConfig.title);
		setContent(savedConfig.content);
		setFrequency(savedConfig.frequency);
		setImages(savedConfig.images ?? []);
		setDeletedImageIds([]);
	}, [open, savedConfig, scope, effectiveBranchId]);

	const handleUploadFiles = async (fileList: FileList | null) => {
		if (!fileList || fileList.length === 0) return;
		const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
		if (files.length === 0) {
			message.warning("Pilih file gambar (JPG, PNG, WEBP, GIF).");
			return;
		}

		setUploading(true);
		let uploadedCount = 0;
		const newlyAdded: SchedulePopupImage[] = [];

		try {
			for (const file of files) {
				if (file.size > 10 * 1024 * 1024) {
					message.warning(`File "${file.name}" melebihi 10MB dan dilewati.`);
					continue;
				}
				const formData = new FormData();
				formData.append("type", "schedule_popup");
				formData.append("file", file);
				const rec = await createRecord("branding_files", formData);
				const url = fileUrl("branding_files", rec, rec.file);
				if (url) {
					newlyAdded.push({ id: rec.id, url });
					uploadedCount += 1;
				}
			}
			if (newlyAdded.length > 0) {
				setImages((prev) => [...prev, ...newlyAdded]);
				message.success(`${uploadedCount} gambar berhasil diunggah.`);
			}
		} catch (err) {
			message.error((err as Error)?.message || "Gagal mengunggah gambar.");
		} finally {
			setUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	const moveImage = (index: number, direction: -1 | 1) => {
		const target = index + direction;
		if (target < 0 || target >= images.length) return;
		setImages((prev) => {
			const next = [...prev];
			const temp = next[index];
			next[index] = next[target];
			next[target] = temp;
			return next;
		});
	};

	const removeImage = (img: SchedulePopupImage) => {
		setImages((prev) => prev.filter((item) => item.id !== img.id));
		if (img.id) {
			setDeletedImageIds((prev) => [...prev, img.id]);
		}
	};

	const handleSave = async () => {
		if (scope === "branch" && !effectiveBranchId) {
			message.warning("Pilih cabang terlebih dahulu.");
			return;
		}
		if (enabled && !title.trim() && !content.trim() && images.length === 0) {
			message.warning("Isi judul, tulisan, atau unggah minimal 1 gambar agar pop-up tidak kosong.");
			return;
		}

		const settingKey = scope === "branch" ? branchPopupKey(effectiveBranchId as string) : GLOBAL_POPUP_KEY;
		const scopeDesc =
			scope === "branch"
				? `Khusus Cabang ${targetBranch?.name ?? effectiveBranchId}`
				: "Global (Semua Cabang)";

		setSaving(true);
		try {
			const payload: SchedulePopupConfig = {
				enabled,
				scope,
				title: title.trim(),
				content: content.trim(),
				frequency,
				images,
				updatedAt: new Date().toISOString(),
			};

			await upsertSiteSetting({
				key: settingKey,
				value: JSON.stringify(payload),
				description: `Pop-up halaman jadwal karyawan (${scopeDesc})`,
			});

			// Hapus file gambar lama yang dibuang dari daftar
			if (deletedImageIds.length > 0) {
				await Promise.all(deletedImageIds.map((id) => deleteRecord("branding_files", id).catch(() => {})));
			}

			await logAdminActivity({
				action: "update",
				collection: "site_settings",
				targetId: settingKey,
				summary: `Mengatur pop-up jadwal karyawan [${scopeDesc}] (${enabled ? "Aktif" : "Nonaktif"}, ${frequency})`,
				details: {
					scope,
					branchId: scope === "branch" ? effectiveBranchId : null,
					branchName: scope === "branch" ? targetBranch?.name : "Semua Cabang",
					enabled,
					title: payload.title,
					frequency,
					imagesCount: images.length,
				},
			}).catch(() => {});

			queryClient.invalidateQueries({ queryKey: ["schedule-popup-config"] });
			queryClient.invalidateQueries({ queryKey: ["public-employee-schedule"] });
			message.success(`Pop-up ${scopeDesc} berhasil disimpan.`);
		} catch (err) {
			message.error((err as Error)?.message || "Gagal menyimpan pengaturan pop-up.");
		} finally {
			setSaving(false);
		}
	};

	const selectedFreqInfo = FREQUENCY_OPTIONS.find((f) => f.value === frequency);

	const previewConfig: SchedulePopupConfig = {
		enabled: true,
		scope,
		scopeLabel:
			scope === "branch"
				? `Info Khusus ${targetBranch?.name ?? "Cabang"}`
				: "Info Global (Semua Cabang)",
		title: title.trim() || "Pengumuman Karyawan",
		content: content.trim(),
		frequency,
		images,
		updatedAt: "preview",
	};

	return (
		<>
			<Modal
				title={
					<div className="flex items-center gap-2">
						<Megaphone size={18} className="text-[#C62828]" />
						<span>Pengaturan Pop-up Halaman Jadwal Karyawan</span>
					</div>
				}
				open={open}
				onCancel={onClose}
				width={760}
				footer={
					<div className="flex flex-wrap items-center justify-between gap-2">
						<Button
							icon={<Eye size={14} />}
							onClick={() => setPreviewOpen(true)}
							disabled={!title.trim() && !content.trim() && images.length === 0}
						>
							Pratinjau Pop-up
						</Button>
						<div className="flex items-center gap-2">
							<Button onClick={onClose}>Tutup</Button>
							<Button type="primary" loading={saving} onClick={handleSave}>
								{scope === "branch"
									? `Simpan Pop-up ${targetBranch?.name ?? "Cabang"}`
									: "Simpan Pop-up Global"}
							</Button>
						</div>
					</div>
				}
			>
				<div className="space-y-4 pt-2">
					{/* Switcher Scope: Khusus Per Cabang vs Global Semua Cabang */}
					<div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3 space-y-2.5">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<Segmented
								value={scope}
								onChange={(v) => setScope(v as SchedulePopupScope)}
								options={[
									{
										value: "branch",
										label: (
											<span className="inline-flex items-center gap-1.5 px-1 font-semibold">
												<Store size={14} />
												<span>Khusus Per Cabang</span>
												{branchQuery.data?.enabled && (
													<span className="h-2 w-2 rounded-full bg-emerald-500" />
												)}
											</span>
										),
									},
									{
										value: "global",
										label: (
											<span className="inline-flex items-center gap-1.5 px-1 font-semibold">
												<Globe size={14} />
												<span>Pop-up Global (Semua Cabang)</span>
												{globalQuery.data?.enabled && (
													<span className="h-2 w-2 rounded-full bg-emerald-500" />
												)}
											</span>
										),
									},
								]}
							/>

							{scope === "branch" && (
								<Select
									className="!w-[230px]"
									value={effectiveBranchId}
									onChange={(v) => setSelectedBranchId(v)}
									placeholder="Pilih Cabang"
									options={branches.map((b) => ({
										value: b.id,
										label: b.name,
									}))}
								/>
							)}
						</div>

						<p className="m-0 text-[11px] text-[var(--text-muted)]">
							{scope === "branch" ? (
								<>
									Pop-up ini <strong>khusus untuk cabang {targetBranch?.name}</strong> dan terpisah dari cabang lain.
								</>
							) : (
								<>
									Pop-up <strong>Global</strong> tampil di <strong>semua link jadwal cabang</strong>. Jika cabang juga punya pop-up khusus yang aktif, keduanya akan tampil bergantian.
								</>
							)}
						</p>
					</div>

					{isLoading ? (
						<div className="flex h-40 items-center justify-center">
							<Spin />
						</div>
					) : (
						<div className="space-y-4">
							{/* Status Aktif/Nonaktif */}
							<div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3">
								<div>
									<p className="m-0 text-[13px] font-bold text-[var(--text-primary)]">
										{scope === "branch"
											? `Aktifkan Pop-up Khusus ${targetBranch?.name ?? "Cabang"}`
											: "Aktifkan Pop-up Global (Semua Cabang)"}
									</p>
									<p className="m-0 text-[11px] text-[var(--text-muted)]">
										{scope === "branch"
											? "Hanya muncul untuk karyawan cabang ini."
											: "Muncul untuk karyawan di seluruh cabang."}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<Tag color={enabled ? "success" : "default"} className="!m-0 font-bold">
										{enabled ? "AKTIF" : "NONAKTIF"}
									</Tag>
									<Switch checked={enabled} onChange={setEnabled} />
								</div>
							</div>

							{/* Frekuensi Muncul */}
							<div>
								<label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
									Seberapa Sering Muncul?
								</label>
								<Select
									className="w-full"
									value={frequency}
									onChange={(v) => setFrequency(v as SchedulePopupFrequency)}
									options={FREQUENCY_OPTIONS.map((opt) => ({
										value: opt.value,
										label: opt.label,
									}))}
								/>
								{selectedFreqInfo && (
									<p className="mt-1 text-[11px] text-[var(--text-muted)]">{selectedFreqInfo.hint}</p>
								)}
							</div>

							{/* Judul & Isi Tulisan */}
							<div className="space-y-3">
								<div>
									<label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
										Judul Pop-up
									</label>
									<Input
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										placeholder={
											scope === "branch"
												? `Contoh: Info Khusus Tim ${targetBranch?.name ?? "Cabang"}`
												: "Contoh: Pengumuman Resmi Semua Cabang"
										}
										maxLength={120}
									/>
								</div>

								<div>
									<label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
										Isi Tulisan / Pesan
									</label>
									<Input.TextArea
										rows={4}
										value={content}
										onChange={(e) => setContent(e.target.value)}
										placeholder="Tulis pengumuman, aturan baru, pengingat shift, atau pesan untuk karyawan di sini... (Bisa pakai baris baru & emoji)"
										maxLength={4000}
										showCount
									/>
								</div>
							</div>

						{/* Upload Gambar Banyak */}
						<div className="space-y-2.5">
							<div className="flex flex-wrap items-center justify-between gap-2">
								<div>
									<label className="block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
										Gambar Pop-up ({images.length} terpasang)
									</label>
									<p className="m-0 text-[11px] text-[var(--text-muted)]">
										Bisa unggah banyak gambar sekaligus. Karyawan bisa geser (swipe) semua gambar di pop-up.
									</p>
								</div>

								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									multiple
									className="hidden"
									onChange={(e) => handleUploadFiles(e.target.files)}
								/>

								<Button
									icon={<ImagePlus size={14} />}
									loading={uploading}
									onClick={() => fileInputRef.current?.click()}
								>
									Tambah Gambar (Bisa Banyak)
								</Button>
							</div>

							{/* Dropzone + Daftar Gambar */}
							<div
								className="rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--bg-surface)]/50 p-3 transition-colors hover:border-[var(--brand)]"
								onDragOver={(e) => e.preventDefault()}
								onDrop={(e) => {
									e.preventDefault();
									handleUploadFiles(e.dataTransfer.files);
								}}
							>
								{images.length === 0 ? (
									<button
										type="button"
										onClick={() => fileInputRef.current?.click()}
										className="flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 py-5 text-center"
									>
										<UploadCloud size={26} className="text-[var(--text-muted)]" />
										<span className="text-[12px] font-semibold text-[var(--text-primary)]">
											Klik atau seret beberapa gambar ke sini
										</span>
										<span className="text-[11px] text-[var(--text-muted)]">
											JPG, PNG, WEBP, GIF • Maks 10MB per gambar
										</span>
									</button>
								) : (
									<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
										{images.map((img, idx) => (
											<div
												key={img.id || `${img.url}-${idx}`}
												className="group relative overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-card)]"
											>
												<div className="aspect-square w-full bg-slate-100 dark:bg-slate-900">
													<img
														src={img.url}
														alt={`Gambar ${idx + 1}`}
														className="h-full w-full object-cover"
													/>
												</div>
												<span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
													#{idx + 1}
												</span>
												<div className="flex items-center justify-between gap-1 border-t border-[var(--border)] bg-[var(--bg-card)] px-1.5 py-1">
													<div className="flex items-center gap-1">
														<Tooltip title="Geser ke kiri">
															<Button
																size="small"
																type="text"
																disabled={idx === 0}
																icon={<ArrowLeft size={12} />}
																onClick={() => moveImage(idx, -1)}
															/>
														</Tooltip>
														<Tooltip title="Geser ke kanan">
															<Button
																size="small"
																type="text"
																disabled={idx === images.length - 1}
																icon={<ArrowRight size={12} />}
																onClick={() => moveImage(idx, 1)}
															/>
														</Tooltip>
													</div>
													<Tooltip title="Hapus gambar">
														<Button
															size="small"
															type="text"
															danger
															icon={<Trash2 size={12} />}
															onClick={() => removeImage(img)}
														/>
													</Tooltip>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						{enabled && (
							<Alert
								type="info"
								showIcon
								message="Pop-up dilengkapi tombol silang (✕) yang selalu terlihat di pojok kanan atas dan aman di layar HP maupun Desktop."
							/>
						)}
					</div>
					)}
				</div>
			</Modal>

			{/* Pratinjau Tampilan Pop-up Karyawan */}
			<ScheduleAnnouncementPopup
				open={previewOpen}
				onClose={() => setPreviewOpen(false)}
				popup={previewConfig}
			/>
		</>
	);
}
