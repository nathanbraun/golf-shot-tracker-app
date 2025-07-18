"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, ToggleLeft, ToggleRight } from "lucide-react"

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
  distanceUnit: "yards" | "ft"
  useSlider: boolean
  isNut: boolean
  isClutch: boolean
  showMoreOptions: boolean
  players: string[]
  onPlayerSelect: (player: string) => void
  onShotTypeChange: (type: string) => void
  onDistanceChange: (distance: string) => void
  onDistanceUnitChange: (unit: "yards" | "ft") => void
  onToggleSlider: () => void
  onToggleMoreOptions: () => void
  onToggleEmojiTag: (emoji: string) => void
  onRecordShot: (endDistance?: number, isHoleOut?: boolean, isGimme?: boolean) => void
  onStartShot: () => void
  formatDistance: (distance: number) => string
  getIntelligentUnit: (distance: number) => "yards" | "ft"
  getSliderRange: (distance: number) => { min: number; max: number; step: number }
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
  const sliderRange = getSliderRange(lastDistance)
  const intelligentUnit = getIntelligentUnit(lastDistance)

  // Check if we should show hole out/gimme buttons prominently
  const shouldShowFinishButtons = () => {
    if (currentPar === 3) return true // Always show on par 3s
    if (currentPar === 4 && currentShotNumber >= 2) return true // Shot 2+ on par 4
    if (currentPar === 5 && currentShotNumber >= 3) return true // Shot 3+ on par 5
    return false
  }

  const showFinishButtonsProminently = shouldShowFinishButtons()

  return (
    <div className="space-y-4">
      {/* Blue box - Record what happened on the shot */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-lg">Record Shot {currentShotNumber}</CardTitle>
          <div className="text-center text-blue-100 text-sm">From {formatDistance(lastDistance)}</div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Player Selection */}
          <div className="space-y-2">
            <Label className="text-blue-100">Who hit this shot?</Label>
            <div className="grid grid-cols-2 gap-2">
              {players.map((player) => (
                <Button
                  key={player}
                  variant={selectedPlayerName === player ? "secondary" : "outline"}
                  onClick={() => onPlayerSelect(player)}
                  className={`h-12 ${
                    selectedPlayerName === player
                      ? "bg-white text-blue-600 hover:bg-gray-100"
                      : "bg-transparent text-white border-blue-300 hover:bg-blue-400"
                  }`}
                >
                  {player}
                </Button>
              ))}
              <Button
                variant={selectedPlayerName === "Team Gimme" ? "secondary" : "outline"}
                onClick={() => onPlayerSelect("Team Gimme")}
                className={`h-12 col-span-2 ${
                  selectedPlayerName === "Team Gimme"
                    ? "bg-white text-green-600 hover:bg-gray-100"
                    : "bg-transparent text-white border-green-300 hover:bg-green-400"
                }`}
              >
                🤝 Team Gimme
              </Button>
            </div>
          </div>

          {/* Shot Type Selection */}
          {selectedPlayerName && (
            <div className="space-y-2">
              <Label className="text-blue-100">What type of shot?</Label>
              <div className="grid grid-cols-3 gap-2">
                {SHOT_TYPES.map((type) => (
                  <Button
                    key={type}
                    variant={selectedShotType === type ? "secondary" : "outline"}
                    onClick={() => onShotTypeChange(type)}
                    size="sm"
                    className={`${
                      selectedShotType === type
                        ? "bg-white text-blue-600 hover:bg-gray-100"
                        : "bg-transparent text-white border-blue-300 hover:bg-blue-400"
                    }`}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Finish buttons - show prominently when close to par */}
          {selectedPlayerName && selectedShotType && showFinishButtonsProminently && (
            <div className="space-y-2">
              <Label className="text-blue-100">Finish the hole?</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => onRecordShot(0, true, false)}
                  className="bg-green-600 hover:bg-green-700 text-white h-12"
                >
                  🏌️ Hole Out
                </Button>
                <Button
                  onClick={() => onRecordShot(0, false, true)}
                  className="bg-green-600 hover:bg-green-700 text-white h-12"
                >
                  🤝 To Gimme
                </Button>
              </div>
            </div>
          )}

          {/* More Options */}
          {selectedPlayerName && selectedShotType && (
            <Collapsible open={showMoreOptions} onOpenChange={onToggleMoreOptions}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full bg-transparent text-white border-blue-300 hover:bg-blue-400"
                >
                  {showMoreOptions ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Hide Options
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Show More Options
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                {/* Emoji Tags */}
                <div className="space-y-2">
                  <Label className="text-blue-100">Tag this shot</Label>
                  <div className="flex gap-2 justify-center">
                    {EMOJI_TAGS.map((emoji) => (
                      <Button
                        key={emoji}
                        variant={getEmojiState(emoji) ? "secondary" : "outline"}
                        onClick={() => onToggleEmojiTag(emoji)}
                        className={`text-2xl h-12 w-12 p-0 ${
                          getEmojiState(emoji)
                            ? "bg-white text-blue-600 hover:bg-gray-100"
                            : "bg-transparent text-white border-blue-300 hover:bg-blue-400"
                        }`}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Finish buttons - always available in more options */}
                {!showFinishButtonsProminently && (
                  <div className="space-y-2">
                    <Label className="text-blue-100">Finish the hole?</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => onRecordShot(0, true, false)}
                        className="bg-green-600 hover:bg-green-700 text-white h-12"
                      >
                        🏌️ Hole Out
                      </Button>
                      <Button
                        onClick={() => onRecordShot(0, false, true)}
                        className="bg-green-600 hover:bg-green-700 text-white h-12"
                      >
                        🤝 To Gimme
                      </Button>
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>

      {/* Green box - Distance remaining after the shot */}
      {selectedPlayerName && selectedShotType && (
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-lg">Distance Remaining</CardTitle>
            <div className="text-center text-green-100 text-sm">How far to the hole after this shot?</div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Distance Unit Toggle */}
            <div className="flex items-center justify-center gap-2">
              <span className={`text-sm ${distanceUnit === "yards" ? "text-white font-semibold" : "text-green-200"}`}>
                Yards
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDistanceUnitChange(distanceUnit === "yards" ? "ft" : "yards")}
                className="p-1 h-8 w-12 bg-transparent hover:bg-green-400"
              >
                {distanceUnit === "yards" ? (
                  <ToggleLeft className="w-6 h-6 text-white" />
                ) : (
                  <ToggleRight className="w-6 h-6 text-white" />
                )}
              </Button>
              <span className={`text-sm ${distanceUnit === "ft" ? "text-white font-semibold" : "text-green-200"}`}>
                Feet
              </span>
            </div>

            {/* Slider Toggle */}
            <div className="flex items-center justify-center gap-2">
              <span className={`text-sm ${!useSlider ? "text-white font-semibold" : "text-green-200"}`}>Type</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSlider}
                className="p-1 h-8 w-12 bg-transparent hover:bg-green-400"
              >
                {!useSlider ? (
                  <ToggleLeft className="w-6 h-6 text-white" />
                ) : (
                  <ToggleRight className="w-6 h-6 text-white" />
                )}
              </Button>
              <span className={`text-sm ${useSlider ? "text-white font-semibold" : "text-green-200"}`}>Slider</span>
            </div>

            {/* Distance Input */}
            {useSlider ? (
              <div className="space-y-4">
                {/* Distance display ABOVE the slider */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {currentDistance || "0"}
                    {distanceUnit === "yards" ? "y" : "ft"}
                  </div>
                </div>
                <Slider
                  value={[Number.parseInt(currentDistance) || 0]}
                  onValueChange={(value) => onDistanceChange(value[0].toString())}
                  max={sliderRange.max}
                  min={sliderRange.min}
                  step={sliderRange.step}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-green-200">
                  <span>
                    {sliderRange.min}
                    {distanceUnit === "yards" ? "y" : "ft"}
                  </span>
                  <span>
                    {sliderRange.max}
                    {distanceUnit === "yards" ? "y" : "ft"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="distance" className="text-green-100">
                  Distance ({distanceUnit})
                </Label>
                <Input
                  id="distance"
                  type="number"
                  placeholder={`Distance in ${distanceUnit}`}
                  value={currentDistance}
                  onChange={(e) => onDistanceChange(e.target.value)}
                  className="text-lg bg-white text-gray-900 border-green-300"
                />
              </div>
            )}

            {/* Record Shot Button */}
            <Button
              onClick={() => onRecordShot(Number.parseInt(currentDistance) || 0)}
              disabled={!currentDistance}
              className="w-full bg-white text-green-600 hover:bg-gray-100 h-12 text-lg font-semibold"
            >
              Record Shot
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
