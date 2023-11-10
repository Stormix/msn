import { useToast } from '@/components/ui/use-toast'
import { useUserMedia } from '@/hooks/useUserMedia'
import { useChatStore } from '@/lib/store'
import { User } from '@/types'
import Peer, { MediaConnection } from 'peerjs'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import useWebSocket from 'react-use-websocket'

type OmegleProviderProps = {
  children: React.ReactNode
}

type OmegleProviderState = {
  sendMessage?: (message: string) => void
  startCall?: () => void
  setName?: (name: string) => void
  call?: MediaConnection
  meRef?: React.RefObject<HTMLVideoElement>
  strangerRef?: React.RefObject<HTMLVideoElement>
  strangerId?: string | null
  stranger?: User
  me?: User
}

const initialState: OmegleProviderState = {
  sendMessage: undefined,
  startCall: undefined,
  call: undefined,
  meRef: undefined,
  strangerRef: undefined,
  strangerId: undefined,
  stranger: undefined,
  me: undefined
}

const OmegleProviderContext = createContext<OmegleProviderState>(initialState)

export function OmegleProvider({ children }: OmegleProviderProps) {
  const { toast } = useToast()
  const { addMessage, clear } = useChatStore()
  const wssEndpoint = import.meta.env.VITE_WS_ENDPOINT ?? 'wss://omegle-server.lab.stormix.dev'

  const meRef = useRef<HTMLVideoElement>(null)
  const strangerRef = useRef<HTMLVideoElement>(null)

  const [me, setMe] = useState<User>({
    id: undefined,
    name: undefined
  })
  const [stranger, setStranger] = useState<User>({
    id: undefined,
    name: undefined
  })

  const id = me?.id
  const strangerId = stranger?.id
  const [peer, setPeer] = useState<Peer | null>(null)
  const [currentCall, setCall] = useState<MediaConnection | null>(null)

  const { stream } = useUserMedia({
    audio: true,
    video: true
  })

  const ws = useWebSocket(wssEndpoint, {
    onOpen: () => {
      console.log('opened')
    },
    shouldReconnect: () => true,
    onMessage: (e) => {
      const { data: raw } = e
      const data = JSON.parse(raw)

      switch (data.type) {
        case 'message':
          addMessage({
            sender: data.payload.name,
            message: data.payload.message
          })
          break
        case 'id':
          setMe({
            ...me,
            id: data.id
          })
          break
        case 'offer':
          setStranger({
            id: data.payload.id,
            name: data.payload.name
          })
          break
        case 'error':
          toast({
            title: 'Error',
            description: data.payload,
            variant: 'destructive'
          })
          break
      }
    }
  })

  // TODO: REMOVE ALL THE USE EFFECTS

  useEffect(() => {
    if (stream && meRef.current) {
      meRef.current.srcObject = stream
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop()
        })
      }
    }
  }, [stream])

  useEffect(() => {
    if (stream && !peer && id) {
      setPeer(
        new Peer(id, {
          host: 'peer.lab.stormix.dev',
          port: 443,
          path: '/',
          debug: 3
        })
      )
    }
  }, [peer, stream, id])

  useEffect(() => {
    if (peer) {
      peer.on('open', (id) => {
        console.log('My peer ID is: ' + id)
      })

      peer.on('call', (call) => {
        if (!stream || currentCall) return
        setStranger({
          id: call.peer,
          name: undefined
        })
        call.answer(stream)
        call.on('stream', (remoteStream) => {
          if (strangerRef.current) {
            strangerRef.current.srcObject = remoteStream
          }
        })
      })
    }
  }, [currentCall, peer, stream, toast])

  useEffect(() => {
    if (peer && strangerId) {
      const call = peer.call(strangerId, stream as MediaStream)
      call.on('stream', (remoteStream) => {
        if (strangerRef.current) {
          strangerRef.current.srcObject = remoteStream
        }
      })
      setCall(call)
    }
  }, [peer, stream, strangerId])

  return (
    <OmegleProviderContext.Provider
      value={{
        sendMessage: (message: string) => {
          clear()
          ws.sendJsonMessage({
            type: 'message',
            payload: {
              id: strangerId,
              name: stranger.name,
              message
            }
          })
          addMessage({
            sender: 'me',
            message
          })
        },
        startCall: () => {
          console.info('Starting call')
          ws.sendJsonMessage({
            id,
            type: 'call'
          })
        },
        setName: (name: string) => {
          ws.sendJsonMessage({
            id,
            type: 'name',
            payload: name
          })
        },
        call: currentCall || undefined,
        meRef,
        strangerRef,
        strangerId,
        stranger,
        me
      }}
    >
      {children}
    </OmegleProviderContext.Provider>
  )
}

export const useOmegle = () => {
  const context = useContext(OmegleProviderContext)
  if (context === undefined) throw new Error('useTheme must be used within a OmegleProvider')

  return context
}
