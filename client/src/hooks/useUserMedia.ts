import { useToast } from '@/components/ui/use-toast'
import { useEffect, useState } from 'react'

interface UseUserMedia {
  constraints: MediaStreamConstraints
  onStream?: (stream: MediaStream) => void
}

export const useUserMedia = ({ constraints, onStream }: UseUserMedia) => {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [requested, setRequested] = useState(false)
  const { toast } = useToast()
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    const getUserMedia = async () => {
      setRequested(true)
      console.debug('Requesting camera and microphone permissions')
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        onStream?.(stream)
        setStream(stream)
        setDenied(false)
      } catch (e) {
        console.error('Failed to get user media', e)
        toast({
          title: 'Error',
          description: (e as Error).message,
          variant: 'destructive'
        })
        setDenied(true)
      }
    }

    if (!requested && !stream) getUserMedia()

    return () => {
      stream?.getVideoTracks()?.forEach((track) => track.stop())
      stream?.getAudioTracks()?.forEach((track) => track.stop())
    }
  }, [constraints, stream, onStream, toast, requested])

  return {
    stream,
    tryAgain: () => setRequested(false),
    denied
  }
}
