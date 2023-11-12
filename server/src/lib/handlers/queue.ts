import { PayloadType, UserState, WebSocket, WebSocketPayload } from '@/types'
import Handler from './handler'

interface QueuePayload {
  id: string
}

export default class QueueHandler extends Handler {
  types = [PayloadType.Queue]

  handle(ws: WebSocket, payload: WebSocketPayload) {
    if (this.app.debug) console.debug('Queue request received', payload)

    const { id } = payload.payload as QueuePayload
    const client = this.app.client(id)

    if (!client) {
      ws.send(JSON.stringify({ type: 'error', payload: 'Client not found' }))
      return
    }

    // Depending on the state of the client, we either search for a new user, disconnect from the current user, or do nothing
    switch (client.state) {
      case UserState.Searching:
        return
      case UserState.Connected:
        // Disconnect
        const lastUserId = client.disconnect()
        if (lastUserId) {
          const lastUser = this.app.client(lastUserId)
          lastUser.disconnect()
        }
      // No break here, we want to continue to the next case
      default:
        // Search
        this.app.updateClient(id, { state: UserState.Searching })
        this.app.queue.push(id)
        break
    }
  }
}
