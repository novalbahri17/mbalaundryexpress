const phonePattern = /^(08\d{8,12}|628\d{7,11})$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hexColorPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const validatePhone = (phone: string): boolean => phonePattern.test(phone.replace(/[^\d]/g, ""));

export const normalizePhone = (phone: string): string => {
	const digits = phone.replace(/[^\d]/g, "");
	if (digits.startsWith("0")) return `62${digits.slice(1)}`;
	return digits;
};

export const validateEmail = (email: string): boolean => emailPattern.test(email);

export const validateHexColor = (value: string): boolean => hexColorPattern.test(value.trim());

export const normalizeHexColor = (value: string | undefined, fallback: string): string => {
	const raw = value?.trim() ?? "";
	if (!raw) return fallback.toUpperCase();

	const withHash = raw.startsWith("#") ? raw : `#${raw}`;
	if (!validateHexColor(withHash)) return fallback.toUpperCase();

	if (withHash.length === 4) {
		const r = withHash[1];
		const g = withHash[2];
		const b = withHash[3];
		return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
	}

	return withHash.toUpperCase();
};

export const required = (value: string, label: string): string | null => {
	if (!value.trim()) return `${label} wajib diisi`;
	return null;
};

export const minLength = (value: string, length: number, label: string): string | null => {
	if (value.trim().length < length) return `${label} minimal ${length} karakter`;
	return null;
};

export const sanitizeText = (value: string): string =>
	value
		.replace(/[<>]/g, "")
		.replace(/\s+/g, " ")
		.trim();

export const rateLimitByKey = (key: string, limit: number, windowMs: number): boolean => {
	if (typeof window === "undefined") return true;
	const now = Date.now();
	const raw = window.localStorage.getItem(key);
	const history = raw ? (JSON.parse(raw) as number[]) : [];
	const valid = history.filter((t) => now - t < windowMs);
	if (valid.length >= limit) return false;
	valid.push(now);
	window.localStorage.setItem(key, JSON.stringify(valid));
	return true;
};
