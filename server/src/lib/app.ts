import { Server } from 'bun'
import { omit } from 'lodash'
import { IUser, PayloadType, WebSocket } from '../types'
import { Handler, MessageHandler, QueueHandler, UserHandler } from './handlers'
import Queue from './queue'
import { WebSocketResponse } from './response'
import User from './user'

export class App {
  server: Server | null = null
  clients: Record<string, User> = {}
  heartbeat: ReturnType<typeof setInterval> | null = null
  matching: ReturnType<typeof setInterval> | null = null
  handlers: Handler[] = []
  queue: Queue<string> = new Queue()
  debug: boolean = true

  constructor() {
    this.handlers = [MessageHandler, UserHandler, QueueHandler].map((HandlerClass) => new HandlerClass(this))
  }

  listen(port: number | string) {
    this.server = Bun.serve({
      port,
      fetch: (req, server) => {
        const url = new URL(req.url)
        switch (url.pathname) {
          case '/':
            return new Response(JSON.stringify({ health: 'ok' }), {
              headers: {
                'content-type': 'application/json'
              }
            })
          case '/ws':
            if (
              server.upgrade(req, {
                data: {
                  id: crypto.randomUUID()
                }
              })
            ) {
              return
            }
            return new Response('Upgrade failed :(', { status: 500 })
          case '/users':
            return new Response(JSON.stringify(Object.values(this.clients).map((user) => omit(user, 'ws'))), {
              headers: {
                'content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
              }
            })
          default:
            return new Response('Not found', { status: 404 })
        }
      },
      websocket: {
        open: (ws: WebSocket) => {
          console.info('Client connected', ws.data.id)
          this.clients[ws.data.id] = new User(ws.data.id, ws)
          ws.send(new WebSocketResponse(PayloadType.UserInfo, this.clients[ws.data.id].serialize()).json())
        },
        close: (ws: WebSocket) => {
          console.info('Client disconnected', ws.data.id)
          delete this.clients[ws.data.id]
        },
        message: (ws: WebSocket, message) => {
          const payload = JSON.parse(message as string)
          this.handlers.forEach((handler) => handler.listen(ws, payload))
        },
        pong: (ws) => {
          // if (this.debug) console.debug('Pong received from', ws.data.id)
          const client = this.clients[ws.data.id]
          if (!client) return
          this.clients[ws.data.id].isAlive = true
        }
      }
    })

    this.heartbeat = setInterval(() => {
      Object.values(this.clients).forEach((client) => {
        if (!client.isAlive) {
          console.info('Client', client.id, 'is dead, removing from clients')
          delete this.clients[client.id]
          return
        }
        client.isAlive = false
        client.ws.ping()
      })
    }, 5_000)

    this.matching = setInterval(() => {
      if (this.queue.length < 2) return

      const user1_id = this.queue.shift() as string
      const user2_id = this.queue.shift() as string

      const user1 = this.client(user1_id)
      const user2 = this.client(user2_id)

      console.debug('Matching: ', {
        user1: user1?.serialize(),
        user2: user2?.serialize()
      })

      if (!user1 || !user2 || !user1.canConnect(user2)) {
        console.error('User not found in clients or cannot connect.')
        // Put the users back in the queue
        if (user1) this.queue.push(user1_id)
        if (user2) this.queue.push(user2_id)
        return
      }

      user1.connect(user2)
      user2.connect(user1)
    }, 2_500)

    console.info('> Listening on port', port)
  }

  updateClient(id: string, data: Partial<IUser>) {
    // Update the user with the new data
    this.clients[id].update(data)
  }

  client(id: string) {
    return this.clients[id] ?? null
  }

  stop() {
    Object.values(this.clients).forEach((client) => client.ws.close())
    this.server?.stop(true)
    clearInterval(this.heartbeat || undefined)
  }
}

export default new App()
