import { useState, useEffect } from "react";
import { Card, Form, Input, Button, message, Slider, Switch, ColorPicker, Tabs, Upload, Spin } from "antd";
import { UploadOutlined, SaveOutlined, EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import { useBranding, useUpdateBranding } from "@/hooks/useBranding";
import { DynamicLogo } from "@/components/public/layout/DynamicLogo";
import { updateFavicon } from "@/components/public/layout/DynamicFavicon";
import type { UploadFile } from "antd/es/upload/interface";

const { TextArea } = Input;
const { TabPane } = Tabs;

export default function BrandingPage() {
	const { data: branding, isLoading, refetch } = useBranding();
	const updateBranding = useUpdateBranding();
	const [form] = Form.useForm();
	const [activeTab, setActiveTab] = useState("logo");
	const [previewVisible, setPreviewVisible] = useState(false);
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string>("");
	const [isSaving, setIsSaving] = useState(false);

	// Set form values when data loads
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
		const file = info.fileList[0]?.originFileObj;
		if (file) {
			setLogoFile(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				setLogoPreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSave = async () => {
		try {
			setIsSaving(true);
			const values = await form.validateFields();

			console.log("[BrandingPage] Saving with logo file:", logoFile?.name);

			await updateBranding.mutateAsync({
				...values,
				logo_file: logoFile || undefined,
			});

			// Clear file state
			setLogoFile(null);

			// Refetch to get new URLs
			await refetch();

			// Update favicon immediately
			setTimeout(() => {
				updateFavicon();
			}, 500);

			message.success("Branding berhasil disimpan!");
		} catch (error) {
			console.error("[BrandingPage] Save error:", error);
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

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Pengaturan Branding</h1>
					<p className="text-gray-500">Kelola logo, favicon, dan identitas brand</p>
				</div>
				<div className="flex gap-2">
					<Button icon={<ReloadOutlined />} onClick={handleRefreshFavicon} title="Refresh Favicon">
						Refresh Favicon
					</Button>
					<Button
						type="primary"
						icon={<SaveOutlined />}
						onClick={handleSave}
						loading={isSaving || updateBranding.isPending}
					>
						Simpan Perubahan
					</Button>
				</div>
			</div>

			<Form form={form} layout="vertical">
				<Card>
					<Tabs activeKey={activeTab} onChange={setActiveTab}>
						<TabPane tab="Logo & Favicon" key="logo">
							<div className="max-w-xl">
								<h3 className="text-lg font-semibold mb-4">Logo Website & Favicon</h3>
								<p className="text-sm text-gray-500 mb-4">
									Upload logo yang akan digunakan sebagai logo website dan favicon (ikon tab browser). Format yang
									disarankan: PNG atau SVG dengan background transparan.
								</p>

								<Form.Item label="Upload Logo">
									<Upload
										accept="image/png,image/jpeg,image/svg+xml,image/webp"
										beforeUpload={() => false}
										onChange={handleLogoChange}
										maxCount={1}
										showUploadList={true}
									>
										<Button icon={<UploadOutlined />}>Pilih File Logo</Button>
									</Upload>
									<p className="text-xs text-gray-500 mt-1">
										Format: PNG, JPG, SVG, WebP. Ukuran maks: 5MB. Logo akan otomatis digunakan sebagai favicon juga.
									</p>
								</Form.Item>

								{logoPreview && (
									<div className="mt-4 p-4 bg-gray-50 rounded-lg">
										<p className="text-sm text-gray-600 mb-2">Preview Logo:</p>
										<div className="flex items-center gap-4">
											<img src={logoPreview} alt="Logo Preview" className="h-16 object-contain" />
											<img src={logoPreview} alt="Favicon Preview" className="w-8 h-8 object-contain" />
										</div>
										<p className="text-xs text-gray-400 mt-2 break-all">{logoPreview}</p>
									</div>
								)}

								<Form.Item label="Lebar Logo (px)" name="logo_width">
									<Slider min={24} max={120} marks={{ 24: "24", 40: "40", 60: "60", 80: "80", 120: "120" }} />
								</Form.Item>

								<Form.Item label="Tinggi Logo (px)" name="logo_height">
									<Slider min={24} max={120} marks={{ 24: "24", 40: "40", 60: "60", 80: "80", 120: "120" }} />
								</Form.Item>
							</div>
						</TabPane>

						<TabPane tab="Teks Brand" key="text">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
								<div>
									<h3 className="text-lg font-semibold mb-4">Teks "MBA"</h3>
									<Form.Item label="Ukuran Font" name="text_mba_size">
										<Slider min={10} max={20} marks={{ 10: "10px", 12: "12px", 14: "14px", 16: "16px", 20: "20px" }} />
									</Form.Item>

									<Form.Item label="Ketebalan Font" name="text_mba_weight">
										<Slider
											min={400}
											max={800}
											step={100}
											marks={{ 400: "400", 500: "500", 600: "600", 700: "700", 800: "800" }}
										/>
									</Form.Item>

									<Form.Item label="Warna Teks" name="text_mba_color">
										<div className="flex items-center gap-2">
											<ColorPicker
												value={form.getFieldValue("text_mba_color")}
												onChange={(color) => form.setFieldValue("text_mba_color", color.toHexString())}
											/>
											<span className="text-sm text-gray-500">{form.getFieldValue("text_mba_color")}</span>
										</div>
									</Form.Item>
								</div>

								<div>
									<h3 className="text-lg font-semibold mb-4">Teks "Laundry Express"</h3>
									<Form.Item label="Ukuran Font" name="text_brand_size">
										<Slider min={12} max={24} marks={{ 12: "12px", 14: "14px", 16: "16px", 18: "18px", 24: "24px" }} />
									</Form.Item>

									<Form.Item label="Ketebalan Font" name="text_brand_weight">
										<Slider
											min={400}
											max={900}
											step={100}
											marks={{ 400: "400", 600: "600", 700: "700", 800: "800", 900: "900" }}
										/>
									</Form.Item>

									<Form.Item label="Gunakan Gradient" name="text_brand_gradient" valuePropName="checked">
										<Switch />
									</Form.Item>

									{form.getFieldValue("text_brand_gradient") ? (
										<>
											<Form.Item label="Warna Gradient Dari" name="text_brand_gradient_from">
												<div className="flex items-center gap-2">
													<ColorPicker
														value={form.getFieldValue("text_brand_gradient_from")}
														onChange={(color) => form.setFieldValue("text_brand_gradient_from", color.toHexString())}
													/>
													<span className="text-sm text-gray-500">
														{form.getFieldValue("text_brand_gradient_from")}
													</span>
												</div>
											</Form.Item>

											<Form.Item label="Warna Gradient Ke" name="text_brand_gradient_to">
												<div className="flex items-center gap-2">
													<ColorPicker
														value={form.getFieldValue("text_brand_gradient_to")}
														onChange={(color) => form.setFieldValue("text_brand_gradient_to", color.toHexString())}
													/>
													<span className="text-sm text-gray-500">{form.getFieldValue("text_brand_gradient_to")}</span>
												</div>
											</Form.Item>
										</>
									) : (
										<Form.Item label="Warna Teks" name="text_brand_color">
											<div className="flex items-center gap-2">
												<ColorPicker
													value={form.getFieldValue("text_brand_color")}
													onChange={(color) => form.setFieldValue("text_brand_color", color.toHexString())}
												/>
												<span className="text-sm text-gray-500">{form.getFieldValue("text_brand_color")}</span>
											</div>
										</Form.Item>
									)}
								</div>
							</div>
						</TabPane>

						<TabPane tab="Meta & SEO" key="seo">
							<div className="max-w-2xl">
								<Form.Item
									label="Judul Situs"
									name="site_title"
									rules={[{ required: true, message: "Judul situs wajib diisi" }]}
								>
									<Input placeholder="MBA Laundry Express" maxLength={60} showCount />
								</Form.Item>

								<Form.Item
									label="Deskripsi Situs"
									name="site_description"
									rules={[{ required: true, message: "Deskripsi situs wajib diisi" }]}
								>
									<TextArea
										placeholder="Self Service Laundry Modern di Surabaya..."
										rows={3}
										maxLength={160}
										showCount
									/>
								</Form.Item>
							</div>
						</TabPane>
					</Tabs>
				</Card>
			</Form>

			{/* Live Preview */}
			<Card
				title={
					<div className="flex items-center justify-between">
						<span>Preview Brand</span>
						<Button type="link" icon={<EyeOutlined />} onClick={() => setPreviewVisible(!previewVisible)}>
							{previewVisible ? "Sembunyikan" : "Tampilkan"} Preview
						</Button>
					</div>
				}
			>
				<div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
					<DynamicLogo />
				</div>

				{previewVisible && (
					<div className="mt-6 space-y-4">
						<div className="p-4 bg-gray-50 rounded-lg">
							<h4 className="font-semibold mb-2">Header Preview:</h4>
							<div className="flex items-center gap-4 p-4 bg-white rounded border">
								<DynamicLogo />
							</div>
						</div>

						<div className="p-4 bg-gray-50 rounded-lg">
							<h4 className="font-semibold mb-2">Footer Preview:</h4>
							<div className="flex items-center gap-4 p-4 bg-gray-900 rounded">
								<DynamicLogo />
							</div>
						</div>
					</div>
				)}
			</Card>
		</div>
	);
}
