import PermissionDialog from '@/components/molecules/permission-dialog'
import { useToast } from '@/components/ui/use-toast'
import { useUserMedia } from '@/hooks/useUserMedia'
import { loadModel } from '@/lib/nsfw'
import { useStore } from '@/lib/store'
import { PayloadType, User, UserState } from '@/types'
import Peer, { MediaConnection } from 'peerjs'
import React, { createContext, useContext, useEffect, useRef } from 'react'
import useWebSocket from 'react-use-websocket'

type WebRTCProviderProps = {
  children: React.ReactNode
}

type WebRTCProviderState = {
  sendMessage?: (message: string) => void
  connect?: () => void
  setName?: (name: string) => void
  call?: MediaConnection
  meRef?: React.RefObject<HTMLVideoElement>
  strangerRef?: React.RefObject<HTMLVideoElement>
  stranger?: User
  me?: User
  emitTyping?: (typing: boolean) => void
  stream?: MediaStream
}

const initialState: WebRTCProviderState = {
  sendMessage: undefined,
  connect: undefined,
  call: undefined,
  meRef: undefined,
  strangerRef: undefined,
  stranger: undefined,
  me: undefined,
  emitTyping: undefined,
  stream: undefined
}

const WebRTCProviderContext = createContext<WebRTCProviderState>(initialState)

export const WebRTCProvider = ({ children }: WebRTCProviderProps) => {
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
    model,
    setModel
  } = useStore()

  const meRef = useRef<HTMLVideoElement>(null)
  const strangerRef = useRef<HTMLVideoElement>(null)

  const onMessage = (e: MessageEvent) => {
    const { data: raw } = e
    const data = JSON.parse(raw)

    switch (data.type) {
      case PayloadType.Disconnect:
        disconnect()
        if (strangerRef.current) strangerRef.current.srcObject = null
        addMessage({
          sender: 'system',
          message: 'Stranger disconnected'
        })
        break
      case PayloadType.Message:
        addMessage({
          sender: data.payload.name,
          message: data.payload.message
        })
        break
      case PayloadType.UserInfo: {
        setMe({ ...data.payload })
        if (!peer) {
          const peer = new Peer(data.payload.id, {
            host: 'peer.lab.stormix.dev',
            port: 443,
            path: '/',
            debug: 2
          })

          peer.on('open', (id) => {
            console.log('My peer ID is: ' + id)
          })

          setPeer(peer)
        }
        break
      }
      case PayloadType.Match: {
        if (!peer || !stream) return
        if (currentCall) currentCall.close()
        setStranger(data.payload)
        const call = peer.call(data.payload.id, stream as MediaStream, {
          metadata: {
            name: me?.name,
            id: me?.id
          }
        })
        if (!call) return
        call.on('stream', (remoteStream) => {
          if (strangerRef.current) strangerRef.current.srcObject = remoteStream
        })
        call.on('close', () => {
          console.info('Call closed')
          disconnect()
          if (strangerRef.current) strangerRef.current.srcObject = null
        })
        setCall(call)
        break
      }
      case PayloadType.Error:
        toast({
          title: 'Error',
          description: data.payload,
          variant: 'destructive'
        })
        break
      case PayloadType.Typing:
        setStranger({
          ...(stranger as User),
          isTyping: data.payload.typing
        })
        break
    }
  }

  const { stream, denied, tryAgain } = useUserMedia({
    constraints: {
      audio: true,
      video: true
    },
    onStream: (stream) => {
      if (meRef.current) meRef.current.srcObject = stream
    }
  })

  const ws = useWebSocket(import.meta.env.VITE_WS_ENDPOINT, {
    shouldReconnect: () => true,
    onOpen: () => {
      console.info('Connected to websocket server.', me?.id)
    },
    onMessage
  })

  // Handle incoming calls
  useEffect(() => {
    if (!peer || !stream || me?.state === UserState.Connected || currentCall) return

    peer?.on('call', (call) => {
      if (!call) return
      call.answer(stream)
      call.on('stream', (remoteStream) => {
        if (strangerRef.current) strangerRef.current.srcObject = remoteStream
      })
      call.on('close', () => {
        console.info('Call closed')
        disconnect()
        if (strangerRef.current) strangerRef.current.srcObject = null
      })
      setCall(call)
    })
  }, [currentCall, disconnect, me?.state, peer, setCall, setStranger, stream])

  // Handle model loading for NSFW detection
  useEffect(() => {
    ;(async () => {
      if (model) return
      const downloadedModel = await loadModel()
      setModel(downloadedModel)
    })()
  }, [model, setModel])

  return (
    <WebRTCProviderContext.Provider
      value={{
        emitTyping: (typing: boolean) => {
          ws.sendJsonMessage({
            type: PayloadType.Typing,
            payload: {
              id: stranger?.id,
              typing
            }
          })
        },
        sendMessage: (message: string) => {
          ws.sendJsonMessage({
            type: PayloadType.Message,
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
          console.log('Connecting...', me, currentCall)
          if (!me?.id) return
          if (currentCall) currentCall.close()
          clear()
          ws.sendJsonMessage({
            payload: {
              id: me?.id
            },
            type: PayloadType.Queue
          })
        },
        setName: (name: string) => {
          ws.sendJsonMessage({
            id: me?.id,
            type: PayloadType.UserInfo,
            payload: { name }
          })
        },
        call: currentCall || undefined,
        meRef,
        strangerRef,
        stranger,
        me,
        stream: stream || undefined
      }}
    >
      {children}
      <PermissionDialog open={denied} onSubmit={tryAgain} />
    </WebRTCProviderContext.Provider>
  )
}

export const useWebRTC = () => {
  const context = useContext(WebRTCProviderContext)
  if (context === undefined) throw new Error('useTheme must be used within a WebRTCProvider')
  return context
}
