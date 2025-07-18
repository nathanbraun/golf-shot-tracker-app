"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Target, ToggleLeft, ToggleRight, Settings } from "lucide-react"

const SHOT_TYPES = ["Drive", "Approach", "Chip", "Putt", "Sand", "Recovery"]
const EMOJI_TAGS = ["💦", "🛟"]

interface ShotRecordingInputProps {
  currentHole: number
  currentPar: number
  currentShotNumber: number
  lastDistance: number
  selectedPlayerName: string
  selectedShotType: string
  currentDistance: number
  distanceUnit: string
  useSlider: boolean
  isNut: boolean
  isClutch: boolean
  showMoreOptions: boolean
  players: string[]
  onPlayerSelect: (player: string) => void
  onShotTypeChange: (type: string) => void
  onDistanceChange: (distance: number) => void
  onDistanceUnitChange: (unit: string) => void
  onToggleSlider: () => void
  onToggleMoreOptions: () => void
  onToggleEmojiTag: (emoji: string) => void
  onRecordShot: () => void
  onStartShot: () => void
  formatDistance: (distance: number) => string
  getIntelligentUnit: (distance: number) => string
  getSliderRange: () => { min: number; max: number; step: number }
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
  const sliderRange = getSliderRange()

  return (
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
          <Label className="text-base font-medium">Shot Type</Label>
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

        {/* Distance Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Distance Remaining</Label>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onToggleSlider} className="flex items-center gap-1 text-sm">
                {useSlider ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                Slider
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDistanceUnitChange(distanceUnit === "yards" ? "ft" : "yards")}
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
                  value={[currentDistance]}
                  onValueChange={(value) => onDistanceChange(value[0])}
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
                  {currentDistance} {distanceUnit}
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
                value={currentDistance || ""}
                onChange={(e) => onDistanceChange(Number.parseInt(e.target.value) || 0)}
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

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            onClick={onRecordShot}
            disabled={!selectedPlayerName || !selectedShotType || currentDistance <= 0}
            className="bg-blue-600 hover:bg-blue-700 text-white h-14 text-base font-medium"
          >
            Record Shot
          </Button>
          <Button onClick={onStartShot} variant="outline" className="h-14 text-base font-medium bg-transparent">
            Start Over
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
