import { create } from 'zustand'

type OtpVerifyResult = "success" | "invalid" | "expired" | "max-attempts"

interface OtpState {
    generatedOtp: string | null
    email: string | null
    expiresAt: number | null
    attempts: number
    generateOtp: (email: string) => void
    verifyOtp: (input: string) => OtpVerifyResult
    resetOtp: () => void
}

const OTP_EXPIRY_MS = 2 * 60 * 1000 // 2 minutes
const MAX_ATTEMPTS = 5

export const useOtpStore = create<OtpState>()((set, get) => ({
    generatedOtp: null,
    email: null,
    expiresAt: null,
    attempts: 0,

    generateOtp: (email: string) => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = Date.now() + OTP_EXPIRY_MS

        // Log to console for dev testing
        console.log(`[BloodConnect OTP] Code for ${email}: ${otp}`)

        set({
            generatedOtp: otp,
            email,
            expiresAt,
            attempts: 0,
        })
    },

    verifyOtp: (input: string): OtpVerifyResult => {
        const { generatedOtp, expiresAt, attempts } = get()

        if (attempts >= MAX_ATTEMPTS) {
            return "max-attempts"
        }

        if (!expiresAt || Date.now() > expiresAt) {
            return "expired"
        }

        if (input !== generatedOtp) {
            set({ attempts: attempts + 1 })
            return "invalid"
        }

        return "success"
    },

    resetOtp: () => {
        set({
            generatedOtp: null,
            email: null,
            expiresAt: null,
            attempts: 0,
        })
    },
}))
