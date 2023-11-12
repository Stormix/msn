import { StateCreator } from 'zustand'
import type { State } from '.'
import { NSFWJS } from '../nsfw'

export interface ModeratorState {
  model: NSFWJS | undefined
  setModel: (model: NSFWJS) => void
}

export const createModeratorSlice: StateCreator<State, [], [], ModeratorState> = (set) => ({
  model: undefined,
  setModel: (model: NSFWJS) => set({ model })
})
