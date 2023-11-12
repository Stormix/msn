import { NUDITY_CHECK_INTERVAL, NUDITY_THRESHOLD } from '@/lib/config'
import { useStore } from '@/lib/store'
import { useOmegle } from '@/providers/omegle-provider'
import { useCallback, useRef } from 'react'
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async'

const useNudityModerator = () => {
  const interval = useRef<ReturnType<typeof setIntervalAsync> | null>(null)
  const { meRef } = useOmegle()
  const { model } = useStore()

  const takePicture = useCallback(async () => {
    console.log('taking picture')
    if (!meRef?.current) return
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const { videoHeight, videoWidth } = meRef.current

    canvas.width = videoWidth
    canvas.height = videoHeight
    context?.drawImage(meRef.current, 0, 0, videoWidth, videoHeight)

    const results = await model?.classify(canvas)
    canvas.remove()
    const isNude =
      (results?.filter(
        (result) => result.probability > NUDITY_THRESHOLD && ['Porn', 'Hentai'].includes(result.className)
      )?.length ?? 0) > 0

    return isNude
  }, [meRef, model])

  const start = useCallback(() => {
    if (interval.current) return
    console.log('interval not set')
    interval.current = setIntervalAsync(async () => {
      console.log('Checking for nudity')
      const isNude = await takePicture()
      if (isNude) {
        console.log('nudity detected')
      }
    }, NUDITY_CHECK_INTERVAL)
  }, [takePicture])

  const stop = useCallback(() => {
    console.log('stopping interval')
    if (interval.current) {
      clearIntervalAsync(interval.current)
    }
  }, [])

  return { start, stop }
}

export default useNudityModerator
