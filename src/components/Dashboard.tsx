import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllGames } from '@/utils/gameRegistry'
import GameCard from './GameCard'

export default function Dashboard() {
  const navigate = useNavigate()
  const allGames = getAllGames()
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = useMemo(() => {
    const cats = new Set(allGames.map((game) => game.metadata.category))
    return ['All', ...Array.from(cats)]
  }, [allGames])

  const filteredGames = useMemo(() => {
    return allGames.filter((game) => {
      const matchesCategory =
        selectedCategory === 'All' || game.metadata.category === selectedCategory
      const matchesSearch =
        game.metadata.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.metadata.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [allGames, selectedCategory, searchQuery])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          Welcome to <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Gamer</span>
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Play amazing browser-based games. No downloads, no sign-ups, just pure fun!
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Games Grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <GameCard
              key={game.metadata.id}
              game={game}
              onClick={() => navigate(`/game/${game.metadata.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-white/60 text-lg">No games found matching your criteria.</p>
        </div>
      )}

      {/* Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="text-3xl font-bold text-white mb-2">{allGames.length}</div>
          <div className="text-white/60">Total Games</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="text-3xl font-bold text-white mb-2">{categories.length - 1}</div>
          <div className="text-white/60">Categories</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="text-3xl font-bold text-white mb-2">100%</div>
          <div className="text-white/60">Free to Play</div>
        </div>
      </div>
    </div>
  )
}

