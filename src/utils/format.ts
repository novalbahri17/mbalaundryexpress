import { format } from "date-fns";
import { id } from "date-fns/locale";

export const formatRupiah = (value: number): string =>
	new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	}).format(value);

export const formatCurrency = (value: number): string =>
	new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	}).format(value);

export const formatCompact = (value: number): string =>
	new Intl.NumberFormat("id-ID", {
		notation: "compact",
		maximumFractionDigits: 1,
	}).format(value);

export const formatDate = (value: string | Date, pattern = "dd MMMM yyyy"): string => {
	const date = typeof value === "string" ? new Date(value) : value;
	if (Number.isNaN(date.getTime())) return "-";
	return format(date, pattern, { locale: id });
};

export const formatDateTime = (value: string | Date): string => formatDate(value, "dd MMM yyyy HH:mm");

export const toWhatsappLink = (phone: string, text?: string): string => {
	const normalized = phone.replace(/^0/, "62").replace(/[^\d]/g, "");
	const url = new URL(`https://wa.me/${normalized}`);
	if (text) {
		url.searchParams.set("text", text);
	}
	return url.toString();
};

export const dayNameId = (date = new Date()): string => {
	const dayMap = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
	return dayMap[date.getDay()] ?? "senin";
};

const blockedUrlProtocols = ["javascript:", "vbscript:", "data:text/html"];

export const sanitizeUrl = (value?: string): string | undefined => {
	if (!value) return undefined;
	const trimmed = value.trim();
	if (!trimmed) return undefined;
	const lower = trimmed.toLowerCase();
	if (blockedUrlProtocols.some((prefix) => lower.startsWith(prefix))) return undefined;
	if (trimmed.startsWith("/")) return trimmed;
	if (trimmed.startsWith("data:image/")) return trimmed;
	if (trimmed.startsWith("blob:")) return trimmed;

	try {
		const url = new URL(trimmed);
		if (url.protocol === "http:" || url.protocol === "https:") {
			return url.toString();
		}
		return undefined;
	} catch {
		return undefined;
	}
};

export const buildImagePlaceholder = (label: string, startColor = "#C62828", endColor = "#1565C0"): string => {
	const safeLabel = label.replace(/[<>&'"]/g, "").slice(0, 32) || "MBA Laundry";
	const svg = `
		<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" fill="none">
			<defs>
				<linearGradient id="mba-gradient" x1="0" y1="0" x2="1280" y2="720" gradientUnits="userSpaceOnUse">
					<stop stop-color="${startColor}"/>
					<stop offset="1" stop-color="${endColor}"/>
				</linearGradient>
			</defs>
			<rect width="1280" height="720" fill="url(#mba-gradient)"/>
			<circle cx="220" cy="180" r="160" fill="white" fill-opacity="0.14"/>
			<circle cx="1080" cy="560" r="220" fill="white" fill-opacity="0.10"/>
			<text x="640" y="380" text-anchor="middle" fill="white" font-size="58" font-family="Plus Jakarta Sans, sans-serif" font-weight="700">${safeLabel}</text>
		</svg>
	`;

	return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const resolveImageUrl = (
	value: string | undefined,
	label: string,
	startColor?: string,
	endColor?: string,
): string => sanitizeUrl(value) ?? buildImagePlaceholder(label, startColor, endColor);

export const sanitizeRichHtml = (value: string): string =>
	value
		.replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1>/gi, "")
		.replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, "")
		.replace(/\shref\s*=\s*(['"])\s*javascript:[^'"]*\1/gi, ' href="#"')
		.replace(/\ssrc\s*=\s*(['"])\s*javascript:[^'"]*\1/gi, "");
