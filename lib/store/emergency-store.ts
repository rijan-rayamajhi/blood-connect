import { create } from 'zustand'

interface EmergencyState {
    isAlertOpen: boolean
    triggerAlert: () => void
    dismissAlert: () => void
}

export const useEmergencyStore = create<EmergencyState>((set) => ({
    isAlertOpen: false,
    triggerAlert: () => set({ isAlertOpen: true }),
    dismissAlert: () => set({ isAlertOpen: false }),
}))
