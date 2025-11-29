import { useState, useEffect, useCallback, useRef } from 'react'

type Grid = number[][]
const GRID_SIZE = 4

export default function Game2048() {
  const [grid, setGrid] = useState<Grid>([])
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const wonRef = useRef(false)

  const initializeGrid = useCallback(() => {
    const newGrid: Grid = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(0))
    
    addRandomTile(newGrid)
    addRandomTile(newGrid)
    return newGrid
  }, [])

  const addRandomTile = (grid: Grid) => {
    const emptyCells: [number, number][] = []
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j] === 0) {
          emptyCells.push([i, j])
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      grid[row][col] = Math.random() < 0.9 ? 2 : 4
    }
  }

  useEffect(() => {
    const newGrid = initializeGrid()
    setGrid(newGrid)
    setScore(0)
    setGameOver(false)
    setWon(false)
    wonRef.current = false
  }, [initializeGrid])

  const moveLeft = (grid: Grid): { newGrid: Grid; moved: boolean; scoreIncrease: number } => {
    const newGrid = grid.map((row) => [...row])
    let moved = false
    let scoreIncrease = 0

    for (let i = 0; i < GRID_SIZE; i++) {
      const row = newGrid[i].filter((cell) => cell !== 0)
      const newRow: number[] = []
      
      for (let j = 0; j < row.length; j++) {
        if (j < row.length - 1 && row[j] === row[j + 1]) {
          const mergedValue = row[j] * 2
          newRow.push(mergedValue)
          scoreIncrease += mergedValue
          
          // Check for 2048 achievement
          if (mergedValue === 2048 && !wonRef.current) {
            wonRef.current = true
            setWon(true)
          }
          j++
        } else {
          newRow.push(row[j])
        }
      }
      
      while (newRow.length < GRID_SIZE) {
        newRow.push(0)
      }
      
      // Check if row changed
      if (JSON.stringify(newRow) !== JSON.stringify(newGrid[i])) {
        moved = true
      }
      
      newGrid[i] = newRow
    }

    return { newGrid, moved, scoreIncrease }
  }

  const rotateGrid = (grid: Grid): Grid => {
    const rotated: Grid = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(0))
    
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        rotated[j][GRID_SIZE - 1 - i] = grid[i][j]
      }
    }
    
    return rotated
  }

  const canMove = useCallback((gridState: Grid): boolean => {
    // Check for empty cells
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (gridState[i][j] === 0) return true
      }
    }

    // Check for possible merges
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const current = gridState[i][j]
        if (current === 0) continue
        
        // Check right neighbor
        if (j < GRID_SIZE - 1 && gridState[i][j + 1] === current) {
          return true
        }
        // Check bottom neighbor
        if (i < GRID_SIZE - 1 && gridState[i + 1][j] === current) {
          return true
        }
      }
    }

    return false
  }, [])

  const move = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver) return

    setGrid((prevGrid) => {
      let currentGrid = prevGrid.map((row) => [...row])
      
      // Rotate grid to use left move logic for all directions
      let rotations = 0
      if (direction === 'right') {
        currentGrid = rotateGrid(rotateGrid(currentGrid))
        rotations = 2
      } else if (direction === 'up') {
        currentGrid = rotateGrid(rotateGrid(rotateGrid(currentGrid)))
        rotations = 3
      } else if (direction === 'down') {
        currentGrid = rotateGrid(currentGrid)
        rotations = 1
      }

      const { newGrid, moved, scoreIncrease } = moveLeft(currentGrid)

      // Rotate back
      let finalGrid = newGrid
      for (let i = 0; i < (4 - rotations) % 4; i++) {
        finalGrid = rotateGrid(finalGrid)
      }

      if (moved) {
        addRandomTile(finalGrid)
        setScore((prev) => prev + scoreIncrease)
        
        // Check if game is over
        if (!canMove(finalGrid)) {
          setGameOver(true)
        }
        
        return finalGrid
      }
      
      return prevGrid
    })
  }, [gameOver, canMove])

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault()
    }

    switch (e.key) {
      case 'ArrowLeft':
        move('left')
        break
      case 'ArrowRight':
        move('right')
        break
      case 'ArrowUp':
        move('up')
        break
      case 'ArrowDown':
        move('down')
        break
    }
  }, [move])

  // Touch/Swipe handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    const minSwipeDistance = 30

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          move('right')
        } else {
          move('left')
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
          move('down')
        } else {
          move('up')
        }
      }
    }

    touchStartRef.current = null
  }, [move])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  const resetGame = () => {
    const newGrid = initializeGrid()
    setGrid(newGrid)
    setScore(0)
    setGameOver(false)
    setWon(false)
    wonRef.current = false
  }

  const getTileColor = (value: number): string => {
    const colors: Record<number, string> = {
      2: 'bg-gray-200 text-gray-800',
      4: 'bg-gray-300 text-gray-800',
      8: 'bg-yellow-200 text-yellow-900',
      16: 'bg-yellow-300 text-yellow-900',
      32: 'bg-orange-200 text-orange-900',
      64: 'bg-orange-300 text-orange-900',
      128: 'bg-red-200 text-red-900',
      256: 'bg-red-300 text-red-900',
      512: 'bg-pink-200 text-pink-900',
      1024: 'bg-pink-300 text-pink-900',
      2048: 'bg-purple-300 text-purple-900 font-extrabold',
    }
    return colors[value] || 'bg-purple-400 text-white'
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="mb-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="text-white">
            <div className="text-2xl font-bold">Score: {score}</div>
            {won && <div className="text-yellow-400 font-semibold">🎉 You reached 2048!</div>}
            {gameOver && <div className="text-red-400 font-semibold">Game Over!</div>}
          </div>
          <button onClick={resetGame} className="btn-primary">
            Reset
          </button>
        </div>
      </div>

      <div
        ref={gameAreaRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 touch-none select-none"
      >
        <div className="grid grid-cols-4 gap-2">
          {grid.map((row, i) =>
            row.map((cell, j) => (
              <div
                key={`${i}-${j}-${cell}`}
                className={`
                  aspect-square rounded-lg flex items-center justify-center font-bold text-2xl
                  ${cell === 0 ? 'bg-white/10' : getTileColor(cell)}
                  transition-all duration-200
                `}
              >
                {cell !== 0 && cell}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 text-white/60 text-sm text-center max-w-md">
        <p>Use arrow keys or swipe to move tiles. Combine tiles with the same number!</p>
      </div>
    </div>
  )
}
