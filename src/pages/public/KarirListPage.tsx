import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getJobs } from "@/api/jobs.api";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { GlassCard } from "@/components/public/shared/GlassCard";
import { formatRupiah, toWhatsappLink } from "@/utils/format";

export default function KarirListPage() {
	const { data: jobs = [] } = useQuery({
		queryKey: ["jobs-open"],
		queryFn: () => getJobs({ openOnly: true }),
	});

	return (
		<section className="pb-20">
			<PageHeader kicker="Karir" title="Bergabung" highlight="Bersama Kami" description="Lowongan aktif dari seluruh cabang MBA Laundry Express." />
			<div className="mx-auto grid max-w-6xl gap-4 px-4 md:px-8">
				{jobs.map((job) => (
					<GlassCard key={job.id}>
						<p className="text-lg font-bold">{job.title}</p>
						<p className="mt-1 text-sm text-[var(--text-muted)]">{job.type}</p>
						{job.show_salary ? (
							<p className="mt-2 text-sm text-red-600 dark:text-red-300">
								{formatRupiah(job.salary_min ?? 0)} - {formatRupiah(job.salary_max ?? 0)}
							</p>
						) : null}
						<div className="mt-4 flex flex-wrap gap-2">
							<Link to={`/karir/${job.id}`} className="btn-primary rounded-full px-4 py-2 text-xs font-semibold">Detail</Link>
							{job.whatsapp_apply ? (
								<a href={toWhatsappLink(job.whatsapp_apply, `Halo, saya ingin melamar ${job.title}`)} target="_blank" rel="noreferrer" className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold dark:border-slate-600">
									Lamar WA
								</a>
							) : null}
						</div>
					</GlassCard>
				))}
				{jobs.length === 0 ? <p className="text-sm text-[var(--text-muted)]">Saat ini belum ada lowongan terbuka.</p> : null}
			</div>
		</section>
	);
}


