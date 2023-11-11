import { ModeToggle } from './mode-toggle'

const Header = () => {
  return (
    <header className="flex justify-between py-4">
      <h1 className="text-2xl font-bold">Chitchatly</h1>
      <ModeToggle />
    </header>
  )
}

export default Header
