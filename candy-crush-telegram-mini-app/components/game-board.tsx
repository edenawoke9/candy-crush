"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

// Candy types
const CANDY_TYPES = ["🍎", "🍊", "🍇", "🍬", "🍫", "🍭"]

interface GameBoardProps {
  onScoreUpdate: (points: number) => void
  onGameStart: () => void
  gameOver: boolean
  isPlaying: boolean
}

export default function GameBoard({ onScoreUpdate, onGameStart, gameOver, isPlaying }: GameBoardProps) {
  const BOARD_SIZE = 8
  const [board, setBoard] = useState<string[][]>([])
  const [selectedCandy, setSelectedCandy] = useState<{ row: number; col: number } | null>(null)
  const [isSwapping, setIsSwapping] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  // Initialize the board
  useEffect(() => {
    initializeBoard()
  }, [])

  const initializeBoard = () => {
    const newBoard = Array(BOARD_SIZE)
      .fill(0)
      .map(() =>
        Array(BOARD_SIZE)
          .fill(0)
          .map(() => getRandomCandy()),
      )
    setBoard(newBoard)

    // Check for initial matches and replace them
    setTimeout(() => {
      const boardWithoutMatches = removeInitialMatches(newBoard)
      setBoard(boardWithoutMatches)
    }, 500)
  }

  const removeInitialMatches = (currentBoard: string[][]) => {
    const boardCopy = [...currentBoard.map((row) => [...row])]
    let hasMatches = true

    while (hasMatches) {
      hasMatches = false

      // Check for horizontal matches
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE - 2; col++) {
          if (boardCopy[row][col] === boardCopy[row][col + 1] && boardCopy[row][col] === boardCopy[row][col + 2]) {
            boardCopy[row][col] = getRandomCandy(boardCopy[row][col])
            hasMatches = true
          }
        }
      }

      // Check for vertical matches
      for (let row = 0; row < BOARD_SIZE - 2; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (boardCopy[row][col] === boardCopy[row + 1][col] && boardCopy[row][col] === boardCopy[row + 2][col]) {
            boardCopy[row][col] = getRandomCandy(boardCopy[row][col])
            hasMatches = true
          }
        }
      }
    }

    return boardCopy
  }

  const getRandomCandy = (exclude?: string) => {
    let candy
    do {
      candy = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)]
    } while (candy === exclude)
    return candy
  }

  const handleCandyClick = (row: number, col: number) => {
    if (gameOver || isSwapping || isChecking || !isPlaying) return

    // Remove the game start logic since we're now starting from the instructions screen
    // if (!isPlaying) {
    //   onGameStart();
    // }

    if (selectedCandy === null) {
      setSelectedCandy({ row, col })
    } else {
      // Check if the clicked candy is adjacent to the selected one
      const isAdjacent =
        (Math.abs(selectedCandy.row - row) === 1 && selectedCandy.col === col) ||
        (Math.abs(selectedCandy.col - col) === 1 && selectedCandy.row === row)

      if (isAdjacent) {
        swapCandies(selectedCandy.row, selectedCandy.col, row, col)
      }

      setSelectedCandy(null)
    }
  }

  const swapCandies = async (row1: number, col1: number, row2: number, col2: number) => {
    setIsSwapping(true)

    // Create a new board with swapped candies
    const newBoard = [...board.map((row) => [...row])]
    const temp = newBoard[row1][col1]
    newBoard[row1][col1] = newBoard[row2][col2]
    newBoard[row2][col2] = temp

    setBoard(newBoard)

    // Wait for animation
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Check if the swap created a match
    const matchFound = checkForMatches(newBoard)

    if (!matchFound) {
      // Swap back if no match
      const revertedBoard = [...newBoard.map((row) => [...row])]
      revertedBoard[row1][col1] = newBoard[row2][col2]
      revertedBoard[row2][col2] = newBoard[row1][col1]
      setBoard(revertedBoard)

      // Wait for animation
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    setIsSwapping(false)
  }

  const checkForMatches = (currentBoard: string[][]) => {
    setIsChecking(true)
    let matchFound = false
    const boardCopy = [...currentBoard.map((row) => [...row])]
    const matchedCandies: { row: number; col: number }[] = []

    // Check horizontal matches
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE - 2; col++) {
        if (
          boardCopy[row][col] !== "" &&
          boardCopy[row][col] === boardCopy[row][col + 1] &&
          boardCopy[row][col] === boardCopy[row][col + 2]
        ) {
          matchFound = true
          matchedCandies.push({ row, col }, { row, col: col + 1 }, { row, col: col + 2 })
        }
      }
    }

    // Check vertical matches
    for (let row = 0; row < BOARD_SIZE - 2; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (
          boardCopy[row][col] !== "" &&
          boardCopy[row][col] === boardCopy[row + 1][col] &&
          boardCopy[row][col] === boardCopy[row + 2][col]
        ) {
          matchFound = true
          matchedCandies.push({ row, col }, { row: row + 1, col }, { row: row + 2, col })
        }
      }
    }

    // Remove duplicates from matchedCandies
    const uniqueMatches = matchedCandies.filter(
      (match, index, self) => index === self.findIndex((m) => m.row === match.row && m.col === match.col),
    )

    if (matchFound) {
      // Update score
      onScoreUpdate(uniqueMatches.length * 10)

      // Clear matched candies
      setTimeout(() => {
        const newBoard = [...boardCopy]
        uniqueMatches.forEach(({ row, col }) => {
          newBoard[row][col] = ""
        })
        setBoard(newBoard)

        // Drop candies down
        setTimeout(() => {
          dropCandies(newBoard)
        }, 300)
      }, 300)
    }

    setIsChecking(false)
    return matchFound
  }

  const dropCandies = (currentBoard: string[][]) => {
    const newBoard = [...currentBoard.map((row) => [...row])]

    // Drop existing candies down
    for (let col = 0; col < BOARD_SIZE; col++) {
      let emptySpaces = 0

      for (let row = BOARD_SIZE - 1; row >= 0; row--) {
        if (newBoard[row][col] === "") {
          emptySpaces++
        } else if (emptySpaces > 0) {
          newBoard[row + emptySpaces][col] = newBoard[row][col]
          newBoard[row][col] = ""
        }
      }
    }

    // Fill empty spaces at the top with new candies
    for (let col = 0; col < BOARD_SIZE; col++) {
      for (let row = 0; row < BOARD_SIZE; row++) {
        if (newBoard[row][col] === "") {
          newBoard[row][col] = getRandomCandy()
        }
      }
    }

    setBoard(newBoard)

    // Check for new matches after dropping
    setTimeout(() => {
      const hasMatches = checkForMatches(newBoard)
      if (!hasMatches) {
        // Check if there are any possible moves left
        const hasMoves = checkForPossibleMoves(newBoard)
        if (!hasMoves && !gameOver) {
          // Shuffle the board if no moves are available
          shuffleBoard()
        }
      }
    }, 500)
  }

  const checkForPossibleMoves = (currentBoard: string[][]) => {
    // Check horizontal swaps
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE - 1; col++) {
        // Swap
        const tempBoard = [...currentBoard.map((r) => [...r])]
        const temp = tempBoard[row][col]
        tempBoard[row][col] = tempBoard[row][col + 1]
        tempBoard[row][col + 1] = temp

        // Check for matches
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE - 2; c++) {
            if (tempBoard[r][c] === tempBoard[r][c + 1] && tempBoard[r][c] === tempBoard[r][c + 2]) {
              return true
            }
          }
        }

        for (let r = 0; r < BOARD_SIZE - 2; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            if (tempBoard[r][c] === tempBoard[r + 1][c] && tempBoard[r][c] === tempBoard[r + 2][c]) {
              return true
            }
          }
        }
      }
    }

    // Check vertical swaps
    for (let row = 0; row < BOARD_SIZE - 1; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        // Swap
        const tempBoard = [...currentBoard.map((r) => [...r])]
        const temp = tempBoard[row][col]
        tempBoard[row][col] = tempBoard[row + 1][col]
        tempBoard[row + 1][col] = temp

        // Check for matches
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE - 2; c++) {
            if (tempBoard[r][c] === tempBoard[r][c + 1] && tempBoard[r][c] === tempBoard[r][c + 2]) {
              return true
            }
          }
        }

        for (let r = 0; r < BOARD_SIZE - 2; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            if (tempBoard[r][c] === tempBoard[r + 1][c] && tempBoard[r][c] === tempBoard[r + 2][c]) {
              return true
            }
          }
        }
      }
    }

    return false
  }

  const shuffleBoard = () => {
    const newBoard = Array(BOARD_SIZE)
      .fill(0)
      .map(() =>
        Array(BOARD_SIZE)
          .fill(0)
          .map(() => getRandomCandy()),
      )
    setBoard(newBoard)

    // Check for initial matches and replace them
    setTimeout(() => {
      const boardWithoutMatches = removeInitialMatches(newBoard)
      setBoard(boardWithoutMatches)
    }, 500)
  }

  return (
    <div className="grid grid-cols-8 gap-1 rounded-lg bg-white/10 p-2">
      {board.map((row, rowIndex) =>
        row.map((candy, colIndex) => (
          <motion.button
            key={`${rowIndex}-${colIndex}`}
            className={`flex h-10 w-10 items-center justify-center rounded-md text-2xl 
              ${
                selectedCandy?.row === rowIndex && selectedCandy?.col === colIndex
                  ? "bg-yellow-300/50 ring-2 ring-yellow-500"
                  : "bg-white/30 hover:bg-white/40"
              } transition-all duration-200`}
            onClick={() => handleCandyClick(rowIndex, colIndex)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              scale: [1, 1.1, 1],
              transition: { duration: 0.3 },
            }}
            disabled={gameOver}
          >
            {candy}
          </motion.button>
        )),
      )}
    </div>
  )
}

