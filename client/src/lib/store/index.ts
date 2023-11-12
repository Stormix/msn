import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import { ChatState, createChatSlice } from './chat.slice'
import { ModeratorState, createModeratorSlice } from './moderator.slice'
import { SettingsState, createSettingsSlice } from './settings.slice'
import { UsersState, createUsersSlice } from './users.slice'

export type State = ChatState & SettingsState & UsersState & ModeratorState

export const useStore = create<State>()(
  devtools(
    persist<State>(
      (...a) => ({
        ...createChatSlice(...a),
        ...createSettingsSlice(...a),
        ...createUsersSlice(...a),
        ...createModeratorSlice(...a)
      }),
      {
        name: 'msn-storage',
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) =>
          Object.fromEntries(
            Object.entries(state).filter(([key]) => !['peer', 'call', 'stranger', 'model'].includes(key))
          ) as State
      }
    )
  )
)
