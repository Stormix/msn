import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './components/pages/home'
import NotFound from './components/pages/not-found'
import Welcome from './components/pages/welcome'
import Layout from './components/template/layout'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="welcome" element={<Welcome />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
