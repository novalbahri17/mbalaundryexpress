import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Alert,
	Button,
	Form,
	Input,
	Modal,
	Popconfirm,
	Select,
	Switch,
	Table,
	Tag,
	Tooltip,
	message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
	Copy,
	Edit3,
	KeyRound,
	Plus,
	RefreshCw,
	Search,
	Shield,
	Trash2,
	UserCheck,
	UserCog,
	Users,
	UserX,
	Wand2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { pb } from "@/api/client";
import {
	type AdminRole,
	type AdminUser,
	createAdminUser,
	deleteAdminUser,
	listAdminUsers,
	updateAdminUser,
} from "@/api/users.api";
import { MetronicCard, MetronicPage } from "@/components/admin/MetronicPage";
import { useUserActions, useUserInfo } from "@/store/userStore";

const ROLE_META: Record<AdminRole, { label: string; color: string }> = {
	superadmin: { label: "Super Admin", color: "red" },
	admin: { label: "Admin", color: "blue" },
	operator: { label: "Operator", color: "cyan" },
};

const formatDateTime = (iso?: string) => {
	if (!iso) return "—";
	try {
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return iso;
		return d.toLocaleString("id-ID", {
			timeZone: "Asia/Jakarta",
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return iso;
	}
};

const generateRandomPassword = () => {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#";
	let out = "";
	for (let i = 0; i < 10; i++) {
		out += chars[Math.floor(Math.random() * chars.length)];
	}
	return out;
};

export default function UsersPage() {
	const queryClient = useQueryClient();
	const currentUser = useUserInfo();
	const { setUserInfo } = useUserActions();

	const [searchQuery, setSearchQuery] = useState("");
	const [formModalOpen, setFormModalOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
	const [passwordModalUser, setPasswordModalUser] = useState<AdminUser | null>(null);

	const [userForm] = Form.useForm();
	const [passwordForm] = Form.useForm();

	const {
		data: users = [],
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["admin-users"],
		queryFn: listAdminUsers,
	});

	const syncSelfSession = (updated: AdminUser) => {
		if (updated.id === currentUser.id) {
			const token = pb.authStore.token;
			if (token) {
				pb.authStore.save(token, {
					id: updated.id,
					email: updated.email,
					name: updated.name,
					role: updated.role,
					collectionName: "_superusers",
				});
			}
			setUserInfo({
				...currentUser,
				id: updated.id,
				email: updated.email,
				username: updated.name || updated.email,
			});
		}
	};

	const createMutation = useMutation({
		mutationFn: createAdminUser,
		onSuccess: () => {
			message.success("User baru berhasil ditambahkan.");
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			setFormModalOpen(false);
			userForm.resetFields();
		},
		onError: (err: Error) => {
			message.error(err?.message || "Gagal menambah user.");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateAdminUser>[1] }) =>
			updateAdminUser(id, payload),
		onSuccess: (updated) => {
			syncSelfSession(updated);
			message.success("Data user berhasil diperbarui.");
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			setFormModalOpen(false);
			setPasswordModalUser(null);
			userForm.resetFields();
			passwordForm.resetFields();
		},
		onError: (err: Error) => {
			message.error(err?.message || "Gagal memperbarui user.");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteAdminUser,
		onSuccess: () => {
			message.success("User berhasil dihapus.");
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
		},
		onError: (err: Error) => {
			message.error(err?.message || "Gagal menghapus user.");
		},
	});

	const filteredUsers = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return users;
		return users.filter(
			(u) =>
				u.email.toLowerCase().includes(q) ||
				(u.name || "").toLowerCase().includes(q) ||
				(u.role || "").toLowerCase().includes(q),
		);
	}, [users, searchQuery]);

	const stats = useMemo(() => {
		const total = users.length;
		const active = users.filter((u) => u.is_active).length;
		const inactive = total - active;
		return { total, active, inactive };
	}, [users]);

	const openCreateModal = () => {
		setEditingUser(null);
		userForm.setFieldsValue({
			name: "",
			email: "",
			role: "admin",
			is_active: true,
			password: "",
		});
		setFormModalOpen(true);
	};

	const openEditModal = (record: AdminUser) => {
		setEditingUser(record);
		userForm.setFieldsValue({
			name: record.name || "",
			email: record.email,
			role: record.role || "admin",
			is_active: record.is_active,
			password: "",
		});
		setFormModalOpen(true);
	};

	const openPasswordModal = (record: AdminUser) => {
		setPasswordModalUser(record);
		passwordForm.setFieldsValue({ newPassword: "" });
	};

	const handleSubmitUserForm = async () => {
		const values = await userForm.validateFields();
		if (editingUser) {
			const payload: Parameters<typeof updateAdminUser>[1] = {
				name: values.name,
				email: values.email,
				role: values.role,
				is_active: values.is_active,
			};
			if (values.password?.trim()) {
				payload.password = values.password;
			}
			updateMutation.mutate({ id: editingUser.id, payload });
		} else {
			createMutation.mutate({
				name: values.name,
				email: values.email,
				role: values.role,
				is_active: values.is_active,
				password: values.password,
			});
		}
	};

	const handleSubmitPasswordModal = async () => {
		if (!passwordModalUser) return;
		const values = await passwordForm.validateFields();
		updateMutation.mutate({
			id: passwordModalUser.id,
			payload: { password: values.newPassword },
		});
	};

	const columns: ColumnsType<AdminUser> = [
		{
			title: "User / Admin",
			key: "user",
			render: (_, record) => {
				const isSelf = record.id === currentUser.id;
				const initial = (record.name || record.email || "A").slice(0, 1).toUpperCase();
				return (
					<div className="flex items-center gap-3">
						<span
							className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
							style={{ background: record.is_active ? "var(--brand)" : "#94A3B8" }}
						>
							{initial}
						</span>
						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-1.5">
								<span className="font-bold text-[var(--text-primary)]">
									{record.name?.trim() || record.email.split("@")[0]}
								</span>
								{isSelf && (
									<Tag color="green" className="!m-0 !text-[10px] font-bold">
										AKUN ANDA
									</Tag>
								)}
							</div>
							<div className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)]">
								<span className="truncate">{record.email}</span>
								<Tooltip title="Salin email">
									<button
										type="button"
										onClick={() => {
											navigator.clipboard.writeText(record.email);
											message.success("Email disalin.");
										}}
										className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--brand)]"
									>
										<Copy size={12} />
									</button>
								</Tooltip>
							</div>
						</div>
					</div>
				);
			},
		},
		{
			title: "Role",
			dataIndex: "role",
			key: "role",
			width: 140,
			render: (role: AdminRole) => {
				const meta = ROLE_META[role] ?? ROLE_META.admin;
				return (
					<Tag color={meta.color} className="!font-semibold">
						{meta.label}
					</Tag>
				);
			},
		},
		{
			title: "Status",
			dataIndex: "is_active",
			key: "is_active",
			width: 130,
			render: (active: boolean, record) => {
				const isSelf = record.id === currentUser.id;
				return (
					<Tooltip title={isSelf ? "Tidak bisa menonaktifkan akun sendiri" : "Klik untuk aktif/nonaktifkan"}>
						<Switch
							size="small"
							checked={active}
							disabled={isSelf || updateMutation.isPending}
							checkedChildren="Aktif"
							unCheckedChildren="Nonaktif"
							onChange={(checked) => {
								updateMutation.mutate({ id: record.id, payload: { is_active: checked } });
							}}
						/>
					</Tooltip>
				);
			},
		},
		{
			title: "Dibuat / Diperbarui",
			key: "dates",
			width: 190,
			render: (_, record) => (
				<div className="text-[11px] leading-relaxed text-[var(--text-muted)]">
					<div>Dibuat: {formatDateTime(record.created)}</div>
					<div>Diubah: {formatDateTime(record.updated)}</div>
				</div>
			),
		},
		{
			title: "Aksi",
			key: "actions",
			width: 240,
			align: "right",
			render: (_, record) => {
				const isSelf = record.id === currentUser.id;
				const isLastAdmin = users.length <= 1;
				return (
					<div className="flex flex-wrap items-center justify-end gap-1.5">
						<Button size="small" icon={<Edit3 size={13} />} onClick={() => openEditModal(record)}>
							Edit
						</Button>
						<Button
							size="small"
							icon={<KeyRound size={13} />}
							onClick={() => openPasswordModal(record)}
						>
							Ubah Password
						</Button>
						<Popconfirm
							title="Hapus User Ini?"
							description={`Akun "${record.email}" akan dihapus permanen dan tidak bisa login lagi.`}
							okText="Ya, Hapus"
							cancelText="Batal"
							okButtonProps={{ danger: true }}
							disabled={isSelf || isLastAdmin}
							onConfirm={() => deleteMutation.mutate(record.id)}
						>
							<Tooltip
								title={
									isSelf
										? "Tidak bisa menghapus akun yang sedang digunakan"
										: isLastAdmin
											? "Minimal 1 admin harus tersisa"
											: "Hapus user"
								}
							>
								<Button
									size="small"
									danger
									icon={<Trash2 size={13} />}
									disabled={isSelf || isLastAdmin}
								/>
							</Tooltip>
						</Popconfirm>
					</div>
				);
			},
		},
	];

	return (
		<MetronicPage
			title="Manajemen User"
			subtitle="Tambah user admin baru, edit profil/role, dan ubah password kapan saja."
		>
			<div className="space-y-4">
				{/* Ringkasan */}
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
					<div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
						<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#C62828] dark:bg-red-950/40">
							<Users size={20} />
						</span>
						<div>
							<p className="m-0 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
								Total User Admin
							</p>
							<p className="m-0 text-[20px] font-black text-[var(--text-primary)]">{stats.total}</p>
						</div>
					</div>

					<div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
						<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
							<UserCheck size={20} />
						</span>
						<div>
							<p className="m-0 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
								Akun Aktif
							</p>
							<p className="m-0 text-[20px] font-black text-emerald-600">{stats.active}</p>
						</div>
					</div>

					<div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
						<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800">
							<UserX size={20} />
						</span>
						<div>
							<p className="m-0 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
								Akun Nonaktif
							</p>
							<p className="m-0 text-[20px] font-black text-[var(--text-secondary)]">{stats.inactive}</p>
						</div>
					</div>
				</div>

				{/* Toolbar + Tabel */}
				<MetronicCard
					title="Daftar User Panel Admin"
					icon={<UserCog size={18} />}
					action={
						<div className="flex flex-wrap items-center gap-2">
							<Input
								allowClear
								prefix={<Search size={14} className="text-[var(--text-muted)]" />}
								placeholder="Cari nama atau email..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="!w-[220px]"
							/>
							<Button
								icon={<RefreshCw size={14} />}
								onClick={() => {
									refetch();
									message.success("Daftar user diperbarui.");
								}}
							>
								Refresh
							</Button>
							<Button type="primary" icon={<Plus size={15} />} onClick={openCreateModal}>
								Tambah User
							</Button>
						</div>
					}
					noPadding
				>
					<Table
						rowKey="id"
						loading={isLoading}
						dataSource={filteredUsers}
						columns={columns}
						scroll={{ x: 760 }}
						pagination={{ pageSize: 15, showSizeChanger: true, pageSizeOptions: ["10", "15", "30", "50"] }}
					/>
				</MetronicCard>
			</div>

			{/* ============ MODAL TAMBAH / EDIT USER ============ */}
			<Modal
				open={formModalOpen}
				onCancel={() => {
					setFormModalOpen(false);
					setEditingUser(null);
				}}
				title={
					<div className="flex items-center gap-2">
						<Shield size={17} className="text-[#C62828]" />
						<span>{editingUser ? `Edit User: ${editingUser.email}` : "Tambah User Admin Baru"}</span>
					</div>
				}
				onOk={handleSubmitUserForm}
				confirmLoading={createMutation.isPending || updateMutation.isPending}
				okText={editingUser ? "Simpan Perubahan" : "Tambah User"}
				cancelText="Batal"
				width={480}
			>
				<Form form={userForm} layout="vertical" className="pt-2">
					<Form.Item name="name" label="Nama Lengkap / Panggilan">
						<Input placeholder="Contoh: Noval / Admin Cabang" maxLength={120} />
					</Form.Item>

					<Form.Item
						name="email"
						label="Email Login"
						rules={[
							{ required: true, message: "Email wajib diisi." },
							{ type: "email", message: "Format email tidak valid." },
						]}
					>
						<Input placeholder="nama@email.com" maxLength={191} />
					</Form.Item>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<Form.Item name="role" label="Role / Label" initialValue="admin">
							<Select
								options={[
									{ value: "superadmin", label: "Super Admin" },
									{ value: "admin", label: "Admin" },
									{ value: "operator", label: "Operator" },
								]}
							/>
						</Form.Item>

						<Form.Item name="is_active" label="Status Akun" valuePropName="checked" initialValue={true}>
							<Switch
								disabled={editingUser?.id === currentUser.id}
								checkedChildren="Aktif"
								unCheckedChildren="Nonaktif"
							/>
						</Form.Item>
					</div>

					<Form.Item
						name="password"
						label={
							<div className="flex w-full items-center justify-between gap-2">
								<span>{editingUser ? "Password Baru (Opsional)" : "Password"}</span>
								<button
									type="button"
									onClick={() => userForm.setFieldValue("password", generateRandomPassword())}
									className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-[#C62828] hover:underline"
								>
									<Wand2 size={11} />
									<span>Buat Acak</span>
								</button>
							</div>
						}
						rules={
							editingUser
								? [{ min: 4, message: "Password minimal 4 karakter." }]
								: [
										{ required: true, message: "Password wajib diisi." },
										{ min: 4, message: "Password minimal 4 karakter." },
									]
						}
						extra={
							editingUser
								? "Kosongkan jika tidak ingin mengganti password user ini."
								: "Bebas atur password (minimal 4 karakter)."
						}
					>
						<Input.Password
							placeholder={editingUser ? "Isi hanya jika ingin ganti password..." : "Masukkan password..."}
						/>
					</Form.Item>
				</Form>
			</Modal>

			{/* ============ MODAL CEPAT UBAH PASSWORD ============ */}
			<Modal
				open={Boolean(passwordModalUser)}
				onCancel={() => {
					setPasswordModalUser(null);
					passwordForm.resetFields();
				}}
				title={
					<div className="flex items-center gap-2">
						<KeyRound size={17} className="text-[#C62828]" />
						<span>Ubah Password User</span>
					</div>
				}
				onOk={handleSubmitPasswordModal}
				confirmLoading={updateMutation.isPending}
				okText="Simpan Password Baru"
				cancelText="Batal"
				width={440}
			>
				{passwordModalUser && (
					<div className="space-y-3 pt-2">
						<Alert
							type="info"
							showIcon
							message={
								<span className="text-[12px]">
									Mengubah password untuk <strong>{passwordModalUser.name || passwordModalUser.email}</strong> (
									{passwordModalUser.email})
								</span>
							}
						/>
						<Form form={passwordForm} layout="vertical">
							<Form.Item
								name="newPassword"
								label={
									<div className="flex w-full items-center justify-between gap-2">
										<span>Password Baru</span>
										<button
											type="button"
											onClick={() => passwordForm.setFieldValue("newPassword", generateRandomPassword())}
											className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-[#C62828] hover:underline"
										>
											<Wand2 size={11} />
											<span>Buat Acak</span>
										</button>
									</div>
								}
								rules={[
									{ required: true, message: "Password baru wajib diisi." },
									{ min: 4, message: "Password minimal 4 karakter." },
								]}
							>
								<Input.Password placeholder="Masukkan password baru terserah Anda..." />
							</Form.Item>
						</Form>
					</div>
				)}
			</Modal>
		</MetronicPage>
	);
}
