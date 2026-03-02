import { useState } from "react";
import toast from "react-hot-toast";
import { subscribePromo } from "@/api/subscribers.api";
import { useBranches } from "@/hooks/useBranches";
import { normalizePhone, rateLimitByKey, validatePhone } from "@/utils/validation";

export function SubscribeSection() {
	const { data: branches = [] } = useBranches({ activeOnly: true });
	const [phone, setPhone] = useState("");
	const [branchId, setBranchId] = useState("");
	const [isSubmitting, setSubmitting] = useState(false);

	const submit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!validatePhone(phone)) {
			toast.error("Nomor WA harus format 08xx atau 628xx");
			return;
		}
		if (!rateLimitByKey("rl_subscribe", 3, 60_000)) {
			toast.error("Terlalu banyak percobaan. Coba lagi 1 menit.");
			return;
		}

		setSubmitting(true);
		try {
			await subscribePromo({ phone: normalizePhone(phone), branch_id: branchId || undefined });
			toast.success("Kamu sudah terdaftar!");
			setPhone("");
		} catch (error) {
			const message =
				error instanceof Error ? error.message.toLowerCase() : "gagal subscribe";
			if (message.includes("unique") || message.includes("already")) {
				toast.success("Kamu sudah terdaftar!");
			} else {
				toast.error("Gagal subscribe, coba beberapa saat lagi.");
			}
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<section className="section-wrap mt-24">
			<div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 text-white md:p-10">
				<div className="absolute -left-14 -top-16 h-44 w-44 rounded-full bg-white/15 blur-3xl" />
				<div className="absolute -bottom-16 right-0 h-56 w-56 rounded-full bg-sapphire-300/25 blur-3xl" />
				<div className="absolute inset-0 dot-grid opacity-15" />

				<div className="relative z-10">
					<p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
						Subscribe
					</p>
					<h2 className="mt-4 text-3xl font-bold md:text-4xl">Jangan Ketinggalan Promo!</h2>
					<p className="mt-2 text-white/90">
						Daftar dan dapatkan info promo lebih dulu via WhatsApp.
					</p>
				</div>

				<form
					onSubmit={submit}
					className="glass-card relative z-10 mt-6 grid gap-3 rounded-2xl border border-white/30 bg-black/25 p-4 md:grid-cols-[2fr_1fr_auto]"
				>
					<div>
						<label className="mb-1 block text-sm font-semibold">Nomor WhatsApp</label>
						<input
							type="tel"
							value={phone}
							onChange={(event) => setPhone(event.target.value.slice(0, 16))}
							placeholder="08xxxxxxxxxx"
							inputMode="numeric"
							autoComplete="tel"
							maxLength={16}
							className="h-11 w-full rounded-xl border border-white/40 bg-white/10 px-3 text-white placeholder:text-white/70 focus:border-white focus:outline-none"
							required
						/>
					</div>
					<div>
						<label className="mb-1 block text-sm font-semibold">Cabang</label>
						<select
							value={branchId}
							onChange={(event) => setBranchId(event.target.value)}
							className="h-11 w-full rounded-xl border border-white/40 bg-white/10 px-3 text-white focus:border-white focus:outline-none"
						>
							<option value="" className="text-black">
								Semua Cabang
							</option>
							{branches.map((branch) => (
								<option key={branch.id} value={branch.id} className="text-black">
									{branch.name}
								</option>
							))}
						</select>
					</div>
					<button
						type="submit"
						disabled={isSubmitting}
						className="mt-6 h-11 rounded-xl bg-white px-5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-60"
					>
						{isSubmitting ? "Memproses..." : "Subscribe Gratis"}
					</button>
				</form>
			</div>
		</section>
	);
}
