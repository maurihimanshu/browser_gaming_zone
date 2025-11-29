import { useState, useEffect, useCallback } from 'react'
import HangmanSettings from './HangmanSettings'

interface WordCategory {
  name: string
  words: string[]
}

const WORD_CATEGORIES: WordCategory[] = [
  {
    name: 'Animals',
    words: ['ELEPHANT', 'GIRAFFE', 'KANGAROO', 'PENGUIN', 'DOLPHIN', 'BUTTERFLY', 'RHINOCEROS', 'HIPPOPOTAMUS'],
  },
  {
    name: 'Countries',
    words: ['JAPAN', 'CANADA', 'BRAZIL', 'AUSTRALIA', 'GERMANY', 'FRANCE', 'ITALY', 'SPAIN'],
  },
  {
    name: 'Food',
    words: ['PIZZA', 'SPAGHETTI', 'CHOCOLATE', 'SANDWICH', 'HAMBURGER', 'SUSHI', 'PASTA', 'BURRITO'],
  },
  {
    name: 'Sports',
    words: ['BASKETBALL', 'FOOTBALL', 'TENNIS', 'SWIMMING', 'BASEBALL', 'VOLLEYBALL', 'SOCCER', 'HOCKEY'],
  },
  {
    name: 'Technology',
    words: ['COMPUTER', 'KEYBOARD', 'MOUSE', 'MONITOR', 'LAPTOP', 'TABLET', 'SMARTPHONE', 'INTERNET'],
  },
  {
    name: 'Nature',
    words: ['MOUNTAIN', 'OCEAN', 'FOREST', 'RIVER', 'SUNSET', 'RAINBOW', 'THUNDER', 'VOLCANO'],
  },
]

interface HangmanGameConfig {
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  maxWrongGuesses: number
}

