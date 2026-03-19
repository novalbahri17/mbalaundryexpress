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
	price_wash: number;
	price_dry: number;
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
	end_date: string;
	is_active: boolean;
	show_on_home: boolean;
	is_global: boolean;
	priority: number;
	status: PromoStatus;
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

export interface Subscriber extends BaseTable {
	phone: string;
	branch_id?: string;
	is_active: boolean;
	source: string;
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

export interface ContactMessage extends BaseTable {
	name: string;
	phone?: string;
	email?: string;
	subject?: string;
	message: string;
	status: "new" | "read" | "replied" | "closed";
}

export interface SiteSetting extends BaseTable {
	key: string;
	value: string;
	description?: string;
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
	subscribers: Subscriber;
	spin_rewards: SpinReward;
	spin_plays: SpinPlay;
	loyalty_members: LoyaltyMember;
	loyalty_transactions: LoyaltyTransaction;
	partnerships: Partnership;
	contact_messages: ContactMessage;
	site_settings: SiteSetting;
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
