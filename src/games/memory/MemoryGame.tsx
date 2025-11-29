import { useState, useEffect, useCallback, useRef } from 'react'
import MemorySettings from './MemorySettings'

interface Card {
  id: number
  value: number
  flipped: boolean
  matched: boolean
}

interface MemoryGameConfig {
  gridSize: number
}

const DEFAULT_CONFIG: MemoryGameConfig = {
  gridSize: 8,
}

// Unique emojis for memory game
const EMOJIS = [
  '🎮', '🎯', '🎲', '🎨', '🎪', '🎭', '🎸', '🎺',
  '🎤', '🎧', '🎬', '🎨', '🎪', '🎭', '🎹', '🥁',
  '🎻', '🎵', '🎶', '🎼', '🎧', '🎤', '🎯', '🎲',
  '🎮', '🎰', '🎳', '🎯', '🎲', '🎨', '🎪', '🎭'
]

// Fisher-Yates shuffle algorithm for truly random shuffling
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function MemoryGame() {
  const [config, setConfig] = useState<MemoryGameConfig>(DEFAULT_CONFIG)
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const lastClickedRef = useRef<number | null>(null)
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const getGridCols = (pairs: number): number => {
    if (pairs <= 4) return 2
    if (pairs <= 6) return 3
    if (pairs <= 8) return 4
    if (pairs <= 12) return 4
    if (pairs <= 16) return 4
    return 6
  }

  const initializeCards = useCallback((pairs: number) => {
    // Create pairs of emoji indices (0, 0, 1, 1, 2, 2, ...)
    const cardValues: number[] = []
    for (let i = 0; i < pairs; i++) {
      cardValues.push(i, i) // Add each pair twice
    }
    const shuffled = shuffleArray(cardValues)
    
    const newCards: Card[] = shuffled.map((emojiIndex, cardIndex) => ({
      id: cardIndex,
      value: emojiIndex, // Store emoji index for matching
      flipped: false,
      matched: false,
    }))
    
    setCards(newCards)
    setFlippedCards([])
    setMoves(0)
    setMatches(0)
    setGameWon(false)
    setIsProcessing(false)
    lastClickedRef.current = null
    
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    initializeCards(config.gridSize)
  }, [config.gridSize, initializeCards])

  const handleCardClick = useCallback((cardId: number) => {
    if (isProcessing || gameWon) return
    
    const card = cards[cardId]
    if (!card || card.flipped || card.matched || flippedCards.length >= 2) return
    
    // Prevent clicking the same card twice quickly
    if (lastClickedRef.current === cardId) return
    lastClickedRef.current = cardId
    
    // Clear any existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }
    
    // Reset last clicked after a short delay
    clickTimeoutRef.current = setTimeout(() => {
      lastClickedRef.current = null
    }, 300)

    setCards((prevCards) => {
      const newCards = [...prevCards]
      newCards[cardId] = { ...card, flipped: true }
      return newCards
    })

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    if (newFlippedCards.length === 2) {
      setIsProcessing(true)
      setMoves((prev) => prev + 1)

      setTimeout(() => {
        setCards((prevCards) => {
          const [firstId, secondId] = newFlippedCards
          const firstCard = prevCards[firstId]
          const secondCard = prevCards[secondId]

          const newCards = [...prevCards]

          // Compare emoji indices directly
          if (firstCard.value === secondCard.value) {
            // Match found
            newCards[firstId] = { ...firstCard, matched: true, flipped: true }
            newCards[secondId] = { ...secondCard, matched: true, flipped: true }
            setMatches((prev) => {
              const newMatches = prev + 1
              if (newMatches === config.gridSize) {
                setGameWon(true)
              }
              return newMatches
            })
          } else {
            // No match - flip back
            newCards[firstId] = { ...firstCard, flipped: false }
            newCards[secondId] = { ...secondCard, flipped: false }
          }

          return newCards
        })
        setFlippedCards([])
        setIsProcessing(false)
      }, 1000)
    }
  }, [cards, flippedCards, isProcessing, gameWon, config.gridSize])

  const getCardEmoji = (card: Card) => {
    // card.value is the emoji index
    return EMOJIS[card.value] || '❓'
  }

  const handleConfigChange = (newConfig: MemoryGameConfig) => {
    setConfig(newConfig)
    initializeCards(newConfig.gridSize)
  }

  const gridCols = getGridCols(config.gridSize)

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center w-full">
      {/* Settings Panel */}
      <div className="w-full max-w-2xl mb-6">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="btn-secondary mb-4 flex items-center gap-2"
        >
          <span>⚙️</span>
          <span>{showSettings ? 'Hide' : 'Show'} Settings</span>
        </button>

        {showSettings && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Game Settings</h3>
            <MemorySettings config={config} onConfigChange={handleConfigChange} />
          </div>
        )}
      </div>

      {/* Game Stats */}
      <div className="mb-6 w-full max-w-2xl">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-white">{moves}</div>
            <div className="text-white/60 text-sm">Moves</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-white">{matches}/{config.gridSize}</div>
            <div className="text-white/60 text-sm">Matches</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 text-center">
            <button onClick={() => initializeCards(config.gridSize)} className="btn-primary w-full text-sm">
              Reset
            </button>
          </div>
        </div>

        {gameWon && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4 text-center">
            <div className="text-2xl font-bold text-green-300 mb-2">🎉 You Won!</div>
            <div className="text-green-200">You completed the game in {moves} moves!</div>
          </div>
        )}
      </div>

      {/* Game Board */}
      <div className={`grid gap-3 max-w-2xl`} style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
        {cards.map((card) => (
          <button
            key={`card-${card.id}-${card.matched}`}
            onClick={() => handleCardClick(card.id)}
            disabled={isProcessing || card.matched}
            className={`
              aspect-square rounded-lg text-3xl md:text-4xl font-bold transition-all duration-300
              ${card.matched
                ? 'bg-green-500/30 border-2 border-green-500 cursor-default scale-105'
                : card.flipped
                ? 'bg-purple-500 border-2 border-purple-400 scale-105'
                : 'bg-white/20 hover:bg-white/30 border-2 border-white/30 hover:border-white/50 hover:scale-105'
              }
              ${isProcessing && !card.matched ? 'cursor-wait' : ''}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {card.flipped || card.matched ? getCardEmoji(card) : '?'}
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-6 text-white/60 text-sm text-center max-w-md">
        <p>Click cards to flip them. Match pairs to win!</p>
      </div>
    </div>
  )
}
