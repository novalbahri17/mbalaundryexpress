import {
	Heading2,
	Heading3,
	Heading4,
	List,
	ListOrdered,
	Quote,
	ImageIcon,
	Link2,
	Minus,
	Text,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface SlashCommandProps {
	position: { top: number; left: number };
	onSelect: (type: string) => void;
	onClose: () => void;
}

interface SlashCommandItem {
	type: string;
	label: string;
	description: string;
	icon: React.ReactNode;
}

interface SlashCommandGroup {
	title: string;
	items: SlashCommandItem[];
}

const COMMAND_GROUPS: SlashCommandGroup[] = [
	{
		title: "Teks",
		items: [
			{ type: "paragraph", label: "Paragraf", description: "Teks biasa", icon: <Text size={17} /> },
			{ type: "heading2", label: "Judul 2", description: "Judul bagian besar", icon: <Heading2 size={17} /> },
			{ type: "heading3", label: "Judul 3", description: "Judul sub-bagian", icon: <Heading3 size={17} /> },
			{ type: "heading4", label: "Judul 4", description: "Judul kecil", icon: <Heading4 size={17} /> },
		],
	},
	{
		title: "Daftar & Blok",
		items: [
			{ type: "bulletList", label: "Daftar Poin", description: "Daftar tanpa nomor", icon: <List size={17} /> },
			{ type: "orderedList", label: "Daftar Nomor", description: "Daftar berurutan", icon: <ListOrdered size={17} /> },
			{ type: "blockquote", label: "Kutipan", description: "Blok kutipan menonjol", icon: <Quote size={17} /> },
			{ type: "divider", label: "Garis Pemisah", description: "Pembatas horizontal", icon: <Minus size={17} /> },
		],
	},
	{
		title: "Media",
		items: [
			{ type: "image", label: "Gambar", description: "Upload atau sisipkan gambar", icon: <ImageIcon size={17} /> },
			{ type: "link", label: "Link", description: "Tautan ke URL lain", icon: <Link2 size={17} /> },
		],
	},
];

const MENU_WIDTH = 288;
const MENU_MAX_HEIGHT = 380;

export function SlashCommand({ position, onSelect, onClose }: SlashCommandProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const menuRef = useRef<HTMLDivElement>(null);
	const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

	// Flatten items for keyboard navigation
	const flatItems = useMemo(() => COMMAND_GROUPS.flatMap((g) => g.items), []);

	// Clamp position to viewport
	const clamped = useMemo(() => {
		const left = Math.max(12, Math.min(position.left, window.innerWidth - MENU_WIDTH - 12));
		let top = position.top;
		if (top + MENU_MAX_HEIGHT > window.innerHeight - 12) {
			top = Math.max(12, position.top - MENU_MAX_HEIGHT - 40);
		}
		return { top, left };
	}, [position]);

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case "ArrowDown":
					e.preventDefault();
					e.stopPropagation();
					setActiveIndex((i) => (i + 1) % flatItems.length);
					break;
				case "ArrowUp":
					e.preventDefault();
					e.stopPropagation();
					setActiveIndex((i) => (i - 1 + flatItems.length) % flatItems.length);
					break;
				case "Enter":
					e.preventDefault();
					e.stopPropagation();
					onSelect(flatItems[activeIndex].type);
					break;
				case "Escape":
					e.preventDefault();
					e.stopPropagation();
					onClose();
					break;
			}
		};
		window.addEventListener("keydown", handleKeyDown, true);
		return () => window.removeEventListener("keydown", handleKeyDown, true);
	}, [activeIndex, flatItems, onSelect, onClose]);

	// Close on outside click
	useEffect(() => {
		const handleMouseDown = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				onClose();
			}
		};
		document.addEventListener("mousedown", handleMouseDown);
		return () => document.removeEventListener("mousedown", handleMouseDown);
	}, [onClose]);

	// Scroll active item into view
	useEffect(() => {
		itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
	}, [activeIndex]);

	let flatIndex = -1;

	return (
		<div ref={menuRef} className="slash-menu" style={{ top: clamped.top, left: clamped.left }}>
			<div className="slash-menu-header">Sisipkan blok</div>
			<div className="slash-menu-body">
				{COMMAND_GROUPS.map((group) => (
					<div key={group.title} className="slash-menu-group">
						<div className="slash-menu-group-title">{group.title}</div>
						{group.items.map((item) => {
							flatIndex += 1;
							const idx = flatIndex;
							return (
								<button
									key={item.type}
									ref={(el) => {
										itemRefs.current[idx] = el;
									}}
									type="button"
									className={`slash-menu-item ${idx === activeIndex ? "active" : ""}`}
									onMouseEnter={() => setActiveIndex(idx)}
									onClick={() => onSelect(item.type)}
								>
									<span className="slash-menu-item-icon">{item.icon}</span>
									<span className="slash-menu-item-text">
										<span className="slash-menu-item-label">{item.label}</span>
										<span className="slash-menu-item-desc">{item.description}</span>
									</span>
								</button>
							);
						})}
					</div>
				))}
			</div>
			<div className="slash-menu-footer">
				<span>
					<kbd>↑↓</kbd> navigasi
				</span>
				<span>
					<kbd>↵</kbd> pilih
				</span>
				<span>
					<kbd>esc</kbd> tutup
				</span>
			</div>

			<style>{slashStyles}</style>
		</div>
	);
}

