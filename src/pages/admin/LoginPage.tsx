import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { isAuthenticated } from "@/api/pocketbase";
import { useSignIn, useLoginGuard } from "@/store/userStore";

export default function LoginPage() {
	const navigate = useNavigate();
	const signIn = useSignIn();
	const guard = useLoginGuard();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (isAuthenticated()) {
			navigate("/admin/dashboard", { replace: true });
		}
	}, [navigate]);

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setLoading(true);
		try {
			await signIn({ email, password });
			toast.success("Login berhasil");
			navigate("/admin/dashboard", { replace: true });
		} catch (error) {
			const message = error instanceof Error ? error.message : "Login gagal";
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="relative min-h-screen overflow-hidden bg-hero-light dark:bg-hero-dark">
			<div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-red-500/15 blur-3xl" />
			<div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
			<div className="mx-auto grid min-h-screen max-w-md place-items-center px-4">
				<form onSubmit={submit} className="glass-card w-full rounded-2xl p-8 shadow-blue-glow">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-300">MBA Admin</p>
					<h1 className="mt-2 text-2xl font-extrabold">Masuk Dashboard</h1>
					<p className="mt-2 text-sm text-[var(--text-muted)]">Kelola cabang, promo, konten, dan data operasional.</p>

					{guard.isLocked ? <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300">Akun terkunci sementara karena 5x gagal login. Coba lagi beberapa menit.</p> : null}

					<label className="mt-5 block text-sm font-semibold">Email</label>
					<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900" />

					<label className="mt-4 block text-sm font-semibold">Password</label>
					<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-900" />

					<button disabled={loading || guard.isLocked} type="submit" className="btn-primary mt-6 h-11 w-full rounded-xl text-sm font-semibold disabled:opacity-60">
						{loading ? "Memproses..." : "Masuk"}
					</button>
				</form>
			</div>
		</div>
	);
}
