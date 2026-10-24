import type { ArticleCategory } from "@/types/database.types";

/**
 * Kamus teks antarmuka situs publik (Indonesia + Inggris).
 *
 * Kenapa satu objek, bukan react-i18next?
 * Template slash-admin membawa `src/locales/i18n.ts` yang hanya punya
 * `en_US` dan `zh_CN` dan dipakai oleh panel admin. Situs publik memakai
 * bahasa Indonesia + Inggris, jadi kamus ini sengaja dibuat terpisah dan
 * sederhana: satu objek bertipe kuat yang dibaca lewat `usePublicText()`.
 *
 * Yang TIDAK diterjemahkan di sini: isi dari database (nama cabang, judul
 * promo, isi artikel, pertanyaan FAQ, komentar testimoni, dan pesan
 * pengumuman). Tabel MySQL belum punya kolom `*_en`, jadi konten dinamis
 * tetap tampil apa adanya. Yang diterjemahkan hanya teks antarmuka.
 */

export type ArticleCategoryKey = ArticleCategory | "all";
export type BranchStatusKey = "buka" | "tutup" | "ramai";
export type MachineKind = "wash" | "dry";
export type FaqCategoryKey = "harga" | "mesin" | "waktu" | "pembayaran" | "keamanan" | "barang-hilang" | "umum";

export type PublicDict = {
	common: {
		readMore: string;
		viewDetail: string;
		reset: string;
		loading: string;
		failed: string;
		notAvailable: string;
		minuteShort: string;
		minutesShort: string;
		perLoad: string;
		load: string;
		loads: string;
		times: string;
		home: string;
		washes: string;
		dries: string;
		skipToContent: string;
	};
	nav: {
		home: string;
		branches: string;
		promotions: string;
		gallery: string;
		pricing: string;
		howItWorks: string;
		blog: string;
		careers: string;
		partnership: string;
		contact: string;
		testimonials: string;
		chooseMenu: string;
		chatWa: string;
		chatWaShort: string;
		openMenu: string;
		closeMenu: string;
		lightMode: string;
		darkMode: string;
		moreMenu: string;
		waMessage: string;
	};
	footer: {
		tagline: string;
		slogan: string;
		quickLinks: string;
		branchLocations: string;
		activePromos: string;
		priceList: string;
		howToUse: string;
		blogTips: string;
		faq: string;
		contact: string;
		copyright: string;
		madeIn: string;
	};
	floating: {
		ariaLabel: string;
		tooltip: string;
		waMessage: string;
	};
	branchStatus: Record<BranchStatusKey, string>;
	countdown: {
		prefix: string;
		ended: string;
		days: string;
		hours: string;
		minutes: string;
		daysShort: string;
		hoursShort: string;
		validFor: string;
	};
	lightbox: {
		fallbackAlt: string;
	};
	home: {
		hero: {
			kicker: string;
			titleLine1: string;
			titleHighlight: string;
			titleLine3: string;
			description: string;
			ctaBranches: string;
			ctaPricing: string;
			startFrom: string;
			priceTransparent: string;
			activeBranches: string;
			branchFallback: string;
			openHours: string;
		};
		heroGrid: {
			loading: string;
			emptyTitle: string;
			emptyBody: string;
			alt: string;
		};
		howItWorks: {
			kicker: string;
			title: string;
			subtitle: string;
			stepBadge: string;
			cta: string;
			step1Title: string;
			step1Desc: string;
			step2Title: string;
			step2Desc: string;
			step3Title: string;
			step3Desc: string;
		};
		pricing: {
			kicker: string;
			title: string;
			titleHighlight: string;
			subtitle: string;
			cashAndQris: string;
			coinValue: string;
			qrisPrice: string;
			perCoin: string;
			wash: string;
			dry: string;
			qrisFrom: string;
			startingFrom: string;
			cashCoin: string;
			washCapacityOption: string;
			washDuration: string;
			dryCapacityOption: string;
			dryDuration: string;
			washFeature1: string;
			washFeature2: string;
			washFeature3: string;
			dryFeature1: string;
			dryFeature2: string;
			dryFeature3: string;
			calculatorKicker: string;
			calculatorTitle: string;
			loadWash: string;
			loadDry: string;
			estimatedTotal: string;
			washDrySummary: string;
			cta: string;
			chooseBranch: string;
		};
		locations: {
			kicker: string;
			title: string;
			subtitle: string;
			loading: string;
			empty: string;
			activeCount: string;
			viewDetail: string;
			viewAll: string;
		};
		promo: {
			kicker: string;
			title: string;
			subtitle: string;
			activeBadge: string;
			globalBadge: string;
			localBadge: string;
			viewAll: string;
		};
		testimonials: {
			kicker: string;
			title: string;
			subtitle: string;
			fallbackSource: string;
			viewAll: string;
		};
		whyUs: {
			kicker: string;
			title: string;
			priceTitle: string;
			priceDesc: string;
			cleanTitle: string;
			cleanDesc: string;
			fastTitle: string;
			fastDesc: string;
			locationTitle: string;
			locationDesc: string;
		};
		gallery: {
			kicker: string;
			title: string;
			subtitle: string;
			badge: string;
			empty: string;
			emptyHint: string;
			loadError: string;
			viewAll: string;
			itemFallback: string;
			clickHint: string;
		};
		faq: {
			kicker: string;
			title: string;
			placeholder: string;
			loading: string;
			empty: string;
			stillQuestions: string;
			supportCta: string;
		};
		blog: {
			kicker: string;
			title: string;
			subtitle: string;
			categoryFallback: string;
			read: string;
			viewAll: string;
		};
		cta: {
			title: string;
			description: string;
			button: string;
			branchCount: string;
			openHours: string;
		};
		banner: {
			titlePrefix: string;
			titleHighlight: string;
			description: string;
			button: string;
		};
		caraPakai: {
			kicker: string;
			title: string;
			titleHighlight: string;
			step1Title: string;
			step1Desc: string;
			step2Title: string;
			step2Desc: string;
			step3Title: string;
			step3Desc: string;
			cta: string;
		};
		announcement: {
			fallbackTitle: string;
			defaultUserName: string;
			closeAria: string;
			closeOverlayAria: string;
			endsIn: string;
			backOn: string;
			dismiss: string;
			days: string;
			hours: string;
			minutes: string;
			typeLabels: Record<"info" | "promo" | "libur" | "maintenance", string>;
		};
	};
	pages: {
		cabang: {
			kicker: string;
			title: string;
			highlight: string;
			description: string;
			filterTitle: string;
			searchLabel: string;
			searchPlaceholder: string;
			clearSearch: string;
			province: string;
			allProvinces: string;
			regency: string;
			allRegencies: string;
			loadingRegencies: string;
			district: string;
			allDistricts: string;
			loadingDistricts: string;
			village: string;
			allVillages: string;
			loadingVillages: string;
			regionError: string;
			loadingProvinces: string;
			showingPrefix: string;
			showingMiddle: string;
			showingSuffix: string;
			loadingBranches: string;
			errorBranches: string;
			emptyBranches: string;
			emptyFilter: string;
			wash: string;
			dry: string;
			viewBranch: string;
			waTitle: string;
			addressEmpty: string;
		};
		cabangDetail: {
			tabs: Record<"info" | "mesin" | "jam" | "fasilitas" | "galeri" | "promo", string>;
			today: string;
			closed: string;
			address: string;
			map: string;
			openMaps: string;
			mapTitle: string;
			noMapLink: string;
			wash: string;
			dry: string;
			loading: string;
			notFoundTitle: string;
			notFoundBody: string;
			backToBranches: string;
			noDescription: string;
			machineHeader: string;
			machineTariff: string;
			cashNote: string;
			qrisOnly: string;
			capacity: string;
			duration: string;
			coins: string;
			priceCash: string;
			priceQris: string;
			noMachines: string;
			hoursClosed: string;
			fullDay: string;
			noHours: string;
			facilitiesEmpty: string;
			galleryEmpty: string;
			promoEmpty: string;
			terms: string;
			chatWa: string;
		};
		promo: {
			kicker: string;
			title: string;
			highlight: string;
			description: string;
			allBranches: string;
			loading: string;
			empty: string;
			emptyFiltered: string;
			globalTitle: string;
			globalTitleHint: string;
			globalBadge: string;
			localTitle: string;
			localTitleHint: string;
			localBadge: string;
			viewBranch: string;
		};
		harga: {
			kicker: string;
			title: string;
			highlight: string;
			description: string;
			chooseBranch: string;
			coinValue: string;
			loadingMachines: string;
			emptyMachines: string;
			machineHeader: string;
			capacity: string;
			duration: string;
			coins: string;
			cash: string;
			qris: string;
			washMachine: string;
			dryMachine: string;
			noteCash: string;
			noteQris: string;
			noteQrisOnly: string;
			cheapest: string;
			cheapestSuffix: string;
		};
		kalkulator: {
			kicker: string;
			title: string;
			highlight: string;
			description: string;
			badge: string;
			estimateTitle: string;
			loadLabel: string;
			loadAria: string;
			wash: string;
			dry: string;
			noteQris: string;
			noteCash: string;
			noteQrisOnly: string;
			branchLabel: string;
		};
		caraPakai: {
			kicker: string;
			title: string;
			highlight: string;
			description: string;
		};
		faq: {
			kicker: string;
			title: string;
			highlight: string;
			description: string;
			all: string;
			loading: string;
			empty: string;
			categories: Record<FaqCategoryKey, string>;
		};
		testimoni: {
			kicker: string;
			title: string;
			highlight: string;
			description: string;
			loading: string;
			source: string;
			empty: string;
		};
		galeri: {
			kicker: string;
			title: string;
			highlight: string;
			description: string;
			empty: string;
		};
		karir: {
			kicker: string;
			title: string;
			highlight: string;
			description: string;
			detail: string;
			applyWa: string;
			empty: string;
			waMessage: string;
		};
		karirDetail: {
			kicker: string;
			notFound: string;
			description: string;
			qualifications: string;
			benefits: string;
			salaryRange: string;
			applyWa: string;
			waMessage: string;
		};
		kemitraan: {
			kicker: string;
			title: string;
			highlight: string;
			description: string;
			name: string;
			company: string;
			phone: string;
			email: string;
			city: string;
			notes: string;
			submit: string;
			submitting: string;
			invalidPhone: string;
			invalidEmail: string;
			rateLimited: string;
			success: string;
			failed: string;
		};
		korporat: {
			kicker: string;
			title: string;
			highlight: string;
			description: string;
			packageTitle: string;
			packageDesc: string;
			activationTitle: string;
			activationDesc: string;
			branchesTitle: string;
			branchesLoading: string;
			branchesCount: string;
		};
		tentang: {
			kicker: string;
			title: string;
			highlight: string;
			description: string;
			missionTitle: string;
			missionDesc: string;
			growthTitle: string;
			growthDesc: string;
		};
		kontak: {
			kicker: string;
			title: string;
			highlight: string;
			description: string;
			name: string;
			namePlaceholder: string;
			phone: string;
			email: string;
			optional: string;
			branch: string;
			branchPlaceholder: string;
			branchRequired: string;
			incidentDate: string;
			item: string;
			itemPlaceholder: string;
			subject: string;
			subjectPlaceholder: string;
			message: string;
			messagePlaceholderLost: string;
			messagePlaceholderFeedback: string;
			submit: string;
			submitting: string;
			invalidPhone: string;
			invalidEmail: string;
			rateLimited: string;
			success: string;
			failed: string;
			topicLost: string;
			topicLostDesc: string;
			topicSuggestion: string;
			topicSuggestionDesc: string;
			topicComplaint: string;
			topicComplaintDesc: string;
		};
		statistik: {
			kicker: string;
			title: string;
			highlight: string;
			description: string;
			activeBranches: string;
			runningPromos: string;
			approvedTestimonials: string;
			averageRating: string;
		};
		blog: {
			kicker: string;
			title: string;
			highlight: string;
			description: string;
			searchPlaceholder: string;
			featured: string;
			readMore: string;
			readTime: string;
			emptyTitle: string;
			emptyBody: string;
			categories: Record<ArticleCategoryKey, string>;
		};
		blogDetail: {
			allArticles: string;
			backToBlog: string;
			author: string;
			readTime: string;
			views: string;
			tag: string;
			share: string;
			shareFacebook: string;
			shareTwitter: string;
			shareWhatsapp: string;
			copyLink: string;
			copied: string;
			copyFailed: string;
			copiedToast: string;
			copyFailedToast: string;
			zoom: string;
			zoomAria: string;
			imageAria: string;
			notFound: string;
			related: string;
			viewAll: string;
			backTop: string;
		};
		notFound: {
			title: string;
			description: string;
			button: string;
		};
	};
	seo: Record<
		string,
		{
			title: string;
			description: string;
		}
	>;
};

const id: PublicDict = {
	common: {
		readMore: "Baca",
		viewDetail: "Lihat Detail",
		reset: "Reset",
		loading: "Memuat...",
		failed: "Gagal memuat data",
		notAvailable: "Belum tersedia",
		minuteShort: "menit",
		minutesShort: "menit",
		perLoad: "per load",
		load: "load",
		loads: "load",
		times: "kali",
		home: "Beranda",
		washes: "cuci",
		dries: "kering",
		skipToContent: "Lewati ke konten",
	},
	nav: {
		home: "Beranda",
		branches: "Cabang",
		promotions: "Promo",
		gallery: "Galeri",
		pricing: "Harga",
		howItWorks: "Cara Pakai",
		blog: "Blog",
		careers: "Loker",
		partnership: "Kemitraan",
		contact: "Bantuan",
		testimonials: "Testimoni",
		chooseMenu: "Pilih menu layanan MBA Laundry Express",
		chatWa: "Chat WhatsApp",
		chatWaShort: "Chat WA",
		openMenu: "Buka menu",
		closeMenu: "Tutup menu",
		lightMode: "Mode Terang",
		darkMode: "Mode Gelap",
		moreMenu: "Lainnya",
		waMessage: "Halo MBA Laundry, saya ingin order laundry.",
	},
	footer: {
		tagline: "Laundry self-service modern, mesin bersih, harga transparan.",
		slogan: "Bersih itu mudah, cepat, dan terjangkau",
		quickLinks: "Tautan Cepat",
		branchLocations: "Lokasi Cabang",
		activePromos: "Promo Aktif",
		priceList: "Daftar Harga",
		howToUse: "Cara Pakai",
		blogTips: "Blog Tips",
		faq: "FAQ",
		contact: "Bantuan",
		copyright: "Hak cipta dilindungi.",
		madeIn: "Laundry self-service di Indonesia.",
	},
	floating: {
		ariaLabel: "Chat WhatsApp",
		tooltip: "Chat Kami",
		waMessage: "Halo MBA Laundry",
	},
	branchStatus: {
		buka: "Buka",
		tutup: "Tutup",
		ramai: "Ramai",
	},
	countdown: {
		prefix: "Hitung mundur:",
		ended: "Promo berakhir",
		days: "hari",
		hours: "jam",
		minutes: "menit",
		daysShort: "h",
		hoursShort: "j",
		validFor: "Berlaku",
	},
	lightbox: {
		fallbackAlt: "Galeri MBA Laundry",
	},
	home: {
		hero: {
			kicker: "Laundry Self-Service",
			titleLine1: "Cuci sendiri,",
			titleHighlight: "bayar lebih hemat",
			titleLine3: "cepat selesai",
			description:
				"Cuci dan kering sendiri pakai mesin yang selalu dibersihkan. Datang kapan saja, tanpa perlu menunggu antrean.",
			ctaBranches: "Lihat cabang terdekat",
			ctaPricing: "Cek daftar harga",
			startFrom: "Mulai",
			priceTransparent: "Harga transparan per mesin",
			activeBranches: "cabang aktif",
			branchFallback: "Cabang di Sidoarjo & Surabaya",
			openHours: "Buka 07:00 sampai 23:00",
		},
		heroGrid: {
			loading: "Memuat...",
			emptyTitle: "Mesin siap dipakai",
			emptyBody: "Foto outlet akan tampil di sini setelah diunggah lewat admin.",
			alt: "Galeri MBA Laundry",
		},
		howItWorks: {
			kicker: "Cara Pakai",
			title: "Mudah! Cukup 3 Langkah",
			subtitle: "Proses laundry mandiri yang simple dan cepat",
			stepBadge: "Langkah",
			cta: "Panduan Lengkap",
			step1Title: "Pilih Mesin Kosong",
			step1Desc: "Cari mesin cuci atau pengering yang tersedia. Cek kondisi mesin bersih.",
			step2Title: "Bayar & Mulai",
			step2Desc: "Scan QRIS atau masukkan koin sesuai tarif. Mesin otomatis mulai bekerja.",
			step3Title: "Tunggu & Ambil",
			step3Desc: "Waktu cuci dan kering beda tiap kapasitas mesin. Ambil pakaian setelah selesai.",
		},
		pricing: {
			kicker: "Harga",
			title: "Harga Jelas,",
			titleHighlight: "Tanpa Biaya Tersembunyi",
			subtitle:
				"Bayar sesuai kapasitas mesin yang kamu pakai. Pilih cabang untuk melihat tarif dan durasi yang berlaku di sana.",
			cashAndQris: "Harga tunai & QRIS · 1 coin =",
			coinValue: "1 coin =",
			qrisPrice: "Harga QRIS",
			perCoin: "per coin",
			wash: "Mencuci",
			dry: "Mengeringkan",
			qrisFrom: "Harga QRIS · ",
			startingFrom: "Mulai dari · ",
			cashCoin: "Tunai / coin: ",
			washCapacityOption: "Pilihan kapasitas",
			washDuration: "Durasi",
			dryCapacityOption: "Pilihan kapasitas",
			dryDuration: "Durasi",
			washFeature1: "Teknologi hemat air",
			washFeature2: "Program aman untuk berbagai kain",
			washFeature3: "Detergen steril otomatis",
			dryFeature1: "Sensor suhu stabil",
			dryFeature2: "Mode cepat untuk kebutuhan mendesak",
			dryFeature3: "Hasil kering siap lipat",
			calculatorKicker: "Kalkulator",
			calculatorTitle: "Hitung perkiraan biaya laundry-mu",
			loadWash: "Load cuci",
			loadDry: "Load kering",
			estimatedTotal: "Estimasi Total",
			washDrySummary: "{wash} cuci + {dry} kering",
			cta: "Cek Cabang Terdekat",
			chooseBranch: "Pilih cabang",
		},
		locations: {
			kicker: "Lokasi",
			title: "Lokasi Kami, Satu Standar Kualitas",
			subtitle: "Setiap cabang MBA Laundry dilengkapi mesin modern dan standar kebersihan tinggi.",
			loading: "Memuat cabang...",
			empty: "Belum ada cabang aktif saat ini.",
			activeCount: "cabang aktif",
			viewDetail: "Lihat Detail",
			viewAll: "Lihat Semua Cabang",
		},
		promo: {
			kicker: "Promo Terbaru",
			title: "Ada Promo Laundry Hari Ini",
			subtitle: "Harga lebih murah untuk cuci dan kering. Cek dulu cabang yang ikut promonya.",
			activeBadge: "Promo Aktif",
			globalBadge: "Semua cabang",
			localBadge: "Cabang tertentu",
			viewAll: "Lihat Semua Promo",
		},
		testimonials: {
			kicker: "Testimoni",
			title: "Apa Kata Pelanggan Kami",
			subtitle: "Testimoni nyata dari pelanggan yang telah menggunakan layanan kami",
			fallbackSource: "Pelanggan",
			viewAll: "Lihat Semua Review",
		},
		whyUs: {
			kicker: "Kenapa MBA Laundry",
			title: "Kenapa Pilih MBA Laundry?",
			priceTitle: "Harga Transparan",
			priceDesc: "Tidak ada biaya tambahan. Tarif per layanan tampil jelas dan selalu update.",
			cleanTitle: "Mesin Selalu Bersih",
			cleanDesc: "Perawatan rutin harian dengan standar kebersihan tinggi untuk setiap drum mesin.",
			fastTitle: "Proses Super Cepat",
			fastDesc: "Siklus cuci dan kering yang efisien untuk jadwal harian yang padat.",
			locationTitle: "Lokasi Strategis",
			locationDesc: "Dekat area kampus, kos, dan pusat aktivitas agar laundry makin praktis.",
		},
		gallery: {
			kicker: "Galeri Outlet",
			title: "Intip Keseruan Cuci di Sini!",
			subtitle:
				"Didesain untuk kenyamanan optimal Anda, setiap outlet kami bersih, terang, dan ber-AC penuh sambil menunggu cucian selesai.",
			badge: "Galeri",
			empty: "Belum ada foto galeri outlet.",
			emptyHint: "Silakan upload dari dashboard admin.",
			loadError: "Galeri outlet belum bisa dimuat. Silakan cek koneksi.",
			viewAll: "Lihat Semua Galeri",
			itemFallback: "Galeri",
			clickHint: "Klik untuk melihat detail",
		},
		faq: {
			kicker: "FAQ",
			title: "Pertanyaan yang paling sering ditanyakan",
			placeholder: "Cari pertanyaan...",
			loading: "Memuat FAQ...",
			empty: "Tidak ada pertanyaan yang cocok.",
			stillQuestions: "Masih ada pertanyaan?",
			supportCta: "Hubungi Tim Support",
		},
		blog: {
			kicker: "Blog",
			title: "Tips Merawat Pakaian",
			subtitle: "Dapatkan informasi terbaru seputar cara mencuci yang benar dan tips merawat mesin.",
			categoryFallback: "Tips",
			read: "Baca",
			viewAll: "Lihat Semua Artikel",
		},
		cta: {
			title: "Yuk, Coba Sekarang!",
			description:
				"Laundry sendiri lebih hemat dan praktis. Pilih cabang terdekat dan langsung datang rasakan kualitasnya!",
			button: "Chat WhatsApp Sekarang",
			branchCount: "Cabang",
			openHours: "Buka 07:00 - 23:00",
		},
		banner: {
			titlePrefix: "Yuk, ",
			titleHighlight: "Laundry Sekarang!",
			description: "Pilih cabang terdekatmu dan rasakan proses laundry yang cepat, bersih, dan praktis.",
			button: "Pilih Cabang",
		},
		caraPakai: {
			kicker: "Cara Pakai",
			title: "Mudah! ",
			titleHighlight: "Cukup 3 Langkah",
			step1Title: "Pilih Mesin Kosong",
			step1Desc: "Cari mesin cuci atau pengering yang tersedia.",
			step2Title: "Bayar & Mulai",
			step2Desc: "Scan QRIS atau masukkan koin sesuai tarif.",
			step3Title: "Tunggu & Ambil",
			step3Desc: "Waktu cuci dan kering beda tiap kapasitas mesin. Ambil pakaian setelah selesai.",
			cta: "Panduan Lengkap",
		},
		announcement: {
			fallbackTitle: "Pengumuman",
			defaultUserName: "Pelanggan Setia",
			closeAria: "Tutup Pengumuman",
			closeOverlayAria: "Tutup Overlay",
			endsIn: "Tutup Berakhir Dalam:",
			backOn: "Kami akan kembali melayani Anda pada",
			dismiss: "Baik, Mengerti",
			days: "Hari",
			hours: "Jam",
			minutes: "Menit",
			typeLabels: {
				info: "Informasi",
				promo: "Promo Spesial",
				libur: "Pengumuman Libur",
				maintenance: "Perbaikan Sistem",
			},
		},
	},
	pages: {
		cabang: {
			kicker: "Cabang",
			title: "Pilih",
			highlight: "Cabang Terdekat",
			description:
				"Semua cabang aktif tampil otomatis dari database. Gunakan filter wilayah Indonesia untuk mempercepat pencarian.",
			filterTitle: "Filter Wilayah Indonesia",
			searchLabel: "Cari Nama/Alamat Cabang",
			searchPlaceholder: "Contoh: bohar, pagesangan, surabaya...",
			clearSearch: "Hapus kata pencarian",
			province: "Provinsi",
			allProvinces: "Semua Provinsi",
			regency: "Kabupaten/Kota",
			allRegencies: "Semua Kab/Kota",
			loadingRegencies: "Memuat kab/kota...",
			district: "Kecamatan",
			allDistricts: "Semua Kecamatan",
			loadingDistricts: "Memuat kecamatan...",
			village: "Kelurahan",
			allVillages: "Semua Kelurahan",
			loadingVillages: "Memuat kelurahan...",
			regionError: "Sebagian data wilayah gagal dimuat. Coba refresh halaman atau cek koneksi internet.",
			loadingProvinces: "Memuat data provinsi...",
			showingPrefix: "Menampilkan",
			showingMiddle: "dari",
			showingSuffix: "cabang.",
			loadingBranches: "Memuat data cabang...",
			errorBranches: "Gagal mengambil data cabang.",
			emptyBranches: "Belum ada cabang aktif.",
			emptyFilter: "Tidak ada cabang yang cocok dengan filter/pencarian saat ini.",
			wash: "Cuci",
			dry: "Kering",
			viewBranch: "Lihat Cabang",
			waTitle: "Chat WhatsApp",
			addressEmpty: "Alamat belum tersedia",
		},
		cabangDetail: {
			tabs: {
				info: "Info",
				mesin: "Mesin & Harga",
				jam: "Jam Operasional",
				fasilitas: "Fasilitas",
				galeri: "Galeri",
				promo: "Promo",
			},
			today: "Hari ini",
			closed: "Tutup",
			address: "Alamat",
			map: "Peta Lokasi",
			openMaps: "Buka Google Maps",
			mapTitle: "Peta",
			noMapLink: "Belum ada tautan peta.",
			wash: "Cuci",
			dry: "Kering",
			loading: "Memuat detail cabang...",
			notFoundTitle: "Cabang tidak ditemukan",
			notFoundBody: "Cabang yang Anda cari mungkin sudah tidak aktif atau tautannya berubah.",
			backToBranches: "Kembali ke daftar cabang",
			noDescription: "Deskripsi cabang belum tersedia.",
			machineHeader: "Mesin",
			machineTariff: "Mesin & Tarif",
			cashNote: "Tunai = coin ×",
			qrisOnly: "Tarif QRIS saja",
			capacity: "Kapasitas",
			duration: "Durasi",
			coins: "Coin",
			priceCash: "Tunai",
			priceQris: "QRIS",
			noMachines: "Data mesin cabang ini belum diisi.",
			hoursClosed: "Tutup",
			fullDay: "24 Jam",
			noHours: "Jam operasional belum tersedia.",
			facilitiesEmpty: "Fasilitas belum terdaftar.",
			galleryEmpty: "Galeri cabang masih kosong.",
			promoEmpty: "Tidak ada promo aktif untuk cabang ini.",
			terms: "S&K:",
			chatWa: "Chat WhatsApp",
		},
		promo: {
			kicker: "Promo",
			title: "Promo",
			highlight: "Hari Ini",
			description: "Pilih cabang untuk melihat promo yang berlaku di sana.",
			allBranches: "Semua Cabang",
			loading: "Memuat promo...",
			empty: "Tidak ada promo aktif saat ini.",
			emptyFiltered: "Belum ada promo di cabang ini. Coba pilih Semua Cabang.",
			globalTitle: "Promo Global",
			globalTitleHint: "Berlaku di semua cabang",
			globalBadge: "SEMUA CABANG",
			localTitle: "Promo Cabang Tertentu",
			localTitleHint: "Hanya berlaku di cabang yang tertera",
			localBadge: "Khusus Cabang",
			viewBranch: "Lihat cabang",
		},
		harga: {
			kicker: "Harga",
			title: "Harga",
			highlight: "Transparan",
			description: "Harga dihitung per mesin dan per cabang, langsung dari database. Bayar pakai coin.",
			chooseBranch: "Pilih Cabang",
			coinValue: "1 coin =",
			loadingMachines: "Memuat tarif mesin...",
			emptyMachines: "Tarif mesin cabang ini belum diisi. Hubungi admin untuk melengkapinya.",
			machineHeader: "Mesin",
			capacity: "Kapasitas",
			duration: "Durasi",
			coins: "Coin",
			cash: "Tunai",
			qris: "QRIS",
			washMachine: "Mesin Cuci",
			dryMachine: "Pengering",
			noteCash: "Jumlah coin mengikuti kapasitas mesin. Harga akhir = coin ×",
			noteQris: "Cabang ini menerima pembayaran QRIS dengan tarif khusus seperti pada kolom harga.",
			noteQrisOnly: "Cabang ini hanya menerima pembayaran QRIS.",
			cheapest: "Harga termurah cuci di cabang ini:",
			cheapestSuffix: "Kapasitas mesin menentukan jumlah coin yang dibutuhkan.",
		},
		kalkulator: {
			kicker: "Kalkulator",
			title: "Kalkulator",
			highlight: "Biaya Laundry",
			description: "Hitung estimasi biaya berdasarkan jumlah load dan jenis layanan.",
			badge: "Kalkulator",
			estimateTitle: "Perkiraan Biaya",
			loadLabel: "Jumlah load",
			loadAria: "Jumlah load",
			wash: "Cuci",
			dry: "Kering",
			noteQris: "Estimasi pakai tarif QRIS. Bayar coin lebih mahal.",
			noteCash: "Estimasi pakai tarif coin.",
			noteQrisOnly: "Cabang ini hanya menerima QRIS.",
			branchLabel: "Pilih cabang",
		},
		caraPakai: {
			kicker: "Panduan",
			title: "Cara",
			highlight: "Pakai",
			description: "Panduan self-service dari pilih mesin hingga selesai cuci dalam 3 langkah.",
		},
		faq: {
			kicker: "FAQ",
			title: "Pertanyaan",
			highlight: "Umum",
			description: "Jawaban cepat untuk pertanyaan yang paling sering ditanyakan pelanggan.",
			all: "Semua",
			loading: "Memuat FAQ...",
			empty: "Belum ada FAQ.",
			categories: {
				harga: "Harga",
				mesin: "Mesin",
				waktu: "Waktu",
				pembayaran: "Pembayaran",
				keamanan: "Keamanan",
				"barang-hilang": "Barang Hilang",
				umum: "Umum",
			},
		},
		testimoni: {
			kicker: "Testimoni",
			title: "Suara",
			highlight: "Pelanggan",
			description: "Ulasan pelanggan dari website, Google, dan Instagram yang sudah disetujui admin.",
			loading: "Memuat testimoni...",
			source: "Sumber:",
			empty: "Belum ada testimoni disetujui.",
		},
		galeri: {
			kicker: "Galeri",
			title: "Lihat",
			highlight: "Suasana Cabang",
			description: "Galeri interior, fasilitas, dan mesin dari seluruh cabang MBA Laundry.",
			empty: "Belum ada gambar galeri.",
		},
		karir: {
			kicker: "Karir",
			title: "Bergabung",
			highlight: "Bersama Kami",
			description: "Lowongan aktif dari seluruh cabang MBA Laundry Express.",
			detail: "Detail",
			applyWa: "Lamar WA",
			empty: "Saat ini belum ada lowongan terbuka.",
			waMessage: "Halo, saya ingin melamar",
		},
		karirDetail: {
			kicker: "Karir Detail",
			notFound: "Lowongan tidak ditemukan.",
			description: "Deskripsi",
			qualifications: "Kualifikasi",
			benefits: "Benefit",
			salaryRange: "Range gaji:",
			applyWa: "Lamar via WhatsApp",
			waMessage: "Halo, saya ingin melamar posisi",
		},
		kemitraan: {
			kicker: "Kemitraan",
			title: "Program",
			highlight: "Kemitraan",
			description: "Buka peluang kerja sama laundry satelit, corporate wash, dan co-branding area kampus/kost.",
			name: "Nama",
			company: "Nama usaha/perusahaan",
			phone: "Nomor WhatsApp",
			email: "Email",
			city: "Kota",
			notes: "Catatan kebutuhan",
			submit: "Kirim Pengajuan",
			submitting: "Mengirim...",
			invalidPhone: "Nomor telepon tidak valid",
			invalidEmail: "Email tidak valid",
			rateLimited: "Terlalu banyak percobaan. Coba lagi nanti.",
			success: "Pengajuan kemitraan terkirim",
			failed: "Gagal mengirim data",
		},
		korporat: {
			kicker: "Korporat",
			title: "Layanan",
			highlight: "Korporat",
			description: "Solusi laundry skala tim, kantor, kos eksklusif, dan komunitas dengan SLA terukur.",
			packageTitle: "Paket Korporat",
			packageDesc: "Skema harga volume, invoice bulanan, dan dashboard pemakaian.",
			activationTitle: "Aktivasi di Lokasi",
			activationDesc: "Aktivasi layanan laundry untuk event, kampus, atau properti sewa.",
			branchesTitle: "Cabang Tersedia",
			branchesLoading: "Memuat data cabang...",
			branchesCount: "Saat ini terhubung ke {count} cabang aktif dan bisa ditambah dinamis.",
		},
		tentang: {
			kicker: "Tentang",
			title: "Tentang",
			highlight: "MBA Laundry",
			description: "Brand laundry self-service modern untuk mahasiswa, keluarga, dan pekerja urban.",
			missionTitle: "Misi Kami",
			missionDesc: "Membuat proses cuci jadi mudah, transparan, dan konsisten lewat standar operasional berbasis data.",
			growthTitle: "Pertumbuhan Cabang",
			growthDesc: "Jumlah cabang aktif saat ini: {count}. Semua cabang dikelola dinamis dari database tanpa hardcode.",
		},
		kontak: {
			kicker: "Bantuan",
			title: "Pusat",
			highlight: "Bantuan",
			description: "Barang tertinggal, kritik, atau saran? Pilih jenisnya, lalu isi satu form yang sama.",
			topicLost: "Kehilangan Barang",
			topicLostDesc: "Barang tertinggal di cabang atau mesin.",
			topicSuggestion: "Saran",
			topicSuggestionDesc: "Ide supaya layanan lebih baik.",
			topicComplaint: "Kritik",
			topicComplaintDesc: "Ada yang kurang pas? Beri tahu kami.",
			name: "Nama",
			namePlaceholder: "Nama lengkap",
			phone: "Nomor WA",
			email: "Email",
			optional: "opsional",
			branch: "Cabang",
			branchPlaceholder: "Pilih cabang",
			branchRequired: "Pilih cabang dulu ya",
			incidentDate: "Tanggal kejadian",
			item: "Barang yang tertinggal",
			itemPlaceholder: "Contoh: jaket hitam dalam kantong plastik",
			subject: "Subjek",
			subjectPlaceholder: "Ringkas dalam satu baris",
			message: "Ceritakan detailnya",
			messagePlaceholderLost: "Contoh: tertinggal 1 kantong plastik berisi jaket hitam di mesin pengering.",
			messagePlaceholderFeedback: "Tulis kritik atau saranmu di sini...",
			submit: "Kirim Laporan",
			submitting: "Mengirim...",
			invalidPhone: "Nomor telepon tidak valid",
			invalidEmail: "Email tidak valid",
			rateLimited: "Terlalu banyak percobaan. Coba lagi 1 menit.",
			success: "Laporan berhasil dikirim",
			failed: "Gagal mengirim laporan",
		},
		statistik: {
			kicker: "Statistik",
			title: "Data",
			highlight: "Operasional",
			description: "Ringkasan metrik operasional dari data realtime seluruh modul.",
			activeBranches: "Cabang Aktif",
			runningPromos: "Promo Berjalan",
			approvedTestimonials: "Testimoni Disetujui",
			averageRating: "Rata-rata Rating",
		},
		blog: {
			kicker: "Blog",
			title: "Tips",
			highlight: "Laundry",
			description: "Artikel, panduan, dan tips seputar mencuci, mengeringkan, dan merawat pakaian.",
			searchPlaceholder: "Cari artikel...",
			featured: "Artikel Pilihan",
			readMore: "Baca Selengkapnya",
			readTime: "{n} menit baca",
			emptyTitle: "Tidak ada artikel ditemukan",
			emptyBody: "Coba ubah kata kunci pencarian atau pilih kategori lain.",
			categories: {
				all: "Semua",
				"tips-mencuci": "Tips Mencuci",
				"tips-kering": "Tips Kering",
				"perawatan-bahan": "Perawatan Bahan",
				noda: "Noda",
				umum: "Umum",
				berita: "Berita",
				"promo-info": "Promo",
			},
		},
		blogDetail: {
			allArticles: "Semua Artikel",
			backToBlog: "Kembali ke Blog",
			author: "Penulis",
			readTime: "{n} menit baca",
			views: "{n} kali dibaca",
			tag: "Tag:",
			share: "Bagikan artikel ini",
			shareFacebook: "Bagikan ke Facebook",
			shareTwitter: "Bagikan ke Twitter",
			shareWhatsapp: "Bagikan ke WhatsApp",
			copyLink: "Salin tautan",
			copied: "Tersalin",
			copyFailed: "Gagal menyalin tautan",
			copiedToast: "Link artikel disalin!",
			copyFailedToast: "Gagal menyalin link",
			zoom: "Perbesar",
			zoomAria: "Perbesar gambar",
			imageAria: "Gambar artikel",
			notFound: "Artikel tidak ditemukan.",
			related: "Artikel Terkait",
			viewAll: "Lihat semua artikel",
			backTop: "Kembali ke atas",
		},
		notFound: {
			title: "Halaman tidak ditemukan",
			description: "Tautan yang Anda buka mungkin sudah dipindahkan atau tidak pernah ada.",
			button: "Kembali ke Beranda",
		},
	},
	seo: {
		"/": {
			title: "MBA Laundry Express - Laundry Self Service Sidoarjo & Surabaya",
			description:
				"Laundry self service di Sidoarjo dan Surabaya. Mesin cuci mulai 10kg sampai 23kg, bayar pakai coin mulai Rp 10.000, buka 07.00-23.00 setiap hari.",
		},
		"/cabang": {
			title: "Lokasi Cabang Laundry - MBA Laundry Express",
			description:
				"Daftar cabang MBA Laundry Express di Sidoarjo dan Surabaya, lengkap dengan alamat, jam operasional, fasilitas, dan tarif per mesin.",
		},
		"/promo": {
			title: "Promo Laundry Terbaru - MBA Laundry Express",
			description:
				"Promo dan diskon laundry terbaru MBA Laundry Express. Cek kode promo aktif dan masa berlakunya sebelum datang ke cabang.",
		},
		"/harga": {
			title: "Daftar Harga Laundry - MBA Laundry Express",
			description:
				"Tarif laundry MBA Laundry Express dihitung per coin. Pilih cabang untuk melihat kapasitas mesin dan jumlah coin yang dibutuhkan.",
		},
		"/kalkulator": {
			title: "Kalkulator Biaya Laundry - MBA Laundry Express",
			description:
				"Hitung perkiraan biaya laundry sebelum datang. Pilih cabang, jumlah mesin cuci dan pengering, lalu lihat totalnya.",
		},
		"/cara-pakai": {
			title: "Cara Pakai Mesin Laundry Self Service - MBA Laundry Express",
			description:
				"Panduan 3 langkah pakai mesin laundry self service MBA Laundry Express: pilih mesin kosong, bayar lewat QRIS atau koin, tunggu lalu ambil.",
		},
		"/faq": {
			title: "Pertanyaan Umum (FAQ) - MBA Laundry Express",
			description:
				"Jawaban pertanyaan yang sering ditanyakan soal layanan, pembayaran, promo, kapasitas mesin, dan jam operasional MBA Laundry Express.",
		},
		"/blog": {
			title: "Tips Laundry & Perawatan Pakaian - MBA Laundry Express",
			description: "Artikel dan tips mencuci, mengeringkan, serta merawat pakaian dari MBA Laundry Express.",
		},
		"/galeri": {
			title: "Galeri Outlet Laundry - MBA Laundry Express",
			description: "Lihat suasana outlet, mesin, dan fasilitas MBA Laundry Express sebelum datang.",
		},
		"/karir": {
			title: "Lowongan Kerja - MBA Laundry Express",
			description: "Lowongan kerja aktif di cabang MBA Laundry Express Sidoarjo dan Surabaya.",
		},
		"/kemitraan": {
			title: "Kemitraan Laundry - MBA Laundry Express",
			description: "Peluang kemitraan laundry satelit, corporate wash, dan co-branding bersama MBA Laundry Express.",
		},
		"/korporat": {
			title: "Layanan Korporat Laundry - MBA Laundry Express",
			description: "Solusi laundry untuk kantor, kos, komunitas, dan event dengan SLA terukur.",
		},
		"/tentang": {
			title: "Tentang MBA Laundry Express",
			description:
				"MBA Laundry Express adalah brand laundry self-service modern untuk mahasiswa, keluarga, dan pekerja urban.",
		},
		"/kontak": {
			title: "Bantuan MBA Laundry Express",
			description: "Laporkan barang tertinggal, kirim kritik, atau sampaikan saran ke tim MBA Laundry Express.",
		},
		"/testimoni": {
			title: "Testimoni Pelanggan - MBA Laundry Express",
			description: "Ulasan pelanggan MBA Laundry Express dari website, Google, dan Instagram.",
		},
		"/statistik": {
			title: "Statistik Operasional - MBA Laundry Express",
			description:
				"Ringkasan metrik operasional MBA Laundry Express: cabang aktif, promo berjalan, dan rating pelanggan.",
		},
	},
};

