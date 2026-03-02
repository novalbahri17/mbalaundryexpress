const slugifyRegex = /[^a-z0-9-]/g;

export const slugify = (input: string): string =>
	input
		.toLowerCase()
		.trim()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(slugifyRegex, "")
		.replace(/^-|-$/g, "");

export const ensureUniqueSlug = (input: string, existingSlugs: string[]): string => {
	const base = slugify(input);
	if (!existingSlugs.includes(base)) return base;

	let index = 2;
	let candidate = `${base}-${index}`;
	while (existingSlugs.includes(candidate)) {
		index += 1;
		candidate = `${base}-${index}`;
	}
	return candidate;
};

