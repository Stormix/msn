import { IUser, PayloadType, WebSocket, WebSocketPayload } from '@/types'
import Handler from './handler'

export default class UserHandler extends Handler {
  types = [PayloadType.UserInfo]

  handle(ws: WebSocket, payload: WebSocketPayload) {
    switch (payload.type) {
      case PayloadType.UserInfo:
        if (this.app.debug) console.debug('Updating user info received: ', payload)
        this.app.updateClient(ws.data.id, payload.payload as Partial<IUser>)
        break
    }
  }
}
