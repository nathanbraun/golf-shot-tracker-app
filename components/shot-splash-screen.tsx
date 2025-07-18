"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play } from "lucide-react"

interface ShotSplashScreenProps {
  currentHole: number
  currentPar: number
  currentShotNumber: number
  lastDistance: number | null
  selectedRound?: {
    course?: {
      name: string
    }
  } | null
  formatDistance: (distance: number) => string
  onContinue: () => void
}

export default function ShotSplashScreen({
  currentHole,
  currentPar,
  currentShotNumber,
  lastDistance,
  selectedRound,
  formatDistance,
  onContinue,
}: ShotSplashScreenProps) {
  return (
    <div className="min-h-screen bg-green-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="py-4">
            <div className="text-center">
              <div className="text-2xl font-bold">Hole {currentHole}</div>
              <div className="text-green-100 text-sm">
                Par {currentPar} • Shot {currentShotNumber}
                {lastDistance && <span className="ml-2">• {formatDistance(lastDistance)} remaining</span>}
              </div>
              {selectedRound?.course && <div className="text-green-100 text-xs mt-1">{selectedRound.course.name}</div>}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-green-200">
          <CardContent className="py-12 text-center space-y-6">
            <div className="text-6xl animate-bounce">🏌️‍♂️</div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-green-700">Players are hitting their shots...</h2>
              <p className="text-lg font-semibold text-green-600">
                Hole {currentHole} • Shot {currentShotNumber}
              </p>
              <p className="text-green-600">
                {currentShotNumber === 1 ? (
                  <>
                    Starting from <strong>{formatDistance(lastDistance!)}</strong>
                  </>
                ) : (
                  <>
                    <strong>{formatDistance(lastDistance!)} out</strong>
                  </>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                Wait for all players to complete their shots, then select the best one and continue.
              </p>
            </div>
            <div className="flex justify-center space-x-2 pt-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={onContinue}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-12 py-6 text-xl flex items-center gap-3"
              >
                <Play className="w-6 h-6" />
                Continue to Record Shot
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
