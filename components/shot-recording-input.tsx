"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ChevronDown, ChevronUp } from "lucide-react"

const SHOT_TYPES = ["Drive", "Approach", "Chip", "Putt", "Sand", "Recovery"]
const EMOJI_TAGS = ["💦", "🛟"]

interface ShotRecordingInputProps {
  selectedPlayerName: string
  selectedShotType: string
  currentDistance: string
  distanceUnit: "yards" | "feet"
  useSlider: boolean
  isNut: boolean
  isClutch: boolean
  showMoreOptions: boolean
  lastDistance: number | null
  currentPar: number
  currentShotNumber: number
  selectedTeam: {
    players?: Array<{ name: string }>
  } | null
  onPlayerSelect: (player: string) => void
  onShotTypeSelect: (shotType: string) => void
  onDistanceChange: (distance: string) => void
  onDistanceUnitChange: (unit: "yards" | "feet") => void
  onSliderToggle: (useSlider: boolean) => void
  onEmojiToggle: (emoji: string) => void
  onMoreOptionsToggle: () => void
  onRecordShot: (isHoleOut?: boolean, isToGimme?: boolean) => void
  getSliderRange: (
    shotType: string,
    startDistance?: number,
  ) => { min: number; max: number; default: number; step: number }
  getEmojiState: (emoji: string) => boolean
}

