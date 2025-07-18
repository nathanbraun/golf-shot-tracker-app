"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, Trophy, Loader2 } from "lucide-react"

interface ShotTrackerHeaderProps {
  currentHole: number
  currentPar: number
  currentShotNumber: number
  isRecordingShot: boolean
  totalScore?: {
    completedHoles: number
    totalStrokes: number
    totalPar: number
    scoreRelativeToPar: number
  }
  shots?: Array<any>
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
  const safeShots = shots || []
  const safeTotalScore = totalScore || {
    completedHoles: 0,
    totalStrokes: 0,
    totalPar: 0,
    scoreRelativeToPar: 0,
  }

  return (
    <div className="space-y-4">
      {/* Status indicators */}
      {(isSyncing || loadingCourseData) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-3">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{loadingCourseData ? "Loading course data..." : "Syncing shots..."}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score summary */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {safeTotalScore.scoreRelativeToPar > 0 ? "+" : ""}
                {safeTotalScore.scoreRelativeToPar}
              </div>
              <div className="text-xs text-muted-foreground">{safeTotalScore.completedHoles} holes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{safeShots.length}</div>
              <div className="text-xs text-muted-foreground">total shots</div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onViewFeed}
                className="flex items-center gap-1 bg-transparent"
              >
                <Trophy className="w-4 h-4" />
                Feed
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onViewSummary}
                className="flex items-center gap-1 bg-transparent"
              >
                <BarChart3 className="w-4 h-4" />
                Stats
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
