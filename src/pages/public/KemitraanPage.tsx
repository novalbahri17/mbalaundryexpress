import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { createPartnership } from "@/api/settings.api";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { rateLimitByKey, sanitizeText, validateEmail, validatePhone } from "@/utils/validation";
import { usePublicText } from "@/hooks/usePublicText";

export default function KemitraanPage() {
	const t = usePublicText().pages.kemitraan;
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({ name: "", company: "", phone: "", email: "", city: "", notes: "" });

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!validatePhone(form.phone)) {
			toast.error(t.invalidPhone);
			return;
		}
		if (form.email && !validateEmail(form.email)) {
			toast.error(t.invalidEmail);
			return;
		}
		if (!rateLimitByKey("rl_partnership", 5, 60_000)) {
			toast.error(t.rateLimited);
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
			toast.success(t.success);
			setForm({ name: "", company: "", phone: "", email: "", city: "", notes: "" });
		} catch (error) {
			const message = error instanceof Error ? error.message : t.failed;
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="pb-20">
			<PageHeader kicker={t.kicker} title={t.title} highlight={t.highlight} description={t.description} />
			<form onSubmit={submit} className="mx-auto grid max-w-3xl gap-4 px-4 md:px-8">
				<input
					required
					value={form.name}
					onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
					placeholder={t.name}
					className="glass-card h-12 rounded-xl px-4"
				/>
				<input
					required
					value={form.company}
					onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
					placeholder={t.company}
					className="glass-card h-12 rounded-xl px-4"
				/>
				<input
					required
					value={form.phone}
					onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
					placeholder={t.phone}
					className="glass-card h-12 rounded-xl px-4"
				/>
				<input
					value={form.email}
					onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
					placeholder={t.email}
					className="glass-card h-12 rounded-xl px-4"
				/>
				<input
					value={form.city}
					onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
					placeholder={t.city}
					className="glass-card h-12 rounded-xl px-4"
				/>
				<textarea
					rows={4}
					value={form.notes}
					onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
					placeholder={t.notes}
					className="glass-card rounded-xl px-4 py-3"
				/>
				<button
					type="submit"
					disabled={loading}
					className="btn-primary rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-60"
				>
					{loading ? t.submitting : t.submit}
				</button>
			</form>
		</section>
	);
}
