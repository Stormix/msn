import { Toaster } from '@/components/ui/toaster'
import { ReactNode } from 'react'
import { OmegleProvider } from './omegle-provider'
import { ThemeProvider } from './theme-provider'

const Providers: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <OmegleProvider>
        {children}
        <Toaster />
      </OmegleProvider>
    </ThemeProvider>
  )
}

export default Providers
