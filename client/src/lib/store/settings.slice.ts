import { StateCreator } from 'zustand'
import type { State } from '.'

export interface SettingsState {
  keywords: string[]
  saveSettings: (keywords: string[]) => void
}

export const createSettingsSlice: StateCreator<State, [], [], SettingsState> = (set) => ({
  keywords: [],
  saveSettings: (keywords: string[]) => set({ keywords })
})
