export type BranchStatus = "buka" | "tutup" | "ramai";
export type DayName = "senin" | "selasa" | "rabu" | "kamis" | "jumat" | "sabtu" | "minggu";
export type GalleryType = "interior" | "exterior" | "mesin" | "fasilitas" | "umum";
export type PromoStatus = "draft" | "published" | "expired";
export type JobType = "full-time" | "part-time" | "freelance" | "magang";
export type ArticleCategory =
	| "tips-mencuci"
	| "tips-kering"
	| "perawatan-bahan"
	| "noda"
	| "umum"
	| "berita"
	| "promo-info";
export type ArticleStatus = "draft" | "published";
export type TestimonialSource = "website" | "google" | "instagram" | "manual";
export type FaqCategory = "harga" | "mesin" | "waktu" | "pembayaran" | "keamanan" | "barang-hilang" | "umum";
export type PageContentType = "text" | "number" | "image" | "boolean" | "url" | "richtext" | "json";

export interface BaseTable {
	id: string;
	created?: string;
	updated?: string;
}

export interface Branch extends BaseTable {
	name: string;
	slug: string;
	address: string;
	maps_url?: string;
	maps_embed?: string;
	whatsapp?: string;
	email?: string;
	description?: string;
	cover_image?: string;
	is_active: boolean;
	status: BranchStatus;
	/** Harga 1 coin. Semua tarif mesin dihitung dari nilai ini. */
	coin_value?: number;
	/** Kalau true, tarif QRIS tiap mesin ditampilkan di halaman publik. */
	qris_enabled?: boolean;
	/** Kalau false, cabang dianggap tidak menerima tunai/coin. */
	cash_enabled?: boolean;
	sort_order: number;
}

export type MachineKind = "wash" | "dry";

/** Satu tipe mesin di satu cabang (mis. Cuci 17kg = 2 coin). */
export interface BranchMachine extends BaseTable {
	branch_id: string;
	kind: MachineKind;
	capacity_min: number;
	capacity_max: number;
	coins: number;
	duration_min: number;
	duration_max: number;
	/** Harga khusus bayar QRIS. Kosong = pakai harga coin. */
	qris_price?: number | null;
	note?: string;
	is_active: boolean;
	sort_order: number;
}

export interface BranchHour extends BaseTable {
	branch_id: string;
	day: DayName;
	open_time?: string;
	close_time?: string;
	is_closed: boolean;
}

export interface BranchFacility extends BaseTable {
	branch_id: string;
	name: string;
	icon?: string;
	sort_order: number;
}

export interface BranchGallery extends BaseTable {
	branch_id?: string;
	image: string;
	caption?: string;
}

export interface Promo extends BaseTable {
	title: string;
	slug: string;
	description?: string;
	image?: string;
	terms?: string;
	start_date: string;
	/** null = promo berjalan tanpa tenggat waktu (evergreen). */
	end_date: string | null;
	is_active: boolean;
	show_on_home: boolean;
	is_global: boolean;
	priority: number;
	status: PromoStatus;
	/** Nama cabang tempat promo berlaku. Kosong untuk promo global. */
	branch_names?: string[];
}

export interface PromoBranch extends BaseTable {
	promo_id: string;
	branch_id: string;
}

export interface Job extends BaseTable {
	title: string;
	description?: string;
	requirements?: string;
	benefits?: string;
	type: JobType;
	branch_id?: string;
	salary_min?: number;
	salary_max?: number;
	show_salary: boolean;
	is_open: boolean;
	whatsapp_apply?: string;
	posted_at?: string;
	closed_at?: string;
	image?: string;
}

export interface Article extends BaseTable {
	title: string;
	slug: string;
	content: string;
	excerpt?: string;
	thumbnail?: string;
	category: ArticleCategory;
	tags?: string[];
	meta_title?: string;
	meta_desc?: string;
	author?: string;
	read_time?: number;
	status: ArticleStatus;
	published_at?: string;
	views: number;
}

export interface Testimonial extends BaseTable {
	customer_name: string;
	branch_id?: string;
	rating: number;
	comment: string;
	photo?: string;
	is_approved: boolean;
	source: TestimonialSource;
}

export interface Faq extends BaseTable {
	question: string;
	answer: string;
	category: FaqCategory;
	branch_id?: string;
	sort_order: number;
	is_active: boolean;
}

export interface PageContent extends BaseTable {
	key: string;
	value: string;
	type: PageContentType;
	label?: string;
	description?: string;
	group?: string;
}

export interface SpinReward extends BaseTable {
	name: string;
	description?: string;
	reward_type: "voucher" | "diskon" | "hadiah" | "zonk";
	reward_value?: string;
	probability: number;
	is_active: boolean;
	stock?: number;
}

export interface SpinPlay extends BaseTable {
	phone: string;
	branch_id?: string;
	reward_id?: string;
	is_winner: boolean;
	played_at: string;
}

export interface LoyaltyMember extends BaseTable {
	name: string;
	phone: string;
	email?: string;
	branch_id?: string;
	points: number;
	level: "bronze" | "silver" | "gold" | "platinum";
	is_active: boolean;
}

export interface LoyaltyTransaction extends BaseTable {
	member_id: string;
	branch_id?: string;
	type: "earn" | "redeem" | "adjust";
	points: number;
	description?: string;
	reference_id?: string;
}

export interface Partnership extends BaseTable {
	name: string;
	company?: string;
	phone: string;
	email?: string;
	city?: string;
	notes?: string;
	status: "new" | "contacted" | "qualified" | "closed" | "rejected";
}

/** Tiga topik halaman "Bantuan" di publik. */
export type ContactTopic = "kehilangan" | "saran" | "kritik";

/** Laporan dari halaman Bantuan: barang hilang, saran, atau kritik. */
export interface ContactMessage extends BaseTable {
	name: string;
	phone?: string;
	email?: string;
	subject?: string;
	message: string;
	/** Topik laporan; null untuk data lama sebelum kolom ini ada. */
	topic?: ContactTopic | null;
	/** Diisi kalau topiknya "kehilangan": cabang tempat barang tertinggal. */
	branch_id?: string | null;
	/** Tanggal kejadian (khusus laporan kehilangan). */
	incident_date?: string | null;
	/** Nomor mesin (khusus laporan kehilangan). */
	machine_code?: string | null;
	status: "new" | "read" | "replied" | "closed";
}

export interface SiteSetting extends BaseTable {
	key: string;
	value: string;
	description?: string;
}

// File branding: logo, favicon, gambar & thumbnail artikel.
export interface BrandingFile extends BaseTable {
	type: string;
	file: string;
}

export type CollectionRecordMap = {
	branches: Branch;
	branch_hours: BranchHour;
	branch_facilities: BranchFacility;
	branch_gallery: BranchGallery;
	promos: Promo;
	promo_branches: PromoBranch;
	jobs: Job;
	articles: Article;
	testimonials: Testimonial;
	faqs: Faq;
	page_contents: PageContent;
	spin_rewards: SpinReward;
	spin_plays: SpinPlay;
	loyalty_members: LoyaltyMember;
	loyalty_transactions: LoyaltyTransaction;
	partnerships: Partnership;
	contact_messages: ContactMessage;
	site_settings: SiteSetting;
	branding_files: BrandingFile;
};

export type CollectionName = keyof CollectionRecordMap;
export type CollectionRecord<T extends CollectionName> = CollectionRecordMap[T];

export interface PaginatedResponse<T> {
	items: T[];
	page: number;
	perPage: number;
	totalItems: number;
	totalPages: number;
}
