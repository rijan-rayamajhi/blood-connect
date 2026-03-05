import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authService from '@/lib/supabase/auth'
import type { AuthProfile } from '@/lib/supabase/auth'

export type UserRole = "admin" | "hospital" | "blood-bank"

export interface User {
    id: string
    name: string
    email: string
    role: UserRole
    organizationId?: string | null
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    sessionReady: boolean
    failedAttempts: number
    isLocked: boolean
    lockUntil: number | null
    error: string | null

    // Core auth actions
    initialize: () => Promise<void>
    loginWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    signUp: (email: string, password: string, orgName: string, role: 'hospital' | 'blood-bank') => Promise<{ success: boolean; error?: string }>
    logoutSupabase: () => Promise<void>

    // Account lock (client-side UX rate limiting)
    incrementFailedAttempt: () => void
    resetFailedAttempts: () => void
    lockAccount: () => void
    unlockAccount: () => void
    checkLockStatus: () => void
}

function profileToUser(profile: AuthProfile): User {
    return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        organizationId: profile.organizationId,
    }
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            sessionReady: false,
            failedAttempts: 0,
            isLocked: false,
            lockUntil: null,
            error: null,

            initialize: async () => {
                // Skip if already initialized
                if (get().sessionReady) return

                try {
                    const result = await authService.getSessionAndProfile()
                    if (result.success && result.profile) {
                        set({
                            user: profileToUser(result.profile),
                            isAuthenticated: true,
                            sessionReady: true,
                            error: null,
                        })
                    } else {
                        set({
                            user: null,
                            isAuthenticated: false,
                            sessionReady: true,
                            error: null,
                        })
                    }
                } catch {
                    set({
                        user: null,
                        isAuthenticated: false,
                        sessionReady: true,
                        error: null,
                    })
                }
            },

            loginWithPassword: async (email, password) => {
                const { isLocked } = get()
                if (isLocked) {
                    return { success: false, error: 'Account is temporarily locked. Please wait.' }
                }

                set({ error: null })

                const result = await authService.signIn(email, password)

                if (!result.success) {
                    get().incrementFailedAttempt()
                    set({ error: result.error || 'Login failed.' })
                    return { success: false, error: result.error }
                }

                if (result.profile) {
                    get().resetFailedAttempts()
                    set({
                        user: profileToUser(result.profile),
                        isAuthenticated: true,
                        sessionReady: true,
                        error: null,
                    })
                }

                return { success: true }
            },

            signUp: async (email, password, orgName, role) => {
                set({ error: null })

                const result = await authService.signUp({ email, password, orgName, role })

                if (!result.success) {
                    set({ error: result.error || 'Signup failed.' })
                    return { success: false, error: result.error }
                }

                return { success: true }
            },

            logoutSupabase: async () => {
                await authService.signOut()
                set({
                    user: null,
                    isAuthenticated: false,
                    sessionReady: true,
                    error: null,
                })
            },

            // ── Account Lock (client-side UX) ────────────────────────────────

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
                lockUntil: Date.now() + 15 * 60 * 1000, // 15 minutes
                failedAttempts: 5,
            }),

            unlockAccount: () => set({
                failedAttempts: 0,
                isLocked: false,
                lockUntil: null
            }),

            checkLockStatus: () => {
                const { isLocked, lockUntil } = get()
                if (isLocked && lockUntil && Date.now() > lockUntil) {
                    set({ isLocked: false, lockUntil: null, failedAttempts: 0 })
                }
            },
        }),
        {
            name: 'blood-connect-auth',
            partialize: (state) => ({
                // Only persist lock-related state and basic user info
                // Session is managed by Supabase, not localStorage
                failedAttempts: state.failedAttempts,
                isLocked: state.isLocked,
                lockUntil: state.lockUntil,
            }),
        }
    )
)
