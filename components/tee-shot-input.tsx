"use client"

import { feetToYards, yardsToFeet } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Target } from "lucide-react"

interface TeeShotInputProps {
  currentHole: number
  currentPar: number
  currentDistance: string
  distanceUnit: "yards" | "feet"
  onDistanceChange: (distance: string) => void
  onDistanceUnitChange: (unit: "yards" | "feet") => void
  onStartShot: () => void
  onPreviousHole: () => void
  onNextHole: () => void
  canGoPrevious: boolean
  canGoNext: boolean
  getIntelligentUnit: (distance: string) => "yards" | "feet"
}

export default function TeeShotInput({
  currentHole,
  currentPar,
  currentDistance,
  distanceUnit,
  onDistanceChange,
  onDistanceUnitChange,
  onStartShot,
  onPreviousHole,
  onNextHole,
  canGoPrevious,
  canGoNext,
  getIntelligentUnit,
}: TeeShotInputProps) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={onPreviousHole}
              variant="outline"
              size="sm"
              className="text-sm bg-transparent"
              disabled={!canGoPrevious}
            >
              ← Previous Hole
            </Button>
            <Button
              onClick={onNextHole}
              variant="outline"
              size="sm"
              className="text-sm bg-transparent"
              disabled={!canGoNext}
            >
              Next Hole →
            </Button>
          </div>
        </div>

        {/* Green setup section */}
        <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-800 font-medium">
            <Target className="w-4 h-4" />
            Shot 1 Setup
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="distance">Distance to hole</Label>
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
                    className="text-lg pr-16 bg-white"
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
              {currentDistance && (
                <div className="text-sm text-green-600">
                  Distance: {currentDistance} {distanceUnit}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
