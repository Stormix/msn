import { IUser, PayloadType, UserState, WebSocket } from '@/types'
import { generateUsername } from 'unique-username-generator'
import { WebSocketResponse } from './response'

class User implements IUser {
  id: string
  name?: string | undefined
  state: UserState
  ws: WebSocket
  isAlive: boolean
  history: string[] = []
  isTyping: boolean = false

  constructor(id: string, ws: WebSocket) {
    this.id = id
    this.ws = ws
    this.state = UserState.Idle
    this.isAlive = true
    this.name = generateUsername()
  }

  update(user: Partial<IUser>) {
    Object.assign(this, user)

    // Send the updated user to the client
    this.ws.send(
      new WebSocketResponse(PayloadType.UserInfo, {
        id: this.id,
        name: this.name,
        state: this.state
      }).json()
    )
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      state: this.state
    }
  }

  canConnect(stranger: User) {
    return stranger.id !== this.id && !this.history.includes(stranger.id)
  }

  connect(stranger: User) {
    this.history.push(stranger.id)
    this.update({ state: UserState.Connected })
    this.ws.send(new WebSocketResponse(PayloadType.Match, stranger.serialize()).json()) // Maybe redundant
  }

  disconnect() {
    // Get the last user in the history
    this.update({ state: UserState.Idle })
    this.ws.send(new WebSocketResponse(PayloadType.Disconnect, null).json())
    return this.history[this.history.length - 1]
  }
}

export default User
