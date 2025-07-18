"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flag, Trophy, BarChart3, Loader2 } from "lucide-react"

interface ShotTrackerHeaderProps {
  currentHole: number
  currentPar: number
  currentShotNumber: number
  isRecordingShot: boolean
  totalScore?: {
    completedHoles: number
    totalToPar: number
  }
  shots: Array<{
    id: string
    hole: number
    par: number
    shotNumber: number
    player: string
    shotType: string
    startDistance: number
    endDistance: number
    calculatedDistance: number
    made: boolean
    isNut: boolean
    isClutch: boolean
    isGimme: boolean
    timestamp: Date
  }>
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
  // Provide default values if totalScore is undefined
  const safeScore = totalScore || { completedHoles: 0, totalToPar: 0 }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 px-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewFeed}
            className="shrink-0 h-8 px-2 py-1 text-xs bg-transparent"
          >
            <Trophy className="w-3 h-3 mr-1" />
            <span className="hidden xs:inline">Feed</span>
          </Button>

          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center justify-center gap-2 text-green-700 text-base sm:text-lg truncate">
              <Flag className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="truncate">Golf Scramble Tracker</span>
            </CardTitle>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onViewSummary}
            className="shrink-0 h-8 px-2 py-1 text-xs bg-transparent"
          >
            <BarChart3 className="w-3 h-3 mr-1" />
            <span className="hidden xs:inline">Stats</span>
          </Button>
        </div>

        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <span className="font-medium">{safeScore.completedHoles}</span>
            <span>holes</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">{shots.length}</span>
            <span>shots</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant={safeScore.totalToPar <= 0 ? "default" : "destructive"} className="text-xs px-1.5 py-0.5">
              {safeScore.totalToPar > 0 ? `+${safeScore.totalToPar}` : safeScore.totalToPar}
            </Badge>
          </div>
          {(isSyncing || loadingCourseData) && (
            <div className="flex items-center gap-1 text-blue-600">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-xs">syncing...</span>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  )
}
