import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { createLoyaltyMember, getLoyaltyMembers } from "@/api/loyalty.api";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { normalizePhone, validateEmail, validatePhone } from "@/utils/validation";

export default function LoyalitasPage() {
	const { data: members = [], refetch } = useQuery({
		queryKey: ["loyalty-members"],
		queryFn: getLoyaltyMembers,
	});
	const [form, setForm] = useState({ name: "", phone: "", email: "" });
	const [loading, setLoading] = useState(false);

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!validatePhone(form.phone)) {
			toast.error("Nomor WA tidak valid");
			return;
		}
		if (form.email && !validateEmail(form.email)) {
			toast.error("Email tidak valid");
			return;
		}

		setLoading(true);
		try {
			await createLoyaltyMember({
				name: form.name,
				phone: normalizePhone(form.phone),
				email: form.email,
				points: 0,
				level: "bronze",
				is_active: true,
			});
			toast.success("Member loyalitas berhasil dibuat");
			setForm({ name: "", phone: "", email: "" });
			await refetch();
		} catch (error) {
			const message = error instanceof Error ? error.message : "Gagal mendaftar";
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="pb-20">
			<PageHeader kicker="Loyalitas" title="Program" highlight="Member" description="Kumpulkan poin tiap transaksi dan tukarkan dengan hadiah promo." />
			<div className="mx-auto grid max-w-7xl gap-6 px-4 md:grid-cols-2 md:px-8">
				<form onSubmit={submit} className="glass-card rounded-2xl p-6">
					<p className="text-lg font-bold">Daftar Member Baru</p>
					<input required value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Nama" className="glass-card mt-4 h-11 w-full rounded-xl px-4" />
					<input required value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} placeholder="Nomor WA" className="glass-card mt-3 h-11 w-full rounded-xl px-4" />
					<input value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="Email" className="glass-card mt-3 h-11 w-full rounded-xl px-4" />
					<button type="submit" disabled={loading} className="btn-primary mt-4 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60">
						{loading ? "Memproses..." : "Daftar Loyalitas"}
					</button>
				</form>

				<div className="space-y-3">
					{members.slice(0, 10).map((member) => (
						<div key={member.id} className="glass-card rounded-2xl p-4">
							<p className="font-semibold">{member.name}</p>
							<p className="text-xs text-[var(--text-muted)]">{member.phone}</p>
							<p className="mt-1 text-sm text-red-600 dark:text-red-300">{member.points} poin · {member.level}</p>
						</div>
					))}
					{members.length === 0 ? <p className="text-sm text-[var(--text-muted)]">Belum ada member loyalitas.</p> : null}
				</div>
			</div>
		</section>
	);
}


