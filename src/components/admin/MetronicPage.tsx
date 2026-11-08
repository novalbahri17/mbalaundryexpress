import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { Link } from "react-router-dom";

interface MetronicPageProps {
	title: string;
	subtitle?: string;
	actionLabel?: string;
	onAction?: () => void;
	actionLink?: string;
	children: React.ReactNode;
}

export function MetronicPage({ title, subtitle, actionLabel, onAction, actionLink, children }: MetronicPageProps) {
	return (
		<div className="metronic-page">
			<style>{metronicPageStyles}</style>

			{/* Page Header */}
			<div className="page-header">
				<div className="header-content">
					<h1 className="page-title">{title}</h1>
					{subtitle && <p className="page-subtitle">{subtitle}</p>}
				</div>
				<div className="header-actions">
					{actionLink && (
						<Link to={actionLink} className="btn btn-primary">
							<PlusOutlined />
							<span>{actionLabel || "Tambah"}</span>
						</Link>
					)}
					{onAction && (
						<Button type="primary" icon={<PlusOutlined />} onClick={onAction} className="btn btn-primary">
							{actionLabel || "Tambah"}
						</Button>
					)}
				</div>
			</div>

			{/* Page Content */}
			<div className="page-content">{children}</div>
		</div>
	);
}

// Metronic-style Card Component
interface CardProps {
	title?: string;
	icon?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
	noPadding?: boolean;
	/** Kontrol tambahan di kanan judul kartu (mis. switch tampilan, tombol kecil). */
	action?: React.ReactNode;
}

export function MetronicCard({ title, icon, children, className = "", noPadding, action }: CardProps) {
	return (
		<div className={`card ${className}`}>
			{title && (
				<div className="card-header">
					<div className="card-title-group">
						{icon && <div className="card-icon">{icon}</div>}
						<h3 className="card-title">{title}</h3>
					</div>
					{action && <div className="card-action">{action}</div>}
				</div>
			)}
			<div className={`card-body ${noPadding ? "no-padding" : ""}`}>{children}</div>
		</div>
	);
}

const metronicPageStyles = `
	.metronic-page {
		max-width: 1400px;
		margin: 0 auto;
	}

	/* Page Header */
	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24px;
		flex-wrap: wrap;
		gap: 16px;
	}

	.page-title {
		font-size: 22px;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
		line-height: 1.2;
	}

	.page-subtitle {
		font-size: 13px;
		color: var(--text-muted);
		margin: 4px 0 0;
	}

	.header-actions {
		display: flex;
		gap: 12px;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		font-size: 13px;
		font-weight: 600;
		border-radius: 10px;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
	}

	.btn-primary {
		background: var(--brand);
		color: var(--brand-text);
	}

	.btn-primary:hover {
		background: var(--brand-hover);
	}

	.btn-secondary {
		background: var(--bg-card);
		color: var(--text-secondary);
		border: 1px solid var(--border);
	}

	.btn-secondary:hover {
		background: var(--bg-surface);
		border-color: var(--border-strong);
	}

	/* Card */
	.card {
		background: var(--bg-card);
		border-radius: 16px;
		border: 1px solid var(--border);
		overflow: hidden;
		margin-bottom: 20px;
	}

	.card .card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px;
		border-bottom: 1px solid var(--border);
	}

	.card-title-group {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.card-action {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}

	.card-icon {
		width: 40px;
		height: 40px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--brand-bg);
		color: var(--brand);
		font-size: 18px;
	}

	.card .card-title {
		font-size: 15px;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
	}

	.card-body {
		padding: 20px;
	}

	.card-body.no-padding {
		padding: 0;
	}

	/* Table Styles */
	.table-container {
		overflow-x: auto;
	}

	.table-container table {
		width: 100%;
		border-collapse: collapse;
	}

	.table-container thead {
		background: var(--bg-surface);
	}

	.table-container th {
		padding: 12px 16px;
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
		text-align: left;
		border-bottom: 1px solid var(--border);
	}

	.table-container td {
		padding: 14px 16px;
		font-size: 13px;
		color: var(--text-secondary);
		border-bottom: 1px solid var(--border);
		vertical-align: middle;
	}

	.table-container tbody tr:hover {
		background: var(--bg-surface);
	}

	.table-container tbody tr:last-child td {
		border-bottom: none;
	}

	/* Badge */
	.badge {
		display: inline-flex;
		align-items: center;
		padding: 4px 10px;
		font-size: 11px;
		font-weight: 600;
		border-radius: 6px;
	}

	.badge-success {
		background: var(--success-bg);
		color: var(--success);
	}

	.badge-warning {
		background: var(--warning-bg);
		color: var(--warning);
	}

	.badge-danger {
		background: var(--danger-bg);
		color: var(--danger);
	}

	.badge-info {
		background: var(--info-bg);
		color: var(--info);
	}

	/* Action Buttons */
	.action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		padding: 6px 12px;
		font-size: 12px;
		font-weight: 600;
		border-radius: 8px;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
	}

	.action-btn-edit {
		background: var(--info-bg);
		color: var(--info);
	}

	.action-btn-edit:hover {
		background: var(--info-bg);
	}

	.action-btn-delete {
		background: var(--danger-bg);
		color: var(--danger);
	}

	.action-btn-delete:hover {
		background: var(--danger-bg);
	}

	/* Form Styles */
	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 16px;
	}

	.form-group {
		margin-bottom: 16px;
	}

	.form-label {
		display: block;
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary);
		margin-bottom: 6px;
	}

	.form-input {
		width: 100%;
		padding: 10px 12px;
		font-size: 13px;
		border: 1px solid var(--border);
		border-radius: 10px;
		transition: all 0.2s;
	}

	.form-input:focus {
		outline: none;
		border-color: var(--brand);
		box-shadow: 0 0 0 3px rgba(198, 40, 40, 0.1);
	}

	.form-textarea {
		min-height: 100px;
		resize: vertical;
	}

	/* Empty State */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px 20px;
		text-align: center;
	}

	.empty-state-icon {
		font-size: 48px;
		color: var(--border-strong);
		margin-bottom: 16px;
	}

	.empty-state-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--text-secondary);
		margin: 0 0 8px;
	}

	.empty-state-description {
		font-size: 13px;
		color: var(--text-muted);
		margin: 0;
	}

	/* Dark Mode: :root.dark in tokens.css sets CSS vars globally */
`;
