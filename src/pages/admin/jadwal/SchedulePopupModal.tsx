import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Input, Modal, Select, Spin, Switch, Tag, Tooltip, message } from "antd";
import { ArrowLeft, ArrowRight, Eye, ImagePlus, Megaphone, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createRecord, deleteRecord, fileUrl, getFirstRecord } from "@/api/client";
import { logAdminActivity } from "@/api/logs.api";
import type {
	SchedulePopupConfig,
	SchedulePopupFrequency,
	SchedulePopupImage,
} from "@/api/publicSchedule.api";
import { upsertSiteSetting } from "@/api/settings.api";
import { ScheduleAnnouncementPopup } from "@/components/public/ScheduleAnnouncementPopup";
import type { Branch } from "@/types/database.types";

const POPUP_SETTING_KEY = "schedule_popup_config";

export const DEFAULT_POPUP_CONFIG: SchedulePopupConfig = {
	enabled: false,
	title: "Pengumuman Penting Tim MBA",
	content: "",
	frequency: "daily",
	targetBranchIds: [],
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

export function useSchedulePopupConfig() {
	return useQuery({
		queryKey: ["schedule-popup-config"],
		queryFn: async (): Promise<SchedulePopupConfig> => {
			try {
				const rec = await getFirstRecord("site_settings", `key = "${POPUP_SETTING_KEY}"`);
				if (!rec?.value) return DEFAULT_POPUP_CONFIG;
				const parsed = JSON.parse(rec.value) as Partial<SchedulePopupConfig>;
				return {
					enabled: Boolean(parsed.enabled),
					title: parsed.title ?? DEFAULT_POPUP_CONFIG.title,
					content: parsed.content ?? "",
					frequency: parsed.frequency ?? "daily",
					targetBranchIds: Array.isArray(parsed.targetBranchIds) ? parsed.targetBranchIds : [],
					images: Array.isArray(parsed.images) ? parsed.images : [],
					updatedAt: parsed.updatedAt ?? "",
				};
			} catch {
				return DEFAULT_POPUP_CONFIG;
			}
		},
	});
}

interface SchedulePopupModalProps {
	open: boolean;
	onClose: () => void;
	branches: Branch[];
}

export function SchedulePopupModal({ open, onClose, branches }: SchedulePopupModalProps) {
	const queryClient = useQueryClient();
	const { data: savedConfig, isLoading } = useSchedulePopupConfig();
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const [enabled, setEnabled] = useState(false);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [frequency, setFrequency] = useState<SchedulePopupFrequency>("daily");
	const [targetBranchIds, setTargetBranchIds] = useState<string[]>([]);
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
		setTargetBranchIds(savedConfig.targetBranchIds ?? []);
		setImages(savedConfig.images ?? []);
		setDeletedImageIds([]);
	}, [open, savedConfig]);

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
		if (enabled && !title.trim() && !content.trim() && images.length === 0) {
			message.warning("Isi judul, tulisan, atau unggah minimal 1 gambar agar pop-up tidak kosong.");
			return;
		}

		setSaving(true);
		try {
			const payload: SchedulePopupConfig = {
				enabled,
				title: title.trim(),
				content: content.trim(),
				frequency,
				targetBranchIds,
				images,
				updatedAt: new Date().toISOString(),
			};

			await upsertSiteSetting({
				key: POPUP_SETTING_KEY,
				value: JSON.stringify(payload),
				description: "Konfigurasi pop-up pengumuman pada halaman jadwal karyawan",
			});

			// Hapus file gambar lama yang dibuang dari daftar
			if (deletedImageIds.length > 0) {
				await Promise.all(deletedImageIds.map((id) => deleteRecord("branding_files", id).catch(() => {})));
			}

			await logAdminActivity({
				action: "update",
				collection: "site_settings",
				targetId: POPUP_SETTING_KEY,
				summary: `Mengatur pop-up halaman jadwal karyawan (${enabled ? "Aktif" : "Nonaktif"}, ${frequency})`,
				details: {
					enabled,
					title: payload.title,
					frequency,
					imagesCount: images.length,
					targetBranchIds,
				},
			}).catch(() => {});

			queryClient.invalidateQueries({ queryKey: ["schedule-popup-config"] });
			queryClient.invalidateQueries({ queryKey: ["public-employee-schedule"] });
			message.success("Pengaturan pop-up jadwal karyawan berhasil disimpan.");
			onClose();
		} catch (err) {
			message.error((err as Error)?.message || "Gagal menyimpan pengaturan pop-up.");
		} finally {
			setSaving(false);
		}
	};

	const selectedFreqInfo = FREQUENCY_OPTIONS.find((f) => f.value === frequency);

	const previewConfig: SchedulePopupConfig = {
		enabled: true,
		title: title.trim() || "Pengumuman Karyawan",
		content: content.trim(),
		frequency,
		targetBranchIds,
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
				width={720}
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
							<Button onClick={onClose}>Batal</Button>
							<Button type="primary" loading={saving} onClick={handleSave}>
								Simpan Pengaturan Pop-up
							</Button>
						</div>
					</div>
				}
			>
				{isLoading ? (
					<div className="flex h-40 items-center justify-center">
						<Spin />
					</div>
				) : (
					<div className="space-y-4 pt-2">
						{/* Status Aktif/Nonaktif */}
						<div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3">
							<div>
								<p className="m-0 text-[13px] font-bold text-[var(--text-primary)]">
									Tampilkan Pop-up di Link Jadwal Karyawan
								</p>
								<p className="m-0 text-[11px] text-[var(--text-muted)]">
									Jika aktif, karyawan akan melihat pop-up ini saat membuka halaman jadwal mereka.
								</p>
							</div>
							<div className="flex items-center gap-2">
								<Tag color={enabled ? "success" : "default"} className="!m-0 font-bold">
									{enabled ? "AKTIF" : "NONAKTIF"}
								</Tag>
								<Switch checked={enabled} onChange={setEnabled} />
							</div>
						</div>

						{/* Frekuensi Muncul & Target Cabang */}
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

							<div>
								<label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
									Target Cabang
								</label>
								<Select
									mode="multiple"
									allowClear
									className="w-full"
									placeholder="Semua Cabang (kosongkan = tampil di semua)"
									value={targetBranchIds}
									onChange={(vals) => setTargetBranchIds(vals)}
									options={branches.map((b) => ({
										value: b.id,
										label: b.name,
									}))}
								/>
								<p className="mt-1 text-[11px] text-[var(--text-muted)]">
									{targetBranchIds.length === 0
										? "Berlaku untuk semua link jadwal cabang."
										: `Hanya tampil di ${targetBranchIds.length} cabang terpilih.`}
								</p>
							</div>
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
									placeholder="Contoh: Pengumuman Penting / Info Operasional"
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
