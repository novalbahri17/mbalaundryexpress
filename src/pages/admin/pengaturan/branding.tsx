import { useState, useEffect } from "react";
import { Card, Form, Input, Button, message, Slider, Switch, ColorPicker, Tabs, Upload, Spin } from "antd";
import { UploadOutlined, SaveOutlined, EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import { useBranding, useUpdateBranding } from "@/hooks/useBranding";
import { DynamicLogo } from "@/components/public/layout/DynamicLogo";
import { updateFavicon } from "@/components/public/layout/DynamicFavicon";
import { MetronicPage } from "@/components/admin/MetronicPage";
import type { UploadFile } from "antd/es/upload/interface";
import { useThemeStore } from "@/store/themeStore";

const { TextArea } = Input;
const { TabPane } = Tabs;

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
	const [isSaving, setIsSaving] = useState(false);

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
			await updateBranding.mutateAsync({
				...values,
				logo_file: logoFile || undefined,
			});
			setLogoFile(null);
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

	return (
		<MetronicPage
			title="Pengaturan Branding"
			subtitle="Kelola logo, favicon, dan identitas brand"
		>
			<div className="card">
				<div className="flex items-center justify-between mb-6">
					<div className="flex gap-2">
						<Button icon={<ReloadOutlined />} onClick={handleRefreshFavicon}>
							Refresh Favicon
						</Button>
					</div>
					<Button
						type="primary"
						icon={<SaveOutlined />}
						onClick={handleSave}
						loading={isSaving || updateBranding.isPending}
					>
						Simpan Perubahan
					</Button>
				</div>

				<Form form={form} layout="vertical">
					<Tabs activeKey={activeTab} onChange={setActiveTab}>
						<TabPane tab="Logo & Favicon" key="logo">
							<div className="max-w-xl">
								<h3 className="text-lg font-semibold mb-4">Logo Website & Favicon</h3>
								<p className="text-sm text-gray-500 mb-4">
									Upload logo yang akan digunakan sebagai logo website dan favicon (ikon tab browser).
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
								</Form.Item>

								{logoPreview && (
									<div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: "var(--bg-surface)" }}>
										<p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>Preview Logo:</p>
										<div className="flex items-center gap-4">
											<img src={logoPreview} alt="Logo Preview" className="h-16 object-contain" />
											<img src={logoPreview} alt="Favicon Preview" className="w-8 h-8 object-contain" />
										</div>
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
					className="mt-4"
				>
					<div className="flex items-center gap-4 p-4 rounded-lg border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
						<DynamicLogo />
					</div>

					{previewVisible && (
						<div className="mt-6 space-y-4">
							<div className="p-4 rounded-lg" style={{ backgroundColor: "var(--bg-surface)" }}>
								<h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Header Preview:</h4>
								<div className="flex items-center gap-4 p-4 rounded border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
									<DynamicLogo />
								</div>
							</div>

							<div className="p-4 rounded-lg" style={{ backgroundColor: "var(--bg-surface)" }}>
								<h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Footer Preview:</h4>
								<div className="flex items-center gap-4 p-4 rounded" style={{ backgroundColor: isDark ? "#1a1d27" : "#111827" }}>
									<DynamicLogo />
								</div>
							</div>
						</div>
					)}
				</Card>
			</div>
		</MetronicPage>
	);
}
