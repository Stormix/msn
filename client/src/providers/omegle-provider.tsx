import { useToast } from '@/components/ui/use-toast'
import { useUserMedia } from '@/hooks/useUserMedia'
import { useStore } from '@/lib/store'
import { User } from '@/types'
import Peer, { MediaConnection } from 'peerjs'
import React, { createContext, useContext, useEffect, useRef } from 'react'
import useWebSocket from 'react-use-websocket'

type OmegleProviderProps = {
  children: React.ReactNode
}

type OmegleProviderState = {
  sendMessage?: (message: string) => void
  connect?: () => void
  setName?: (name: string) => void
  call?: MediaConnection
  meRef?: React.RefObject<HTMLVideoElement>
  strangerRef?: React.RefObject<HTMLVideoElement>
  stranger?: User
  me?: User
}

const initialState: OmegleProviderState = {
  sendMessage: undefined,
  connect: undefined,
  call: undefined,
  meRef: undefined,
  strangerRef: undefined,
  stranger: undefined,
  me: undefined
}

const OmegleProviderContext = createContext<OmegleProviderState>(initialState)

export function OmegleProvider({ children }: OmegleProviderProps) {
  const { toast } = useToast()
  const {
    addMessage,
    clear,
    setMe,
    setStranger,
    me,
    stranger,
    call: currentCall,
    peer,
    setPeer,
    setCall,
    disconnect,
    setState
  } = useStore()

  const meRef = useRef<HTMLVideoElement>(null)
  const strangerRef = useRef<HTMLVideoElement>(null)

  const onMessage = (e: MessageEvent) => {
    const { data: raw } = e
    const data = JSON.parse(raw)

    switch (data.type) {
      case 'message':
        addMessage({
          sender: data.payload.name,
          message: data.payload.message
        })
        break
      case 'id': {
        setMe({
          ...me,
          id: data.id
        })

        const peer = new Peer(data.id, {
          host: 'peer.lab.stormix.dev',
          port: 443,
          path: '/',
          debug: 2
        })

        peer.on('open', (id) => {
          console.log('My peer ID is: ' + id)
        })

        setPeer(peer)

        break
      }
      case 'offer': {
        if (!peer || !stream) return

        setStranger({
          id: data.payload.id,
          name: data.payload.name
        })
        setState('connected')

        const call = peer.call(data.payload.id, stream as MediaStream, {
          metadata: {
            name: me?.name,
            id: me?.id
          }
        })

        call.on('stream', (remoteStream) => {
          if (strangerRef.current) strangerRef.current.srcObject = remoteStream
        })

        call.on('close', () => {
          console.info('Call closed')
          disconnect()
        })

        setCall(call)
        break
      }
      case 'error':
        toast({
          title: 'Error',
          description: data.payload,
          variant: 'destructive'
        })
        break
    }
  }

  const { stream } = useUserMedia({
    constraints: {
      audio: true,
      video: true
    },
    onStream: (stream) => {
      if (meRef.current) {
        meRef.current.srcObject = stream
      }
    }
  })

  const ws = useWebSocket(import.meta.env.VITE_WS_ENDPOINT, {
    shouldReconnect: () => true,
    onOpen: () => {
      console.info('Connected to websocket server.', me?.id)
    },
    onMessage
  })

  useEffect(() => {
    if (!peer || !stream || me?.state === 'connected' || currentCall) return

    peer?.on('call', (call) => {
      if (me?.state !== 'searching') return

      setStranger({
        id: call.peer,
        name: call.metadata.name
      })

      call.answer(stream)
      call.on('stream', (remoteStream) => {
        if (strangerRef.current) strangerRef.current.srcObject = remoteStream
      })
      call.on('close', () => {
        console.info('Call closed')
        disconnect()
      })

      setState('connected')
      setCall(call)
    })
  }, [currentCall, disconnect, me?.state, peer, setCall, setState, setStranger, stream])

  return (
    <OmegleProviderContext.Provider
      value={{
        sendMessage: (message: string) => {
          ws.sendJsonMessage({
            type: 'message',
            payload: {
              id: stranger?.id,
              name: stranger?.name ?? stranger?.id,
              message
            }
          })
          addMessage({
            sender: 'me',
            message
          })
        },
        connect: () => {
          if (!me?.id) return
          if (currentCall) currentCall.close()
          setState('searching')
          clear()
          ws.sendJsonMessage({
            id: me?.id,
            type: 'call'
          })
        },
        setName: (name: string) => {
          ws.sendJsonMessage({
            id: me?.id,
            type: 'name',
            payload: name
          })
        },
        call: currentCall || undefined,
        meRef,
        strangerRef,
        stranger,
        me
      }}
    >
      {children}
    </OmegleProviderContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useOmegle = () => {
  const context = useContext(OmegleProviderContext)
  if (context === undefined) throw new Error('useTheme must be used within a OmegleProvider')

  return context
}
