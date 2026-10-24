import {
	AppstoreOutlined,
	DashboardOutlined,
	EditOutlined,
	FileAddOutlined,
	LinkOutlined,
	PlusOutlined,
	SettingOutlined,
	ToolOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button, Dropdown, FloatButton, Tooltip } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export interface QuickAction {
	key: string;
	label: string;
	description: string;
	icon: React.ReactNode;
	action: () => void;
	color: string;
	shortcut?: string;
}

function QuickActions() {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);

	const quickActions: QuickAction[] = [
		{
			key: "add-promo",
			label: "Tambah Promo",
			description: "Buat promo baru",
			icon: <PlusOutlined />,
			action: () => navigate("/admin/promo"),
			color: "#f5222d",
			shortcut: "P",
		},
		{
			key: "add-article",
			label: "Tambah Artikel",
			description: "Buat artikel blog baru",
			icon: <FileAddOutlined />,
			action: () => navigate("/admin/blog"),
			color: "#1890ff",
			shortcut: "A",
		},
		{
			key: "add-branch",
			label: "Tambah Cabang",
			description: "Tambah cabang baru",
			icon: <PlusOutlined />,
			action: () => navigate("/admin/cabang"),
			color: "#52c41a",
			shortcut: "C",
		},
		{
			key: "edit-home",
			label: "Edit Konten Home",
			description: "Ubah konten landing page",
			icon: <EditOutlined />,
			action: () => navigate("/admin/pengaturan"),
			color: "#722ed1",
			shortcut: "H",
		},
		{
			key: "marketing-dashboard",
			label: "Marketing Dashboard",
			description: "Analisis performa marketing",
			icon: <DashboardOutlined />,
			action: () => navigate("/admin/marketing"),
			color: "#fa8c16",
			shortcut: "M",
		},
		{
			key: "widget-settings",
			label: "Atur Widget",
			description: "Kustomisasi dashboard",
			icon: <AppstoreOutlined />,
			action: () => {
				// Will implement widget customization later
				console.log("Open widget settings");
			},
			color: "#13c2c2",
		},
	];

	const items: MenuProps["items"] = quickActions.map((action) => ({
		key: action.key,
		label: (
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div
						className="flex h-8 w-8 items-center justify-center rounded-lg"
						style={{ backgroundColor: `${action.color}20`, color: action.color }}
					>
						{action.icon}
					</div>
					<div>
						<div className="font-semibold">{action.label}</div>
						<div className="text-xs text-gray-500">{action.description}</div>
					</div>
				</div>
				{action.shortcut && (
					<kbd className="rounded bg-gray-100 px-2 py-1 text-xs font-mono text-gray-600">{action.shortcut}</kbd>
				)}
			</div>
		),
		onClick: action.action,
	}));

	// Add keyboard shortcuts
	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.ctrlKey || event.metaKey) {
			const key = event.key.toUpperCase();
			const action = quickActions.find((a) => a.shortcut === key);
			if (action) {
				event.preventDefault();
				action.action();
			}
		}
	};

	// Add event listener for keyboard shortcuts
	if (typeof window !== "undefined") {
		window.addEventListener("keydown", handleKeyDown);
	}

	return (
		<>
			{/* Floating Button */}
			<FloatButton.Group
				trigger="click"
				type="primary"
				style={{ right: 24, bottom: 24 }}
				icon={<ToolOutlined />}
				tooltip="Quick Actions"
			>
				{quickActions.slice(0, 4).map((action) => (
					<Tooltip key={action.key} title={`${action.label} (Ctrl+${action.shortcut})`} placement="left">
						<FloatButton
							icon={action.icon}
							onClick={action.action}
							style={{ backgroundColor: action.color }}
							tooltip={action.label}
						/>
					</Tooltip>
				))}
				<FloatButton icon={<SettingOutlined />} onClick={() => setOpen(!open)} tooltip="More Actions" />
			</FloatButton.Group>

			{/* Dropdown for more actions (shown on desktop) */}
			<div className="hidden lg:block">
				<Dropdown menu={{ items }} trigger={["click"]} placement="topRight" open={open} onOpenChange={setOpen}>
					<Button
						type="primary"
						icon={<ToolOutlined />}
						className="fixed right-6 bottom-6 z-50 h-12 w-12 rounded-full shadow-lg"
					/>
				</Dropdown>
			</div>

			{/* Mobile quick actions bar */}
			<div className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t bg-white p-2 shadow-2xl lg:hidden">
				{quickActions.slice(0, 4).map((action) => (
					<Button
						key={action.key}
						type="text"
						icon={action.icon}
						onClick={action.action}
						className="flex flex-col items-center"
					>
						<span className="text-xs">{action.label.split(" ")[0]}</span>
					</Button>
				))}
			</div>
		</>
	);
}

export default QuickActions;
