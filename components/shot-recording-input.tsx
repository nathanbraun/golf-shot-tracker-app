"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { User, Target, ArrowDown, ChevronDown, ChevronUp, ToggleLeft, ToggleRight } from "lucide-react"

interface ShotRecordingInputProps {
  currentShot: number
  players: Array<{ id: string; name: string }>
  selectedPlayer: string | null
  selectedShotType: string | null
  shotTypes: Array<{ id: string; name: string; emoji: string }>
  isCloseToHole: boolean
  showMoreOptions: boolean
  selectedEmojis: string[]
  availableEmojis: Array<{ emoji: string; label: string }>
  distanceRemaining: string
  distanceUnit: "yards" | "feet"
  useSlider: boolean
  sliderValue: number[]
  onPlayerSelect: (playerId: string) => void
  onShotTypeSelect: (shotType: string) => void
  onHoleOut: () => void
  onToGimme: () => void
  onToggleMoreOptions: () => void
  onEmojiToggle: (emoji: string) => void
  onDistanceRemainingChange: (distance: string) => void
  onDistanceUnitChange: (unit: "yards" | "feet") => void
  onToggleSlider: () => void
  onSliderChange: (value: number[]) => void
  onRecordShot: () => void
  getIntelligentUnit: (distance: string) => "yards" | "feet"
}

export default function ShotRecordingInput({
  currentShot,
  players,
  selectedPlayer,
  selectedShotType,
  shotTypes,
  isCloseToHole,
  showMoreOptions,
  selectedEmojis,
  availableEmojis,
  distanceRemaining,
  distanceUnit,
  useSlider,
  sliderValue,
  onPlayerSelect,
  onShotTypeSelect,
  onHoleOut,
  onToGimme,
  onToggleMoreOptions,
  onEmojiToggle,
  onDistanceRemainingChange,
  onDistanceUnitChange,
  onToggleSlider,
  onSliderChange,
  onRecordShot,
  getIntelligentUnit,
}: ShotRecordingInputProps) {
  return (
    <Card>
      <CardContent className="p-0">
        {/* Blue result section */}
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="font-medium text-blue-800">Shot {currentShot} Result</h3>
          </div>

          {/* Player Selection */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {players.map((player) => (
                <Button
                  key={player.id}
                  onClick={() => onPlayerSelect(player.id)}
                  variant={selectedPlayer === player.id ? "default" : "outline"}
                  className="h-12 text-sm"
                >
                  {player.name}
                </Button>
              ))}
              {isCloseToHole && (
                <Button
                  onClick={() => onPlayerSelect("team-gimme")}
                  variant={selectedPlayer === "team-gimme" ? "default" : "outline"}
                  className="h-12 text-sm col-span-2"
                >
                  Team Gimme
                </Button>
              )}
            </div>

            {/* Shot Type Selection */}
            <div className="grid grid-cols-3 gap-2">
              {shotTypes.map((type) => (
                <Button
                  key={type.id}
                  onClick={() => onShotTypeSelect(type.id)}
                  variant={selectedShotType === type.id ? "default" : "outline"}
                  className="h-12 text-xs flex flex-col gap-1"
                >
                  <span className="text-lg">{type.emoji}</span>
                  <span>{type.name}</span>
                </Button>
              ))}
            </div>

            {/* Quick Actions */}
            {isCloseToHole && (
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={onHoleOut} className="h-12 bg-green-600 hover:bg-green-700">
                  🏌️ Hole Out
                </Button>
                <Button onClick={onToGimme} className="h-12 bg-yellow-600 hover:bg-yellow-700">
                  👌 To Gimme
                </Button>
              </div>
            )}

            {/* More Options */}
            <Collapsible open={showMoreOptions} onOpenChange={onToggleMoreOptions}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                  More options
                  {showMoreOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {availableEmojis.map((item) => (
                    <Button
                      key={item.emoji}
                      onClick={() => onEmojiToggle(item.emoji)}
                      variant={selectedEmojis.includes(item.emoji) ? "default" : "outline"}
                      className="h-12 text-lg"
                      title={item.label}
                    >
                      {item.emoji}
                    </Button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Arrow separator */}
        <div className="flex justify-center py-2 bg-gray-50">
          <ArrowDown className="w-4 h-4 text-gray-400" />
        </div>

        {/* Green setup section */}
        <div className="bg-green-50 border-t border-green-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-green-600" />
            <h3 className="font-medium text-green-800">Shot {currentShot + 1} Setup</h3>
          </div>

          <div className="space-y-3">
            {/* Distance Input Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">Distance remaining</span>
              <Button onClick={onToggleSlider} variant="ghost" size="sm" className="h-8 px-2">
                {useSlider ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                {useSlider ? "Slider" : "Text"}
              </Button>
            </div>

            {useSlider ? (
              <div className="space-y-2">
                <Slider value={sliderValue} onValueChange={onSliderChange} max={500} step={5} className="w-full" />
                <div className="flex justify-between text-xs text-green-600">
                  <span>0</span>
                  <span className="font-medium">
                    {sliderValue[0]} {distanceUnit}
                  </span>
                  <span>500</span>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    type="number"
                    placeholder={`Enter ${distanceUnit}`}
                    value={distanceRemaining}
                    onChange={(e) => {
                      onDistanceRemainingChange(e.target.value)
                      if (e.target.value) {
                        onDistanceUnitChange(getIntelligentUnit(e.target.value))
                      }
                    }}
                    className="pr-16 bg-white"
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
              </div>
            )}

            {(distanceRemaining || sliderValue[0] > 0) && (
              <div className="text-sm text-green-600">
                Distance: {useSlider ? sliderValue[0] : distanceRemaining} {distanceUnit}
              </div>
            )}

            <Button
              onClick={onRecordShot}
              disabled={!selectedPlayer || !selectedShotType}
              className="w-full h-12 text-lg"
            >
              Record Shot
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
