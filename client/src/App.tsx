import Peer, { MediaConnection } from 'peerjs'
import { useEffect, useRef, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import Layout from './components/template/layout'
import { Button } from './components/ui/button'
import { Textarea } from './components/ui/textarea'
import { useToast } from './components/ui/use-toast'
import { useUserMedia } from './hooks/useUserMedia'

interface Message {
  sender: string
  message: string
}

const App = () => {
  const meRef = useRef<HTMLVideoElement>(null)
  const strangerRef = useRef<HTMLVideoElement>(null)
  const [id, setId] = useState<string | null>(null)
  const [strangerId, setStrangerId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState<string>('')

  const addMessage = (message: Message) => {
    setMessages((messages) => [...messages, message])
  }

  const { toast } = useToast()

  const ws = useWebSocket('wss://omegle-server.lab.stormix.dev', {
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
            sender: data.payload.id,
            message: data.payload.message
          })
          break
        case 'id':
          setId(data.id)
          break
        case 'offer':
          setStrangerId(data.payload)
          toast({
            title: 'Stranger Found',
            description: 'Calling ' + data.payload
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

  const [peer, setPeer] = useState<Peer | null>(null)
  const [call, setCall] = useState<MediaConnection | null>(null)

  const { stream } = useUserMedia({
    audio: true,
    video: true
  })

  if (stream && meRef.current) {
    meRef.current.srcObject = stream
  }

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
        if (!stream) return
        setStrangerId(call.peer)
        call.answer(stream)
        call.on('stream', (remoteStream) => {
          if (strangerRef.current) {
            strangerRef.current.srcObject = remoteStream
          }
        })
      })
    }
  }, [peer, stream])

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

  const startCall = () => {
    ws.sendJsonMessage({
      id,
      type: 'call'
    })
  }

  return (
    <>
      <Layout>
        <div className="flex flex-row h-full gap-8">
          <div className="w-1/4 flex flex-col gap-8">
            <div className="bg-accent text-white h-72 w-full">
              <video autoPlay playsInline className="w-full h-full" id="stranger-video" ref={strangerRef} />
            </div>
            <div className="bg-accent text-white h-72 w-full">
              <video autoPlay playsInline muted className="w-full h-full" id="me-video" ref={meRef} />
            </div>
          </div>
          <div className="flex-grow flex flex-col h-full">
            <div className="flex-grow">
              {messages.map((message, i) => (
                <div key={i} className="flex flex-col gap-4 p-4">
                  <span className="font-bold">{message.sender}: </span>
                  <span>{message.message}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-row gap-4">
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
              <div className="flex flex-col gap-4">
                <Button
                  disabled={!message || !strangerId}
                  onClick={() => {
                    ws.sendJsonMessage({
                      type: 'message',
                      payload: {
                        id: strangerId,
                        message
                      }
                    })

                    addMessage({
                      sender: 'me',
                      message
                    })
                  }}
                >
                  Send
                </Button>
                <Button onClick={() => startCall()}>{call ? 'Skip' : 'Call'}</Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default App
