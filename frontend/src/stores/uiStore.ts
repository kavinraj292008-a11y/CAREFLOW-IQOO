import { create } from 'zustand'

interface UIState {
  sidebarCollapsed: boolean
  assistantOpen: boolean
  toggleSidebar: () => void
  setAssistantOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  assistantOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setAssistantOpen: (open) => set({ assistantOpen: open }),
}))
