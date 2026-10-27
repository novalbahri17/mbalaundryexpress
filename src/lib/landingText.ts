/**
 * Katalog teks landing page yang bisa diedit dari admin.
 *
 * Satu sumber kebenaran untuk:
 * - Form admin "Teks Landing" (`/admin/pengaturan/teks-landing`)
 * - Komponen landing page publik (fallback ke kamus `src/locales/public.ts`)
 *
 * Semua field disimpan di koleksi `page_contents` dengan awalan `landing_`
 * dan `group: "landing"`. Versi Inggris otomatis tersedia lewat suffix `_en`
 * (diisi oleh `/api/translate` + cache `translations`).
 */

import type { PublicDict } from "@/locales/public";

export type LandingFieldKind = "text" | "textarea";

export interface LandingField {
	/** Key kolom di `page_contents`, contoh: `landing_hero_kicker`. */
	key: string;
	/** Label singkat di form admin. */
	label: string;
	kind: LandingFieldKind;
	/** Nilai bawaan (dipakai sebagai placeholder + fallback tampilan). */
	defaultValue: string;
	/** Petunjuk kecil di bawah input. */
	hint?: string;
}

export interface LandingSection {
	id: string;
	title: string;
	description?: string;
	fields: LandingField[];
}

export function buildLandingSections(text: PublicDict): LandingSection[] {
	const { hero, howItWorks, pricing, whyUs, faq, testimonials, gallery, blog, cta } = text.home;

	return [
		{
			id: "hero",
			title: "Hero / Banner Atas",
			description: "Teks utama yang pertama dilihat pengunjung di halaman depan.",
			fields: [
				{ key: "landing_hero_kicker", label: "Label kecil di atas judul", kind: "text", defaultValue: hero.kicker },
				{ key: "landing_hero_title_line1", label: "Judul baris 1", kind: "text", defaultValue: hero.titleLine1 },
				{
					key: "landing_hero_title_highlight",
					label: "Judul baris 2 (berwarna)",
					kind: "text",
					defaultValue: hero.titleHighlight,
				},
				{ key: "landing_hero_title_line3", label: "Judul baris 3", kind: "text", defaultValue: hero.titleLine3 },
				{
					key: "landing_hero_description",
					label: "Deskripsi",
					kind: "textarea",
					defaultValue: hero.description,
				},
				{ key: "landing_hero_cta_branches", label: "Tombol utama", kind: "text", defaultValue: hero.ctaBranches },
				{ key: "landing_hero_cta_pricing", label: "Tombol kedua", kind: "text", defaultValue: hero.ctaPricing },
				{
					key: "landing_hero_open_hours",
					label: "Keterangan jam buka",
					kind: "text",
					defaultValue: hero.openHours,
				},
				{
					key: "landing_hero_branch_fallback",
					label: "Teks cadangan lokasi cabang",
					kind: "text",
					defaultValue: hero.branchFallback,
					hint: "Dipakai kalau belum ada data cabang aktif.",
				},
			],
		},
		{
			id: "cara-pakai",
			title: "Cara Pakai",
			description: "Section tiga langkah di landing page.",
			fields: [
				{ key: "landing_how_kicker", label: "Label kecil", kind: "text", defaultValue: howItWorks.kicker },
				{ key: "landing_how_title", label: "Judul", kind: "text", defaultValue: howItWorks.title },
				{ key: "landing_how_subtitle", label: "Subjudul", kind: "text", defaultValue: howItWorks.subtitle },
				{
					key: "landing_how_step1_title",
					label: "Langkah 1 — judul",
					kind: "text",
					defaultValue: howItWorks.step1Title,
				},
				{
					key: "landing_how_step1_desc",
					label: "Langkah 1 — deskripsi",
					kind: "textarea",
					defaultValue: howItWorks.step1Desc,
				},
				{
					key: "landing_how_step2_title",
					label: "Langkah 2 — judul",
					kind: "text",
					defaultValue: howItWorks.step2Title,
				},
				{
					key: "landing_how_step2_desc",
					label: "Langkah 2 — deskripsi",
					kind: "textarea",
					defaultValue: howItWorks.step2Desc,
				},
				{
					key: "landing_how_step3_title",
					label: "Langkah 3 — judul",
					kind: "text",
					defaultValue: howItWorks.step3Title,
				},
				{
					key: "landing_how_step3_desc",
					label: "Langkah 3 — deskripsi",
					kind: "textarea",
					defaultValue: howItWorks.step3Desc,
				},
			],
		},
		{
			id: "harga",
			title: "Harga",
			description: "Judul dan keterangan section daftar harga.",
			fields: [
				{ key: "landing_pricing_kicker", label: "Label kecil", kind: "text", defaultValue: pricing.kicker },
				{ key: "landing_pricing_title", label: "Judul", kind: "text", defaultValue: pricing.title },
				{
					key: "landing_pricing_title_highlight",
					label: "Judul (bagian berwarna)",
					kind: "text",
					defaultValue: pricing.titleHighlight,
				},
				{ key: "landing_pricing_subtitle", label: "Subjudul", kind: "textarea", defaultValue: pricing.subtitle },
				{
					key: "landing_pricing_calc_title",
					label: "Judul kalkulator",
					kind: "text",
					defaultValue: pricing.calculatorTitle,
				},
				{ key: "landing_pricing_cta", label: "Tombol bawah", kind: "text", defaultValue: pricing.cta },
			],
		},
		{
			id: "keunggulan",
			title: "Keunggulan (Why Us)",
			description: "Empat kartu alasan pelanggan memilih MBA Laundry.",
			fields: [
				{ key: "landing_why_kicker", label: "Label kecil", kind: "text", defaultValue: whyUs.kicker },
				{ key: "landing_why_title", label: "Judul", kind: "text", defaultValue: whyUs.title },
				{ key: "landing_why_price_title", label: "Kartu 1 — judul", kind: "text", defaultValue: whyUs.priceTitle },
				{
					key: "landing_why_price_desc",
					label: "Kartu 1 — deskripsi",
					kind: "textarea",
					defaultValue: whyUs.priceDesc,
				},
				{ key: "landing_why_clean_title", label: "Kartu 2 — judul", kind: "text", defaultValue: whyUs.cleanTitle },
				{
					key: "landing_why_clean_desc",
					label: "Kartu 2 — deskripsi",
					kind: "textarea",
					defaultValue: whyUs.cleanDesc,
				},
				{ key: "landing_why_fast_title", label: "Kartu 3 — judul", kind: "text", defaultValue: whyUs.fastTitle },
				{ key: "landing_why_fast_desc", label: "Kartu 3 — deskripsi", kind: "textarea", defaultValue: whyUs.fastDesc },
				{
					key: "landing_why_location_title",
					label: "Kartu 4 — judul",
					kind: "text",
					defaultValue: whyUs.locationTitle,
				},
				{
					key: "landing_why_location_desc",
					label: "Kartu 4 — deskripsi",
					kind: "textarea",
					defaultValue: whyUs.locationDesc,
				},
			],
		},
		{
			id: "testimoni",
			title: "Testimoni",
			description: "Judul section testimoni pelanggan.",
			fields: [
				{ key: "landing_testi_kicker", label: "Label kecil", kind: "text", defaultValue: testimonials.kicker },
				{ key: "landing_testi_title", label: "Judul", kind: "text", defaultValue: testimonials.title },
				{ key: "landing_testi_subtitle", label: "Subjudul", kind: "textarea", defaultValue: testimonials.subtitle },
				{
					key: "landing_testi_view_all",
					label: "Tombol lihat semua",
					kind: "text",
					defaultValue: testimonials.viewAll,
				},
			],
		},
		{
			id: "galeri",
			title: "Galeri",
			description: "Judul section galeri foto outlet.",
			fields: [
				{ key: "landing_gallery_kicker", label: "Label kecil", kind: "text", defaultValue: gallery.kicker },
				{ key: "landing_gallery_title", label: "Judul", kind: "text", defaultValue: gallery.title },
				{ key: "landing_gallery_subtitle", label: "Subjudul", kind: "textarea", defaultValue: gallery.subtitle },
				{ key: "landing_gallery_view_all", label: "Tombol lihat semua", kind: "text", defaultValue: gallery.viewAll },
			],
		},
		{
			id: "faq",
			title: "FAQ",
			description: "Judul section tanya-jawab. Daftar pertanyaannya diatur di menu FAQ.",
			fields: [
				{ key: "landing_faq_kicker", label: "Label kecil", kind: "text", defaultValue: faq.kicker },
				{ key: "landing_faq_title", label: "Judul", kind: "text", defaultValue: faq.title },
				{ key: "landing_faq_placeholder", label: "Placeholder pencarian", kind: "text", defaultValue: faq.placeholder },
				{
					key: "landing_faq_still_questions",
					label: 'Teks "masih ada pertanyaan"',
					kind: "text",
					defaultValue: faq.stillQuestions,
				},
				{ key: "landing_faq_support_cta", label: "Tombol hubungi support", kind: "text", defaultValue: faq.supportCta },
			],
		},
		{
			id: "blog",
			title: "Blog / Tips",
			description: "Judul section artikel tips laundry.",
			fields: [
				{ key: "landing_blog_kicker", label: "Label kecil", kind: "text", defaultValue: blog.kicker },
				{ key: "landing_blog_title", label: "Judul", kind: "text", defaultValue: blog.title },
				{ key: "landing_blog_subtitle", label: "Subjudul", kind: "textarea", defaultValue: blog.subtitle },
			],
		},
		{
			id: "cta",
			title: "Ajakan (CTA) Bawah",
			description: "Section penutup sebelum footer.",
			fields: [
				{ key: "landing_cta_title", label: "Judul", kind: "text", defaultValue: cta.title },
				{ key: "landing_cta_description", label: "Deskripsi", kind: "textarea", defaultValue: cta.description },
				{ key: "landing_cta_button", label: "Label tombol", kind: "text", defaultValue: cta.button },
				{
					key: "landing_cta_branch_count",
					label: "Keterangan jumlah cabang",
					kind: "text",
					defaultValue: cta.branchCount,
				},
				{ key: "landing_cta_open_hours", label: "Keterangan jam buka", kind: "text", defaultValue: cta.openHours },
			],
		},
	];
}

/**
 * Ambil teks gabungan default + isian admin, dengan dukungan versi Inggris.
 * Nilai admin yang kosong (atau hanya spasi) dianggap belum diisi.
 */
export function buildLandingValues(
	sections: LandingSection[],
	content: Record<string, string>,
	locale: "id" | "en",
): Record<string, string> {
	const out: Record<string, string> = {};
	for (const section of sections) {
		for (const field of section.fields) {
			const stored = content[field.key]?.trim();
			const storedEn = content[`${field.key}_en`]?.trim();
			if (locale === "en") {
				out[field.key] = storedEn || stored || field.defaultValue;
			} else {
				out[field.key] = stored || field.defaultValue;
			}
		}
	}
	return out;
}
