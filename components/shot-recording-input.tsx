"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
              className="h-12 text-base"
            >
              {player}
            </Button>
          ))}
        </div>
      </div>

      {/* Shot Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Shot Type</Label>
        <Select value={shotType} onValueChange={setShotType} disabled={disabled}>
          <SelectTrigger className="h-12 text-base bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SHOT_TYPES.map((type) => (
              <SelectItem key={type} value={type} className="text-base py-3">
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Distance Slider - Made bigger for mobile */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-700">Distance Remaining</Label>
          <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
            {endDistance[0]} yards
          </Badge>
        </div>
        <div className="px-2 space-y-3">
          <Slider
            value={endDistance}
            onValueChange={setEndDistance}
            max={startDistance}
            min={0}
            step={1}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0 yards</span>
            <span>{startDistance} yards</span>
          </div>
        </div>
      </div>

      {/* Shot Flags */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch id="made" checked={made} onCheckedChange={setMade} disabled={disabled} />
          <Label htmlFor="made" className="text-sm">
            Made Shot
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="nut" checked={isNut} onCheckedChange={setIsNut} disabled={disabled} />
          <Label htmlFor="nut" className="text-sm">
            Nut Shot
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="clutch" checked={isClutch} onCheckedChange={setIsClutch} disabled={disabled} />
          <Label htmlFor="clutch" className="text-sm">
            Clutch
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="gimme" checked={isGimme} onCheckedChange={setIsGimme} disabled={disabled} />
          <Label htmlFor="gimme" className="text-sm">
            Gimme
          </Label>
        </div>
      </div>

      {/* Record Button */}
      <Button onClick={handleRecordShot} disabled={!canRecord} className="w-full h-14 text-lg font-semibold">
        Record Shot
      </Button>
    </div>
  )
}
