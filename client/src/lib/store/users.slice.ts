import { User } from '@/types'
import Peer, { MediaConnection } from 'peerjs'
import { StateCreator } from 'zustand'
import type { State } from '.'

export interface UsersState {
  me: User | undefined
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
}

export const createUsersSlice: StateCreator<State, [], [], UsersState> = (set) => ({
  me: undefined,
  stranger: undefined,
  inCall: false,
  call: undefined,
  peer: undefined,
  setMe: (user: User) =>
    set({
      me: user
    }),
  setStranger: (user: User) => set({ stranger: user }),
  setName: (name: string) => set((state) => ({ me: { ...(state.me as User), name } })),
  setCall: (call: MediaConnection) => set({ call }),
  setPeer: (peer: Peer) => set({ peer }),
  disconnect: () =>
    set({
      stranger: undefined,
      inCall: false,
      call: undefined,
      peer: undefined
    })
})
