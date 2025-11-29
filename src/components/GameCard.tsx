import { GameModule } from '@/types/game'

interface GameCardProps {
  game: GameModule
  onClick: () => void
}

export default function GameCard({ game, onClick }: GameCardProps) {
  const { metadata } = game

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'Hard':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  return (
    <div
      onClick={onClick}
      className="game-card group"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
          {metadata.name}
        </h3>
        <span
          className={`px-2 py-1 rounded text-xs font-semibold border ${getDifficultyColor(
            metadata.difficulty
          )}`}
        >
          {metadata.difficulty}
        </span>
      </div>
      <p className="text-white/70 mb-4 line-clamp-2">{metadata.description}</p>
      <div className="flex items-center justify-between text-sm text-white/60">
        <div className="flex items-center gap-4">
          <span>👥 {metadata.players}</span>
          <span>⏱️ {metadata.estimatedTime}</span>
        </div>
        <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
          {metadata.category}
        </span>
      </div>
      <div className="mt-4 pt-4 border-t border-white/10">
        <button className="btn-primary w-full">Play Now →</button>
      </div>
    </div>
  )
}

