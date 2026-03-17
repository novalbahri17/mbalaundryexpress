import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/api/pocketbase";

export interface BrandingSettings {
	// Logo
	logo_url?: string;
	logo_width?: number;
	logo_height?: number;
	
	// Text "MBA"
	text_mba_size?: string;
	text_mba_weight?: string;
	text_mba_color?: string;
	
	// Text "LAUNDRY EXPRESS"
	text_brand_size?: string;
	text_brand_weight?: string;
	text_brand_color?: string;
	text_brand_gradient?: boolean;
	text_brand_gradient_from?: string;
	text_brand_gradient_to?: string;
	
	// Favicon
	favicon_url?: string;
	
	// Meta
	site_title?: string;
	site_description?: string;
}

const BRANDING_KEYS = [
	"logo_url",
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
	"favicon_url",
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

// Upload file to PocketBase and return URL
async function uploadBrandingFile(file: File, filename: string): Promise<string> {
	// Create form data
	const formData = new FormData();
	formData.append("image", file);
	
	// Upload to branch_gallery collection as temporary storage
	// or create a dedicated collection for branding files
	try {
		const record = await pb.collection("branch_gallery").create({
			caption: `branding-${filename}`,
			type: "umum",
			sort_order: 0,
			image: file,
		});
		
		// Get the file URL
		const url = pb.files.getURL(record, record.image);
		return url;
	} catch (error) {
		console.error("Failed to upload file:", error);
		// Fallback to base64 if upload fails
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = reject;
		});
	}
}

export function useBranding() {
	return useQuery({
		queryKey: ["branding"],
		queryFn: async (): Promise<BrandingSettings> => {
			const records = await pb.collection("site_settings").getFullList({
				filter: BRANDING_KEYS.map((k) => `key="${k}"`).join(" || "),
			});

			const settings: Record<string, string> = {};
			for (const record of records) {
				settings[record.key] = record.value;
			}

			return {
				logo_url: settings.logo_url || DEFAULT_BRANDING.logo_url,
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
				favicon_url: settings.favicon_url || DEFAULT_BRANDING.favicon_url,
				site_title: settings.site_title || DEFAULT_BRANDING.site_title,
				site_description: settings.site_description || DEFAULT_BRANDING.site_description,
			};
		},
		staleTime: 5 * 60 * 1000,
	});
}

export function useUpdateBranding() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (settings: BrandingSettings & { logo_file?: File; favicon_file?: File }) => {
			// Handle file uploads first
			let logoUrl = settings.logo_url;
			let faviconUrl = settings.favicon_url;
			
			if (settings.logo_file) {
				logoUrl = await uploadBrandingFile(settings.logo_file, "logo");
			}
			
			if (settings.favicon_file) {
				faviconUrl = await uploadBrandingFile(settings.favicon_file, "favicon");
			}

			const updates: Promise<unknown>[] = [];

			for (const [key, value] of Object.entries(settings)) {
				// Skip file objects and undefined values
				if (key === "logo_file" || key === "favicon_file" || value === undefined) continue;
				
				// Use uploaded URLs for logo and favicon
				let finalValue = value;
				if (key === "logo_url") finalValue = logoUrl;
				if (key === "favicon_url") finalValue = faviconUrl;

				// Cek apakah setting sudah ada
				const existing = await pb
					.collection("site_settings")
					.getFirstListItem(`key="${key}"`)
					.catch(() => null);

				if (existing) {
					// Update
					updates.push(
						pb.collection("site_settings").update(existing.id, {
							value: String(finalValue),
						})
					);
				} else {
					// Create
					updates.push(
						pb.collection("site_settings").create({
							key,
							value: String(finalValue),
							description: `Branding setting: ${key}`,
						})
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
