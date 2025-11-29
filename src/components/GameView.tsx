import { useParams, useNavigate } from 'react-router-dom'
import { getGameById } from '@/utils/gameRegistry'

export default function GameView() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()

  if (!gameId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-white text-xl">Game not found</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">
          Back to Dashboard
        </button>
      </div>
    )
  }

  const game = getGameById(gameId)

  if (!game) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-white text-xl">Game not found</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">
          Back to Dashboard
        </button>
      </div>
    )
  }

  const GameComponent = game.component

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/')}
            className="btn-secondary mb-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">{game.metadata.name}</h1>
          <p className="text-white/70 mt-1">{game.metadata.description}</p>
        </div>
      </div>
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
        <GameComponent />
      </div>
    </div>
  )
}

