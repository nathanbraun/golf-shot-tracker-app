"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ShotSplashScreenProps {
  currentHole: number
  currentPar: number
  currentShotNumber: number
  lastDistance: number | null
  selectedRound?: {
    name: string
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
    <div className="min-h-screen bg-green-50 p-4 flex items-center justify-center">
      <div className="max-w-md mx-auto space-y-6">
        <Card className="bg-gradient-to-r from-blue-500 to-green-500 text-white border-2 border-blue-400">
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold">🏌️ Shot Recorded!</div>
              <div className="text-blue-100 text-lg">
                Hole {currentHole} (Par {currentPar}) • Shot {currentShotNumber}
              </div>
              {lastDistance && <div className="text-xl font-semibold">{formatDistance(lastDistance)} remaining</div>}
              {selectedRound?.course && <div className="text-blue-100 text-sm">{selectedRound.course.name}</div>}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            onClick={onContinue}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 text-xl"
          >
            Continue to Record Shot
          </Button>
        </div>
      </div>
    </div>
  )
}
