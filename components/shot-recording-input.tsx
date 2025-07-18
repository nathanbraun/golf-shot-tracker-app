"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Target, ToggleLeft, ToggleRight, Settings, ArrowDown } from "lucide-react"

const SHOT_TYPES = ["Drive", "Approach", "Chip", "Putt", "Sand", "Recovery"]
const EMOJI_TAGS = ["💦", "🛟"]

interface ShotRecordingInputProps {
  currentHole: number
  currentPar: number
  currentShotNumber: number
  lastDistance: number
  selectedPlayerName: string
  selectedShotType: string
  currentDistance: string
  distanceUnit: "yards" | "feet"
  useSlider: boolean
  isNut: boolean
  isClutch: boolean
  showMoreOptions: boolean
  players: string[]
  onPlayerSelect: (player: string) => void
  onShotTypeChange: (type: string) => void
  onDistanceChange: (distance: string) => void
  onDistanceUnitChange: (unit: "yards" | "feet") => void
  onToggleSlider: () => void
  onToggleMoreOptions: () => void
  onToggleEmojiTag: (emoji: string) => void
  onRecordShot: (isHoleOut?: boolean, isToGimme?: boolean) => void
  onStartShot: () => void
  formatDistance: (distance: number) => string
  getIntelligentUnit: (distance: string) => "yards" | "feet"
  getSliderRange: (
    shotType: string,
    startDistance?: number,
  ) => { min: number; max: number; default: number; step: number }
  getEmojiState: (emoji: string) => boolean
}

export default function ShotRecordingInput({
  currentHole,
  currentPar,
  currentShotNumber,
  lastDistance,
  selectedPlayerName,
  selectedShotType,
  currentDistance,
  distanceUnit,
  useSlider,
  isNut,
  isClutch,
  showMoreOptions,
  players,
  onPlayerSelect,
  onShotTypeChange,
  onDistanceChange,
  onDistanceUnitChange,
  onToggleSlider,
  onToggleMoreOptions,
  onToggleEmojiTag,
  onRecordShot,
  onStartShot,
  formatDistance,
  getIntelligentUnit,
  getSliderRange,
  getEmojiState,
}: ShotRecordingInputProps) {
  const sliderRange = getSliderRange(selectedShotType, lastDistance)
  const currentDistanceNum = Number.parseInt(currentDistance) || 0

  return (
    <div className="space-y-4">
      {/* Blue box - Record what happened on shot N */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Target className="w-5 h-5" />
            Record Shot {currentShotNumber}
          </CardTitle>
          <div className="text-sm text-blue-600">
            From {formatDistance(lastDistance)} • Par {currentPar}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 bg-white rounded-lg p-4 mx-2 mb-2">
          {/* Player Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Who hit this shot?</Label>
            <div className="grid grid-cols-2 gap-3">
              {players.map((player) => (
                <Button
                  key={player}
                  variant={selectedPlayerName === player ? "default" : "outline"}
                  onClick={() => onPlayerSelect(player)}
                  className="h-14 text-base font-medium"
                >
                  {player}
                </Button>
              ))}
              <Button
                variant={selectedPlayerName === "Team Gimme" ? "default" : "outline"}
                onClick={() => onPlayerSelect("Team Gimme")}
                className="h-14 col-span-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 text-base font-medium"
              >
                🤝 Team Gimme
              </Button>
            </div>
          </div>

          {/* Shot Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">What type of shot was it?</Label>
            <div className="grid grid-cols-3 gap-2">
              {SHOT_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={selectedShotType === type ? "default" : "outline"}
                  onClick={() => onShotTypeChange(type)}
                  className="h-12 text-sm"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* More Options */}
          <div className="space-y-3">
            <Button variant="ghost" onClick={onToggleMoreOptions} className="flex items-center gap-2 text-sm">
              <Settings className="w-4 h-4" />
              {showMoreOptions ? "Hide" : "Show"} More Options
            </Button>

            {showMoreOptions && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <Label className="text-base font-medium">Tag this shot</Label>
                <div className="flex gap-3 justify-center">
                  {EMOJI_TAGS.map((emoji) => (
                    <Button
                      key={emoji}
                      variant={getEmojiState(emoji) ? "default" : "outline"}
                      onClick={() => onToggleEmojiTag(emoji)}
                      className="text-2xl h-14 w-14 p-0"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
                {(isNut || isClutch) && (
                  <div className="text-center text-sm text-muted-foreground">
                    Selected: {isNut && "💦"} {isClutch && "🛟"}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Arrow indicator */}
      {selectedPlayerName && selectedShotType && (
        <div className="flex justify-center">
          <ArrowDown className="w-6 h-6 text-gray-400" />
        </div>
      )}

      {/* Green box - Distance remaining after shot N (sets up shot N+1) */}
      {selectedPlayerName && selectedShotType && (
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Target className="w-5 h-5" />
              Distance Remaining
            </CardTitle>
            <div className="text-sm text-green-600">
              After {selectedPlayerName}'s {selectedShotType.toLowerCase()}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 bg-white rounded-lg p-4 mx-2 mb-2">
            {/* Distance Input */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">How far to the hole?</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleSlider}
                    className="flex items-center gap-1 text-sm"
                  >
                    {useSlider ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    Slider
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDistanceUnitChange(distanceUnit === "yards" ? "feet" : "yards")}
                    className="text-sm min-w-[60px]"
                  >
                    {distanceUnit}
                  </Button>
                </div>
              </div>

              {useSlider ? (
                <div className="space-y-4 py-2">
                  <div className="px-2">
                    <Slider
                      value={[currentDistanceNum]}
                      onValueChange={(value) => onDistanceChange(value[0].toString())}
                      min={sliderRange.min}
                      max={sliderRange.max}
                      step={sliderRange.step}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground px-2">
                    <span>
                      {sliderRange.min} {distanceUnit}
                    </span>
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {currentDistanceNum} {distanceUnit}
                    </Badge>
                    <span>
                      {sliderRange.max} {distanceUnit}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Distance remaining"
                    value={currentDistance}
                    onChange={(e) => {
                      onDistanceChange(e.target.value)
                      if (e.target.value) {
                        onDistanceUnitChange(getIntelligentUnit(e.target.value))
                      }
                    }}
                    className="text-lg h-14"
                  />
                  <Button
                    variant="outline"
                    onClick={() => onDistanceUnitChange(getIntelligentUnit(currentDistance))}
                    className="h-14 px-4 text-base"
                  >
                    {distanceUnit}
                  </Button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => onRecordShot(true)} // Hole out
                  disabled={!selectedPlayerName || !selectedShotType}
                  className="bg-green-600 hover:bg-green-700 text-white h-14 text-base font-medium"
                >
                  🏌️ Hole Out
                </Button>
                <Button
                  onClick={() => onRecordShot(false, true)} // To gimme
                  disabled={!selectedPlayerName || !selectedShotType || currentDistanceNum > 5}
                  className="bg-green-500 hover:bg-green-600 text-white h-14 text-base font-medium"
                >
                  🤝 To Gimme
                </Button>
              </div>
              <Button
                onClick={() => onRecordShot()}
                disabled={!selectedPlayerName || !selectedShotType || !currentDistance}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-base font-medium"
              >
                Record Shot & Continue
              </Button>
              <Button
                onClick={onStartShot}
                variant="outline"
                className="w-full h-12 text-base font-medium bg-transparent"
              >
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
