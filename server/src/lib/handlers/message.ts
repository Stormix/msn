import { WebSocketResponse } from '@/lib/response'
import { PayloadType, WebSocket, WebSocketPayload } from '@/types'
import Handler from './handler'

interface MessagePayload {
  id: string
  message: string
}

export default class MessageHandler extends Handler {
  types = [PayloadType.Message]

  handle(ws: WebSocket, payload: WebSocketPayload) {
    if (this.app.debug) console.debug('Message received', payload)
    const { id, message } = payload.payload as MessagePayload
    const client = this.app.client(id)

    if (!client) {
      return ws.send(new WebSocketResponse(PayloadType.Error, 'Client not found').json())
    }

    return client.ws.send(
      new WebSocketResponse(PayloadType.Message, {
        id: ws.data.id,
        name: this.app.client(ws.data.id).name,
        message
      }).json()
    )
  }
}
