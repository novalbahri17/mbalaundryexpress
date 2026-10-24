import { type FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/api/client";
import { useThemeStore } from "@/store/themeStore";
import { useLoginGuard, useSignIn } from "@/store/userStore";

export default function LoginPage() {
	const { mode } = useThemeStore();
	const navigate = useNavigate();
	const signIn = useSignIn();
	const guard = useLoginGuard();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const isDark = mode === "dark";

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
		<div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: "var(--bg-app)" }}>
			<div className="mx-auto grid min-h-screen max-w-md place-items-center px-4">
				<form onSubmit={submit} className="glass-card w-full rounded-2xl p-8">
					<p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--brand)" }}>
						MBA Admin
					</p>
					<h1 className="mt-2 text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
						Masuk Dashboard
					</h1>
					<p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
						Kelola cabang, promo, konten, dan data operasional.
					</p>

					{guard.isLocked ? (
						<p
							className="mt-4 rounded-xl px-3 py-2 text-xs"
							style={{ backgroundColor: "var(--danger-bg)", color: "var(--danger)" }}
						>
							Akun terkunci sementara karena 5x gagal login. Coba lagi beberapa menit.
						</p>
					) : null}

					<label className="mt-5 block text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
						Email
					</label>
					<input
						type="email"
						required
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						className="mt-1 h-11 w-full rounded-xl border px-3"
						style={{
							backgroundColor: "var(--bg-card)",
							borderColor: "var(--border)",
							color: "var(--text-primary)",
						}}
					/>

					<label className="mt-4 block text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
						Password
					</label>
					<input
						type="password"
						required
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						className="mt-1 h-11 w-full rounded-xl border px-3"
						style={{
							backgroundColor: "var(--bg-card)",
							borderColor: "var(--border)",
							color: "var(--text-primary)",
						}}
					/>

					<button
						disabled={loading || guard.isLocked}
						type="submit"
						className="btn-primary mt-6 h-11 w-full rounded-xl text-sm font-semibold disabled:opacity-60"
					>
						{loading ? "Memproses..." : "Masuk"}
					</button>
				</form>
			</div>
		</div>
	);
}
