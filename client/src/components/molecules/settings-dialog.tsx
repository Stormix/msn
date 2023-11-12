import { useStore } from '@/lib/store'
import { useWebRTC } from '@/providers/webrtc-provider'
import { zodResolver } from '@hookform/resolvers/zod'
import { DialogDescription } from '@radix-ui/react-dialog'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { generateUsername } from 'unique-username-generator'
import { z } from 'zod'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '../ui/form'
import { Input } from '../ui/input'

const formSchema = z.object({
  name: z.string().min(1),
  keywords: z.string().optional()
})

const SettingsDialog = () => {
  const { keywords, saveSettings, me, setName } = useStore()
  const [open, setOpen] = useState(!me?.name)
  const { setName: setChatName } = useWebRTC()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: me?.name || generateUsername(),
      keywords: keywords?.join(', ') || ''
    }
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setOpen(false)
    saveSettings(data.keywords?.split(',').map((keyword) => keyword.trim()) ?? [])
    setName(data.name)
    setChatName?.(data.name)
  }

  return (
    <Dialog open={open}>
      <DialogTrigger>
        <a onClick={() => setOpen(true)}>
          (<span className="hover:underline">Change name</span>)
        </a>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="gap-4">
          <DialogTitle>Pick a name stranger!</DialogTitle>
          <DialogDescription className="text-start text-sm">
            This is the name that will be displayed to your chat partner. You can also add some keywords that you want
            to talk about.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.stopPropagation()
              form.handleSubmit(onSubmit)(e)
            }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input placeholder="What do you want to be called?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input placeholder="Topics you want to talk about (comma separated)" {...field} />
                  </FormControl>
                  <FormDescription>You can leave this blank if you want to talk about anything.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsDialog
