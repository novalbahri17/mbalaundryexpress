import { format } from "date-fns";
import { enUS, id } from "date-fns/locale";

/**
 * Locale aktif situs publik. Dipakai oleh helper format di file ini.
 *
 * Default-nya `id-ID` supaya panel admin (yang seluruhnya berbahasa
 * Indonesia) tidak perlu berubah sama sekali. Halaman publik akan memanggil
 * `setFormatLocale()` lewat `usePublicText()` ketika pengguna mengganti bahasa.
 */
export type FormatLocale = "id-ID" | "en-US";

let activeLocale: FormatLocale = "id-ID";

export const setFormatLocale = (locale: FormatLocale): void => {
	activeLocale = locale;
};

export const getFormatLocale = (): FormatLocale => activeLocale;

const dateFnsLocale = (locale: FormatLocale) => (locale === "en-US" ? enUS : id);

export const formatRupiah = (value: number, locale: FormatLocale = activeLocale): string =>
	new Intl.NumberFormat(locale, {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	}).format(value);

export const formatCurrency = (value: number, locale: FormatLocale = activeLocale): string =>
	new Intl.NumberFormat(locale, {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	}).format(value);

export const formatCompact = (value: number, locale: FormatLocale = activeLocale): string =>
	new Intl.NumberFormat(locale, {
		notation: "compact",
		maximumFractionDigits: 1,
	}).format(value);

/** "12.500" (id) / "12,500" (en). */
export const formatNumber = (value: number, locale: FormatLocale = activeLocale): string =>
	new Intl.NumberFormat(locale).format(value);

export const formatDate = (value: string | Date, pattern = "dd MMMM yyyy", locale?: FormatLocale): string => {
	const date = typeof value === "string" ? new Date(value) : value;
	if (Number.isNaN(date.getTime())) return "-";
	const resolved = locale ?? activeLocale;
	return format(date, pattern, { locale: dateFnsLocale(resolved) });
};

export const formatDateTime = (value: string | Date, locale?: FormatLocale): string =>
	formatDate(value, "dd MMM yyyy HH:mm", locale);

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

/**
 * Jam operasional 24 jam disimpan sebagai 00:00 - 23:59.
 * Helper ini dipakai admin maupun situs publik supaya labelnya konsisten.
 */
export const isFullDayHours = (openTime?: string, closeTime?: string): boolean =>
	Boolean(openTime && closeTime && openTime.slice(0, 5) === "00:00" && closeTime.slice(0, 5) === "23:59");

/** "07:00 - 23:00" atau "24 JAM" kalau buka sehari penuh. */
export const formatOpeningHours = (
	openTime: string | undefined,
	closeTime: string | undefined,
	fullDayLabel = "24 JAM",
): string => {
	if (isFullDayHours(openTime, closeTime)) return fullDayLabel;
	if (!openTime && !closeTime) return "-";
	return `${openTime?.slice(0, 5) ?? "-"} - ${closeTime?.slice(0, 5) ?? "-"}`;
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

	// Jika hanya berupa nama file gambar murni (mis. abc123def.jpeg / file.png), arahkan ke /uploads/
	if (/^[A-Za-z0-9._-]+\.(jpeg|jpg|png|webp|gif|svg|avif|ico)$/i.test(trimmed)) {
		return `/uploads/${trimmed}`;
	}

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
