import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import GameView from './components/GameView'
import Layout from './components/Layout'

function App() {
  // Use base path for GitHub Pages, empty for local development
  const basename = import.meta.env.PROD ? '/browser_gaming_zone' : ''
  
  return (
    <BrowserRouter basename={basename}>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/game/:gameId" element={<GameView />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App

