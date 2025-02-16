import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  toggle: () => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    set => ({
      isOpen: true, // default state
      setIsOpen: open => set({ isOpen: open }),
      toggle: () => set(state => ({ isOpen: !state.isOpen }))
    }),
    {
      name: 'sidebar-storage' // unique name for localStorage
    }
  )
)
