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
}

export function MetronicCard({ title, icon, children, className = "", noPadding }: CardProps) {
	return (
		<div className={`card ${className}`}>
			{title && (
				<div className="card-header">
					<div className="card-title-group">
						{icon && <div className="card-icon">{icon}</div>}
						<h3 className="card-title">{title}</h3>
					</div>
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
		color: #111827;
		margin: 0;
		line-height: 1.2;
	}

	.page-subtitle {
		font-size: 13px;
		color: #6B7280;
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
		background: linear-gradient(135deg, #C62828 0%, #EF4444 100%);
		color: #fff;
		box-shadow: 0 4px 12px rgba(198, 40, 40, 0.3);
	}

	.btn-primary:hover {
		transform: translateY(-1px);
		box-shadow: 0 6px 16px rgba(198, 40, 40, 0.4);
	}

	.btn-secondary {
		background: #fff;
		color: #374151;
		border: 1px solid #E5E7EB;
	}

	.btn-secondary:hover {
		background: #F9FAFB;
		border-color: #D1D5DB;
	}

	/* Card */
	.card {
		background: #fff;
		border-radius: 16px;
		border: 1px solid #E5E7EB;
		overflow: hidden;
		margin-bottom: 20px;
	}

	.card .card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px;
		border-bottom: 1px solid #F3F4F6;
	}

	.card-title-group {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.card-icon {
		width: 40px;
		height: 40px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #FEE2E2;
		color: #C62828;
		font-size: 18px;
	}

	.card .card-title {
		font-size: 15px;
		font-weight: 700;
		color: #111827;
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
		background: #F9FAFB;
	}

	.table-container th {
		padding: 12px 16px;
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #6B7280;
		text-align: left;
		border-bottom: 1px solid #E5E7EB;
	}

	.table-container td {
		padding: 14px 16px;
		font-size: 13px;
		color: #374151;
		border-bottom: 1px solid #F3F4F6;
		vertical-align: middle;
	}

	.table-container tbody tr:hover {
		background: #F9FAFB;
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
		background: #D1FAE5;
		color: #059669;
	}

	.badge-warning {
		background: #FEF3C7;
		color: #D97706;
	}

	.badge-danger {
		background: #FEE2E2;
		color: #DC2626;
	}

	.badge-info {
		background: #DBEAFE;
		color: #2563EB;
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
		background: #EFF6FF;
		color: #2563EB;
	}

	.action-btn-edit:hover {
		background: #DBEAFE;
	}

	.action-btn-delete {
		background: #FEE2E2;
		color: #DC2626;
	}

	.action-btn-delete:hover {
		background: #FECACA;
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
		color: #374151;
		margin-bottom: 6px;
	}

	.form-input {
		width: 100%;
		padding: 10px 12px;
		font-size: 13px;
		border: 1px solid #E5E7EB;
		border-radius: 10px;
		transition: all 0.2s;
	}

	.form-input:focus {
		outline: none;
		border-color: #C62828;
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
		color: #D1D5DB;
		margin-bottom: 16px;
	}

	.empty-state-title {
		font-size: 16px;
		font-weight: 600;
		color: #374151;
		margin: 0 0 8px;
	}

	.empty-state-description {
		font-size: 13px;
		color: #6B7280;
		margin: 0;
	}

	/* Dark Mode */
	@media (prefers-color-scheme: dark) {
		.page-title {
			color: #F9FAFB;
		}

		.page-subtitle {
			color: #9CA3AF;
		}

		.card {
			background: #1A1A24;
			border-color: #2D2E3F;
		}

		.card .card-title {
			color: #F9FAFB;
		}

		.card .card-header {
			border-color: #2D2E3F;
		}

		.table-container thead {
			background: #0F0F12;
		}

		.table-container th {
			color: #9CA3AF;
			border-color: #2D2E3F;
		}

		.table-container td {
			color: #D1D5DB;
			border-color: #2D2E3F;
		}

		.table-container tbody tr:hover {
			background: #0F0F12;
		}

		.form-label {
			color: #D1D5DB;
		}

		.form-input {
			background: #0F0F12;
			border-color: #2D2E3F;
			color: #F9FAFB;
		}

		.form-input:focus {
			border-color: #C62828;
		}

		.badge-success {
			background: rgba(5, 150, 105, 0.2);
			color: #34D399;
		}

		.badge-warning {
			background: rgba(217, 119, 6, 0.2);
			color: #FBBF24;
		}

		.badge-danger {
			background: rgba(220, 38, 38, 0.2);
			color: #F87171;
		}

		.badge-info {
			background: rgba(37, 99, 235, 0.2);
			color: #60A5FA;
		}
	}
`;
