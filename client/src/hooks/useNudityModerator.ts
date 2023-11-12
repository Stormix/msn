import { NUDITY_CHECK_INTERVAL, NUDITY_THRESHOLD } from '@/lib/config'
import { NSFW_CLASSES } from '@/lib/nsfw'
import { useStore } from '@/lib/store'
import { useWebRTC } from '@/providers/webrtc-provider'
import { useCallback, useRef } from 'react'
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async'

const useNudityModerator = () => {
  const interval = useRef<ReturnType<typeof setIntervalAsync> | null>(null)
  const { meRef } = useWebRTC()
  const { model } = useStore()

  const takePicture = useCallback(async () => {
    if (!meRef?.current) return
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const { videoHeight, videoWidth } = meRef.current

    canvas.width = videoWidth
    canvas.height = videoHeight
    context?.drawImage(meRef.current, 0, 0, videoWidth, videoHeight)

    const results = await model?.classify(canvas)
    const isNude =
      (results?.filter(
        (result) =>
          result.probability > NUDITY_THRESHOLD && [NSFW_CLASSES.Porn, NSFW_CLASSES.Hentai].includes(result.className)
      )?.length ?? 0) > 0

    canvas.remove()
    return isNude
  }, [meRef, model])

  const start = useCallback(() => {
    if (interval.current) return
    interval.current = setIntervalAsync(async () => {
      console.log('Checking for nudity')
      const isNude = await takePicture()
      if (isNude) {
        console.log('Nudity detected')
        // TODO: ban user
      }
    }, NUDITY_CHECK_INTERVAL)
  }, [takePicture])

  const stop = useCallback(() => {
    if (interval.current) clearIntervalAsync(interval.current)
  }, [])

  return { start, stop }
}

export default useNudityModerator
