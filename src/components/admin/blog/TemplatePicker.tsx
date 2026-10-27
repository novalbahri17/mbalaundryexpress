import { Sparkles, X } from "lucide-react";
import { useEffect } from "react";
import { ARTICLE_TEMPLATES, type ArticleTemplate } from "./BlogEditor";

interface TemplatePickerProps {
	onSelect: (template: ArticleTemplate) => void;
	onClose: () => void;
}

export function TemplatePicker({ onSelect, onClose }: TemplatePickerProps) {
	// Close on Escape
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	return (
		<div className="template-picker-overlay" onClick={onClose}>
			<div className="template-picker" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Pilih template artikel">
				<div className="template-picker-header">
					<div className="template-picker-title-wrap">
						<span className="template-picker-icon">
							<Sparkles size={18} />
						</span>
						<div>
							<h2 className="template-picker-title">Mulai Menulis</h2>
							<p className="template-picker-subtitle">Pilih template untuk mempercepat penulisan artikel Anda</p>
						</div>
					</div>
					<button className="template-picker-close" onClick={onClose} type="button" aria-label="Tutup">
						<X size={18} />
					</button>
				</div>

				<div className="template-picker-grid">
					{ARTICLE_TEMPLATES.map((template) => (
						<button
							key={template.id}
							className={`template-card ${template.id === "blank" ? "blank" : ""}`}
							onClick={() => onSelect(template)}
							type="button"
						>
							<span className="template-card-icon">{template.icon}</span>
							<span className="template-card-body">
								<span className="template-card-name">{template.name}</span>
								<span className="template-card-desc">{template.description}</span>
							</span>
							{template.id === "blank" && <span className="template-card-badge">Mulai Kosong</span>}
						</button>
					))}
				</div>

				<div className="template-picker-footer">
					Tips: Template bisa diedit bebas setelah dipilih. Ketik <kbd>/</kbd> di editor untuk menyisipkan blok.
				</div>
			</div>

			<style>{pickerStyles}</style>
		</div>
	);
}

const pickerStyles = `
	@keyframes pickerOverlayIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes pickerCardIn {
		from {
			opacity: 0;
			transform: translateY(16px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.template-picker-overlay {
		position: fixed;
		inset: 0;
		z-index: 1100;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(10, 12, 20, 0.55);
		backdrop-filter: blur(6px);
		animation: pickerOverlayIn 0.18s ease-out;
		padding: 24px;
	}

	.template-picker {
		width: 100%;
		max-width: 680px;
		max-height: calc(100vh - 48px);
		display: flex;
		flex-direction: column;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-modal);
		animation: pickerCardIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
		overflow: hidden;
	}

	.template-picker-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		padding: 24px 24px 18px;
		border-bottom: 1px solid var(--border);
	}

	.template-picker-title-wrap {
		display: flex;
		align-items: flex-start;
		gap: 14px;
	}

	.template-picker-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 42px;
		height: 42px;
		flex-shrink: 0;
		background: var(--brand-bg);
		color: var(--brand);
		border-radius: var(--radius-sm);
	}

	.template-picker-title {
		margin: 0;
		font-size: 18px;
		font-weight: 700;
		color: var(--text-primary);
		line-height: 1.3;
	}

	.template-picker-subtitle {
		margin: 3px 0 0;
		font-size: 13px;
		color: var(--text-muted);
	}

	.template-picker-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		flex-shrink: 0;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-xs);
		color: var(--text-muted);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.template-picker-close:hover {
		background: var(--bg-surface);
		color: var(--text-primary);
		border-color: var(--border-strong);
	}

	.template-picker-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
		padding: 20px 24px;
		overflow-y: auto;
	}

	.template-card {
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 16px;
		background: var(--bg-surface);
		border: 1.5px solid var(--border);
		border-radius: var(--radius-md);
		cursor: pointer;
		text-align: left;
		font-family: var(--font-sans);
		transition: all var(--transition-fast);
	}

	.template-card:hover {
		border-color: var(--brand);
		background: var(--bg-card);
		box-shadow: var(--shadow-card);
		transform: translateY(-2px);
	}

	.template-card.blank {
		border-style: dashed;
		background: transparent;
	}

	.template-card.blank:hover {
		background: var(--brand-bg);
	}

	.template-card-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		flex-shrink: 0;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--brand);
		transition: all var(--transition-fast);
	}

	.template-card:hover .template-card-icon {
		background: var(--brand-bg);
		border-color: var(--brand);
	}

	.template-card-body {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
	}

	.template-card-name {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-primary);
	}

	.template-card-desc {
		font-size: 12px;
		color: var(--text-muted);
		line-height: 1.45;
	}

	.template-card-badge {
		position: absolute;
		top: 10px;
		right: 10px;
		padding: 2px 8px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-full);
		font-size: 10px;
		font-weight: 600;
		color: var(--text-muted);
	}

	.template-picker-footer {
		padding: 14px 24px;
		border-top: 1px solid var(--border);
		background: var(--bg-surface);
		font-size: 12px;
		color: var(--text-muted);
	}

	.template-picker-footer kbd {
		display: inline-block;
		padding: 1px 6px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-bottom-width: 2px;
		border-radius: 4px;
		font-size: 11px;
		font-family: var(--font-sans);
		color: var(--text-secondary);
	}

	@media (max-width: 640px) {
		.template-picker-grid {
			grid-template-columns: 1fr;
		}
	}
`;
