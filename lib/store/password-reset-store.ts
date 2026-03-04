import { create } from 'zustand'

type ResetValidationResult = "valid" | "expired" | "invalid"

interface PasswordResetState {
    resetToken: string | null
    expiresAt: number | null
    email: string | null
    requestReset: (email: string) => void
    validateToken: (token: string) => ResetValidationResult
    clearReset: () => void
}

const RESET_EXPIRY_MS = 10 * 60 * 1000 // 10 minutes

function generateToken(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    let token = ""
    for (let i = 0; i < 32; i++) {
        token += chars[Math.floor(Math.random() * chars.length)]
    }
    return token
}

export const usePasswordResetStore = create<PasswordResetState>()((set, get) => ({
    resetToken: null,
    expiresAt: null,
    email: null,

    requestReset: (email: string) => {
        const token = generateToken()
        const expiresAt = Date.now() + RESET_EXPIRY_MS

        console.log(`[BloodConnect Reset] Token for ${email}: ${token}`)

        set({
            resetToken: token,
            expiresAt,
            email,
        })
    },

    validateToken: (token: string): ResetValidationResult => {
        const { resetToken, expiresAt } = get()

        if (!resetToken || token !== resetToken) {
            return "invalid"
        }

        if (!expiresAt || Date.now() > expiresAt) {
            return "expired"
        }

        return "valid"
    },

    clearReset: () => {
        set({
            resetToken: null,
            expiresAt: null,
            email: null,
        })
    },
}))
