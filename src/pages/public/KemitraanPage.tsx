import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { createPartnership } from "@/api/settings.api";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { rateLimitByKey, sanitizeText, validateEmail, validatePhone } from "@/utils/validation";

export default function KemitraanPage() {
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({ name: "", company: "", phone: "", email: "", city: "", notes: "" });

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!validatePhone(form.phone)) {
			toast.error("Nomor telepon tidak valid");
			return;
		}
		if (form.email && !validateEmail(form.email)) {
			toast.error("Email tidak valid");
			return;
		}
		if (!rateLimitByKey("rl_partnership", 5, 60_000)) {
			toast.error("Terlalu banyak percobaan. Coba lagi nanti.");
			return;
		}

		setLoading(true);
		try {
			await createPartnership({
				name: sanitizeText(form.name),
				company: sanitizeText(form.company),
				phone: form.phone,
				email: form.email,
				city: sanitizeText(form.city),
				notes: sanitizeText(form.notes),
				status: "new",
			});
			toast.success("Pengajuan kemitraan terkirim");
			setForm({ name: "", company: "", phone: "", email: "", city: "", notes: "" });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Gagal mengirim data";
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="pb-20">
			<PageHeader kicker="Kemitraan" title="Program" highlight="Kemitraan" description="Buka peluang kerja sama laundry satelit, corporate wash, dan co-branding area kampus/kost." />
			<form onSubmit={submit} className="mx-auto grid max-w-3xl gap-4 px-4 md:px-8">
				<input required value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Nama" className="glass-card h-12 rounded-xl px-4" />
				<input required value={form.company} onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))} placeholder="Nama usaha/perusahaan" className="glass-card h-12 rounded-xl px-4" />
				<input required value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} placeholder="Nomor WhatsApp" className="glass-card h-12 rounded-xl px-4" />
				<input value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="Email" className="glass-card h-12 rounded-xl px-4" />
				<input value={form.city} onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))} placeholder="Kota" className="glass-card h-12 rounded-xl px-4" />
				<textarea rows={4} value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Catatan kebutuhan" className="glass-card rounded-xl px-4 py-3" />
				<button type="submit" disabled={loading} className="btn-primary rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-60">
					{loading ? "Mengirim..." : "Kirim Pengajuan"}
				</button>
			</form>
		</section>
	);
}