const en: PublicDict = {
	common: {
		readMore: "Read",
		viewDetail: "View Details",
		reset: "Reset",
		loading: "Loading...",
		failed: "Failed to load data",
		notAvailable: "Not available yet",
		minuteShort: "min",
		minutesShort: "min",
		perLoad: "per load",
		load: "load",
		loads: "loads",
		times: "views",
		home: "Home",
		washes: "wash",
		dries: "dry",
		skipToContent: "Skip to content",
	},
	nav: {
		home: "Home",
		branches: "Branches",
		promotions: "Promotions",
		gallery: "Gallery",
		pricing: "Pricing",
		howItWorks: "How It Works",
		blog: "Blog",
		careers: "Careers",
		partnership: "Partnership",
		contact: "Help",
		testimonials: "Reviews",
		chooseMenu: "Choose MBA Laundry Express service menu",
		chatWa: "WhatsApp Chat",
		chatWaShort: "Chat WA",
		openMenu: "Open menu",
		closeMenu: "Close menu",
		lightMode: "Light Mode",
		darkMode: "Dark Mode",
		moreMenu: "More",
		waMessage: "Hi MBA Laundry, I would like to order laundry service.",
	},
	footer: {
		tagline: "Modern self-service laundry, clean machines, transparent pricing.",
		slogan: "Clean is easy, fast, and affordable",
		quickLinks: "Quick Links",
		branchLocations: "Branch Locations",
		activePromos: "Active Promotions",
		priceList: "Price List",
		howToUse: "How It Works",
		blogTips: "Blog & Tips",
		faq: "FAQ",
		contact: "Help",
		copyright: "All rights reserved.",
		madeIn: "Self-service laundry in Indonesia.",
	},
	floating: {
		ariaLabel: "WhatsApp Chat",
		tooltip: "Chat With Us",
		waMessage: "Hi MBA Laundry",
	},
	branchStatus: {
		buka: "Open",
		tutup: "Closed",
		ramai: "Busy",
	},
	countdown: {
		prefix: "Countdown:",
		ended: "Promo ended",
		days: "days",
		hours: "hours",
		minutes: "minutes",
		daysShort: "d",
		hoursShort: "h",
		validFor: "Valid for",
	},
	lightbox: {
		fallbackAlt: "MBA Laundry gallery",
	},
	home: {
		hero: {
			kicker: "Self-Service Laundry",
			titleLine1: "Wash it yourself,",
			titleHighlight: "pay less",
			titleLine3: "done faster",
			description: "Wash and dry on your own with machines that are always cleaned. Come anytime, no need to queue.",
			ctaBranches: "Find nearest branch",
			ctaPricing: "Check price list",
			startFrom: "From",
			priceTransparent: "Transparent price per machine",
			activeBranches: "active branches",
			branchFallback: "Branches in Sidoarjo & Surabaya",
			openHours: "Open 07:00 to 23:00",
		},
		heroGrid: {
			loading: "Loading...",
			emptyTitle: "Machines ready to use",
			emptyBody: "Outlet photos will appear here once uploaded through the admin panel.",
			alt: "MBA Laundry gallery",
		},
		howItWorks: {
			kicker: "How It Works",
			title: "Easy! Just 3 Steps",
			subtitle: "A simple and fast self-service laundry process",
			stepBadge: "Step",
			cta: "Full Guide",
			step1Title: "Pick an Empty Machine",
			step1Desc: "Find an available washer or dryer. Check that the machine is clean.",
			step2Title: "Pay & Start",
			step2Desc: "Scan QRIS or insert coins according to the rate. The machine starts automatically.",
			step3Title: "Wait & Collect",
			step3Desc: "Wash and dry times differ by machine capacity. Collect your clothes when done.",
		},
		pricing: {
			kicker: "Pricing",
			title: "Clear Pricing,",
			titleHighlight: "No Hidden Fees",
			subtitle:
				"Pay according to the machine capacity you use. Choose a branch to see the rates and durations that apply there.",
			cashAndQris: "Cash & QRIS price · 1 coin =",
			coinValue: "1 coin =",
			qrisPrice: "QRIS price",
			perCoin: "per coin",
			wash: "Washing",
			dry: "Drying",
			qrisFrom: "QRIS price · ",
			startingFrom: "Starting from · ",
			cashCoin: "Cash / coin: ",
			washCapacityOption: "Capacity options",
			washDuration: "Duration",
			dryCapacityOption: "Capacity options",
			dryDuration: "Duration",
			washFeature1: "Water-saving technology",
			washFeature2: "Safe programs for every fabric",
			washFeature3: "Automatic sterile detergent",
			dryFeature1: "Stable temperature sensor",
			dryFeature2: "Quick mode for urgent needs",
			dryFeature3: "Dry results ready to fold",
			calculatorKicker: "Calculator",
			calculatorTitle: "Estimate your laundry cost",
			loadWash: "Wash loads",
			loadDry: "Dry loads",
			estimatedTotal: "Estimated Total",
			washDrySummary: "{wash} wash + {dry} dry",
			cta: "Find Nearest Branch",
			chooseBranch: "Choose branch",
		},
		locations: {
			kicker: "Location",
			title: "Our Locations, One Quality Standard",
			subtitle: "Every MBA Laundry branch is equipped with modern machines and high cleanliness standards.",
			loading: "Loading branches...",
			empty: "No active branches yet.",
			activeCount: "active branches",
			viewDetail: "View Details",
			viewAll: "View All Branches",
		},
		promo: {
			kicker: "Latest Promos",
			title: "Laundry Promos Available Now",
			subtitle: "Lower prices for wash and dry. Check which branch the promo applies to first.",
			activeBadge: "Active Promo",
			globalBadge: "All branches",
			localBadge: "Selected branch",
			viewAll: "View All Promos",
		},
		testimonials: {
			kicker: "Reviews",
			title: "What Our Customers Say",
			subtitle: "Real reviews from customers who have used our service",
			fallbackSource: "Customer",
			viewAll: "View All Reviews",
		},
		whyUs: {
			kicker: "Why MBA Laundry",
			title: "Why Choose MBA Laundry?",
			priceTitle: "Transparent Pricing",
			priceDesc: "No extra fees. Every service rate is clearly displayed and always up to date.",
			cleanTitle: "Always Clean Machines",
			cleanDesc: "Daily routine maintenance with high cleanliness standards for every machine drum.",
			fastTitle: "Super Fast Process",
			fastDesc: "Efficient wash and dry cycles for a busy daily schedule.",
			locationTitle: "Strategic Locations",
			locationDesc: "Close to campuses, boarding houses, and activity centers so laundry stays practical.",
		},
		gallery: {
			kicker: "Outlet Gallery",
			title: "Take a Peek at the Laundry Experience!",
			subtitle:
				"Designed for your comfort, every outlet is clean, bright, and fully air-conditioned while you wait for your laundry.",
			badge: "Gallery",
			empty: "No outlet gallery photos yet.",
			emptyHint: "Please upload from the admin dashboard.",
			loadError: "The outlet gallery could not be loaded. Please check your connection.",
			viewAll: "View All Gallery",
			itemFallback: "Gallery",
			clickHint: "Click to see details",
		},
		faq: {
			kicker: "FAQ",
			title: "Frequently Asked Questions",
			placeholder: "Search questions...",
			loading: "Loading FAQ...",
			empty: "No matching questions.",
			stillQuestions: "Still have questions?",
			supportCta: "Contact Support Team",
		},
		blog: {
			kicker: "Blog",
			title: "Clothing Care Tips",
			subtitle: "Get the latest information on how to wash properly and how to care for your machine.",
			categoryFallback: "Tips",
			read: "Read",
			viewAll: "View All Articles",
		},
		cta: {
			title: "Come Try It Now!",
			description:
				"Self-service laundry is cheaper and more practical. Pick the nearest branch and experience the quality yourself!",
			button: "Chat on WhatsApp Now",
			branchCount: "Branches",
			openHours: "Open 07:00 - 23:00",
		},
		banner: {
			titlePrefix: "Let's ",
			titleHighlight: "Do Laundry Now!",
			description: "Pick your nearest branch and experience a fast, clean, and practical laundry process.",
			button: "Choose Branch",
		},
		caraPakai: {
			kicker: "How It Works",
			title: "Easy! ",
			titleHighlight: "Just 3 Steps",
			step1Title: "Pick an Empty Machine",
			step1Desc: "Find an available washer or dryer.",
			step2Title: "Pay & Start",
			step2Desc: "Scan QRIS or insert coins according to the rate.",
			step3Title: "Wait & Collect",
			step3Desc: "Wash and dry times differ by machine capacity. Collect your clothes when done.",
			cta: "Full Guide",
		},
		announcement: {
			fallbackTitle: "Announcement",
			defaultUserName: "Loyal Customer",
			closeAria: "Close Announcement",
			closeOverlayAria: "Close Overlay",
			endsIn: "Closing In:",
			backOn: "We will serve you again on",
			dismiss: "Got It",
			days: "Days",
			hours: "Hours",
			minutes: "Minutes",
			typeLabels: {
				info: "Information",
				promo: "Special Promo",
				libur: "Holiday Notice",
				maintenance: "System Maintenance",
			},
		},
	},
	pages: {
		cabang: {
			kicker: "Branches",
			title: "Find the",
			highlight: "Nearest Branch",
			description:
				"All active branches appear automatically from the database. Use the Indonesian region filter to search faster.",
			filterTitle: "Indonesia Region Filter",
			searchLabel: "Search Branch Name/Address",
			searchPlaceholder: "e.g. bohar, pagesangan, surabaya...",
			clearSearch: "Clear search",
			province: "Province",
			allProvinces: "All Provinces",
			regency: "City/Regency",
			allRegencies: "All Cities/Regencies",
			loadingRegencies: "Loading cities/regencies...",
			district: "District",
			allDistricts: "All Districts",
			loadingDistricts: "Loading districts...",
			village: "Village",
			allVillages: "All Villages",
			loadingVillages: "Loading villages...",
			regionError: "Some region data failed to load. Try refreshing the page or check your internet connection.",
			loadingProvinces: "Loading province data...",
			showingPrefix: "Showing",
			showingMiddle: "of",
			showingSuffix: "branches.",
			loadingBranches: "Loading branch data...",
			errorBranches: "Failed to fetch branch data.",
			emptyBranches: "No active branches yet.",
			emptyFilter: "No branches match the current filter/search.",
			wash: "Wash",
			dry: "Dry",
			viewBranch: "View Branch",
			waTitle: "Chat on WhatsApp",
			addressEmpty: "Address not available yet",
		},
		cabangDetail: {
			tabs: {
				info: "Info",
				mesin: "Machines & Price",
				jam: "Opening Hours",
				fasilitas: "Facilities",
				galeri: "Gallery",
				promo: "Promo",
			},
			today: "Today",
			closed: "Closed",
			address: "Address",
			map: "Location Map",
			openMaps: "Open Google Maps",
			mapTitle: "Map",
			noMapLink: "No map link yet.",
			wash: "Wash",
			dry: "Dry",
			loading: "Loading branch details...",
			notFoundTitle: "Branch not found",
			notFoundBody: "The branch you are looking for may no longer be active or its link has changed.",
			backToBranches: "Back to branch list",
			noDescription: "Branch description is not available yet.",
			machineHeader: "Machine",
			machineTariff: "Machines & Rates",
			cashNote: "Cash = coins ×",
			qrisOnly: "QRIS rates only",
			capacity: "Capacity",
			duration: "Duration",
			coins: "Coin",
			priceCash: "Cash",
			priceQris: "QRIS",
			noMachines: "Machine data for this branch has not been filled in yet.",
			hoursClosed: "Closed",
			fullDay: "24 Hours",
			noHours: "Opening hours are not available yet.",
			facilitiesEmpty: "No facilities registered yet.",
			galleryEmpty: "Branch gallery is still empty.",
			promoEmpty: "No active promo for this branch.",
			terms: "T&C:",
			chatWa: "Chat on WhatsApp",
		},
		promo: {
			kicker: "Promo",
			title: "Today's",
			highlight: "Promos",
			description: "Pick a branch to see the promos available there.",
			allBranches: "All Branches",
			loading: "Loading promos...",
			empty: "No active promos right now.",
			emptyFiltered: "No promos at this branch yet. Try All Branches.",
			globalTitle: "Global Promos",
			globalTitleHint: "Valid at every branch",
			globalBadge: "ALL BRANCHES",
			localTitle: "Branch-Specific Promos",
			localTitleHint: "Only valid at the listed branch",
			localBadge: "Branch Only",
			viewBranch: "View branch",
		},
		harga: {
			kicker: "Pricing",
			title: "Transparent",
			highlight: "Pricing",
			description: "Prices are calculated per machine and per branch, straight from the database. Pay with coins.",
			chooseBranch: "Choose Branch",
			coinValue: "1 coin =",
			loadingMachines: "Loading machine rates...",
			emptyMachines: "Machine rates for this branch have not been filled in yet. Contact the admin to complete them.",
			machineHeader: "Machine",
			capacity: "Capacity",
			duration: "Duration",
			coins: "Coin",
			cash: "Cash",
			qris: "QRIS",
			washMachine: "Washer",
			dryMachine: "Dryer",
			noteCash: "The number of coins follows machine capacity. Final price = coins ×",
			noteQris: "This branch accepts QRIS payments with special rates as shown in the price column.",
			noteQrisOnly: "This branch only accepts QRIS payments.",
			cheapest: "Cheapest wash price at this branch:",
			cheapestSuffix: "Machine capacity determines how many coins are needed.",
		},
		kalkulator: {
			kicker: "Calculator",
			title: "Laundry Cost",
			highlight: "Calculator",
			description: "Estimate the cost based on the number of loads and the service type.",
			badge: "Calculator",
			estimateTitle: "Cost Estimate",
			loadLabel: "Number of loads",
			loadAria: "Number of loads",
			wash: "Wash",
			dry: "Dry",
			noteQris: "Estimate uses QRIS rates. Paying with coins costs more.",
			noteCash: "Estimate uses coin rates.",
			noteQrisOnly: "This branch only accepts QRIS.",
			branchLabel: "Choose branch",
		},
		caraPakai: {
			kicker: "Guide",
			title: "How to",
			highlight: "Use",
			description: "Self-service guide from picking a machine to finishing your wash in 3 steps.",
		},
		faq: {
			kicker: "FAQ",
			title: "General",
			highlight: "Questions",
			description: "Quick answers to the questions customers ask most often.",
			all: "All",
			loading: "Loading FAQ...",
			empty: "No FAQ yet.",
			categories: {
				harga: "Pricing",
				mesin: "Machines",
				waktu: "Timing",
				pembayaran: "Payment",
				keamanan: "Security",
				"barang-hilang": "Lost Items",
				umum: "General",
			},
		},
		testimoni: {
			kicker: "Reviews",
			title: "Customer",
			highlight: "Voices",
			description: "Customer reviews from the website, Google, and Instagram that have been approved by the admin.",
			loading: "Loading reviews...",
			source: "Source:",
			empty: "No approved reviews yet.",
		},
		galeri: {
			kicker: "Gallery",
			title: "Explore the",
			highlight: "Branch Atmosphere",
			description: "Gallery of interiors, facilities, and machines from every MBA Laundry outlet.",
			empty: "No gallery images yet.",
		},
		karir: {
			kicker: "Careers",
			title: "Join",
			highlight: "Our Team",
			description: "Active job openings from all MBA Laundry Express branches.",
			detail: "Details",
			applyWa: "Apply via WA",
			empty: "There are no open positions right now.",
			waMessage: "Hello, I would like to apply for",
		},
		karirDetail: {
			kicker: "Career Detail",
			notFound: "Job opening not found.",
			description: "Description",
			qualifications: "Qualifications",
			benefits: "Benefits",
			salaryRange: "Salary range:",
			applyWa: "Apply via WhatsApp",
			waMessage: "Hello, I would like to apply for the position",
		},
		kemitraan: {
			kicker: "Partnership",
			title: "Partnership",
			highlight: "Program",
			description:
				"Open partnership opportunities for satellite laundry, corporate wash, and co-branding around campuses and boarding houses.",
			name: "Name",
			company: "Business/company name",
			phone: "WhatsApp number",
			email: "Email",
			city: "City",
			notes: "Requirement notes",
			submit: "Send Application",
			submitting: "Sending...",
			invalidPhone: "Phone number is not valid",
			invalidEmail: "Email is not valid",
			rateLimited: "Too many attempts. Please try again later.",
			success: "Partnership application sent",
			failed: "Failed to send data",
		},
		korporat: {
			kicker: "Corporate",
			title: "Corporate",
			highlight: "Services",
			description:
				"Laundry solutions for teams, offices, exclusive boarding houses, and communities with measurable SLAs.",
			packageTitle: "Corporate Package",
			packageDesc: "Volume pricing scheme, monthly invoices, and usage dashboard.",
			activationTitle: "On-Site Activation",
			activationDesc: "Laundry service activation for events, campuses, or rental properties.",
			branchesTitle: "Available Branches",
			branchesLoading: "Loading branch data...",
			branchesCount: "Currently connected to {count} active branches and can be expanded dynamically.",
		},
		tentang: {
			kicker: "About",
			title: "About",
			highlight: "MBA Laundry",
			description: "A modern self-service laundry brand for students, families, and urban workers.",
			missionTitle: "Our Mission",
			missionDesc: "Make washing easy, transparent, and consistent through data-driven standard operating procedures.",
			growthTitle: "Branch Growth",
			growthDesc:
				"There are currently {count} active branches. Every branch is managed dynamically from the database without hardcoding.",
		},
		kontak: {
			kicker: "Help",
			title: "Help",
			highlight: "Center",
			description: "Lost an item, have a complaint, or a suggestion? Pick a type, then fill one shared form.",
			topicLost: "Lost Item",
			topicLostDesc: "An item was left behind at a branch or machine.",
			topicSuggestion: "Suggestion",
			topicSuggestionDesc: "Ideas to make our service better.",
			topicComplaint: "Complaint",
			topicComplaintDesc: "Something not right? Let us know.",
			name: "Name",
			namePlaceholder: "Full name",
			phone: "WhatsApp number",
			email: "Email",
			optional: "optional",
			branch: "Branch",
			branchPlaceholder: "Select a branch",
			branchRequired: "Please select a branch first",
			incidentDate: "Date of incident",
			item: "Item left behind",
			itemPlaceholder: "Example: black jacket in a plastic bag",
			subject: "Subject",
			subjectPlaceholder: "Summarize in one line",
			message: "Tell us the details",
			messagePlaceholderLost: "Example: left one plastic bag with a black jacket in the dryer.",
			messagePlaceholderFeedback: "Write your complaint or suggestion here...",
			submit: "Send Report",
			submitting: "Sending...",
			invalidPhone: "Phone number is not valid",
			invalidEmail: "Email is not valid",
			rateLimited: "Too many attempts. Please try again in 1 minute.",
			success: "Report sent successfully",
			failed: "Failed to send report",
		},
		statistik: {
			kicker: "Statistics",
			title: "Operational",
			highlight: "Data",
			description: "Summary of operational metrics from real-time data across all modules.",
			activeBranches: "Active Branches",
			runningPromos: "Running Promos",
			approvedTestimonials: "Approved Reviews",
			averageRating: "Average Rating",
		},
		blog: {
			kicker: "Blog",
			title: "Laundry",
			highlight: "Tips",
			description: "Articles, guides, and tips on washing, drying, and caring for your clothes.",
			searchPlaceholder: "Search articles...",
			featured: "Featured Article",
			readMore: "Read More",
			readTime: "{n} min read",
			emptyTitle: "No articles found",
			emptyBody: "Try changing the search keyword or choosing another category.",
			categories: {
				all: "All",
				"tips-mencuci": "Washing Tips",
				"tips-kering": "Drying Tips",
				"perawatan-bahan": "Fabric Care",
				noda: "Stains",
				umum: "General",
				berita: "News",
				"promo-info": "Offers",
			},
		},
		blogDetail: {
			allArticles: "All Articles",
			backToBlog: "Back to Blog",
			author: "Author",
			readTime: "{n} min read",
			views: "{n} reads",
			tag: "Tags:",
			share: "Share this article",
			shareFacebook: "Share to Facebook",
			shareTwitter: "Share to Twitter",
			shareWhatsapp: "Share to WhatsApp",
			copyLink: "Copy link",
			copied: "Copied",
			copyFailed: "Failed to copy link",
			copiedToast: "Article link copied!",
			copyFailedToast: "Failed to copy link",
			zoom: "Zoom",
			zoomAria: "Zoom image",
			imageAria: "Article image",
			notFound: "Article not found.",
			related: "Related Articles",
			viewAll: "View all articles",
			backTop: "Back to top",
		},
		notFound: {
			title: "Page not found",
			description: "The link you opened may have been moved or never existed.",
			button: "Back to Home",
		},
	},
	seo: {
		"/": {
			title: "MBA Laundry Express - Self-Service Laundry in Sidoarjo & Surabaya",
			description:
				"Self-service laundry in Sidoarjo and Surabaya. Washers from 10kg to 23kg, pay with coins from Rp 10,000, open 07:00-23:00 every day.",
		},
		"/cabang": {
			title: "Laundry Branch Locations - MBA Laundry Express",
			description:
				"List of MBA Laundry Express branches in Sidoarjo and Surabaya, complete with addresses, opening hours, facilities, and per-machine rates.",
		},
		"/promo": {
			title: "Latest Laundry Promos - MBA Laundry Express",
			description:
				"The latest MBA Laundry Express laundry promos and discounts. Check active promo codes and validity before visiting a branch.",
		},
		"/harga": {
			title: "Laundry Price List - MBA Laundry Express",
			description:
				"MBA Laundry Express rates are calculated per coin. Choose a branch to see machine capacities and the number of coins required.",
		},
		"/kalkulator": {
			title: "Laundry Cost Calculator - MBA Laundry Express",
			description:
				"Estimate laundry cost before you arrive. Choose a branch, the number of washers and dryers, then see the total.",
		},
		"/cara-pakai": {
			title: "How to Use Self-Service Laundry Machines - MBA Laundry Express",
			description:
				"A 3-step guide to using MBA Laundry Express self-service machines: pick an empty machine, pay by QRIS or coins, wait then collect.",
		},
		"/faq": {
			title: "Frequently Asked Questions (FAQ) - MBA Laundry Express",
			description:
				"Answers to common questions about service, payment, promos, machine capacity, and opening hours at MBA Laundry Express.",
		},
		"/blog": {
			title: "Laundry Tips & Clothing Care - MBA Laundry Express",
			description: "Articles and tips on washing, drying, and caring for clothes from MBA Laundry Express.",
		},
		"/galeri": {
			title: "Laundry Outlet Gallery - MBA Laundry Express",
			description: "See the atmosphere, machines, and facilities at MBA Laundry Express outlets before you visit.",
		},
		"/karir": {
			title: "Job Openings - MBA Laundry Express",
			description: "Active job openings at MBA Laundry Express branches in Sidoarjo and Surabaya.",
		},
		"/kemitraan": {
			title: "Laundry Partnership - MBA Laundry Express",
			description:
				"Partnership opportunities for satellite laundry, corporate wash, and co-branding with MBA Laundry Express.",
		},
		"/korporat": {
			title: "Corporate Laundry Service - MBA Laundry Express",
			description: "Laundry solutions for offices, boarding houses, communities, and events with measurable SLAs.",
		},
		"/tentang": {
			title: "About MBA Laundry Express",
			description:
				"MBA Laundry Express is a modern self-service laundry brand for students, families, and urban workers.",
		},
		"/kontak": {
			title: "MBA Laundry Express Help Center",
			description: "Report a lost item, file a complaint, or send a suggestion to the MBA Laundry Express team.",
		},
		"/testimoni": {
			title: "Customer Reviews - MBA Laundry Express",
			description: "MBA Laundry Express customer reviews from the website, Google, and Instagram.",
		},
		"/statistik": {
			title: "Operational Statistics - MBA Laundry Express",
			description: "MBA Laundry Express operational metrics: active branches, running promos, and customer ratings.",
		},
	},
};

export const PUBLIC_TEXT: Record<"id" | "en", PublicDict> = { id, en };

/** Ganti placeholder `{nama}` di template dengan nilai sebenarnya. */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
	return template.replace(/\{(\w+)\}/g, (match, key: string) =>
		Object.hasOwn(values, key) ? String(values[key]) : match,
	);
}
