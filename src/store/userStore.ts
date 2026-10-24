import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { create } from "zustand";
import { adminLogin, adminLogout, isAdminSession, pb } from "@/api/client";

export interface UserInfo {
	id?: string;
	username?: string;
	email?: string;
	avatar?: string;
	permissions?: string[];
	roles?: string[];
}

export interface UserToken {
	accessToken?: string;
	refreshToken?: string;
}

export interface SignInReq {
	email: string;
	password: string;
}

type UserStore = {
	userInfo: Partial<UserInfo>;
	userToken: UserToken;
	loginAttempts: number;
	lockUntil: number;
	actions: {
		setUserInfo: (userInfo: UserInfo) => void;
		setUserToken: (token: UserToken) => void;
		hydrateFromAuthStore: () => void;
		clearUserInfoAndToken: () => void;
		recordFailedLogin: () => void;
		resetLoginAttempt: () => void;
	};
};

const MAX_ATTEMPT = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const useUserStore = create<UserStore>((set) => ({
	userInfo: {},
	userToken: {},
	loginAttempts: 0,
	lockUntil: 0,
	actions: {
		setUserInfo: (userInfo) => set({ userInfo }),
		setUserToken: (userToken) => set({ userToken }),
		hydrateFromAuthStore: () => {
			if (!isAdminSession()) {
				pb.authStore.clear();
				set({ userInfo: {}, userToken: {} });
				return;
			}

			const model = pb.authStore.model;
			if (!pb.authStore.isValid || !model) return;

			const id = typeof model.id === "string" ? model.id : undefined;
			const email = typeof model.email === "string" ? model.email : undefined;
			const name = typeof model.name === "string" ? model.name : undefined;

			set({
				userToken: { accessToken: pb.authStore.token || undefined },
				userInfo: {
					id,
					email,
					username: name || email,
					roles: ["admin"],
					permissions: ["*:*"],
				},
			});
		},
		clearUserInfoAndToken: () => {
			adminLogout();
			set({ userInfo: {}, userToken: {}, loginAttempts: 0, lockUntil: 0 });
		},
		recordFailedLogin: () =>
			set((state) => {
				const attempts = state.loginAttempts + 1;
				if (attempts >= MAX_ATTEMPT) {
					return { loginAttempts: attempts, lockUntil: Date.now() + LOCKOUT_MS };
				}
				return { loginAttempts: attempts };
			}),
		resetLoginAttempt: () => set({ loginAttempts: 0, lockUntil: 0 }),
	},
}));

export const useUserInfo = () => useUserStore((state) => state.userInfo);
export const useUserToken = () => useUserStore((state) => state.userToken);
export const useUserPermissions = () => useUserStore((state) => state.userInfo.permissions || []);
export const useUserRoles = () => useUserStore((state) => state.userInfo.roles || []);
export const useUserActions = () => useUserStore((state) => state.actions);
export const useLoginGuard = () =>
	useUserStore((state) => ({
		attempts: state.loginAttempts,
		lockUntil: state.lockUntil,
		isLocked: state.lockUntil > Date.now(),
	}));

export const useSignIn = () => {
	const { setUserInfo, setUserToken, recordFailedLogin, resetLoginAttempt } = useUserActions();
	const { lockUntil } = useLoginGuard();

	const loginMutation = useMutation({
		mutationFn: (payload: SignInReq) => adminLogin(payload),
	});

	const signIn = async (data: SignInReq): Promise<void> => {
		if (lockUntil > Date.now()) {
			const remain = Math.ceil((lockUntil - Date.now()) / 60_000);
			throw new Error(`Akun dikunci sementara. Coba lagi ${remain} menit lagi.`);
		}

		try {
			const result = await loginMutation.mutateAsync(data);
			setUserToken({ accessToken: result.token });
			setUserInfo({
				id: result.model.id,
				email: result.model.email,
				username: result.model.name || result.model.email,
				roles: ["admin"],
				permissions: ["*:*"],
			});
			resetLoginAttempt();
		} catch (error) {
			recordFailedLogin();
			const message = error instanceof Error ? error.message : "Login gagal";
			toast.error(message);
			throw error;
		}
	};

	return signIn;
};

export default useUserStore;
