"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface GameInstructionsProps {
  onStart: () => void
}

export default function GameInstructions({ onStart }: GameInstructionsProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="mx-4 max-w-md rounded-lg bg-white/10 p-6 text-center backdrop-blur-md">
        <h2 className="mb-4 text-2xl font-bold text-white">How to Play</h2>
        <ul className="mb-6 space-y-2 text-left text-white">
          <li>• Swap adjacent candies to match 3 or more in a row</li>
          <li>• You have 2 minutes to get the highest score</li>
          <li>• Each match gives you points</li>
          <li>• Try to beat your high score!</li>
        </ul>
        <Button
          onClick={onStart}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600"
        >
          Start Game
        </Button>
      </div>
    </motion.div>
  )
}