const slashStyles = `
	@keyframes slashMenuIn {
		from {
			opacity: 0;
			transform: translateY(6px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.slash-menu {
		position: fixed;
		z-index: 1000;
		width: ${MENU_WIDTH}px;
		max-height: ${MENU_MAX_HEIGHT}px;
		display: flex;
		flex-direction: column;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-dropdown);
		animation: slashMenuIn 0.14s ease-out;
		overflow: hidden;
	}

	.slash-menu-header {
		padding: 10px 14px 8px;
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		border-bottom: 1px solid var(--border);
	}

	.slash-menu-body {
		overflow-y: auto;
		padding: 6px;
	}

	.slash-menu-group {
		margin-bottom: 4px;
	}

	.slash-menu-group:last-child {
		margin-bottom: 0;
	}

	.slash-menu-group-title {
		padding: 6px 10px 4px;
		font-size: 10.5px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
		opacity: 0.8;
	}

	.slash-menu-item {
		display: flex;
		align-items: center;
		gap: 11px;
		width: 100%;
		padding: 8px 10px;
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		text-align: left;
		transition: background var(--transition-fast);
		font-family: var(--font-sans);
	}

	.slash-menu-item.active {
		background: var(--brand-bg);
	}

	.slash-menu-item-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		flex-shrink: 0;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-xs);
		color: var(--text-secondary);
		transition: all var(--transition-fast);
	}

	.slash-menu-item.active .slash-menu-item-icon {
		background: var(--bg-card);
		border-color: var(--brand);
		color: var(--brand);
	}

	.slash-menu-item-text {
		display: flex;
		flex-direction: column;
		gap: 1px;
		min-width: 0;
	}

	.slash-menu-item-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-primary);
	}

	.slash-menu-item.active .slash-menu-item-label {
		color: var(--brand);
	}

	.slash-menu-item-desc {
		font-size: 11.5px;
		color: var(--text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.slash-menu-footer {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 14px;
		border-top: 1px solid var(--border);
		background: var(--bg-surface);
		font-size: 10.5px;
		color: var(--text-muted);
	}

	.slash-menu-footer kbd {
		display: inline-block;
		padding: 1px 5px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-bottom-width: 2px;
		border-radius: 4px;
		font-size: 10px;
		font-family: var(--font-sans);
		color: var(--text-secondary);
		margin-right: 3px;
	}
`;
