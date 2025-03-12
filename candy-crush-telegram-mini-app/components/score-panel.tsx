"use client"

import { motion } from "framer-motion"

interface ScorePanelProps {
  score: number
  timeLeft: number
  highScore: number
}

export default function ScorePanel({ score, timeLeft, highScore }: ScorePanelProps) {
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <div className="mb-4 grid w-full max-w-md grid-cols-3 gap-2 rounded-lg bg-white/20 p-4 backdrop-blur-sm">
      <div className="text-center">
        <h2 className="text-sm font-semibold text-white">Score</h2>
        <motion.p
          key={score}
          className="text-2xl font-bold text-white"
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {score}
        </motion.p>
      </div>

      <div className="text-center">
        <h2 className="text-sm font-semibold text-white">Time Left</h2>
        <motion.p
          key={timeLeft}
          className={`text-2xl font-bold ${timeLeft <= 10 ? "text-red-300" : "text-white"}`}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {formatTime(timeLeft)}
        </motion.p>
      </div>

      <div className="text-center">
        <h2 className="text-sm font-semibold text-white">High Score</h2>
        <motion.p
          key={highScore}
          className="text-2xl font-bold text-yellow-300"
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {highScore}
        </motion.p>
      </div>
    </div>
  )
}

