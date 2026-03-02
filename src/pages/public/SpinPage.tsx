import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { createSpinPlay, getSpinRewards } from "@/api/spin.api";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { normalizePhone, validatePhone } from "@/utils/validation";

export default function SpinPage() {
	const { data: rewards = [] } = useQuery({
		queryKey: ["spin-rewards"],
		queryFn: getSpinRewards,
	});
	const [phone, setPhone] = useState("");
	const [spinning, setSpinning] = useState(false);
	const [result, setResult] = useState<string | null>(null);

	const activeRewards = useMemo(() => rewards.filter((item) => item.is_active), [rewards]);

	const spin = async () => {
		if (!validatePhone(phone)) {
			toast.error("Nomor WA tidak valid");
			return;
		}
		if (activeRewards.length === 0) {
			toast.error("Spin belum tersedia");
			return;
		}

		setSpinning(true);
		const selected = activeRewards[Math.floor(Math.random() * activeRewards.length)];
		window.setTimeout(async () => {
			setResult(selected.name);
			await createSpinPlay({
				phone: normalizePhone(phone),
				reward_id: selected.id,
				is_winner: selected.reward_type !== "zonk",
				played_at: new Date().toISOString(),
			});
			setSpinning(false);
		}, 1400);
	};

	return (
		<section className="pb-20">
			<PageHeader kicker="Spin" title="Spin" highlight="Berhadiah" description="Masukkan nomor WhatsApp lalu putar roda untuk kesempatan hadiah promo." />
			<div className="mx-auto max-w-xl px-4 md:px-8">
				<div className="glass-card rounded-2xl p-6 text-center">
					<div className={`mx-auto grid h-40 w-40 place-items-center rounded-full border-4 border-red-500 text-2xl font-bold transition ${spinning ? "animate-spin" : ""}`}>
						SPIN
					</div>
					<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="08xxxxxxxxxx" className="glass-card mt-6 h-12 w-full rounded-xl px-4 text-center" />
					<button type="button" onClick={spin} disabled={spinning} className="btn-primary mt-4 rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-60">
						{spinning ? "Memutar..." : "Putar Sekarang"}
					</button>
					{result ? <p className="mt-4 text-sm">Hasil spin kamu: <span className="font-bold text-red-600 dark:text-red-300">{result}</span></p> : null}
				</div>
			</div>
		</section>
	);
}


