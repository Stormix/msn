import { Me, User } from '@/types'
import Peer, { MediaConnection } from 'peerjs'
import { StateCreator } from 'zustand'
import type { State } from '.'

export interface UsersState {
  me: Me | undefined
  stranger: User | undefined

  setMe: (user: User) => void
  setStranger: (user: User) => void

  inCall: boolean
  call: MediaConnection | undefined
  peer: Peer | undefined

  setCall: (call: MediaConnection) => void
  setPeer: (peer: Peer) => void
  setName: (name: string) => void
  disconnect: () => void
  setState: (state: Me['state']) => void
}

export const createUsersSlice: StateCreator<State, [], [], UsersState> = (set) => ({
  me: undefined,
  stranger: undefined,
  inCall: false,
  call: undefined,
  peer: undefined,
  setMe: (user: User) =>
    set({
      me: {
        ...user,
        state: 'idle'
      }
    }),
  setStranger: (user: User) => set({ stranger: user }),
  setName: (name: string) => set((state) => ({ me: { ...state.me, name, state: state.me?.state ?? 'idle' } })),
  setCall: (call: MediaConnection) => set({ call }),
  setPeer: (peer: Peer) => set({ peer }),
  disconnect: () =>
    set((state) => ({
      stranger: undefined,
      inCall: false,
      call: undefined,
      peer: undefined,
      me: {
        ...state.me,
        state: 'idle'
      }
    })),
  setState: (state: Me['state']) => set((s) => ({ me: { ...s.me, state } }))
})
