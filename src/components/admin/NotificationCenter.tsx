import {
	BellOutlined,
	CheckCircleOutlined,
	CloseOutlined,
	ExclamationCircleOutlined,
	MessageOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Badge, Button, List, Popover, Tag, theme } from "antd";
import { useState } from "react";
import { getPromos } from "@/api/promos.api";
import { getContactMessages, getPartnerships } from "@/api/settings.api";
import { formatDateTime } from "@/utils/format";

export interface NotificationItem {
	id: string;
	type: "message" | "promo" | "system" | "alert";
	title: string;
	description: string;
	time: string;
	read: boolean;
	actionUrl?: string;
	priority: "low" | "medium" | "high";
}

function NotificationCenter() {
	const [open, setOpen] = useState(false);
	const { token } = theme.useToken();

	const { data: messages = [], isLoading: messagesLoading } = useQuery({
		queryKey: ["notification-messages"],
		queryFn: getContactMessages,
	});

	const { data: partnerships = [] } = useQuery({
		queryKey: ["notification-partnerships"],
		queryFn: getPartnerships,
	});

	const { data: promoRes, isLoading: promosLoading } = useQuery({
		queryKey: ["notification-promos"],
		queryFn: () => getPromos({ activeOnly: true, status: "published", perPage: 50 }),
	});

	const promos = promoRes?.items || [];

	const newLeads = partnerships.filter((lead) => lead.status === "new");

	const unreadMessages = messages.filter((msg) => msg.status === "new");
	const expiringPromos = promos
		.filter((promo): promo is typeof promo & { end_date: string } => Boolean(promo.end_date))
		.filter((promo) => {
			const endDate = new Date(promo.end_date);
			const now = new Date();
			const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
			return diffDays <= 3 && diffDays > 0;
		});

	const notifications: NotificationItem[] = [
		...unreadMessages.slice(0, 3).map((msg) => ({
			id: `msg-${msg.id}`,
			type: "message" as const,
			title: `Pesan baru dari ${msg.name}`,
			description: msg.subject || "Tidak ada subjek",
			time: formatDateTime(msg.created || new Date()),
			read: false,
			actionUrl: "/admin/pesan",
			priority: "high" as const,
		})),
		...newLeads.slice(0, 2).map((lead) => ({
			id: `lead-${lead.id}`,
			type: "alert" as const,
			title: `Lead kemitraan baru: ${lead.name}`,
			description: lead.company || "Individu",
			time: formatDateTime(lead.created || new Date()),
			read: false,
			actionUrl: "/admin/kemitraan",
			priority: "medium" as const,
		})),
		...expiringPromos.slice(0, 3).map((promo) => ({
			id: `promo-${promo.id}`,
			type: "promo" as const,
			title: `Promo hampir berakhir: ${promo.title}`,
			description: `Berakhir ${formatDateTime(promo.end_date)}`,
			time: formatDateTime(promo.updated || promo.created || new Date()),
			read: false,
			actionUrl: "/admin/promo",
			priority: "medium" as const,
		})),
		{
			id: "system-1",
			type: "system",
			title: "Backup otomatis berhasil",
			description: "Backup database harian telah selesai",
			time: "Hari ini, 02:00",
			read: true,
			priority: "low",
		},
	];

	const unreadCount = notifications.filter((n) => !n.read).length;

	const getNotificationIcon = (type: NotificationItem["type"]) => {
		switch (type) {
			case "message":
				return <MessageOutlined style={{ color: token.colorPrimary }} />;
			case "promo":
				return <ExclamationCircleOutlined style={{ color: token.colorWarning }} />;
			case "alert":
				return <ExclamationCircleOutlined style={{ color: token.colorError }} />;
			default:
				return <BellOutlined style={{ color: token.colorTextSecondary }} />;
		}
	};

	const getPriorityTag = (priority: NotificationItem["priority"]) => {
		switch (priority) {
			case "high":
				return <Tag color="red">HIGH</Tag>;
			case "medium":
				return <Tag color="orange">MEDIUM</Tag>;
			case "low":
				return <Tag color="blue">LOW</Tag>;
		}
	};

	const notificationContent = (
		<div className="w-96">
			<div className="flex items-center justify-between border-b px-4 py-3">
				<h4 className="m-0 text-base font-bold">Notifikasi</h4>
				<div className="flex items-center gap-2">
					<Button type="text" size="small" icon={<CheckCircleOutlined />}>
						Tandai semua terbaca
					</Button>
					<Button type="text" size="small" icon={<CloseOutlined />} onClick={() => setOpen(false)} />
				</div>
			</div>
			<div className="max-h-96 overflow-y-auto">
				<List
					itemLayout="horizontal"
					dataSource={notifications}
					loading={messagesLoading || promosLoading}
					renderItem={(item) => (
						<List.Item
							className={`cursor-pointer px-4 py-3 hover:bg-gray-50 ${!item.read ? "bg-blue-50" : ""}`}
							onClick={() => {
								if (item.actionUrl) {
									window.location.href = item.actionUrl;
								}
							}}
						>
							<List.Item.Meta
								avatar={getNotificationIcon(item.type)}
								title={
									<div className="flex items-center justify-between">
										<span className="font-semibold">{item.title}</span>
										{getPriorityTag(item.priority)}
									</div>
								}
								description={
									<div>
										<p className="m-0 text-sm">{item.description}</p>
										<p className="m-0 mt-1 text-xs text-gray-500">{item.time}</p>
									</div>
								}
							/>
						</List.Item>
					)}
					locale={{ emptyText: "Tidak ada notifikasi baru" }}
				/>
			</div>
			<div className="border-t p-3 text-center">
				<Button type="link" onClick={() => (window.location.href = "/admin/pesan")}>
					Lihat semua notifikasi
				</Button>
			</div>
		</div>
	);

	return (
		<Popover
			content={notificationContent}
			title={null}
			trigger="click"
			open={open}
			onOpenChange={setOpen}
			placement="bottomRight"
			arrow={false}
		>
			<button type="button" className="header-icon-btn" aria-label="Notifikasi">
				<Badge count={unreadCount} size="small" offset={[-2, 2]}>
					<BellOutlined style={{ fontSize: 18 }} />
				</Badge>
			</button>
		</Popover>
	);
}

export default NotificationCenter;
