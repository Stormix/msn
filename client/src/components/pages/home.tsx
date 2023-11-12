import { useWebRTC } from '@/providers/webrtc-provider'
import Chat from '../molecules/chat'
import { Button } from '../ui/button'

const Home = () => {
  const { meRef, strangerRef, call, connect: startCall } = useWebRTC()

  return (
    <div className="flex flex-col md:flex-row h-full gap-8">
      <div className="w-full md:w-2/5 md:max-w-2xl flex flex-col gap-4">
        <div className="flex flex-col gap-4 h-full">
          <div className="p-4 border-primary border rounded-md w-full h-1/2">
            <video autoPlay playsInline className="w-full h-full" id="stranger-video" ref={strangerRef} />
          </div>
          <div className="p-4 border-primary border rounded-md h-1/2 w-full">
            <video autoPlay playsInline muted className="w-full h-full" id="me-video" ref={meRef} />
          </div>
        </div>
        <Button onClick={() => startCall?.()}>{call ? 'Reroll' : 'Start chatting'}</Button>
      </div>
      <Chat />
    </div>
  )
}

export default Home
