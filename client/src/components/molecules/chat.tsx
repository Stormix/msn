import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useChatStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { useOmegle } from '@/providers/omegle-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Textarea } from '../ui/textarea'
import { useToast } from '../ui/use-toast'
import NameDialog from './name-dialog'

const formSchema = z.object({
  message: z.string().min(1)
})

const Chat = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { messages, name } = useChatStore()
  const { sendMessage, strangerId } = useOmegle()
  const { toast } = useToast()
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

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!strangerId) {
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
    <div className="flex-grow flex flex-col h-full w-full max-h-full">
      <div className="flex gap-2">
        <span>
          You're connected as <b>{name}</b>
        </span>
        <NameDialog />
      </div>
      <h3>Chat log: </h3>
      <div className="flex-grow flex flex-col gap-2 overflow-y-auto h-5/6 py-8" ref={ref}>
        {messages.map((message, i) => (
          <div key={i} className="flex flex-col gap-2 ">
            <span
              className={cn('font-bold', {
                'text-accent': message.sender === strangerId
              })}
            >
              {message.sender}:{' '}
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
                <FormItem className="flex-grow">
                  <FormControl>
                    <Textarea
                      placeholder="Type your message here"
                      {...field}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          form.handleSubmit(onSubmit)()
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>This is your public display name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size={'lg'}>
              Send message
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default Chat
