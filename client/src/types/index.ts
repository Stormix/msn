export interface Message {
  sender: string
  message: string
}

export interface User {
  id?: string
  name?: string
}

export interface Me extends User {
  state: 'idle' | 'searching' | 'connected'
}
