import {
	AppstoreOutlined,
	AreaChartOutlined,
	BarChartOutlined,
	CloseOutlined,
	DragOutlined,
	EditOutlined,
	LineChartOutlined,
	PieChartOutlined,
	SettingOutlined,
} from "@ant-design/icons";
import { Button, Card, Dropdown, Modal, Select, Space, Switch, Tag, Tooltip } from "antd";
import type { MenuProps } from "antd";
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { useLocalStorage } from "usehooks-ts";

export interface WidgetConfig {
	id: string;
	title: string;
	component: React.ReactNode;
	icon: React.ReactNode;
	colSpan: 1 | 2 | 3 | 4; // 1-4 columns in 12-column grid
	enabled: boolean;
	order: number;
	category: "analytics" | "monitoring" | "quickActions" | "content";
}

interface SortableWidgetProps {
	widget: WidgetConfig;
	onRemove: (id: string) => void;
	onToggle: (id: string) => void;
}

function SortableWidget({ widget, onRemove, onToggle }: SortableWidgetProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const colSpanClasses = {
		1: "xl:col-span-3",
		2: "xl:col-span-6",
		3: "xl:col-span-9",
		4: "xl:col-span-12",
	};

	return (
		<div ref={setNodeRef} style={style} className={`${colSpanClasses[widget.colSpan]} relative`}>
			<Card
				title={
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<span className="cursor-move" {...attributes} {...listeners}>
								<DragOutlined className="text-gray-400" />
							</span>
							<span className="flex items-center gap-2">
								{widget.icon}
								<span className="font-semibold">{widget.title}</span>
							</span>
						</div>
						<Space>
							<Tooltip title={widget.enabled ? "Nonaktifkan" : "Aktifkan"}>
								<Switch size="small" checked={widget.enabled} onChange={() => onToggle(widget.id)} />
							</Tooltip>
							<Tooltip title="Hapus widget">
								<Button
									type="text"
									size="small"
									icon={<CloseOutlined />}
									onClick={() => onRemove(widget.id)}
									className="text-gray-400 hover:text-red-500"
								/>
							</Tooltip>
						</Space>
					</div>
				}
				className="h-full shadow-sm"
			>
				{widget.enabled ? (
					widget.component
				) : (
					<div className="flex h-40 items-center justify-center text-gray-400">Widget dinonaktifkan</div>
				)}
			</Card>
		</div>
	);
}

