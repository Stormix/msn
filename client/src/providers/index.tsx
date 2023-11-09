import { Toaster } from '@/components/ui/toaster'
import { ReactNode } from 'react'
import { ThemeProvider } from './theme-provider'

const Providers: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {children}
      <Toaster />
    </ThemeProvider>
  )
}

export default Providers
