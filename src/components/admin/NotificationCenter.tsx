import {
	BellOutlined,
	CheckCircleOutlined,
	CloseOutlined,
	ExclamationCircleOutlined,
	MessageOutlined,
} from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, List, message, Popover, Tag, theme } from "antd";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPromos } from "@/api/promos.api";
import { getContactMessages, getPartnerships, updateContactMessage, updatePartnership } from "@/api/settings.api";
import { formatDateTime } from "@/utils/format";

/**
 * Kunci cache yang dipakai halaman admin terkait, supaya badge langsung
 * ikut hilang setelah data diubah dari halaman lain (dan sebaliknya).
 */
const RELATED_QUERY_KEYS = [
	["notification-messages"],
	["notification-partnerships"],
	["notification-promos"],
	["admin-contact-messages"],
	["admin-partnerships"],
	["admin-promos"],
];

/**
 * Notifikasi promo/sistem tidak punya kolom status di database, jadi status
 * "sudah dibaca"-nya disimpan di browser. Tanpa ini badge merah tidak akan
 * pernah bisa 0 karena item promo dibuat ulang dari data setiap render.
 */
const ACK_STORAGE_KEY = "mba-notif-ack";
const ACK_LIMIT = 200;

function readAckIds(): Set<string> {
	if (typeof window === "undefined") return new Set();
	try {
		const raw = window.localStorage.getItem(ACK_STORAGE_KEY);
		const parsed: unknown = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed) ? new Set(parsed.map((id) => String(id))) : new Set();
	} catch {
		return new Set();
	}
}

function writeAckIds(ids: Set<string>): void {
	if (typeof window === "undefined") return;
	try {
		const list = Array.from(ids).slice(-ACK_LIMIT);
		window.localStorage.setItem(ACK_STORAGE_KEY, JSON.stringify(list));
	} catch {
		// localStorage penuh / diblokir: badge tetap jalan dari data server.
	}
}

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
	const [marking, setMarking] = useState(false);
	const [ackIds, setAckIds] = useState<Set<string>>(readAckIds);
	const { token } = theme.useToken();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const refreshNotifications = useCallback(async (): Promise<void> => {
		await Promise.all(RELATED_QUERY_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
	}, [queryClient]);

	const acknowledge = useCallback((ids: string[]) => {
		if (ids.length === 0) return;
		setAckIds((prev) => {
			const next = new Set(prev);
			for (const id of ids) next.add(id);
			writeAckIds(next);
			return next;
		});
	}, []);

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
			type: "system" as const,
			title: "Backup otomatis berhasil",
			description: "Backup database harian telah selesai",
			time: "Hari ini, 02:00",
			read: true,
			priority: "low" as const,
		},
	].map((item) => (ackIds.has(item.id) ? { ...item, read: true } : item));

	const unreadCount = notifications.filter((n) => !n.read).length;

	/**
	 * Tandai semua notifikasi terbaca. Pesan & lead diubah statusnya di database,
	 * sedangkan promo/sistem dicatat di localStorage. Keduanya perlu supaya
	 * badge benar-benar jadi 0 dan tidak muncul lagi setelah halaman di-refresh.
	 */
	const handleMarkAllRead = async (): Promise<void> => {
		if (unreadCount === 0 || marking) return;
		setMarking(true);
		try {
			const tasks: Promise<unknown>[] = [
				...unreadMessages.map((msg) => updateContactMessage(msg.id, { status: "read" })),
				...newLeads.map((lead) => updatePartnership(lead.id, { status: "contacted" })),
			];
			const results = await Promise.allSettled(tasks);
			acknowledge(notifications.map((item) => item.id));
			await refreshNotifications();
			const failed = results.filter((result) => result.status === "rejected").length;
			if (failed > 0) {
				message.warning(`${failed} notifikasi gagal ditandai. Coba lagi.`);
			} else {
				message.success("Semua notifikasi ditandai terbaca");
			}
		} finally {
			setMarking(false);
		}
	};

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
			<div
				className="flex items-center justify-between border-b px-4 py-3"
				style={{ borderColor: token.colorBorderSecondary }}
			>
				<h4 className="m-0 text-base font-bold" style={{ color: token.colorText }}>
					Notifikasi
				</h4>
				<div className="flex items-center gap-2">
					<Button
						type="text"
						size="small"
						icon={<CheckCircleOutlined />}
						loading={marking}
						disabled={unreadCount === 0}
						onClick={handleMarkAllRead}
					>
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
							className="notif-row cursor-pointer px-4 py-3"
							style={{
								borderBlockEndColor: token.colorBorderSecondary,
								background: item.read ? "transparent" : token.colorPrimaryBg,
							}}
							onClick={async () => {
								// Klik = sudah dibaca: perbarui data sumbernya supaya badge ikut turun.
								if (!item.read) {
									acknowledge([item.id]);
									if (item.type === "message") {
										await updateContactMessage(item.id.replace(/^msg-/, ""), { status: "read" }).catch(
											() => undefined,
										);
									}
									if (item.type === "alert") {
										await updatePartnership(item.id.replace(/^lead-/, ""), { status: "contacted" }).catch(
											() => undefined,
										);
									}
									await refreshNotifications();
								}
								if (item.actionUrl) {
									setOpen(false);
									navigate(item.actionUrl);
								}
							}}
						>
							<List.Item.Meta
								avatar={getNotificationIcon(item.type)}
								title={
									<div className="flex items-center justify-between gap-3">
										<span className="font-semibold" style={{ color: token.colorText }}>
											{item.title}
										</span>
										{getPriorityTag(item.priority)}
									</div>
								}
								description={
									<div>
										<p className="m-0 text-sm" style={{ color: token.colorTextSecondary }}>
											{item.description}
										</p>
										<p className="m-0 mt-1 text-xs" style={{ color: token.colorTextTertiary }}>
											{item.time}
										</p>
									</div>
								}
							/>
						</List.Item>
					)}
					locale={{ emptyText: "Tidak ada notifikasi baru" }}
				/>
			</div>
			<div className="border-t p-3 text-center" style={{ borderColor: token.colorBorderSecondary }}>
				<Button
					type="link"
					onClick={() => {
						setOpen(false);
						navigate("/admin/pesan");
					}}
				>
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
