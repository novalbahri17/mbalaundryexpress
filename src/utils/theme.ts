import color from "color";
import { type AddChannelToLeaf, themeTokens } from "../theme/type";

export function rgbAlpha(colorVal: string | string[] | number[], alpha: number): string {
	const safeAlpha = Math.max(0, Math.min(1, alpha));

	if (typeof colorVal === "string") {
		if (colorVal.startsWith("#")) {
			return color(colorVal).alpha(safeAlpha).toString();
		}
		if (colorVal.includes("var(")) {
			return `rgba(${colorVal} / ${safeAlpha})`;
		}
		if (colorVal.startsWith("--")) {
			return `rgba(var(${colorVal}) / ${safeAlpha})`;
		}
		if (colorVal.includes(",") || colorVal.includes(" ")) {
			const rgb = colorVal
				.split(/[\s,]+/)
				.map((value) => value.trim())
				.filter(Boolean);
			return `rgba(${rgb.join(", ")}, ${safeAlpha})`;
		}
	}

	if (Array.isArray(colorVal)) {
		return `rgba(${colorVal.join(", ")}, ${safeAlpha})`;
	}

	throw new Error("Invalid color format");
}

export const toCssVar = (propertyPath: string): string => `--${propertyPath.split(".").join("-")}`;

export const createTailwinConfg = (propertyPath: string): Record<string, string> => {
	const variants = getThemeTokenVariants(propertyPath);
	return variants.reduce<Record<string, string>>((acc, variant) => {
		acc[variant] = `var(${toCssVar(`${propertyPath}-${variant}`)})`;
		return acc;
	}, {});
};

export const creatColorChannel = (propertyPath: string): Record<string, string> => {
	const variants = getThemeTokenVariants(propertyPath);
	return variants.reduce<Record<string, string>>((acc, variant) => {
		const variantKey = variant === "default" ? "DEFAULT" : variant;
		acc[variantKey] = `rgb(var(${toCssVar(`${propertyPath}-${variant}Channel`)}))`;
		return acc;
	}, {});
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

export const getThemeTokenVariants = (propertyPath: string): string[] => {
	const keys = propertyPath.split(".");
	const value = keys.reduce<unknown>((obj, key) => {
		if (isRecord(obj)) {
			return obj[key];
		}
		return undefined;
	}, themeTokens as unknown);

	return isRecord(value) ? Object.keys(value) : [];
};

export const removePx = (value: string | number): number => {
	if (typeof value === "number") return value;
	if (!value) {
		throw new Error("Invalid value: empty string");
	}
	const trimmed = value.trim();
	const hasPx = /px$/i.test(trimmed);
	const numeric = hasPx ? trimmed.slice(0, -2) : trimmed;
	const parsed = Number.parseFloat(numeric);
	if (Number.isNaN(parsed)) {
		throw new Error(`Invalid value: ${value}`);
	}
	return parsed;
};

const convertColorChannels = (input: Record<string, unknown>): Record<string, unknown> => {
	const result: Record<string, unknown> = {};
	const isLeafObject = Object.values(input).every((value) => value === null || typeof value === "string");

	if (isLeafObject) {
		for (const [key, value] of Object.entries(input)) {
			result[key] = value;
			if (typeof value === "string") {
				result[`${key}Channel`] = color(value).rgb().array().join(" ");
			}
		}
		return result;
	}

	for (const [key, value] of Object.entries(input)) {
		if (isRecord(value)) {
			result[key] = convertColorChannels(value);
		} else {
			result[key] = value;
		}
	}
	return result;
};

export const addColorChannels = <T extends Record<string, unknown>>(obj: T): AddChannelToLeaf<T> =>
	convertColorChannels(obj) as AddChannelToLeaf<T>;
