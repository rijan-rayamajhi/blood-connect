import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'blood-bank' | 'hospital' | 'admin'

export interface User {
    id: string
    name: string
    email: string
    role: UserRole
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    login: (user: User) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (user) => set({ user, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: 'blood-connect-auth',
        }
    )
)
