import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import GameView from './components/GameView'
import Layout from './components/Layout'

function App() {
  return (
    <BrowserRouter>
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

