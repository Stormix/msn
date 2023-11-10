import { Message } from '@/types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface ChatState {
  name?: string
  messages: Message[]
  addMessage: (message: Message) => void
  setName: (name: string) => void
  clear: () => void
}

export const useChatStore = create(
  persist<ChatState>(
    (set) => ({
      name: '',
      messages: [],
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      setName: (name) => set({ name }),
      clear: () => set({ messages: [] })
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)
