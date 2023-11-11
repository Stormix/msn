import { ServerWebSocket, env } from 'bun'
import { nanoid } from 'nanoid'

type WebSocket = ServerWebSocket<{ id: string }>

interface Client {
  id: string
  name?: string
  state: 'idle' | 'searching' | 'connected'
  ws: WebSocket
}

class Queue<T> {
  private _queue: T[] = []

  constructor() {}

  push(item: T) {
    this._queue.push(item)
  }

  get() {
    return this._queue
  }

  pop() {
    return this._queue.shift()
  }

  length() {
    return this._queue.length
  }
}

const main = async () => {
  const clients: Record<string, Client> = {}
  const queue = new Queue<Client>()

  Bun.serve({
    port: env.PORT ?? 9000,
    fetch(req, server) {
      // upgrade the request to a WebSocket
      if (
        server.upgrade(req, {
          data: {
            id: nanoid()
          }
        })
      ) {
        return // do not return a Response
      }
      return new Response('Upgrade failed :(', { status: 500 })
    },
    websocket: {
      message(ws: WebSocket, message) {
        console.log('WS Message received', message)
        const { type, payload } = JSON.parse(message as string)

        switch (type) {
          case 'name':
            clients[ws.data.id].name = payload
            break
          case 'message': {
            const { id, message } = payload
            const client = clients[id]

            if (!client) {
              ws.send(JSON.stringify({ type: 'error', payload: 'Client not found' }))
              return
            }

            client.ws.send(
              JSON.stringify({
                type: 'message',
                payload: {
                  id: ws.data.id,
                  name: clients[ws.data.id].name ?? ws.data.id,
                  message
                }
              })
            )
            return
          }
          case 'call': {
            console.log('Call', ws.data.id, 'looking for a client, current queue:', queue.get()?.map((c) => c.id))

            const client = clients[ws.data.id]

            if (!client) {
              ws.send(JSON.stringify({ type: 'error', payload: 'Client not found' }))
              return
            }

            client.state = 'searching'

            if (queue.length() > 0) {
              const randomClientId = queue.pop()!.id
              console.info('Found a client, current queue:', randomClientId)
              const randomClient = clients[randomClientId]
              // TODO check if client is still connected

              randomClient.state = 'connected'
              client.state = 'connected'

              client.ws.send(
                JSON.stringify({
                  type: 'offer',
                  payload: {
                    id: randomClient.id,
                    name: clients[randomClientId].name ?? randomClientId
                  }
                })
              )
              break
            }

            queue.push(client)
            break
          }
        }
      }, // a message is received
      open(ws: WebSocket) {
        console.log('WS Client connected', ws.data.id)
        clients[ws.data.id] = { ws, id: ws.data.id, state: 'idle' }
        ws.send(JSON.stringify({ type: 'id', id: ws.data.id }))
      },
      close(ws: WebSocket, code, message) {
        console.log('WS Client disconnected', code, message)
        delete clients[ws.data.id]
      }
    }
  })
}

main()
  .then(() => {
    console.log(`Server started on port ${env.PORT ?? 9000}`)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
