import { ServerWebSocket, env } from 'bun'
import { sample } from 'lodash'
import { nanoid } from 'nanoid'

type WebSocket = ServerWebSocket<{ id: string }>

interface Client {
  id: string
  name?: string
  ws: WebSocket
}

const main = async () => {
  const clients: Record<string, Client> = {}
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
          }
          case 'call': {
            console.log('Call', ws, 'looking for a client')
            const client = clients[ws.data.id]

            if (!client) {
              ws.send(JSON.stringify({ type: 'error', payload: 'Client not found' }))
              return
            }

            // Get another random client
            const randomClientId = sample(Object.keys(clients).filter((c) => c !== ws.data.id))
            if (!randomClientId) {
              ws.send(JSON.stringify({ type: 'error', payload: 'No other clients found' }))
              return
            }

            client.ws.send(
              JSON.stringify({
                type: 'offer',
                payload: {
                  id: randomClientId,
                  name: clients[randomClientId].name ?? randomClientId
                }
              })
            )
            break
          }
        }
      }, // a message is received
      open(ws: WebSocket) {
        console.log('WS Client connected', ws.data.id)
        clients[ws.data.id] = { ws, id: ws.data.id }
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
