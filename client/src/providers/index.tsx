import { Toaster } from '@/components/ui/toaster'
import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ThemeProvider } from './theme-provider'
import { WebRTCProvider } from './webrtc-provider'

const queryClient = new QueryClient()

const Providers: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <WebRTCProvider>
          {children}
          <Toaster />
        </WebRTCProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default Providers
