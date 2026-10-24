import {
	Accessibility,
	AirVent,
	AlarmClock,
	Apple,
	Archive,
	Armchair,
	Award,
	Baby,
	BadgeCheck,
	BadgePercent,
	BaggageClaim,
	Banknote,
	Bath,
	BatteryCharging,
	Beer,
	BellRing,
	Bike,
	BookOpen,
	Box,
	Briefcase,
	BugOff,
	Building2,
	Bus,
	Calculator,
	Calendar,
	CalendarClock,
	CalendarDays,
	Candy,
	Camera,
	Car,
	CarFront,
	CheckCheck,
	CigaretteOff,
	CircleAlert,
	CircleCheck,
	CircleDollarSign,
	CircleParking,
	CircleX,
	ClipboardList,
	Clock,
	Clock3,
	Coffee,
	Coins,
	Cookie,
	CookingPot,
	CreditCard,
	Crown,
	CupSoda,
	DoorOpen,
	Dog,
	Droplet,
	Droplets,
	Eye,
	Facebook,
	Fan,
	Feather,
	Filter,
	Fingerprint,
	FireExtinguisher,
	Flame,
	FlameKindling,
	FoldHorizontal,
	Fuel,
	Gamepad2,
	Gift,
	Globe,
	Hammer,
	HandCoins,
	HandHeart,
	HandHelping,
	Headphones,
	Heart,
	HelpCircle,
	Home,
	Hourglass,
	IceCreamBowl,
	Info,
	Instagram,
	Key,
	KeyRound,
	LampCeiling,
	LampDesk,
	Layers,
	Leaf,
	Library,
	Lightbulb,
	ListChecks,
	Lock,
	LockKeyhole,
	LucideIcon,
	Mail,
	MapPin,
	MapPinned,
	Megaphone,
	MessageCircle,
	MessageSquare,
	Microwave,
	Milk,
	Monitor,
	Moon,
	Music,
	Navigation,
	Newspaper,
	NotebookPen,
	Package,
	PackageCheck,
	Percent,
	Phone,
	PiggyBank,
	Pizza,
	Plug,
	PlugZap,
	Power,
	Printer,
	QrCode,
	Radio,
	Receipt,
	Recycle,
	Refrigerator,
	Route,
	Ruler,
	Scale,
	ScanFace,
	ScanLine,
	School,
	Scissors,
	Send,
	Settings,
	Shield,
	ShieldCheck,
	ShieldPlus,
	Shirt,
	ShoppingBag,
	ShoppingBasket,
	ShowerHead,
	Signpost,
	Siren,
	Smartphone,
	Snowflake,
	Sofa,
	Speaker,
	Sparkle,
	Sparkles,
	SprayCan,
	SquareParking,
	Soup,
	Star,
	Store,
	Sun,
	SunDim,
	Sunrise,
	Sunset,
	Table2,
	Tag,
	Tags,
	Thermometer,
	ThermometerSun,
	ThumbsUp,
	Ticket,
	Timer,
	Toilet,
	Trash2,
	Truck,
	Tv,
	User,
	UserCheck,
	UserRoundCheck,
	Users,
	Usb,
	Utensils,
	UtensilsCrossed,
	Video,
	Volume2,
	VolumeX,
	Wallet,
	WashingMachine,
	Watch,
	Waves,
	Weight,
	Wifi,
	Wind,
	WindArrowDown,
	Wrench,
	Zap,
} from "lucide-react";

export type FacilityIconCategory =
	| "Laundry"
	| "Ruang Tunggu"
	| "Makanan & Minuman"
	| "Parkir & Transport"
	| "Keamanan"
	| "Pembayaran"
	| "Waktu"
	| "Fasilitas Umum"
	| "Komunikasi"
	| "Kebersihan"
	| "Umum";

export const FACILITY_ICON_CATEGORIES: FacilityIconCategory[] = [
	"Laundry",
	"Ruang Tunggu",
	"Makanan & Minuman",
	"Parkir & Transport",
	"Keamanan",
	"Pembayaran",
	"Waktu",
	"Fasilitas Umum",
	"Komunikasi",
	"Kebersihan",
	"Umum",
];

export type FacilityIconOption = {
	/** Nilai yang disimpan ke kolom `icon` di tabel branch_facilities. */
	value: string;
	label: string;
	icon: LucideIcon;
	category: FacilityIconCategory;
};

/**
 * Daftar ikon fasilitas terkurasi dari lucide-react (183 ikon).
 * Dipakai admin (picker) dan halaman publik supaya ikon yang dipilih
 * admin pasti tampil sama di website.
 */
export const FACILITY_ICONS: FacilityIconOption[] = [
	// ===== Laundry & Proses =====
	{ value: "washing-machine", label: "Mesin Cuci", icon: WashingMachine, category: "Laundry" },
	{ value: "shirt", label: "Pakaian", icon: Shirt, category: "Laundry" },
	{ value: "wind", label: "Pengering", icon: Wind, category: "Laundry" },
	{ value: "droplets", label: "Air", icon: Droplets, category: "Laundry" },
	{ value: "droplet", label: "Tetes Air", icon: Droplet, category: "Laundry" },
	{ value: "waves", label: "Air Mengalir", icon: Waves, category: "Laundry" },
	{ value: "sparkles", label: "Wangi / Bersih", icon: Sparkles, category: "Laundry" },
	{ value: "spray-can", label: "Semprot / Parfum", icon: SprayCan, category: "Laundry" },
	{ value: "thermometer", label: "Suhu Air", icon: Thermometer, category: "Laundry" },
	{ value: "timer", label: "Timer", icon: Timer, category: "Laundry" },
	{ value: "hourglass", label: "Waktu Proses", icon: Hourglass, category: "Laundry" },
	{ value: "package", label: "Paket Cucian", icon: Package, category: "Laundry" },
	{ value: "package-check", label: "Cucian Selesai", icon: PackageCheck, category: "Laundry" },
	{ value: "shopping-basket", label: "Keranjang", icon: ShoppingBasket, category: "Laundry" },
	{ value: "baggage-claim", label: "Ambil Cucian", icon: BaggageClaim, category: "Laundry" },
	{ value: "ruler", label: "Ukuran", icon: Ruler, category: "Laundry" },
	{ value: "scale", label: "Timbangan", icon: Scale, category: "Laundry" },
	{ value: "weight", label: "Berat", icon: Weight, category: "Laundry" },
	{ value: "layers", label: "Tumpukan", icon: Layers, category: "Laundry" },
	{ value: "fold-horizontal", label: "Lipat", icon: FoldHorizontal, category: "Laundry" },
	{ value: "scissors", label: "Gunting", icon: Scissors, category: "Laundry" },
	{ value: "tag", label: "Label", icon: Tag, category: "Laundry" },
	{ value: "tags", label: "Label Harga", icon: Tags, category: "Laundry" },
	{ value: "receipt", label: "Struk", icon: Receipt, category: "Laundry" },
	{ value: "clipboard-list", label: "Daftar", icon: ClipboardList, category: "Laundry" },
	{ value: "notebook-pen", label: "Catatan", icon: NotebookPen, category: "Laundry" },
	{ value: "list-checks", label: "Checklist", icon: ListChecks, category: "Laundry" },
	{ value: "check-check", label: "Selesai", icon: CheckCheck, category: "Laundry" },

	// ===== Ruang Tunggu & Kenyamanan =====
	{ value: "sofa", label: "Sofa", icon: Sofa, category: "Ruang Tunggu" },
	{ value: "armchair", label: "Kursi", icon: Armchair, category: "Ruang Tunggu" },
	{ value: "table-2", label: "Meja", icon: Table2, category: "Ruang Tunggu" },
	{ value: "wifi", label: "WiFi", icon: Wifi, category: "Ruang Tunggu" },
	{ value: "tv", label: "TV", icon: Tv, category: "Ruang Tunggu" },
	{ value: "monitor", label: "Layar", icon: Monitor, category: "Ruang Tunggu" },
	{ value: "speaker", label: "Speaker", icon: Speaker, category: "Ruang Tunggu" },
	{ value: "music", label: "Musik", icon: Music, category: "Ruang Tunggu" },
	{ value: "radio", label: "Radio", icon: Radio, category: "Ruang Tunggu" },
	{ value: "headphones", label: "Headphone", icon: Headphones, category: "Ruang Tunggu" },
	{ value: "newspaper", label: "Bacaan", icon: Newspaper, category: "Ruang Tunggu" },
	{ value: "book-open", label: "Buku", icon: BookOpen, category: "Ruang Tunggu" },
	{ value: "library", label: "Rak Buku", icon: Library, category: "Ruang Tunggu" },
	{ value: "gamepad-2", label: "Area Bermain", icon: Gamepad2, category: "Ruang Tunggu" },
	{ value: "baby", label: "Area Anak", icon: Baby, category: "Ruang Tunggu" },
	{ value: "lamp-desk", label: "Lampu Meja", icon: LampDesk, category: "Ruang Tunggu" },
	{ value: "lamp-ceiling", label: "Lampu", icon: LampCeiling, category: "Ruang Tunggu" },
	{ value: "lightbulb", label: "Penerangan", icon: Lightbulb, category: "Ruang Tunggu" },
	{ value: "sun", label: "Cahaya", icon: Sun, category: "Ruang Tunggu" },
	{ value: "moon", label: "Malam", icon: Moon, category: "Ruang Tunggu" },
	{ value: "fan", label: "Kipas Angin", icon: Fan, category: "Ruang Tunggu" },
	{ value: "air-vent", label: "AC / Pendingin", icon: AirVent, category: "Ruang Tunggu" },
	{ value: "snowflake", label: "Dingin", icon: Snowflake, category: "Ruang Tunggu" },
	{ value: "flame", label: "Pemanas", icon: Flame, category: "Ruang Tunggu" },
	{ value: "flame-kindling", label: "Air Panas / Dispenser", icon: FlameKindling, category: "Makanan & Minuman" },
	{ value: "thermometer-sun", label: "Hangat", icon: ThermometerSun, category: "Ruang Tunggu" },
	{ value: "wind-arrow-down", label: "Sirkulasi Udara", icon: WindArrowDown, category: "Ruang Tunggu" },

	// ===== Makanan & Minuman =====
	{ value: "coffee", label: "Kopi", icon: Coffee, category: "Makanan & Minuman" },
	{ value: "soup", label: "Pop Mie / Mie Instan", icon: Soup, category: "Makanan & Minuman" },
	{ value: "cup-soda", label: "Minuman", icon: CupSoda, category: "Makanan & Minuman" },
	{ value: "milk", label: "Susu", icon: Milk, category: "Makanan & Minuman" },
	{ value: "beer", label: "Minuman Dingin", icon: Beer, category: "Makanan & Minuman" },
	{ value: "utensils", label: "Makanan", icon: Utensils, category: "Makanan & Minuman" },
	{ value: "utensils-crossed", label: "Alat Makan", icon: UtensilsCrossed, category: "Makanan & Minuman" },
	{ value: "refrigerator", label: "Kulkas", icon: Refrigerator, category: "Makanan & Minuman" },
	{ value: "microwave", label: "Microwave", icon: Microwave, category: "Makanan & Minuman" },
	{ value: "cooking-pot", label: "Dapur", icon: CookingPot, category: "Makanan & Minuman" },
	{ value: "pizza", label: "Snack", icon: Pizza, category: "Makanan & Minuman" },
	{ value: "cookie", label: "Camilan", icon: Cookie, category: "Makanan & Minuman" },
	{ value: "ice-cream-bowl", label: "Es", icon: IceCreamBowl, category: "Makanan & Minuman" },
	{ value: "candy", label: "Permen", icon: Candy, category: "Makanan & Minuman" },
	{ value: "apple", label: "Buah", icon: Apple, category: "Makanan & Minuman" },

	// ===== Parkir & Transport =====
	{ value: "circle-parking", label: "Parkir", icon: CircleParking, category: "Parkir & Transport" },
	{ value: "square-parking", label: "Area Parkir", icon: SquareParking, category: "Parkir & Transport" },
	{ value: "car", label: "Mobil", icon: Car, category: "Parkir & Transport" },
	{ value: "car-front", label: "Parkir Mobil", icon: CarFront, category: "Parkir & Transport" },
	{ value: "bike", label: "Sepeda", icon: Bike, category: "Parkir & Transport" },
	{ value: "truck", label: "Truk", icon: Truck, category: "Parkir & Transport" },
	{ value: "bus", label: "Bus", icon: Bus, category: "Parkir & Transport" },
	{ value: "map-pin", label: "Lokasi", icon: MapPin, category: "Parkir & Transport" },
	{ value: "map-pinned", label: "Titik Lokasi", icon: MapPinned, category: "Parkir & Transport" },
	{ value: "navigation", label: "Navigasi", icon: Navigation, category: "Parkir & Transport" },
	{ value: "route", label: "Rute", icon: Route, category: "Parkir & Transport" },
	{ value: "signpost", label: "Petunjuk Arah", icon: Signpost, category: "Parkir & Transport" },
	{ value: "fuel", label: "BBM", icon: Fuel, category: "Parkir & Transport" },

	// ===== Keamanan =====
	{ value: "shield-check", label: "Keamanan", icon: ShieldCheck, category: "Keamanan" },
	{ value: "shield", label: "Proteksi", icon: Shield, category: "Keamanan" },
	{ value: "shield-plus", label: "Steril", icon: ShieldPlus, category: "Keamanan" },
	{ value: "lock", label: "Terkunci", icon: Lock, category: "Keamanan" },
	{ value: "lock-keyhole", label: "Kunci", icon: LockKeyhole, category: "Keamanan" },
	{ value: "key-round", label: "Kunci Bundar", icon: KeyRound, category: "Keamanan" },
	{ value: "key", label: "Anak Kunci", icon: Key, category: "Keamanan" },
	{ value: "video", label: "CCTV", icon: Video, category: "Keamanan" },
	{ value: "camera", label: "Kamera", icon: Camera, category: "Keamanan" },
	{ value: "eye", label: "Pengawasan", icon: Eye, category: "Keamanan" },
	{ value: "fire-extinguisher", label: "APAR", icon: FireExtinguisher, category: "Keamanan" },
	{ value: "siren", label: "Alarm", icon: Siren, category: "Keamanan" },
	{ value: "bell-ring", label: "Bel", icon: BellRing, category: "Keamanan" },
	{ value: "user-check", label: "Petugas", icon: UserCheck, category: "Keamanan" },
	{ value: "user-round-check", label: "Staf", icon: UserRoundCheck, category: "Keamanan" },
	{ value: "badge-check", label: "Terverifikasi", icon: BadgeCheck, category: "Keamanan" },
	{ value: "fingerprint", label: "Akses", icon: Fingerprint, category: "Keamanan" },
	{ value: "scan-face", label: "Wajah", icon: ScanFace, category: "Keamanan" },
	{ value: "hand-helping", label: "Bantuan", icon: HandHelping, category: "Keamanan" },

	// ===== Pembayaran & Layanan =====
	{ value: "credit-card", label: "Kartu", icon: CreditCard, category: "Pembayaran" },
	{ value: "wallet", label: "Dompet", icon: Wallet, category: "Pembayaran" },
	{ value: "banknote", label: "Uang Tunai", icon: Banknote, category: "Pembayaran" },
	{ value: "coins", label: "Coin", icon: Coins, category: "Pembayaran" },
	{ value: "circle-dollar-sign", label: "Harga", icon: CircleDollarSign, category: "Pembayaran" },
	{ value: "qr-code", label: "QRIS", icon: QrCode, category: "Pembayaran" },
	{ value: "scan-line", label: "Scan QR", icon: ScanLine, category: "Pembayaran" },
	{ value: "smartphone", label: "Aplikasi", icon: Smartphone, category: "Pembayaran" },
	{ value: "gift", label: "Hadiah", icon: Gift, category: "Pembayaran" },
	{ value: "percent", label: "Diskon", icon: Percent, category: "Pembayaran" },
	{ value: "badge-percent", label: "Promo", icon: BadgePercent, category: "Pembayaran" },
	{ value: "ticket", label: "Voucher", icon: Ticket, category: "Pembayaran" },
	{ value: "hand-coins", label: "Bayar", icon: HandCoins, category: "Pembayaran" },
	{ value: "piggy-bank", label: "Tabungan", icon: PiggyBank, category: "Pembayaran" },
	{ value: "calculator", label: "Kalkulator", icon: Calculator, category: "Pembayaran" },
	{ value: "printer", label: "Cetak", icon: Printer, category: "Pembayaran" },

	// ===== Waktu =====
	{ value: "clock", label: "Jam", icon: Clock, category: "Waktu" },
	{ value: "clock-3", label: "Jam Operasional", icon: Clock3, category: "Waktu" },
	{ value: "alarm-clock", label: "Alarm", icon: AlarmClock, category: "Waktu" },
	{ value: "calendar", label: "Kalender", icon: Calendar, category: "Waktu" },
	{ value: "calendar-clock", label: "Jadwal", icon: CalendarClock, category: "Waktu" },
	{ value: "calendar-days", label: "Hari", icon: CalendarDays, category: "Waktu" },
	{ value: "watch", label: "Jam Tangan", icon: Watch, category: "Waktu" },
	{ value: "sunrise", label: "Buka Pagi", icon: Sunrise, category: "Waktu" },
	{ value: "sunset", label: "Tutup Sore", icon: Sunset, category: "Waktu" },

	// ===== Fasilitas Umum =====
	{ value: "shower-head", label: "Shower", icon: ShowerHead, category: "Fasilitas Umum" },
	{ value: "bath", label: "Kamar Mandi", icon: Bath, category: "Fasilitas Umum" },
	{ value: "toilet", label: "Toilet", icon: Toilet, category: "Fasilitas Umum" },
	{ value: "accessibility", label: "Akses Difabel", icon: Accessibility, category: "Fasilitas Umum" },
	{ value: "dog", label: "Ramah Hewan", icon: Dog, category: "Fasilitas Umum" },
	{ value: "cigarette-off", label: "Bebas Rokok", icon: CigaretteOff, category: "Fasilitas Umum" },
	{ value: "volume-2", label: "Audio", icon: Volume2, category: "Fasilitas Umum" },
	{ value: "volume-x", label: "Tenang", icon: VolumeX, category: "Fasilitas Umum" },
	{ value: "leaf", label: "Ramah Lingkungan", icon: Leaf, category: "Fasilitas Umum" },
	{ value: "recycle", label: "Daur Ulang", icon: Recycle, category: "Fasilitas Umum" },
	{ value: "heart", label: "Favorit", icon: Heart, category: "Fasilitas Umum" },
	{ value: "star", label: "Unggulan", icon: Star, category: "Fasilitas Umum" },
	{ value: "award", label: "Kualitas", icon: Award, category: "Fasilitas Umum" },
	{ value: "thumbs-up", label: "Rekomendasi", icon: ThumbsUp, category: "Fasilitas Umum" },
	{ value: "crown", label: "Premium", icon: Crown, category: "Fasilitas Umum" },
	{ value: "zap", label: "Listrik", icon: Zap, category: "Fasilitas Umum" },
	{ value: "plug", label: "Colokan", icon: Plug, category: "Fasilitas Umum" },
	{ value: "plug-zap", label: "Stop Kontak", icon: PlugZap, category: "Fasilitas Umum" },
	{ value: "battery-charging", label: "Charger", icon: BatteryCharging, category: "Fasilitas Umum" },
	{ value: "usb", label: "Port USB", icon: Usb, category: "Fasilitas Umum" },
	{ value: "power", label: "Daya", icon: Power, category: "Fasilitas Umum" },

	// ===== Komunikasi & Info =====
	{ value: "phone", label: "Telepon", icon: Phone, category: "Komunikasi" },
	{ value: "message-circle", label: "Chat", icon: MessageCircle, category: "Komunikasi" },
	{ value: "message-square", label: "Pesan", icon: MessageSquare, category: "Komunikasi" },
	{ value: "mail", label: "Email", icon: Mail, category: "Komunikasi" },
	{ value: "info", label: "Info", icon: Info, category: "Komunikasi" },
	{ value: "help-circle", label: "Bantuan", icon: HelpCircle, category: "Komunikasi" },
	{ value: "circle-alert", label: "Penting", icon: CircleAlert, category: "Komunikasi" },
	{ value: "megaphone", label: "Pengumuman", icon: Megaphone, category: "Komunikasi" },
	{ value: "globe", label: "Website", icon: Globe, category: "Komunikasi" },
	{ value: "instagram", label: "Instagram", icon: Instagram, category: "Komunikasi" },
	{ value: "facebook", label: "Facebook", icon: Facebook, category: "Komunikasi" },
	{ value: "send", label: "Kirim", icon: Send, category: "Komunikasi" },

	// ===== Kebersihan =====
	{ value: "sparkle", label: "Kebersihan", icon: Sparkle, category: "Kebersihan" },
	{ value: "hand-heart", label: "Higienis", icon: HandHeart, category: "Kebersihan" },
	{ value: "bug-off", label: "Anti Serangga", icon: BugOff, category: "Kebersihan" },
	{ value: "trash-2", label: "Tempat Sampah", icon: Trash2, category: "Kebersihan" },
	{ value: "sun-dim", label: "Lembut", icon: SunDim, category: "Kebersihan" },
	{ value: "feather", label: "Halus", icon: Feather, category: "Kebersihan" },

	// ===== Umum =====
	{ value: "building-2", label: "Gedung", icon: Building2, category: "Umum" },
	{ value: "store", label: "Toko", icon: Store, category: "Umum" },
	{ value: "home", label: "Rumah", icon: Home, category: "Umum" },
	{ value: "door-open", label: "Pintu", icon: DoorOpen, category: "Umum" },
	{ value: "users", label: "Rombongan", icon: Users, category: "Umum" },
	{ value: "user", label: "Pelanggan", icon: User, category: "Umum" },
	{ value: "school", label: "Sekolah", icon: School, category: "Umum" },
	{ value: "briefcase", label: "Bisnis", icon: Briefcase, category: "Umum" },
	{ value: "shopping-bag", label: "Belanja", icon: ShoppingBag, category: "Umum" },
	{ value: "box", label: "Kotak", icon: Box, category: "Umum" },
	{ value: "archive", label: "Arsip", icon: Archive, category: "Umum" },
	{ value: "filter", label: "Filter", icon: Filter, category: "Umum" },
	{ value: "settings", label: "Setelan", icon: Settings, category: "Umum" },
	{ value: "wrench", label: "Servis", icon: Wrench, category: "Umum" },
	{ value: "hammer", label: "Perbaikan", icon: Hammer, category: "Umum" },
	{ value: "circle-check", label: "Tersedia", icon: CircleCheck, category: "Umum" },
	{ value: "circle-x", label: "Tidak Ada", icon: CircleX, category: "Umum" },
];

