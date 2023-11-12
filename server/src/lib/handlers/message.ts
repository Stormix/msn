import { WebSocketResponse } from '@/lib/response'
import { PayloadType, WebSocket, WebSocketPayload } from '@/types'
import Handler from './handler'

interface TypingPayload {
  id: string
  typing: boolean
}

interface MessagePayload {
  id: string
  message: string
}

export default class MessageHandler extends Handler {
  types = [PayloadType.Message, PayloadType.Typing]

  handle(ws: WebSocket, payload: WebSocketPayload) {
    if (this.app.debug) console.debug('Message received', payload)
    const { id } = payload.payload as MessagePayload | TypingPayload
    const client = this.app.client(id)

    if (!client) {
      return ws.send(new WebSocketResponse(PayloadType.Error, 'Client not found').json())
    }

    switch (payload.type) {
      case PayloadType.Message:
        const { message } = payload.payload as MessagePayload
        return client.ws.send(
          new WebSocketResponse(PayloadType.Message, {
            id: ws.data.id,
            name: this.app.client(ws.data.id).name,
            message
          }).json()
        )
      case PayloadType.Typing:
        return client.ws.send(
          new WebSocketResponse(PayloadType.Typing, {
            id: ws.data.id,
            typing: (payload.payload as TypingPayload).typing
          }).json()
        )
    }
  }
}
