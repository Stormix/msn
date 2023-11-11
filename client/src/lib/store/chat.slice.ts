import { Message } from '@/types'
import { StateCreator } from 'zustand'
import type { State } from '.'

export interface ChatState {
  messages: Message[]
  addMessage: (message: Message) => void
  clear: () => void
}

export const createChatSlice: StateCreator<State, [], [], ChatState> = (set) => ({
  messages: [],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clear: () => set({ messages: [] })
})
