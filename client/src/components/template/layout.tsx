import Providers from '@/providers'
import { Outlet } from 'react-router-dom'
import Footer from '../molecules/footer'
import Header from '../molecules/header'

const Layout = () => {
  return (
    <Providers>
      <div className="flex w-screen h-screen flex-col px-8">
        <Header />
        <main className="flex-grow w-full h-full overflow-y-auto md:overflow-hidden">
          <Outlet />
        </main>
        <Footer />
      </div>
    </Providers>
  )
}

export default Layout
