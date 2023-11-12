import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form'
import useNudityModerator from '@/hooks/useNudityModerator'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { useWebRTC } from '@/providers/webrtc-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Badge } from '../ui/badge'
import { Textarea } from '../ui/textarea'
import { useToast } from '../ui/use-toast'
import SettingsDialog from './settings-dialog'
import UserCount from './user-count'

const formSchema = z.object({
  message: z.string().min(1)
})

const Chat = () => {
  const { start } = useNudityModerator()

  const ref = useRef<HTMLDivElement>(null)
  const { messages, me } = useStore()
  const { sendMessage, stranger, emitTyping: setTyping, stream } = useWebRTC()
  const { toast } = useToast()
  const [meTyping, setMeTyping] = useState(false)

  const debouncedTyping = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!meTyping) return
    if (debouncedTyping.current) {
      clearTimeout(debouncedTyping.current)
    }
    debouncedTyping.current = setTimeout(() => {
      setMeTyping(false)
      setTyping?.(false)
    }, 2000)
  }, [meTyping, setTyping])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: ''
    }
  })

  useEffect(() => {
    // When a new message is received, scroll to the bottom of the chat
    ref?.current?.scrollTo(0, ref?.current?.scrollHeight)
  }, [messages])

  useEffect(() => {
    if (stream) {
      start()
    }
  }, [start, stream])

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!stranger?.id) {
      toast({
        title: 'Error',
        description: 'You are not connected to a chat.',
        variant: 'destructive'
      })
      return
    }
    sendMessage?.(data.message)
    form.reset()
  }

  return (
    <div className="flex-grow flex flex-col h-full w-full ">
      <div className="flex justify-between gap-2 text-xl">
        <h3>
          Chat log: <Badge>{me?.state}</Badge>
        </h3>
        <UserCount />
      </div>
      <div className="flex-grow flex flex-col gap-2 overflow-y-auto h-5/6 py-8" ref={ref}>
        <span
          className={cn('animate-pulse ease-in-out ', {
            visible: stranger?.isTyping,
            hidden: !stranger?.isTyping
          })}
        >
          Stranger is typing...
        </span>
        {messages.map((message, i) => (
          <div key={i} className="flex flex-col gap-2 ">
            <span
              className={cn('font-bold', {
                'text-accent': message.sender === stranger?.id || message.sender === stranger?.name
              })}
            >
              {message.sender}:
            </span>
            <span>{message.message}</span>
          </div>
        ))}
      </div>
      <div className="flex w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className=" flex flex-col md:flex-row gap-4 w-full items-start">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex flex-grow flex-col w-full justify-center md:justify-normal">
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Type your message here"
                      {...field}
                      onKeyDown={(e) => {
                        if (!meTyping) {
                          setMeTyping(true)
                          setTyping?.(true)
                        }
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          form.handleSubmit(onSubmit)()
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription className="">
                    <span className="mr-2">
                      You're connected as <b>{me?.name}.</b>
                    </span>
                    <SettingsDialog />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size={'lg'} className="flex gap-2 w-full md:max-w-xs">
              <Send className="w-4 h-4" />
              Send message
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default Chat
