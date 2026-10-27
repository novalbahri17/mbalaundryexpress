import { EyeInvisibleOutlined, EyeOutlined, ReloadOutlined, SaveOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, ColorPicker, Form, Input, message, Slider, Spin, Switch, Tabs, Upload } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { useEffect, useState } from "react";
import { MetronicPage } from "@/components/admin/MetronicPage";
import { updateFavicon } from "@/components/public/layout/DynamicFavicon";
import { DynamicLogo } from "@/components/public/layout/DynamicLogo";
import { useBranding, useUpdateBranding } from "@/hooks/useBranding";
import { useThemeStore } from "@/store/themeStore";

const { TextArea } = Input;

/**
 * Kotak pengaturan yang dipakai berulang di halaman ini supaya semua blok punya
 * jarak, sudut, dan garis tepi yang sama (kotak abu-abu lama ukurannya
 * beda-beda sehingga tampak berantakan).
 */
function SettingBox({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
			<h3 className="m-0 text-sm font-bold text-neutral-800 dark:text-neutral-100">{title}</h3>
			{description ? (
				<p className="mt-1 mb-0 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{description}</p>
			) : null}
			<div className="mt-4">{children}</div>
		</section>
	);
}

/** Pratinjau gambar dengan fallback kalau berkasnya gagal dimuat. */
function ImagePreview({
	src,
	alt,
	size,
	box,
}: {
	src: string;
	alt: string;
	size: { width: number; height: number };
	box: number;
}) {
	const [failed, setFailed] = useState(false);

	return (
		<div
			className="flex items-center justify-center overflow-hidden rounded-lg border border-dashed border-neutral-300 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800"
			style={{ width: box, height: box }}
		>
			{failed ? (
				<span className="px-2 text-center text-[10px] font-semibold leading-tight text-neutral-400">
					Tidak bisa dimuat
				</span>
			) : (
				<img
					src={src || undefined}
					alt={alt}
					onError={() => setFailed(true)}
					className="object-contain"
					style={{
						width: Math.min(size.width, box - 12),
						height: Math.min(size.height, box - 12),
					}}
				/>
			)}
		</div>
	);
}

