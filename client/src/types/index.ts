export interface Message {
  sender: string
  message: string
}

export interface User {
  id: string
  name: string
  state: UserState
  isTyping: boolean
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
  Typing = 'typing'
}
