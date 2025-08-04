import { adminClient, anonymousClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { auth } from "./auth";
import { ac, allRoles } from "./roles";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  plugins: [anonymousClient(),
		adminClient({
			ac,
			roles: allRoles,
		}),
		inferAdditionalFields<typeof auth>(),
  ],
});
export const {
	signIn,
	signOut,
	signUp,
	updateUser,
	changePassword,
	changeEmail,
	deleteUser,
	useSession,
	revokeSession,
	resetPassword,
	linkSocial,
	forgetPassword,
	listAccounts,
	listSessions,
	revokeOtherSessions,
	revokeSessions,
} = authClient

export function useUser() {
	const session = useSession()
	return session.data?.user
}

export function useRole() {
	const session = useSession()
	return session.data?.user?.role
}

export function useIsAdmin() {
	const role = useRole()
	return role === 'admin'
}