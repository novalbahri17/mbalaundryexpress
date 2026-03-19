import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/api/pocketbase";

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
}

const BRANDING_TEXT_KEYS = [
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

// Upload file to branding_files collection
async function uploadBrandingFile(file: File): Promise<string> {
	console.log("[useBranding] Uploading file:", file.name, file.size);

	// Hapus file branding lama
	try {
		const existing = await pb.collection("branding_files").getFullList();
		console.log("[useBranding] Found existing files:", existing.length);
		for (const record of existing) {
			await pb.collection("branding_files").delete(record.id);
			console.log("[useBranding] Deleted old file:", record.id);
		}
	} catch (e) {
		console.log("[useBranding] No existing files or error:", e);
	}

	// Upload file baru
	const record = await pb.collection("branding_files").create({
		type: "logo",
		file: file,
	});

	const url = pb.files.getURL(record, record.file);
	console.log("[useBranding] Uploaded new file, URL:", url);
	return url;
}

export function useBranding() {
	return useQuery({
		queryKey: ["branding"],
		queryFn: async (): Promise<BrandingSettings> => {
			console.log("[useBranding] Fetching branding...");

			// Get text settings from site_settings
			const records = await pb.collection("site_settings").getFullList({
				filter: BRANDING_TEXT_KEYS.map((k) => `key="${k}"`).join(" || "),
			});

			const settings: Record<string, string> = {};
			for (const record of records) {
				settings[record.key] = record.value;
			}

			// Get logo/favicon dari branding_files collection
			let logoUrl = DEFAULT_BRANDING.logo_url;
			let faviconUrl = DEFAULT_BRANDING.favicon_url;

			try {
				const brandingFiles = await pb.collection("branding_files").getFullList({
					sort: "-created",
				});
				console.log("[useBranding] Found branding files:", brandingFiles.length);

				const logoFile = brandingFiles.find((f) => f.type === "logo");

				if (logoFile) {
					logoUrl = pb.files.getURL(logoFile, logoFile.file);
					faviconUrl = logoUrl; // Use same logo as favicon
					console.log("[useBranding] Using custom logo:", logoUrl);
				}
			} catch (e) {
				console.log("[useBranding] Could not fetch branding files:", e);
			}

			const result = {
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

			console.log("[useBranding] Result:", result);
			return result;
		},
		staleTime: 0,
		refetchOnWindowFocus: true,
	});
}

export function useUpdateBranding() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (settings: BrandingSettings & { logo_file?: File }) => {
			console.log("[useUpdateBranding] Starting update...", settings.logo_file?.name);

			// Upload logo file jika ada
			if (settings.logo_file) {
				const logoUrl = await uploadBrandingFile(settings.logo_file);
				settings.logo_url = logoUrl;
				settings.favicon_url = logoUrl; // Same logo for favicon
				console.log("[useUpdateBranding] Logo uploaded:", logoUrl);
			}

			// Update text settings ke site_settings
			const updates: Promise<unknown>[] = [];

			for (const key of BRANDING_TEXT_KEYS) {
				const value = settings[key as keyof BrandingSettings];
				if (value === undefined) continue;

				const existing = await pb
					.collection("site_settings")
					.getFirstListItem(`key="${key}"`)
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
			console.log("[useUpdateBranding] Settings updated");
		},
		onSuccess: () => {
			console.log("[useUpdateBranding] Success, invalidating queries...");
			queryClient.invalidateQueries({ queryKey: ["branding"] });
			queryClient.invalidateQueries({ queryKey: ["site-settings"] });

			setTimeout(() => {
				queryClient.refetchQueries({ queryKey: ["branding"] });
			}, 500);
		},
	});
}
