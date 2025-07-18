"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Target, ArrowRight } from "lucide-react"

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
  onRecordShot: (made?: boolean, isGimme?: boolean) => void
  onStartShot: () => void
  formatDistance: (distance: number) => string
  getIntelligentUnit: (distance: string) => "yards" | "feet"
  getSliderRange: (
    shotType: string,
    lastDistance?: number,
  ) => {
    min: number
    max: number
    default: number
    step: number
  }
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="w-5 h-5" />
          What happened?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-blue-700">
          <strong>
            Hole {currentHole} (Par {currentPar}) • Shot {currentShotNumber}
          </strong>{" "}
          •{" "}
          {currentShotNumber === 1 ? (
            <>
              Started from: <strong>{formatDistance(lastDistance)}</strong>
            </>
          ) : (
            <>
              <strong>{formatDistance(lastDistance)} out</strong>
            </>
          )}
        </p>

        {/* Last Shot Section */}
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-blue-800 font-medium">
            <Target className="w-4 h-4" />
            Shot {currentShotNumber} Result
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Whose shot did the team use?</Label>
              <div className="grid grid-cols-2 gap-2">
                {players.map((player) => (
                  <Button
                    key={player}
                    variant={selectedPlayerName === player ? "default" : "outline"}
                    onClick={() => onPlayerSelect(player)}
                    className="h-12"
                  >
                    {player}
                  </Button>
                ))}
                {lastDistance <= 5 && distanceUnit === "feet" && selectedShotType === "Putt" && (
                  <Button
                    variant={selectedPlayerName === "Team Gimme" ? "default" : "outline"}
                    onClick={() => onPlayerSelect("Team Gimme")}
                    className="h-12 col-span-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  >
                    🤝 Team Gimme
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Shot type</Label>
              <div className="grid grid-cols-3 gap-2">
                {SHOT_TYPES.map((type) => (
                  <Button
                    key={type}
                    variant={selectedShotType === type ? "default" : "outline"}
                    onClick={() => onShotTypeChange(type)}
                    size="sm"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {lastDistance <= 30 && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="default"
                  onClick={() => onRecordShot(true)}
                  disabled={!selectedPlayerName || !selectedShotType}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Hole Out! ⛳
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onRecordShot(false, true)}
                  disabled={!selectedPlayerName || !selectedShotType}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                >
                  To Gimme 🤝
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleMoreOptions}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                {showMoreOptions ? "Less options ↑" : "More options ↓"}
              </Button>
              {showMoreOptions && (
                <div className="space-y-4 p-4 bg-white rounded-lg border">
                  <div className="space-y-2">
                    <Label>Tag this shot (optional)</Label>
                    <div className="flex gap-2 justify-center flex-wrap">
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
                  {lastDistance > 30 && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="default"
                        onClick={() => onRecordShot(true)}
                        disabled={!selectedPlayerName || !selectedShotType}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Hole Out! ⛳
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => onRecordShot(false, true)}
                        disabled={!selectedPlayerName || !selectedShotType}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                      >
                        To Gimme 🤝
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Separator with Arrow */}
        <div className="flex items-center gap-4">
          <Separator className="flex-1" />
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
          <Separator className="flex-1" />
        </div>

        {/* Next Shot Section */}
        <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-800 font-medium">
            <Target className="w-4 h-4" />
            Shot {currentShotNumber + 1} Setup
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="distance">Distance remaining</Label>
                <Button variant="ghost" size="sm" onClick={onToggleSlider} className="text-xs h-6">
                  {useSlider ? "Type" : "Slide"}
                </Button>
              </div>
              {useSlider && selectedShotType ? (
                <div className="space-y-3">
                  <div className="px-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {getSliderRange(selectedShotType, lastDistance).min} {distanceUnit}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-medium">
                          {currentDistance || getSliderRange(selectedShotType, lastDistance).default}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant={distanceUnit === "yards" ? "default" : "ghost"}
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => {
                              if (distanceUnit === "feet") {
                                const currentValue = Number.parseInt(currentDistance) || 0
                                const yardsValue = Math.round(currentValue / 3)
                                onDistanceChange(yardsValue.toString())
                                onDistanceUnitChange("yards")
                              }
                            }}
                          >
                            yd
                          </Button>
                          <Button
                            type="button"
                            variant={distanceUnit === "feet" ? "default" : "ghost"}
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => {
                              if (distanceUnit === "yards") {
                                const currentValue = Number.parseInt(currentDistance) || 0
                                const feetValue = currentValue * 3
                                onDistanceChange(feetValue.toString())
                                onDistanceUnitChange("feet")
                              }
                            }}
                          >
                            ft
                          </Button>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {getSliderRange(selectedShotType, lastDistance).max} {distanceUnit}
                      </span>
                    </div>
                    <Slider
                      value={[
                        Number.parseInt(currentDistance) || getSliderRange(selectedShotType, lastDistance).default,
                      ]}
                      onValueChange={(value) => onDistanceChange(value[0].toString())}
                      min={getSliderRange(selectedShotType, lastDistance).min}
                      max={getSliderRange(selectedShotType, lastDistance).max}
                      step={getSliderRange(selectedShotType, lastDistance).step}
                      className="w-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      id="distance"
                      type="number"
                      placeholder={`Enter ${distanceUnit}`}
                      value={currentDistance}
                      onChange={(e) => {
                        onDistanceChange(e.target.value)
                        if (e.target.value) {
                          onDistanceUnitChange(getIntelligentUnit(e.target.value))
                        }
                      }}
                      className="text-lg pr-16"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                      <Button
                        type="button"
                        variant={distanceUnit === "yards" ? "default" : "ghost"}
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => onDistanceUnitChange("yards")}
                      >
                        yd
                      </Button>
                      <Button
                        type="button"
                        variant={distanceUnit === "feet" ? "default" : "ghost"}
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => onDistanceUnitChange("feet")}
                      >
                        ft
                      </Button>
                    </div>
                  </div>
                  <Button onClick={onStartShot} disabled={!currentDistance} className="whitespace-nowrap">
                    Start Shot
                  </Button>
                </div>
              )}
              {currentDistance && (
                <div className="text-sm text-muted-foreground">
                  Remaining distance: {currentDistance} {distanceUnit}
                </div>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={() => onRecordShot()}
          disabled={!selectedPlayerName || !selectedShotType || !currentDistance}
          className="w-full bg-green-600 hover:bg-green-700 text-white text-lg flex items-center justify-center gap-2"
        >
          Record Shot
        </Button>
      </CardContent>
    </Card>
  )
}
