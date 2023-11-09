import Providers from '@/providers'
import { FC, ReactNode } from 'react'
import Footer from '../molecules/footer'
import Header from '../molecules/header'

const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Providers>
      <div className="flex w-screen h-screen flex-col p-8">
        <Header />
        <main className="flex-grow w-full h-full">{children}</main>
        <Footer />
      </div>
    </Providers>
  )
}

export default Layout
