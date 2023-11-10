import Providers from '@/providers'
import { FC, ReactNode } from 'react'

const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Providers>
      <div className="flex w-screen h-screen flex-col p-8 gap-16">
        {/* <Header /> */}
        <main className="flex-grow w-full h-full max-h-full overflow-hidden">{children}</main>
        {/* <Footer /> */}
      </div>
    </Providers>
  )
}

export default Layout