export default function ShotRecordingInput({
  selectedPlayerName,
  selectedShotType,
  currentDistance,
  distanceUnit,
  useSlider,
  isNut,
  isClutch,
  showMoreOptions,
  lastDistance,
  currentPar,
  currentShotNumber,
  selectedTeam,
  onPlayerSelect,
  onShotTypeSelect,
  onDistanceChange,
  onDistanceUnitChange,
  onSliderToggle,
  onEmojiToggle,
  onMoreOptionsToggle,
  onRecordShot,
  getSliderRange,
  getEmojiState,
}: ShotRecordingInputProps) {
  const [showDistanceInput, setShowDistanceInput] = useState(false)

  // Determine if we should show finish buttons prominently
  const shouldShowFinishButtons = () => {
    if (currentPar === 3) return true // Always show on par 3s
    if (currentPar === 4 && currentShotNumber >= 2) return true // Show on shot 2+ for par 4s
    if (currentPar === 5 && currentShotNumber >= 3) return true // Show on shot 3+ for par 5s
    return false
  }

  const showFinishButtonsProminent = shouldShowFinishButtons()

  const range = selectedShotType
    ? getSliderRange(selectedShotType, lastDistance || undefined)
    : { min: 0, max: 100, default: 50, step: 1 }

  return (
    <div className="space-y-4">
      {/* Blue Box - Record Shot Information */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-800 text-lg">Record Shot {currentShotNumber}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Player Selection */}
          <div>
            <Label className="text-sm font-medium text-blue-700 mb-2 block">Who hit this shot?</Label>
            <div className="grid grid-cols-2 gap-2">
              {selectedTeam?.players?.map((player) => (
                <Button
                  key={player.name}
                  variant={selectedPlayerName === player.name ? "default" : "outline"}
                  onClick={() => onPlayerSelect(player.name)}
                  className="h-10 text-sm"
                >
                  {player.name}
                </Button>
              ))}
              <Button
                variant={selectedPlayerName === "Team Gimme" ? "default" : "outline"}
                onClick={() => onPlayerSelect("Team Gimme")}
                className="h-10 text-sm bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200"
              >
                Team Gimme
              </Button>
            </div>
          </div>

          {/* Shot Type Selection */}
          {selectedPlayerName && (
            <div>
              <Label className="text-sm font-medium text-blue-700 mb-2 block">What type of shot?</Label>
              <div className="grid grid-cols-3 gap-2">
                {SHOT_TYPES.map((type) => (
                  <Button
                    key={type}
                    variant={selectedShotType === type ? "default" : "outline"}
                    onClick={() => onShotTypeSelect(type)}
                    className="h-10 text-sm"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Prominent Finish Buttons (when close to par) */}
          {selectedPlayerName && selectedShotType && showFinishButtonsProminent && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <Label className="text-sm font-medium text-green-700 mb-2 block">Finish the hole?</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => onRecordShot(true)} className="bg-green-600 hover:bg-green-700 text-white h-10">
                  Hole Out
                </Button>
                <Button
                  onClick={() => onRecordShot(false, true)}
                  className="bg-green-600 hover:bg-green-700 text-white h-10"
                >
                  To Gimme
                </Button>
              </div>
            </div>
          )}

          {/* Show More Options */}
          {selectedPlayerName && selectedShotType && (
            <div>
              <Button
                variant="ghost"
                onClick={onMoreOptionsToggle}
                className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              >
                <span>Show More Options</span>
                {showMoreOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              {showMoreOptions && (
                <div className="space-y-3 pt-3 border-t border-blue-200">
                  {/* Emoji Tags */}
                  <div>
                    <Label className="text-sm font-medium text-blue-700 mb-2 block">Tags</Label>
                    <div className="flex gap-2">
                      {EMOJI_TAGS.map((emoji) => (
                        <Button
                          key={emoji}
                          variant={getEmojiState(emoji) ? "default" : "outline"}
                          onClick={() => onEmojiToggle(emoji)}
                          className="h-10 w-12 text-lg"
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Finish Buttons (when not prominent) */}
                  {!showFinishButtonsProminent && (
                    <div>
                      <Label className="text-sm font-medium text-blue-700 mb-2 block">Finish Options</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => onRecordShot(true)}
                          variant="outline"
                          className="h-10 border-green-300 text-green-700 hover:bg-green-50"
                        >
                          Hole Out
                        </Button>
                        <Button
                          onClick={() => onRecordShot(false, true)}
                          variant="outline"
                          className="h-10 border-green-300 text-green-700 hover:bg-green-50"
                        >
                          To Gimme
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Green Box - Distance Remaining (only for regular shots) */}
      {selectedPlayerName && selectedShotType && !showDistanceInput && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-800 text-lg">Distance Remaining</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Distance Input Method Toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-green-700">Use slider</Label>
              <Switch checked={useSlider} onCheckedChange={onSliderToggle} />
            </div>

            {useSlider ? (
              <div className="space-y-3">
                {/* MOVED: Distance Display is now above the slider */}
                <div className="text-center pb-2">
                  <div className="text-3xl font-bold text-green-800">
                    {currentDistance || range.default} {distanceUnit}
                  </div>
                </div>

                {/* Slider */}
                <Slider
                  value={[Number.parseInt(currentDistance) || range.default]}
                  onValueChange={(value) => onDistanceChange(value[0].toString())}
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  className="w-full"
                />

                {/* Range Labels */}
                <div className="flex justify-between text-xs text-green-600">
                  <span>
                    {range.min} {distanceUnit}
                  </span>
                  <span>
                    {range.max} {distanceUnit}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={currentDistance}
                    onChange={(e) => onDistanceChange(e.target.value)}
                    placeholder="Enter distance"
                    className="flex-1"
                  />
                  <div className="flex border border-input rounded-md">
                    <Button
                      variant={distanceUnit === "yards" ? "default" : "ghost"}
                      onClick={() => onDistanceUnitChange("yards")}
                      className="h-10 px-3 rounded-r-none text-sm"
                      size="sm"
                    >
                      yards
                    </Button>
                    <Button
                      variant={distanceUnit === "feet" ? "default" : "ghost"}
                      onClick={() => onDistanceUnitChange("feet")}
                      className="h-10 px-3 rounded-l-none text-sm"
                      size="sm"
                    >
                      feet
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Record Shot Button */}
            <Button
              onClick={() => onRecordShot()}
              disabled={!currentDistance}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg font-medium"
            >
              Record Shot
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
