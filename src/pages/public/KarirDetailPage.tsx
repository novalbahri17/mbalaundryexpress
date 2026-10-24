import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getJobById } from "@/api/jobs.api";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { GlassCard } from "@/components/public/shared/GlassCard";
import { formatRupiah, resolveImageUrl, toWhatsappLink } from "@/utils/format";
import { usePublicText } from "@/hooks/usePublicText";

export default function KarirDetailPage() {
	const text = usePublicText();
	const t = text.pages.karirDetail;
	const { id } = useParams();
	const { data: job } = useQuery({
		queryKey: ["job-detail", id],
		queryFn: () => getJobById(id ?? ""),
		enabled: Boolean(id),
	});

	if (!job) {
		return <p className="px-4 py-20 text-center text-sm text-[var(--text-muted)]">{t.notFound}</p>;
	}

	return (
		<section className="pb-20">
			<PageHeader kicker={t.kicker} title={job.title} description={job.type} />
			<div className="mx-auto max-w-5xl px-4 md:px-8">
				<GlassCard hoverable={false} className="overflow-hidden p-0">
					<img
						src={resolveImageUrl(job.image, job.title, "#C62828", "#1565C0")}
						alt={job.title}
						loading="lazy"
						className="h-56 w-full object-cover md:h-72"
					/>
					<div className="p-5 md:p-6">
						<p className="text-sm font-semibold">{t.description}</p>
						<p className="mt-2 text-sm text-[var(--text-muted)]">{job.description}</p>
						<p className="mt-5 text-sm font-semibold">{t.qualifications}</p>
						<p className="mt-2 text-sm text-[var(--text-muted)]">{job.requirements}</p>
						<p className="mt-5 text-sm font-semibold">{t.benefits}</p>
						<p className="mt-2 text-sm text-[var(--text-muted)]">{job.benefits}</p>
						{job.show_salary ? (
							<p className="mt-5 text-sm text-[var(--brand)]">
								{t.salaryRange} {formatRupiah(job.salary_min ?? 0)} - {formatRupiah(job.salary_max ?? 0)}
							</p>
						) : null}
						{job.whatsapp_apply ? (
							<a
								href={toWhatsappLink(job.whatsapp_apply, `${t.waMessage} ${job.title}`)}
								target="_blank"
								rel="noreferrer"
								className="btn-primary mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold"
							>
								{t.applyWa}
							</a>
						) : null}
					</div>
				</GlassCard>
			</div>
		</section>
	);
}
