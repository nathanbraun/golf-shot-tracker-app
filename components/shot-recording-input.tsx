"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Target, Settings, Zap } from "lucide-react"

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
  distanceUnit: "yards" | "ft"
  useSlider: boolean
  isNut: boolean
  isClutch: boolean
  showMoreOptions: boolean
  players: string[]
  onPlayerSelect: (player: string) => void
  onShotTypeChange: (type: string) => void
  onDistanceChange: (distance: number) => void
  onDistanceUnitChange: (unit: "yards" | "ft") => void
  onToggleSlider: () => void
  onToggleMoreOptions: () => void
  onToggleEmojiTag: (emoji: string) => void
  onRecordShot: () => void
  onStartShot: () => void
  formatDistance: (distance: number) => string
  getIntelligentUnit: (distance: number) => "yards" | "ft"
  getSliderRange: (lastDistance: number, shotType: string) => { min: number; max: number; step: number }
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
  formatDistance,
  getIntelligentUnit,
  getSliderRange,
  getEmojiState,
}: ShotRecordingInputProps) {
  const sliderRange = getSliderRange(lastDistance, selectedShotType)

  return (
    <div className="space-y-4">
      {/* Shot Setup Section */}
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-2 border-green-400">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5" />
            Record Shot #{currentShotNumber}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 bg-white text-gray-900 rounded-lg mx-4 mb-4 p-4">
          {/* Player Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Who's hitting?</Label>
            <div className="grid grid-cols-2 gap-2">
              {players.map((player) => (
                <Button
                  key={player}
                  variant={selectedPlayerName === player ? "default" : "outline"}
                  onClick={() => onPlayerSelect(player)}
                  className="h-12 text-base"
                >
                  {player}
                </Button>
              ))}
              <Button
                variant={selectedPlayerName === "Team Gimme" ? "default" : "outline"}
                onClick={() => onPlayerSelect("Team Gimme")}
                className="h-12 col-span-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 text-base"
              >
                🤝 Team Gimme
              </Button>
            </div>
          </div>

          {/* Shot Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Shot Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {SHOT_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={selectedShotType === type ? "default" : "outline"}
                  onClick={() => onShotTypeChange(type)}
                  className="h-10 text-sm"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Distance Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Distance Remaining</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleSlider}
                  className="h-8 px-3 text-xs bg-transparent"
                >
                  {useSlider ? "Input" : "Slider"}
                </Button>
                <div className="flex rounded-md border">
                  <Button
                    variant={distanceUnit === "yards" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onDistanceUnitChange("yards")}
                    className="h-8 px-3 text-xs rounded-r-none"
                  >
                    Yards
                  </Button>
                  <Button
                    variant={distanceUnit === "ft" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onDistanceUnitChange("ft")}
                    className="h-8 px-3 text-xs rounded-l-none"
                  >
                    Feet
                  </Button>
                </div>
              </div>
            </div>

            {useSlider ? (
              <div className="space-y-4">
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
                <div className="flex justify-between text-xs text-muted-foreground px-2">
                  <span>
                    {sliderRange.min} {distanceUnit}
                  </span>
                  <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
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
                  placeholder="Distance"
                  value={currentDistance}
                  onChange={(e) => onDistanceChange(Number(e.target.value) || 0)}
                  className="text-lg h-12"
                />
                <div className="flex items-center px-3 bg-gray-100 rounded-md border text-sm font-medium">
                  {distanceUnit}
                </div>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground">Started from {formatDistance(lastDistance)}</div>
          </div>

          {/* More Options */}
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={onToggleMoreOptions}
              className="w-full h-10 flex items-center gap-2 bg-transparent"
            >
              <Settings className="w-4 h-4" />
              {showMoreOptions ? "Hide" : "Show"} More Options
            </Button>

            {showMoreOptions && (
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tag this shot</Label>
                  <div className="flex gap-2 justify-center">
                    {EMOJI_TAGS.map((emoji) => (
                      <Button
                        key={emoji}
                        variant={getEmojiState(emoji) ? "default" : "outline"}
                        onClick={() => onToggleEmojiTag(emoji)}
                        className="text-2xl h-12 w-12 p-0"
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                  {(isNut || isClutch) && (
                    <div className="text-center text-sm text-muted-foreground">
                      Selected: {isNut && "💦"}
                      {isClutch && "🛟"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Record Shot Button */}
          <Button
            onClick={onRecordShot}
            disabled={!selectedPlayerName || !selectedShotType}
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold flex items-center justify-center gap-3"
          >
            <Zap className="w-6 h-6" />
            Record Shot
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
