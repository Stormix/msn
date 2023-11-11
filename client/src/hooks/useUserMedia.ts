import { useEffect, useState } from 'react'
interface UseUserMedia {
  constraints: MediaStreamConstraints
  onStream?: (stream: MediaStream) => void
}

export const useUserMedia = ({ constraints, onStream }: UseUserMedia) => {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (stream) return
    let didCancel = false

    const getUserMedia = async () => {
      if (!didCancel) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints)
          onStream?.(stream)
          setStream(stream)
        } catch (e) {
          setError(e as Error)
        }
      }
    }

    getUserMedia()

    return () => {
      didCancel = true
      if (!stream) return
      ;(stream as MediaStream).getVideoTracks()?.forEach((track) => track.stop())
      ;(stream as MediaStream).getAudioTracks()?.forEach((track) => track.stop())
    }
  }, [constraints, stream, error, onStream])
  return { stream, error }
}
