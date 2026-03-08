import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getJobById } from "@/api/jobs.api";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { GlassCard } from "@/components/public/shared/GlassCard";
import { formatRupiah, resolveImageUrl, toWhatsappLink } from "@/utils/format";

export default function KarirDetailPage() {
	const { id } = useParams();
	const { data: job } = useQuery({
		queryKey: ["job-detail", id],
		queryFn: () => getJobById(id ?? ""),
		enabled: Boolean(id),
	});

	if (!job) {
		return <p className="px-4 py-20 text-center text-sm text-[var(--text-muted)]">Lowongan tidak ditemukan.</p>;
	}

	return (
		<section className="pb-20">
			<PageHeader kicker="Karir Detail" title={job.title} description={job.type} />
			<div className="mx-auto max-w-5xl px-4 md:px-8">
				<GlassCard hoverable={false} className="overflow-hidden p-0">
					<img
						src={resolveImageUrl(job.image, job.title, "#C62828", "#1565C0")}
						alt={job.title}
						loading="lazy"
						className="h-56 w-full object-cover md:h-72"
					/>
					<div className="p-5 md:p-6">
					<p className="text-sm font-semibold">Deskripsi</p>
					<p className="mt-2 text-sm text-[var(--text-muted)]">{job.description}</p>
					<p className="mt-5 text-sm font-semibold">Kualifikasi</p>
					<p className="mt-2 text-sm text-[var(--text-muted)]">{job.requirements}</p>
					<p className="mt-5 text-sm font-semibold">Benefit</p>
					<p className="mt-2 text-sm text-[var(--text-muted)]">{job.benefits}</p>
					{job.show_salary ? <p className="mt-5 text-sm text-red-600 dark:text-red-300">Range gaji: {formatRupiah(job.salary_min ?? 0)} - {formatRupiah(job.salary_max ?? 0)}</p> : null}
					{job.whatsapp_apply ? (
						<a href={toWhatsappLink(job.whatsapp_apply, `Halo, saya ingin melamar posisi ${job.title}`)} target="_blank" rel="noreferrer" className="btn-primary mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold">
							Lamar via WhatsApp
						</a>
					) : null}
					</div>
				</GlassCard>
			</div>
		</section>
	);
}


