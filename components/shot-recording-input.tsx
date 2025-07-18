"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Target, Users } from "lucide-react"

const SHOT_TYPES = ["Drive", "Approach", "Chip", "Putt", "Sand", "Recovery"]

interface ShotRecordingInputProps {
  players: string[]
  onRecordShot: (shotData: {
    player: string
    shotType: string
    startDistance: number
    endDistance: number
    made: boolean
    isNut: boolean
    isClutch: boolean
    isGimme: boolean
  }) => void
  defaultShotType?: string
  defaultStartDistance?: number
  disabled?: boolean
}

export function ShotRecordingInput({
  players,
  onRecordShot,
  defaultShotType = "Drive",
  defaultStartDistance = 150,
  disabled = false,
}: ShotRecordingInputProps) {
  const [selectedPlayer, setSelectedPlayer] = useState("")
  const [shotType, setShotType] = useState(defaultShotType)
  const [startDistance, setStartDistance] = useState(defaultStartDistance)
  const [endDistance, setEndDistance] = useState([75])
  const [made, setMade] = useState(false)
  const [isNut, setIsNut] = useState(false)
  const [isClutch, setIsClutch] = useState(false)
  const [isGimme, setIsGimme] = useState(false)

  // Update defaults when they change
  useEffect(() => {
    setShotType(defaultShotType)
    setStartDistance(defaultStartDistance)
    setEndDistance([Math.floor(defaultStartDistance / 2)])
  }, [defaultShotType, defaultStartDistance])

  const handleRecordShot = () => {
    if (!selectedPlayer) return

    onRecordShot({
      player: selectedPlayer,
      shotType,
      startDistance,
      endDistance: endDistance[0],
      made,
      isNut,
      isClutch,
      isGimme,
    })

    // Reset form
    setSelectedPlayer("")
    setMade(false)
    setIsNut(false)
    setIsClutch(false)
    setIsGimme(false)
  }

  const canRecord = selectedPlayer && !disabled

  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 space-y-6">
      <div className="flex items-center gap-2 text-green-800">
        <Target className="w-5 h-5" />
        <h3 className="font-semibold text-lg">Record Shot</h3>
      </div>

      {/* Player Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Users className="w-4 h-4" />
          <span>Select Player</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {players.map((player) => (
            <Button
              key={player}
              variant={selectedPlayer === player ? "default" : "outline"}
              onClick={() => setSelectedPlayer(player)}
              disabled={disabled}
              className="h-12 text-base"\