/** Kartu pratinjau yang menampilkan logo + teks brand seperti di situs publik. */
function PreviewSurface({
	label,
	logoWidth,
	logoHeight,
	logoUrl,
	faviconUrl,
}: {
	label: string;
	logoWidth: number;
	logoHeight: number;
	logoUrl: string;
	faviconUrl: string;
}) {
	return (
		<div>
			<p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400">{label}</p>
			<div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900">
				<DynamicLogo />
			</div>
			<div className="mt-3 flex flex-wrap items-center gap-4">
				<div className="flex items-center gap-2">
					{/* `key` membuat komponen di-mount ulang saat logo berganti supaya
					    status "gagal dimuat" ikut direset. */}
					<ImagePreview
						key={logoUrl}
						src={logoUrl}
						alt="Logo"
						size={{ width: logoWidth, height: logoHeight }}
						box={64}
					/>
					<div className="text-[11px] leading-tight text-neutral-500 dark:text-neutral-400">
						Logo
						<br />
						<span className="font-semibold text-neutral-700 dark:text-neutral-200">
							{logoWidth}×{logoHeight}px
						</span>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<ImagePreview key={faviconUrl} src={faviconUrl} alt="Favicon" size={{ width: 32, height: 32 }} box={40} />
					<div className="text-[11px] leading-tight text-neutral-500 dark:text-neutral-400">
						Favicon
						<br />
						<span className="font-semibold text-neutral-700 dark:text-neutral-200">32×32px</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function BrandingPage() {
	const { mode } = useThemeStore();
	const { data: branding, isLoading, refetch } = useBranding();
	const updateBranding = useUpdateBranding();

	const isDark = mode === "dark";
	const [form] = Form.useForm();
	const [activeTab, setActiveTab] = useState("logo");
	const [previewVisible, setPreviewVisible] = useState(false);
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string>("");
	// Daftar file yang dikontrol sendiri: setelah simpan berhasil, daftar ini
	// dikosongkan supaya nama file lama tidak tertinggal di kotak upload.
	const [logoFileList, setLogoFileList] = useState<UploadFile[]>([]);
	const [isSaving, setIsSaving] = useState(false);

	// Nilai slider dibaca langsung dari form supaya pratinjau ikut berubah saat
	// slider digeser (tanpa harus simpan dulu).
	const watchedWidth = Form.useWatch("logo_width", form) as number | undefined;
	const watchedHeight = Form.useWatch("logo_height", form) as number | undefined;
	const logoWidth = Number(watchedWidth ?? branding?.logo_width ?? 40);
	const logoHeight = Number(watchedHeight ?? branding?.logo_height ?? 40);
	// Dibaca lewat `useWatch` supaya blok warna gradient muncul/hilang seketika
	// ketika switch ditoggle (getFieldValue tidak memicu render ulang).
	const useGradient = Form.useWatch("text_brand_gradient", form) as boolean | undefined;

	useEffect(() => {
		if (branding) {
			form.setFieldsValue({
				logo_width: branding.logo_width,
				logo_height: branding.logo_height,
				text_mba_size: branding.text_mba_size,
				text_mba_weight: branding.text_mba_weight,
				text_mba_color: branding.text_mba_color,
				text_brand_size: branding.text_brand_size,
				text_brand_weight: branding.text_brand_weight,
				text_brand_color: branding.text_brand_color,
				text_brand_gradient: branding.text_brand_gradient,
				text_brand_gradient_from: branding.text_brand_gradient_from,
				text_brand_gradient_to: branding.text_brand_gradient_to,
				site_title: branding.site_title,
				site_description: branding.site_description,
			});
			if (branding.logo_url) {
				setLogoPreview(branding.logo_url);
			}
		}
	}, [branding, form]);

	const handleLogoChange = (info: { fileList: UploadFile[] }) => {
		setLogoFileList(info.fileList);
		const file = info.fileList[0]?.originFileObj;
		if (file) {
			setLogoFile(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				setLogoPreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		} else {
			// File dibatalkan/dihapus dari kotak upload.
			setLogoFile(null);
			setLogoPreview(branding?.logo_url ?? "");
		}
	};

	const handleSave = async () => {
		try {
			setIsSaving(true);
			const values = await form.validateFields();
			// `useUpdateBranding` membaca file dari
			// `logo_file.fileList[0].originFileObj`. Kalau `File` dikirim
			// langsung, tidak ada `.fileList` sehingga upload dilewati diam-diam
			// dan logo tidak pernah berubah.
			await updateBranding.mutateAsync({
				...values,
				logo_file: logoFile ? { fileList: [{ originFileObj: logoFile }] } : undefined,
			});
			setLogoFile(null);
			setLogoFileList([]);
			await refetch();
			setTimeout(() => {
				updateFavicon();
			}, 500);
			message.success("Branding berhasil disimpan!");
		} catch (error) {
			message.error("Gagal menyimpan branding: " + (error instanceof Error ? error.message : "Unknown error"));
		} finally {
			setIsSaving(false);
		}
	};

	const handleRefreshFavicon = () => {
		refetch();
		updateFavicon();
		message.success("Favicon diperbarui!");
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Spin size="large" />
			</div>
		);
	}

	const logoUrl = logoPreview || branding?.logo_url || "";
	const faviconUrl = logoPreview || branding?.favicon_url || "";

	return (
		<MetronicPage title="Pengaturan Branding" subtitle="Kelola logo, favicon, dan identitas brand">
			<div className="card">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4 dark:border-neutral-700">
					<div>
						<p className="m-0 text-sm font-bold text-neutral-800 dark:text-neutral-100">Identitas Visual</p>
						<p className="m-0 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
							Perubahan berlaku setelah menekan Simpan Perubahan.
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button className="admin-soft-btn" icon={<ReloadOutlined />} onClick={handleRefreshFavicon}>
							Refresh Favicon
						</Button>
						<Button
							type="primary"
							className="admin-soft-btn"
							icon={<SaveOutlined />}
							onClick={handleSave}
							loading={isSaving || updateBranding.isPending}
						>
							Simpan Perubahan
						</Button>
					</div>
				</div>

				<div className="p-5">
					<Form form={form} layout="vertical" requiredMark={false}>
						<Tabs
							activeKey={activeTab}
							onChange={setActiveTab}
							className="admin-responsive-tabs"
							items={[
								{
									key: "logo",
									label: "Logo & Favicon",
									children: (
										<div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
											<div className="space-y-4">
												<SettingBox
													title="Berkas Logo"
													description="PNG, JPG, SVG, atau WEBP. Logo ini dipakai sebagai logo situs sekaligus favicon (ikon tab browser)."
												>
													<Upload
														accept="image/png,image/jpeg,image/svg+xml,image/webp"
														beforeUpload={() => false}
														onChange={handleLogoChange}
														fileList={logoFileList}
														maxCount={1}
														showUploadList
													>
														<Button icon={<UploadOutlined />}>Pilih File Logo</Button>
													</Upload>
												</SettingBox>

												<SettingBox title="Ukuran Logo" description="Lebar dan tinggi logo pada header situs (piksel).">
													<Form.Item label="Lebar Logo (px)" name="logo_width" className="mb-6">
														<Slider min={24} max={120} marks={{ 24: "24", 40: "40", 60: "60", 80: "80", 120: "120" }} />
													</Form.Item>
													<Form.Item label="Tinggi Logo (px)" name="logo_height" className="mb-2">
														<Slider min={24} max={120} marks={{ 24: "24", 40: "40", 60: "60", 80: "80", 120: "120" }} />
													</Form.Item>
												</SettingBox>
											</div>

											<div className="lg:sticky lg:top-4">
												<SettingBox
													title="Pratinjau"
													description="Tampilan logo dan favicon yang sedang dipakai situs."
												>
													<PreviewSurface
														label="Header situs"
														logoWidth={logoWidth}
														logoHeight={logoHeight}
														logoUrl={logoUrl}
														faviconUrl={faviconUrl}
													/>
												</SettingBox>
											</div>
										</div>
									),
								},
								{
									key: "text",
									label: "Teks Brand",
									children: (
										<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
											<SettingBox title={`Teks "MBA"`} description="Baris atas pada logo teks.">
												<Form.Item label="Ukuran Font" name="text_mba_size" className="mb-6">
													<Slider
														min={10}
														max={20}
														marks={{ 10: "10px", 12: "12px", 14: "14px", 16: "16px", 20: "20px" }}
													/>
												</Form.Item>
												<Form.Item label="Ketebalan Font" name="text_mba_weight" className="mb-6">
													<Slider
														min={400}
														max={900}
														step={100}
														marks={{ 400: "400", 600: "600", 700: "700", 800: "800", 900: "900" }}
													/>
												</Form.Item>
												<Form.Item label="Warna Teks" name="text_mba_color" className="mb-2">
													<div className="flex items-center gap-2">
														<ColorPicker
															value={form.getFieldValue("text_mba_color")}
															onChange={(color) => form.setFieldValue("text_mba_color", color.toHexString())}
														/>
														<span className="text-xs text-neutral-500">{form.getFieldValue("text_mba_color")}</span>
													</div>
												</Form.Item>
											</SettingBox>

											<SettingBox title={`Teks "Laundry Express"`} description="Baris bawah pada logo teks.">
												<Form.Item label="Ukuran Font" name="text_brand_size" className="mb-6">
													<Slider
														min={12}
														max={24}
														marks={{ 12: "12px", 14: "14px", 16: "16px", 18: "18px", 24: "24px" }}
													/>
												</Form.Item>
												<Form.Item label="Ketebalan Font" name="text_brand_weight" className="mb-6">
													<Slider
														min={400}
														max={900}
														step={100}
														marks={{ 400: "400", 600: "600", 700: "700", 800: "800", 900: "900" }}
													/>
												</Form.Item>
												<Form.Item
													label="Gunakan Gradient"
													name="text_brand_gradient"
													valuePropName="checked"
													className="mb-3"
												>
													<Switch />
												</Form.Item>
												{useGradient ? (
													<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
														<Form.Item label="Gradient Dari" name="text_brand_gradient_from" className="mb-2">
															<div className="flex items-center gap-2">
																<ColorPicker
																	value={form.getFieldValue("text_brand_gradient_from")}
																	onChange={(color) =>
																		form.setFieldValue("text_brand_gradient_from", color.toHexString())
																	}
																/>
																<span className="text-xs text-neutral-500">
																	{form.getFieldValue("text_brand_gradient_from")}
																</span>
															</div>
														</Form.Item>
														<Form.Item label="Gradient Ke" name="text_brand_gradient_to" className="mb-2">
															<div className="flex items-center gap-2">
																<ColorPicker
																	value={form.getFieldValue("text_brand_gradient_to")}
																	onChange={(color) =>
																		form.setFieldValue("text_brand_gradient_to", color.toHexString())
																	}
																/>
																<span className="text-xs text-neutral-500">
																	{form.getFieldValue("text_brand_gradient_to")}
																</span>
															</div>
														</Form.Item>
													</div>
												) : (
													<Form.Item label="Warna Teks" name="text_brand_color" className="mb-2">
														<div className="flex items-center gap-2">
															<ColorPicker
																value={form.getFieldValue("text_brand_color")}
																onChange={(color) => form.setFieldValue("text_brand_color", color.toHexString())}
															/>
															<span className="text-xs text-neutral-500">{form.getFieldValue("text_brand_color")}</span>
														</div>
													</Form.Item>
												)}
											</SettingBox>
										</div>
									),
								},
								{
									key: "seo",
									label: "Meta & SEO",
									children: (
										<SettingBox
											title="Metadata Halaman"
											description="Dipakai untuk judul tab browser dan deskripsi saat situs dibagikan."
										>
											<Form.Item
												label="Judul Situs"
												name="site_title"
												rules={[{ required: true, message: "Judul situs wajib diisi" }]}
												className="mb-5"
											>
												<Input placeholder="MBA Laundry Express" maxLength={60} showCount />
											</Form.Item>
											<Form.Item
												label="Deskripsi Situs"
												name="site_description"
												rules={[{ required: true, message: "Deskripsi situs wajib diisi" }]}
												className="mb-2"
											>
												<TextArea
													placeholder="Self Service Laundry Modern di Surabaya..."
													rows={3}
													maxLength={160}
													showCount
												/>
											</Form.Item>
										</SettingBox>
									),
								},
							]}
						/>
					</Form>
				</div>
			</div>

			{/* Live Preview */}
			<div className="card">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4 dark:border-neutral-700">
					<div>
						<p className="m-0 text-sm font-bold text-neutral-800 dark:text-neutral-100">Preview Brand</p>
						<p className="m-0 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
							Cek hasil akhir logo sebelum menyimpan.
						</p>
					</div>
					<Button
						className="admin-soft-btn"
						icon={previewVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
						onClick={() => setPreviewVisible(!previewVisible)}
					>
						{previewVisible ? "Sembunyikan" : "Tampilkan"} Preview
					</Button>
				</div>
				<div className="p-5">
					<div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900">
						<DynamicLogo />
					</div>

					{previewVisible && (
						<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400">
									Header (latar terang)
								</p>
								<div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700">
									<DynamicLogo />
								</div>
							</div>
							<div>
								<p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400">
									Footer (latar gelap)
								</p>
								<div
									className="rounded-xl border border-neutral-200 px-4 py-3 dark:border-neutral-700"
									style={{ backgroundColor: isDark ? "#1a1d27" : "#111827" }}
								>
									<DynamicLogo />
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</MetronicPage>
	);
}
