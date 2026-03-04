import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = "admin" | "hospital" | "blood-bank"

export interface User {
    id: string
    name: string
    email: string
    role: UserRole
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    failedAttempts: number
    isLocked: boolean
    lockUntil: number | null
    sessionExpiresAt: number | null
    login: (user: User) => void
    logout: () => void
    incrementFailedAttempt: () => void
    resetFailedAttempts: () => void
    lockAccount: () => void
    unlockAccount: () => void
    checkLockAndSession: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            failedAttempts: 0,
            isLocked: false,
            lockUntil: null,
            sessionExpiresAt: null,

            login: (user) => set({
                user,
                isAuthenticated: true,
                failedAttempts: 0,
                isLocked: false,
                lockUntil: null,
                sessionExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
            }),

            logout: () => set({
                user: null,
                isAuthenticated: false,
                sessionExpiresAt: null
            }),

            incrementFailedAttempt: () => {
                const { failedAttempts } = get()
                const newAttempts = failedAttempts + 1
                if (newAttempts >= 5) {
                    get().lockAccount()
                } else {
                    set({ failedAttempts: newAttempts })
                }
            },

            resetFailedAttempts: () => set({
                failedAttempts: 0,
                isLocked: false,
                lockUntil: null
            }),

            lockAccount: () => set({
                isLocked: true,
                lockUntil: Date.now() + 15 * 60 * 1000 // 15 minutes
            }),

            unlockAccount: () => set({
                failedAttempts: 0,
                isLocked: false,
                lockUntil: null
            }),

            checkLockAndSession: () => {
                const { isLocked, lockUntil, sessionExpiresAt, isAuthenticated, logout } = get()
                const now = Date.now()

                if (isLocked && lockUntil && now > lockUntil) {
                    set({ isLocked: false, lockUntil: null, failedAttempts: 0 })
                }

                if (isAuthenticated && sessionExpiresAt && now > sessionExpiresAt) {
                    logout()
                }
            }
        }),
        {
            name: 'blood-connect-auth',
        }
    )
)
