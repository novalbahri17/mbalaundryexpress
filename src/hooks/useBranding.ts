import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/api/client";

export interface BrandingSettings {
	logo_url?: string;
	logo_width?: number;
	logo_height?: number;
	text_mba_size?: string;
	text_mba_weight?: string;
	text_mba_color?: string;
	text_brand_size?: string;
	text_brand_weight?: string;
	text_brand_color?: string;
	text_brand_gradient?: boolean;
	text_brand_gradient_from?: string;
	text_brand_gradient_to?: string;
	favicon_url?: string;
	site_title?: string;
	site_description?: string;
	logo_file?: { fileList?: Array<{ originFileObj?: File }> };
}

const BRANDING_TEXT_KEYS = [
	// logo_url & favicon_url WAJIB ada di sini. Tanpa keduanya, hasil upload
	// hanya tersimpan di tabel branding_files dan `site_settings` tetap
	// menunjuk file lama (atau file yang sudah dihapus).
	"logo_url",
	"favicon_url",
	"logo_width",
	"logo_height",
	"text_mba_size",
	"text_mba_weight",
	"text_mba_color",
	"text_brand_size",
	"text_brand_weight",
	"text_brand_color",
	"text_brand_gradient",
	"text_brand_gradient_from",
	"text_brand_gradient_to",
	"site_title",
	"site_description",
];

const DEFAULT_BRANDING: BrandingSettings = {
	logo_url: "/logo.png",
	logo_width: 40,
	logo_height: 40,
	text_mba_size: "12px",
	text_mba_weight: "600",
	text_mba_color: "#374151",
	text_brand_size: "16px",
	text_brand_weight: "800",
	text_brand_color: "#C62828",
	text_brand_gradient: true,
	text_brand_gradient_from: "#C62828",
	text_brand_gradient_to: "#1565C0",
	favicon_url: "/favicon.ico",
	site_title: "MBA Laundry Express",
	site_description: "Self Service Laundry Modern di Surabaya",
};

interface BrandingFileRecord {
	id: string;
	type: string;
	file: string;
}

// Semua file branding lama (khusus type "logo") dihapus, lalu file baru diunggah.
//
// PENTING: file harus dikirim sebagai multipart/form-data. Kalau objek File
// dimasukkan ke JSON, `JSON.stringify` mengubahnya menjadi teks biasa dan
// server menyimpannya sebagai nama file — akibatnya logo gagal tampil.
// Gambar artikel/gambar pengumuman TIDAK ikut terhapus karena type-nya beda.
async function uploadBrandingFile(file: File): Promise<string> {
	const existing = await pb.collection("branding_files").getFullList<{ id: string; type?: string }>();
	for (const record of existing) {
		if (record.type !== "logo") continue;
		await pb.collection("branding_files").delete(record.id);
	}

	const formData = new FormData();
	formData.append("type", "logo");
	formData.append("file", file);

	const record = await pb.collection("branding_files").create<BrandingFileRecord>(formData);

	// URL selalu berubah karena memakai id record baru, jadi browser tidak
	// akan memakai logo lama dari cache.
	return pb.files.getURL({ id: record.id, collectionName: "branding_files" }, record.file);
}

export function useBranding() {
	return useQuery({
		queryKey: ["branding"],
		queryFn: async (): Promise<BrandingSettings> => {
			const records = await pb.collection("site_settings").getFullList<{ key: string; value: string }>();

			const settings: Record<string, string> = {};
			for (const record of records) {
				settings[record.key] = record.value;
			}

			// Urutan prioritas:
			// 1. `branding_files` dengan type "logo" (hasil upload terbaru dari admin)
			// 2. `site_settings.logo_url` / `favicon_url` (bisa diisi manual)
			// 3. default bawaan
			let logoUrl = settings.logo_url || DEFAULT_BRANDING.logo_url;
			let faviconUrl = settings.favicon_url || DEFAULT_BRANDING.favicon_url;

			try {
				const brandingFiles = await pb.collection("branding_files").getFullList<BrandingFileRecord>({
					sort: "-created",
				});

				const logoFile = brandingFiles.find((f) => f.type === "logo");
				if (logoFile) {
					logoUrl = pb.files.getURL({ id: logoFile.id, collectionName: "branding_files" }, logoFile.file);
					faviconUrl = logoUrl;
				}
			} catch {
				// Pakai logo dari site_settings / bawaan bila belum ada file tersimpan.
			}

			return {
				logo_url: logoUrl,
				logo_width: Number(settings.logo_width) || DEFAULT_BRANDING.logo_width,
				logo_height: Number(settings.logo_height) || DEFAULT_BRANDING.logo_height,
				text_mba_size: settings.text_mba_size || DEFAULT_BRANDING.text_mba_size,
				text_mba_weight: settings.text_mba_weight || DEFAULT_BRANDING.text_mba_weight,
				text_mba_color: settings.text_mba_color || DEFAULT_BRANDING.text_mba_color,
				text_brand_size: settings.text_brand_size || DEFAULT_BRANDING.text_brand_size,
				text_brand_weight: settings.text_brand_weight || DEFAULT_BRANDING.text_brand_weight,
				text_brand_color: settings.text_brand_color || DEFAULT_BRANDING.text_brand_color,
				text_brand_gradient: settings.text_brand_gradient === "true",
				text_brand_gradient_from: settings.text_brand_gradient_from || DEFAULT_BRANDING.text_brand_gradient_from,
				text_brand_gradient_to: settings.text_brand_gradient_to || DEFAULT_BRANDING.text_brand_gradient_to,
				favicon_url: faviconUrl,
				site_title: settings.site_title || DEFAULT_BRANDING.site_title,
				site_description: settings.site_description || DEFAULT_BRANDING.site_description,
			};
		},
	});
}

export function useUpdateBranding() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (settings: BrandingSettings) => {
			if (settings.logo_file) {
				const file = settings.logo_file.fileList?.[0]?.originFileObj;
				if (file) {
					const logoUrl = await uploadBrandingFile(file);
					settings.logo_url = logoUrl;
					settings.favicon_url = logoUrl;
				}
			}

			const updates: Promise<unknown>[] = [];

			for (const key of BRANDING_TEXT_KEYS) {
				const value = settings[key as keyof BrandingSettings];
				if (value === undefined) continue;

				const existing = await pb
					.collection("site_settings")
					.getFirstListItem<{ id: string }>(`key = "${key}"`)
					.catch(() => null);

				if (existing) {
					updates.push(
						pb.collection("site_settings").update(existing.id, {
							value: String(value),
						}),
					);
				} else {
					updates.push(
						pb.collection("site_settings").create({
							key,
							value: String(value),
							description: `Branding setting: ${key}`,
						}),
					);
				}
			}

			await Promise.all(updates);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["branding"] });
			queryClient.invalidateQueries({ queryKey: ["site-settings"] });
		},
	});
}