const iconByValue = new Map(FACILITY_ICONS.map((item) => [item.value, item.icon]));

/** Alias lama / nama bebas yang mungkin sudah tersimpan di database. */
function resolveByName(raw: string): LucideIcon | undefined {
	const key = raw.toLowerCase();
	if (key.includes("wifi") || key.includes("internet")) return Wifi;
	if (key.includes("sofa") || key.includes("tunggu")) return Sofa;
	if (key.includes("park")) return CircleParking;
	if (key.includes("tv") || key.includes("hiburan")) return Tv;
	if (key.includes("coffee") || key.includes("kopi") || key.includes("minum")) return Coffee;
	if (key.includes("air-vent") || key.includes("ac") || key.includes("pendingin")) return AirVent;
	if (key.includes("wind") || key.includes("kering")) return Wind;
	if (key.includes("washing") || key.includes("cuci")) return WashingMachine;
	if (key.includes("drop") || key.includes("air")) return Droplets;
	if (key.includes("shirt") || key.includes("setrika") || key.includes("lipat")) return Shirt;
	if (key.includes("sparkle") || key.includes("wangi") || key.includes("parfum")) return Sparkles;
	if (key.includes("mie") || key.includes("noodle") || key.includes("pop mie") || key.includes("indomie")) return Soup;
	if (key.includes("panas") || key.includes("dispenser") || key.includes("kettle") || key.includes("hot water"))
		return FlameKindling;
	if (key.includes("shield") || key.includes("aman")) return ShieldCheck;
	return undefined;
}

/** Ambil komponen ikon dari nilai kolom `icon` (fallback ke nama fasilitas). */
export function getFacilityIcon(iconValue?: string | null, fallbackName?: string): LucideIcon {
	const value = (iconValue || "").trim();
	if (value) {
		const direct = iconByValue.get(value);
		if (direct) return direct;
		const byName = resolveByName(value);
		if (byName) return byName;
	}
	if (fallbackName) {
		const byName = resolveByName(fallbackName);
		if (byName) return byName;
	}
	return Tag;
}
