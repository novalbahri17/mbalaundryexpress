import { useState, useEffect } from "react";
import { Button, Input, Upload, ColorPicker, Switch, message } from "antd";
import { UploadOutlined, SaveOutlined, ReloadOutlined } from "@ant-design/icons";
import { useBranding, useUpdateBranding, type BrandingSettings } from "@/hooks/useBranding";
import { fileUrl } from "@/api/pocketbase";

export default function BrandingSettingsPage() {
	const { data: branding, isLoading } = useBranding();
	const updateBranding = useUpdateBranding();

	const [form, setForm] = useState<BrandingSettings>({});
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [faviconFile, setFaviconFile] = useState<File | null>(null);

	useEffect(() => {
		if (branding) {
			setForm(branding);
		}
	}, [branding]);

	const handleSave = async () => {
		try {
			const payload: BrandingSettings = { ...form };

			// Upload logo jika ada
			if (logoFile) {
				const formData = new FormData();
				formData.append("file", logoFile);
				// Upload ke collection files atau gunakan base64
				const reader = new FileReader();
				reader.readAsDataURL(logoFile);
				reader.onload = () => {
					payload.logo_url = reader.result as string;
				};
			}

			// Upload favicon jika ada
			if (faviconFile) {
				const reader = new FileReader();
				reader.readAsDataURL(faviconFile);
				reader.onload = () => {
					payload.favicon_url = reader.result as string;
				};
			}

			await updateBranding.mutateAsync(payload);
			message.success("Pengaturan branding berhasil disimpan");
		} catch (error) {
			message.error("Gagal menyimpan pengaturan");
			console.error(error);
		}
	};

	const handleReset = () => {
		if (branding) {
			setForm(branding);
			setLogoFile(null);
			setFaviconFile(null);
		}
	};

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="text-neutral-400">Memuat pengaturan...</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Pengaturan Branding</h1>
				<div className="flex gap-2">
					<Button icon={<ReloadOutlined />} onClick={handleReset}>
						Reset
					</Button>
					<Button
						type="primary"
						icon={<SaveOutlined />}
						onClick={handleSave}
						loading={updateBranding.isPending}
					>
						Simpan
					</Button>
				</div>
			</div>

			{/* Preview */}
			<div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
				<h3 className="mb-4 text-lg font-semibold">Preview Logo</h3>
				<div className="flex items-center gap-3 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900">
					<img
						src={logoFile ? URL.createObjectURL(logoFile) : form.logo_url}
						alt="Logo"
						width={form.logo_width}
						height={form.logo_height}
						className="object-contain"
					/>
					<div className="flex flex-col leading-none">
						<span
							className="tracking-wider uppercase"
							style={{
								fontSize: form.text_mba_size,
								fontWeight: form.text_mba_weight,
								color: form.text_mba_color,
							}}
						>
							MBA
						</span>
						<span
							className="tracking-wide uppercase"
							style={{
								fontSize: form.text_brand_size,
								fontWeight: form.text_brand_weight,
								...(form.text_brand_gradient
									? {
											backgroundImage: `linear-gradient(135deg, ${form.text_brand_gradient_from}, ${form.text_brand_gradient_to})`,
											WebkitBackgroundClip: "text",
											backgroundClip: "text",
											color: "transparent",
									  }
									: { color: form.text_brand_color }),
							}}
						>
							LAUNDRY EXPRESS
						</span>
					</div>
				</div>
			</div>

			{/* Logo Settings */}
			<div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
				<h3 className="mb-4 text-lg font-semibold">Logo</h3>
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label className="mb-2 block text-sm font-medium">Upload Logo</label>
						<Upload
							beforeUpload={(file) => {
								setLogoFile(file);
								return false;
							}}
							accept="image/*"
							maxCount={1}
						>
							<Button icon={<UploadOutlined />}>Pilih File</Button>
						</Upload>
						{logoFile && <p className="mt-2 text-sm text-neutral-500">{logoFile.name}</p>}
					</div>
					<div>
						<label className="mb-2 block text-sm font-medium">Upload Favicon</label>
						<Upload
							beforeUpload={(file) => {
								setFaviconFile(file);
								return false;
							}}
							accept=".ico,.png,.svg"
							maxCount={1}
						>
							<Button icon={<UploadOutlined />}>Pilih File</Button>
						</Upload>
						{faviconFile && <p className="mt-2 text-sm text-neutral-500">{faviconFile.name}</p>}
					</div>
				</div>
				<div className="mt-4 grid gap-4 sm:grid-cols-2">
					<div>
						<label className="mb-2 block text-sm font-medium">Lebar Logo (px)</label>
						<Input
							type="number"
							value={form.logo_width}
							onChange={(e) => setForm({ ...form, logo_width: Number(e.target.value) })}
						/>
					</div>
					<div>
						<label className="mb-2 block text-sm font-medium">Tinggi Logo (px)</label>
						<Input
							type="number"
							value={form.logo_height}
							onChange={(e) => setForm({ ...form, logo_height: Number(e.target.value) })}
						/>
					</div>
				</div>
			</div>

			{/* Text "MBA" Settings */}
			<div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
				<h3 className="mb-4 text-lg font-semibold">Teks "MBA"</h3>
				<div className="grid gap-4 sm:grid-cols-3">
					<div>
						<label className="mb-2 block text-sm font-medium">Ukuran Font</label>
						<Input
							value={form.text_mba_size}
							onChange={(e) => setForm({ ...form, text_mba_size: e.target.value })}
							placeholder="12px"
						/>
					</div>
					<div>
						<label className="mb-2 block text-sm font-medium">Ketebalan Font</label>
						<Input
							value={form.text_mba_weight}
							onChange={(e) => setForm({ ...form, text_mba_weight: e.target.value })}
							placeholder="600"
						/>
					</div>
					<div>
						<label className="mb-2 block text-sm font-medium">Warna</label>
						<div className="flex items-center gap-2">
							<Input
								value={form.text_mba_color}
								onChange={(e) => setForm({ ...form, text_mba_color: e.target.value })}
							/>
							<input
								type="color"
								value={form.text_mba_color}
								onChange={(e) => setForm({ ...form, text_mba_color: e.target.value })}
								className="h-8 w-8 rounded cursor-pointer"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Text "LAUNDRY EXPRESS" Settings */}
			<div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
				<h3 className="mb-4 text-lg font-semibold">Teks "LAUNDRY EXPRESS"</h3>
				<div className="mb-4">
					<Switch
						checked={form.text_brand_gradient}
						onChange={(checked) => setForm({ ...form, text_brand_gradient: checked })}
					/>
					<span className="ml-2">Gunakan Gradient</span>
				</div>
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label className="mb-2 block text-sm font-medium">Ukuran Font</label>
						<Input
							value={form.text_brand_size}
							onChange={(e) => setForm({ ...form, text_brand_size: e.target.value })}
							placeholder="16px"
						/>
					</div>
					<div>
						<label className="mb-2 block text-sm font-medium">Ketebalan Font</label>
						<Input
							value={form.text_brand_weight}
							onChange={(e) => setForm({ ...form, text_brand_weight: e.target.value })}
							placeholder="800"
						/>
					</div>
				</div>
				{form.text_brand_gradient ? (
					<div className="mt-4 grid gap-4 sm:grid-cols-2">
						<div>
							<label className="mb-2 block text-sm font-medium">Gradient Dari</label>
							<div className="flex items-center gap-2">
								<Input
									value={form.text_brand_gradient_from}
									onChange={(e) => setForm({ ...form, text_brand_gradient_from: e.target.value })}
								/>
								<input
									type="color"
									value={form.text_brand_gradient_from}
									onChange={(e) => setForm({ ...form, text_brand_gradient_from: e.target.value })}
									className="h-8 w-8 rounded cursor-pointer"
								/>
							</div>
						</div>
						<div>
							<label className="mb-2 block text-sm font-medium">Gradient Ke</label>
							<div className="flex items-center gap-2">
								<Input
									value={form.text_brand_gradient_to}
									onChange={(e) => setForm({ ...form, text_brand_gradient_to: e.target.value })}
								/>
								<input
									type="color"
									value={form.text_brand_gradient_to}
									onChange={(e) => setForm({ ...form, text_brand_gradient_to: e.target.value })}
									className="h-8 w-8 rounded cursor-pointer"
								/>
							</div>
						</div>
					</div>
				) : (
					<div className="mt-4">
						<label className="mb-2 block text-sm font-medium">Warna</label>
						<div className="flex items-center gap-2">
							<Input
								value={form.text_brand_color}
								onChange={(e) => setForm({ ...form, text_brand_color: e.target.value })}
							/>
							<input
								type="color"
								value={form.text_brand_color}
								onChange={(e) => setForm({ ...form, text_brand_color: e.target.value })}
								className="h-8 w-8 rounded cursor-pointer"
							/>
						</div>
					</div>
				)}
			</div>

			{/* Meta Settings */}
			<div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
				<h3 className="mb-4 text-lg font-semibold">Meta & SEO</h3>
				<div className="space-y-4">
					<div>
						<label className="mb-2 block text-sm font-medium">Judul Situs</label>
						<Input
							value={form.site_title}
							onChange={(e) => setForm({ ...form, site_title: e.target.value })}
							placeholder="MBA Laundry Express"
						/>
					</div>
					<div>
						<label className="mb-2 block text-sm font-medium">Deskripsi Situs</label>
						<Input.TextArea
							value={form.site_description}
							onChange={(e) => setForm({ ...form, site_description: e.target.value })}
							placeholder="Self Service Laundry Modern di Surabaya"
							rows={3}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
