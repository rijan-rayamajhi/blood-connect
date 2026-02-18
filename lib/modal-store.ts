import { create } from 'zustand'

interface CreateRequestStore {
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
}

export const useCreateRequestStore = create<CreateRequestStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}))
