import { PayloadType, WebSocket, WebSocketPayload } from '@/types'
import { App } from '../app'

export default abstract class Handler {
  abstract types: PayloadType[]
  abstract handle(ws: WebSocket, payload: WebSocketPayload): void

  constructor(private readonly _app: App) {}

  listen(ws: WebSocket, payload: WebSocketPayload) {
    if (this.types.includes(payload.type)) {
      this.handle(ws, payload)
    }
  }

  get app() {
    return this._app
  }
}
