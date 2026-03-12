import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { createContactMessage } from "@/api/settings.api";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { rateLimitByKey, sanitizeText, validateEmail, validatePhone } from "@/utils/validation";

export default function KontakPage() {
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (form.phone && !validatePhone(form.phone)) {
			toast.error("Nomor telepon tidak valid");
			return;
		}
		if (form.email && !validateEmail(form.email)) {
			toast.error("Email tidak valid");
			return;
		}
		if (!rateLimitByKey("rl_contact", 5, 60_000)) {
			toast.error("Terlalu banyak percobaan. Coba lagi 1 menit.");
			return;
		}

		setLoading(true);
		try {
			await createContactMessage({
				name: sanitizeText(form.name),
				phone: form.phone,
				email: form.email,
				subject: sanitizeText(form.subject),
				message: sanitizeText(form.message),
				status: "new",
			});
			toast.success("Pesan berhasil dikirim");
			setForm({ name: "", phone: "", email: "", subject: "", message: "" });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Gagal mengirim pesan";
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="pb-20">
			<PageHeader
				kicker="Kontak"
				title="Hubungi"
				highlight="Kami"
				description="Kirim pertanyaan, masukan, atau kebutuhan kerja sama tim MBA Laundry."
			/>
			<form onSubmit={submit} className="mx-auto grid max-w-3xl gap-4 px-4 md:px-8">
				<input
					required
					value={form.name}
					onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
					placeholder="Nama"
					className="glass-card h-12 rounded-xl px-4"
				/>
				<input
					value={form.phone}
					onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
					placeholder="Nomor WA"
					className="glass-card h-12 rounded-xl px-4"
				/>
				<input
					value={form.email}
					onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
					placeholder="Email"
					className="glass-card h-12 rounded-xl px-4"
				/>
				<input
					required
					value={form.subject}
					onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
					placeholder="Subjek"
					className="glass-card h-12 rounded-xl px-4"
				/>
				<textarea
					required
					rows={5}
					value={form.message}
					onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
					placeholder="Pesan"
					className="glass-card rounded-xl px-4 py-3"
				/>
				<button
					type="submit"
					disabled={loading}
					className="btn-primary rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-60"
				>
					{loading ? "Mengirim..." : "Kirim Pesan"}
				</button>
			</form>
		</section>
	);
}
