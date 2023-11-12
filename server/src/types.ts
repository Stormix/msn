import { ServerWebSocket } from 'bun'

export type WebSocketData = {
  id: string
}

export type WebSocket = ServerWebSocket<WebSocketData>

export type WebSocketPayload = {
  type: PayloadType
  payload: unknown
}

export interface IUser {
  id: string
  name?: string
  state: UserState
  ws: WebSocket
  isAlive: boolean
}

export enum UserState {
  Idle = 'idle',
  Searching = 'searching',
  Connected = 'connected'
}

export enum PayloadType {
  Message = 'message',
  UserInfo = 'user-info',
  Error = 'error',
  Call = 'call',
  Queue = 'queue',
  Match = 'match',
  Disconnect = 'disconnect',
  UpdateName = 'update-name',
  Typing = 'typing'
}