function DashboardWidgets() {
	const [widgets, setWidgets] = useLocalStorage<WidgetConfig[]>("dashboard-widgets", [
		{
			id: "stats-overview",
			title: "Statistik Overview",
			icon: <BarChartOutlined />,
			component: <div className="p-4">Widget Statistik Overview</div>,
			colSpan: 2,
			enabled: true,
			order: 1,
			category: "analytics",
		},
		{
			id: "recent-activities",
			title: "Aktivitas Terbaru",
			icon: <AreaChartOutlined />,
			component: <div className="p-4">Widget Aktivitas Terbaru</div>,
			colSpan: 1,
			enabled: true,
			order: 2,
			category: "monitoring",
		},
		{
			id: "promo-performance",
			title: "Performa Promo",
			icon: <LineChartOutlined />,
			component: <div className="p-4">Widget Performa Promo</div>,
			colSpan: 2,
			enabled: true,
			order: 3,
			category: "analytics",
		},
		{
			id: "quick-actions",
			title: "Quick Actions",
			icon: <AppstoreOutlined />,
			component: <div className="p-4">Widget Quick Actions</div>,
			colSpan: 1,
			enabled: true,
			order: 4,
			category: "quickActions",
		},
		{
			id: "content-health",
			title: "Kesehatan Konten",
			icon: <PieChartOutlined />,
			component: <div className="p-4">Widget Kesehatan Konten</div>,
			colSpan: 1,
			enabled: true,
			order: 5,
			category: "content",
		},
	]);

	const [showSettings, setShowSettings] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<string>("all");

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			setWidgets((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over.id);
				return arrayMove(items, oldIndex, newIndex);
			});
		}
	};

	const handleRemoveWidget = (id: string) => {
		setWidgets((items) => items.filter((item) => item.id !== id));
	};

	const handleToggleWidget = (id: string) => {
		setWidgets((items) => items.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)));
	};

	const availableWidgets: WidgetConfig[] = [
		{
			id: "visitor-analytics",
			title: "Analisis Pengunjung",
			icon: <AreaChartOutlined />,
			component: <div className="p-4">Widget Analisis Pengunjung</div>,
			colSpan: 2,
			enabled: false,
			order: 6,
			category: "analytics",
		},
		{
			id: "conversion-funnel",
			title: "Conversion Funnel",
			icon: <BarChartOutlined />,
			component: <div className="p-4">Widget Conversion Funnel</div>,
			colSpan: 2,
			enabled: false,
			order: 7,
			category: "analytics",
		},
	];

	const filteredWidgets =
		selectedCategory === "all" ? widgets : widgets.filter((widget) => widget.category === selectedCategory);

	const handleAddWidget = (widget: WidgetConfig) => {
		setWidgets((items) => [...items, { ...widget, enabled: true }]);
	};

	const settingsMenuItems: MenuProps["items"] = [
		{
			key: "1",
			label: "Atur Widget",
			icon: <SettingOutlined />,
			onClick: () => setShowSettings(true),
		},
		{
			key: "2",
			label: "Reset Layout",
			icon: <AppstoreOutlined />,
			onClick: () => {
				if (confirm("Reset layout ke default?")) {
					localStorage.removeItem("dashboard-widgets");
					window.location.reload();
				}
			},
		},
	];

	return (
		<>
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h2 className="text-lg font-bold">Dashboard Kustom</h2>
					<p className="text-gray-600">Drag & drop untuk mengatur widget</p>
				</div>
				<Space>
					<Select value={selectedCategory} onChange={setSelectedCategory} style={{ width: 150 }}>
						<Select.Option value="all">Semua Kategori</Select.Option>
						<Select.Option value="analytics">Analytics</Select.Option>
						<Select.Option value="monitoring">Monitoring</Select.Option>
						<Select.Option value="quickActions">Quick Actions</Select.Option>
						<Select.Option value="content">Konten</Select.Option>
					</Select>
					<Dropdown menu={{ items: settingsMenuItems }} placement="bottomRight">
						<Button icon={<EditOutlined />}>Kustomisasi</Button>
					</Dropdown>
				</Space>
			</div>

			<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
				<SortableContext items={filteredWidgets.map((w) => w.id)}>
					<div className="grid gap-4 md:grid-cols-6 xl:grid-cols-12">
						{filteredWidgets.map((widget) => (
							<SortableWidget
								key={widget.id}
								widget={widget}
								onRemove={handleRemoveWidget}
								onToggle={handleToggleWidget}
							/>
						))}
					</div>
				</SortableContext>
			</DndContext>

			<Modal
				title="Pengaturan Widget Dashboard"
				open={showSettings}
				onCancel={() => setShowSettings(false)}
				width={800}
				footer={null}
			>
				<div className="space-y-6">
					<div>
						<h4 className="font-semibold">Widget Tersedia</h4>
						<div className="mt-2 grid gap-4 md:grid-cols-2">
							{availableWidgets.map((widget) => (
								<Card
									key={widget.id}
									title={
										<div className="flex items-center justify-between">
											<span className="flex items-center gap-2">
												{widget.icon}
												{widget.title}
											</span>
											<Button type="primary" size="small" onClick={() => handleAddWidget(widget)}>
												Tambah
											</Button>
										</div>
									}
								>
									<div className="h-20"></div>
								</Card>
							))}
						</div>
					</div>

					<div>
						<h4 className="font-semibold">Widget Aktif</h4>
						<div className="mt-2 space-y-2">
							{widgets.map((widget) => (
								<div key={widget.id} className="flex items-center justify-between rounded border p-3">
									<div className="flex items-center gap-3">
										<DragOutlined className="text-gray-400" />
										{widget.icon}
										<span>{widget.title}</span>
										<Tag>{widget.category}</Tag>
										<Tag>Span: {widget.colSpan}</Tag>
									</div>
									<Space>
										<Switch checked={widget.enabled} onChange={() => handleToggleWidget(widget.id)} />
										<Button type="text" danger size="small" onClick={() => handleRemoveWidget(widget.id)}>
											Hapus
										</Button>
									</Space>
								</div>
							))}
						</div>
					</div>
				</div>
			</Modal>
		</>
	);
}

export default DashboardWidgets;
