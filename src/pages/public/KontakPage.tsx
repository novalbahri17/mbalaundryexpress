import { AlertTriangle, Lightbulb, Send, ThumbsDown } from "lucide-react";
import { type FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { createContactMessage } from "@/api/settings.api";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { useBranches } from "@/hooks/useBranches";
import { usePublicText } from "@/hooks/usePublicText";
import type { ContactTopic } from "@/types/database.types";
import { rateLimitByKey, sanitizeText, validateEmail, validatePhone } from "@/utils/validation";

/**
 * Halaman Bantuan (menggantikan halaman Kontak).
 * Satu form dipakai untuk tiga keperluan: kehilangan barang, saran, dan kritik.
 * Topik menentukan field tambahan yang tampil sekaligus kolom `topic` di database.
 */

type HelpForm = {
	topic: ContactTopic;
	name: string;
	phone: string;
	email: string;
	branchId: string;
	incidentDate: string;
	item: string;
	subject: string;
	message: string;
};

const EMPTY_FORM: HelpForm = {
	topic: "kehilangan",
	name: "",
	phone: "",
	email: "",
	branchId: "",
	incidentDate: "",
	item: "",
	subject: "",
	message: "",
};

const todayIso = (): string => {
	const now = new Date();
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const TONE_CLASS: Record<string, string> = {
	amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
	sky: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
	rose: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

export default function KontakPage() {
	const t = usePublicText().pages.kontak;
	const [form, setForm] = useState<HelpForm>(EMPTY_FORM);
	const [loading, setLoading] = useState(false);
	const { data: branches = [] } = useBranches({ activeOnly: true });

	const isLost = form.topic === "kehilangan";
	const patch = (key: keyof HelpForm, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

	const topics = [
		{ key: "kehilangan" as const, label: t.topicLost, desc: t.topicLostDesc, tone: "amber", icon: AlertTriangle },
		{ key: "saran" as const, label: t.topicSuggestion, desc: t.topicSuggestionDesc, tone: "sky", icon: Lightbulb },
		{ key: "kritik" as const, label: t.topicComplaint, desc: t.topicComplaintDesc, tone: "rose", icon: ThumbsDown },
	];

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
		if (!form.branchId) {
			toast.error(t.branchRequired);
			return;
		}
		if (!rateLimitByKey("rl_contact", 5, 60_000)) {
			toast.error(t.rateLimited);
			return;
		}

		const fallbackSubject = topics.find((topic) => topic.key === form.topic)?.label ?? "";

		setLoading(true);
		try {
			await createContactMessage({
				name: sanitizeText(form.name),
				phone: form.phone,
				email: form.email.trim(),
				subject: sanitizeText(isLost ? form.item : form.subject) || fallbackSubject,
				message: sanitizeText(form.message),
				topic: form.topic,
				branch_id: form.branchId,
				incident_date: form.incidentDate ? form.incidentDate : null,
				status: "new",
			});
			toast.success(t.success);
			setForm({ ...EMPTY_FORM, topic: form.topic });
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

			<div className="mx-auto w-full max-w-3xl px-4 md:px-8">
				<div role="tablist" aria-label={t.kicker} className="grid gap-3 sm:grid-cols-3">
					{topics.map((topic) => {
						const Icon = topic.icon;
						const active = form.topic === topic.key;
						return (
							<button
								key={topic.key}
								type="button"
								role="tab"
								aria-selected={active}
								onClick={() => patch("topic", topic.key)}
								className={`rounded-2xl border p-4 text-left transition-colors ${
									active
										? "border-[var(--brand)] bg-[var(--brand)]/5 ring-1 ring-[var(--brand)]"
										: "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
								}`}
							>
								<span
									className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${TONE_CLASS[topic.tone]}`}
								>
									<Icon className="h-5 w-5" aria-hidden="true" />
								</span>
								<span className="mt-2 block text-sm font-bold">{topic.label}</span>
								<span className="mt-1 block text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
									{topic.desc}
								</span>
							</button>
						);
					})}
				</div>

				<form onSubmit={submit} className="mt-6 grid gap-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<label className="grid gap-1.5 text-sm font-medium">
							<span>{t.name}</span>
							<input
								required
								value={form.name}
								onChange={(event) => patch("name", event.target.value)}
								placeholder={t.namePlaceholder}
								className="glass-card h-12 rounded-xl px-4"
							/>
						</label>
						<label className="grid gap-1.5 text-sm font-medium">
							<span>
								{t.phone} <span className="text-rose-500">*</span>
							</span>
							<input
								required
								inputMode="tel"
								value={form.phone}
								onChange={(event) => patch("phone", event.target.value)}
								placeholder="08xxxxxxxxxx"
								className="glass-card h-12 rounded-xl px-4"
							/>
						</label>
					</div>

					<label className="grid gap-1.5 text-sm font-medium">
						<span>
							{t.email} <span className="text-xs font-normal opacity-70">({t.optional})</span>
						</span>
						<input
							type="email"
							value={form.email}
							onChange={(event) => patch("email", event.target.value)}
							placeholder="nama@email.com"
							className="glass-card h-12 rounded-xl px-4"
						/>
					</label>

					<div className="grid gap-4 sm:grid-cols-2">
						<label className="grid gap-1.5 text-sm font-medium">
							<span>
								{t.branch} <span className="text-rose-500">*</span>
							</span>
							<select
								required
								value={form.branchId}
								onChange={(event) => patch("branchId", event.target.value)}
								className="glass-card h-12 rounded-xl px-4"
							>
								<option value="">{t.branchPlaceholder}</option>
								{branches.map((branch) => (
									<option key={branch.id} value={branch.id}>
										{branch.name}
									</option>
								))}
							</select>
						</label>
						<label className="grid gap-1.5 text-sm font-medium">
							<span>{t.incidentDate}</span>
							<input
								type="date"
								max={todayIso()}
								value={form.incidentDate}
								onChange={(event) => patch("incidentDate", event.target.value)}
								className="glass-card h-12 rounded-xl px-4"
							/>
						</label>
					</div>

					<label className="grid gap-1.5 text-sm font-medium">
						<span>{isLost ? t.item : t.subject}</span>
						<input
							required
							value={isLost ? form.item : form.subject}
							onChange={(event) => patch(isLost ? "item" : "subject", event.target.value)}
							placeholder={isLost ? t.itemPlaceholder : t.subjectPlaceholder}
							className="glass-card h-12 rounded-xl px-4"
						/>
					</label>

					<label className="grid gap-1.5 text-sm font-medium">
						<span>{t.message}</span>
						<textarea
							required
							rows={5}
							value={form.message}
							onChange={(event) => patch("message", event.target.value)}
							placeholder={isLost ? t.messagePlaceholderLost : t.messagePlaceholderFeedback}
							className="glass-card rounded-xl px-4 py-3"
						/>
					</label>

					<button
						type="submit"
						disabled={loading}
						className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-60"
					>
						<Send className="h-4 w-4" aria-hidden="true" />
						{loading ? t.submitting : t.submit}
					</button>
				</form>
			</div>
		</section>
	);
}
