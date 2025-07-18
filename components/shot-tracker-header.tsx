"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, BarChart3, Loader2, Flag } from "lucide-react"

interface ShotTrackerHeaderProps {
  currentHole: number
  currentPar: number
  currentShotNumber: number
  isRecordingShot: boolean
  totalScore: {
    completedHoles: number
    totalToPar: number
  }
  shots: any[]
  isSyncing: boolean
  loadingCourseData: boolean
  onViewFeed: () => void
  onViewSummary: () => void
}

export default function ShotTrackerHeader({
  currentHole,
  currentPar,
  currentShotNumber,
  isRecordingShot,
  totalScore,
  shots,
  isSyncing,
  loadingCourseData,
  onViewFeed,
  onViewSummary,
}: ShotTrackerHeaderProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-center mb-3">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Flag className="w-5 h-5" />
            Golf Scramble Tracker
          </CardTitle>
        </div>

        {/* Current hole status */}
        <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">Hole {currentHole}</div>
            <div className="text-xs text-muted-foreground">Par {currentPar}</div>
          </div>

          {totalScore.completedHoles > 0 && (
            <>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className={`text-lg font-bold ${totalScore.totalToPar <= 0 ? "text-green-600" : "text-red-600"}`}>
                  {totalScore.totalToPar > 0 ? `+${totalScore.totalToPar}` : totalScore.totalToPar}
                </div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </>
          )}

          <div className="w-px h-8 bg-gray-300"></div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {isRecordingShot ? currentShotNumber : currentShotNumber}
            </div>
            <div className="text-xs text-muted-foreground">Shot</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-200">
          <Button onClick={onViewFeed} variant="outline" size="sm" className="text-xs h-7 px-2 bg-transparent">
            <Trophy className="w-3 h-3 mr-1" />
            Live
          </Button>

          {shots.length > 0 && (
            <Button onClick={onViewSummary} variant="outline" size="sm" className="text-xs h-7 px-2 bg-transparent">
              <BarChart3 className="w-3 h-3 mr-1" />
              Stats
            </Button>
          )}

          {isSyncing && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Syncing...
            </div>
          )}
        </div>

        {loadingCourseData && (
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading course data...
          </div>
        )}
      </CardHeader>
    </Card>
  )
}
