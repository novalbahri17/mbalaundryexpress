const WILAYAH_BASE_URL = "https://novalbahri17.github.io/api-wilayah-indonesia/api";

export interface Province {
	id: string;
	name: string;
}

export interface Regency {
	id: string;
	province_id: string;
	name: string;
}

export interface District {
	id: string;
	regency_id: string;
	name: string;
}

export interface Village {
	id: string;
	district_id: string;
	name: string;
}

async function fetchWilayah<T>(path: string): Promise<T[]> {
	const response = await fetch(`${WILAYAH_BASE_URL}/${path}`, {
		method: "GET",
		headers: {
			Accept: "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(`Gagal mengambil data wilayah (${response.status})`);
	}

	const data = (await response.json()) as T[];
	return data;
}

export const getProvinces = (): Promise<Province[]> => fetchWilayah<Province>("provinces.json");

export const getRegencies = (provinceId: string): Promise<Regency[]> =>
	fetchWilayah<Regency>(`regencies/${provinceId}.json`);

export const getDistricts = (regencyId: string): Promise<District[]> =>
	fetchWilayah<District>(`districts/${regencyId}.json`);

export const getVillages = (districtId: string): Promise<Village[]> =>
	fetchWilayah<Village>(`villages/${districtId}.json`);