const DEFAULT_CONFIG: HangmanGameConfig = {
  category: 'Animals',
  difficulty: 'medium',
  maxWrongGuesses: 6,
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function HangmanGame() {
  const [config, setConfig] = useState<HangmanGameConfig>(DEFAULT_CONFIG)
  const [showSettings, setShowSettings] = useState(false)
  const [word, setWord] = useState<string>('')
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set())
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  const getWordsByDifficulty = useCallback((category: string, difficulty: string): string[] => {
    const categoryData = WORD_CATEGORIES.find((c) => c.name === category)
    if (!categoryData) return []

    const words = categoryData.words
    if (difficulty === 'easy') {
      return words.filter((w) => w.length <= 5)
    } else if (difficulty === 'medium') {
      return words.filter((w) => w.length > 5 && w.length <= 7)
    } else {
      return words.filter((w) => w.length > 7)
    }
  }, [])

  const getRandomWord = useCallback((): string => {
    const words = getWordsByDifficulty(config.category, config.difficulty)
    if (words.length === 0) {
      // Fallback to all words if filtered list is empty
      const categoryData = WORD_CATEGORIES.find((c) => c.name === config.category)
      return categoryData?.words[Math.floor(Math.random() * categoryData.words.length)] || 'HELLO'
    }
    return words[Math.floor(Math.random() * words.length)]
  }, [config.category, config.difficulty, getWordsByDifficulty])

  const initializeGame = useCallback(() => {
    const newWord = getRandomWord()
    setWord(newWord)
    setGuessedLetters(new Set())
    setWrongGuesses(0)
    setGameWon(false)
    setGameOver(false)
  }, [getRandomWord])

  useEffect(() => {
    initializeGame()
  }, [initializeGame, config.category, config.difficulty])

  const handleLetterClick = useCallback(
    (letter: string) => {
      if (gameOver || gameWon || guessedLetters.has(letter)) return

      const newGuessed = new Set(guessedLetters)
      newGuessed.add(letter)
      setGuessedLetters(newGuessed)

      if (!word.includes(letter)) {
        const newWrong = wrongGuesses + 1
        setWrongGuesses(newWrong)

        if (newWrong >= config.maxWrongGuesses) {
          setGameOver(true)
        }
      } else {
        // Check if won
        const allLettersGuessed = word.split('').every((char) => newGuessed.has(char))
        if (allLettersGuessed) {
          setGameWon(true)
        }
      }
    },
    [word, guessedLetters, wrongGuesses, gameOver, gameWon, config.maxWrongGuesses]
  )

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const letter = e.key.toUpperCase()
      if (ALPHABET.includes(letter)) {
        handleLetterClick(letter)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleLetterClick])

  const getDisplayWord = (): string => {
    return word
      .split('')
      .map((letter) => (guessedLetters.has(letter) ? letter : '_'))
      .join(' ')
  }

  const getHangmanDrawing = (): string => {
    const stages = [
      '', // 0 wrong
      '  |\n  |\n  |\n  |\n  |\n__|__', // 1 wrong
      '  +---+\n  |   |\n  |\n  |\n  |\n  |\n__|__', // 2 wrong
      '  +---+\n  |   |\n  |   O\n  |\n  |\n  |\n__|__', // 3 wrong
      '  +---+\n  |   |\n  |   O\n  |   |\n  |\n  |\n__|__', // 4 wrong
      '  +---+\n  |   |\n  |   O\n  |  /|\n  |\n  |\n__|__', // 5 wrong
      '  +---+\n  |   |\n  |   O\n  |  /|\\\n  |  /\n  |\n__|__', // 6 wrong
      '  +---+\n  |   |\n  |   O\n  |  /|\\\n  |  / \\\n  |\n__|__', // 7 wrong
    ]
    return stages[Math.min(wrongGuesses, stages.length - 1)]
  }

  const handleConfigChange = (newConfig: HangmanGameConfig) => {
    setConfig(newConfig)
    initializeGame()
  }

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
            <HangmanSettings config={config} onConfigChange={handleConfigChange} />
          </div>
        )}
      </div>

      {/* Game Info */}
      <div className="mb-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="text-white">
            <div className="text-lg font-semibold">
              Wrong Guesses: {wrongGuesses}/{config.maxWrongGuesses}
            </div>
            {gameWon && <div className="text-green-400 font-semibold text-xl mt-2">🎉 You Won!</div>}
            {gameOver && (
              <div className="text-red-400 font-semibold text-xl mt-2">
                Game Over! The word was: <span className="text-yellow-400">{word}</span>
              </div>
            )}
          </div>
          <button onClick={initializeGame} className="btn-primary">
            New Word
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex flex-col md:flex-row gap-8 items-start w-full max-w-4xl">
        {/* Hangman Drawing */}
        <div className="bg-white/10 rounded-lg p-6 border border-white/20">
          <pre className="text-white font-mono text-sm whitespace-pre">
            {getHangmanDrawing()}
          </pre>
        </div>

        {/* Word Display and Keyboard */}
        <div className="flex-1">
          {/* Word Display */}
          <div className="bg-white/10 rounded-lg p-6 border border-white/20 mb-6 text-center">
            <div className="text-4xl md:text-5xl font-bold text-white font-mono tracking-wider mb-4">
              {getDisplayWord()}
            </div>
            <div className="text-white/60 text-sm">
              Category: {config.category} | Difficulty: {config.difficulty}
            </div>
          </div>

          {/* Keyboard */}
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="grid grid-cols-7 md:grid-cols-9 gap-2">
              {ALPHABET.map((letter) => {
                const isGuessed = guessedLetters.has(letter)
                const isWrong = isGuessed && !word.includes(letter)
                const isCorrect = isGuessed && word.includes(letter)

                return (
                  <button
                    key={letter}
                    onClick={() => handleLetterClick(letter)}
                    disabled={isGuessed || gameOver || gameWon}
                    className={`
                      w-10 h-10 md:w-12 md:h-12 rounded font-bold text-lg transition-all
                      ${isCorrect
                        ? 'bg-green-500 text-white'
                        : isWrong
                        ? 'bg-red-500 text-white'
                        : isGuessed
                        ? 'bg-gray-500 text-white'
                        : 'bg-white/20 hover:bg-white/30 text-white'
                      }
                      disabled:cursor-not-allowed disabled:opacity-50
                    `}
                  >
                    {letter}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-white/60 text-sm text-center max-w-2xl">
        <p>Click letters or type on keyboard to guess. Guess the word before running out of attempts!</p>
      </div>
    </div>
  )
}

