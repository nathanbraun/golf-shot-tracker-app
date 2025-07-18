"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flag, Trophy, BarChart3, Loader2, Wifi } from "lucide-react"

interface ShotTrackerHeaderProps {
  currentHole: number
  currentPar: number
  currentShotNumber: number
  isRecordingShot: boolean
  totalScore: {
    completedHoles: number
    totalToPar: number
  }
  shots: Array<{
    id: string
    hole: number
    shotNumber: number
    player: string
    made: boolean
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
  return (
    <Card>
      <CardHeader className="text-center pb-2 px-2">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewFeed}
            className="flex items-center gap-1 text-xs bg-transparent px-2 py-1 h-8 min-w-0 shrink-0"
          >
            <Trophy className="w-3 h-3" />
            <span className="hidden xs:inline">Feed</span>
          </Button>

          <CardTitle className="flex items-center gap-2 text-green-700 text-base sm:text-lg flex-1 min-w-0">
            <Flag className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="truncate">Golf Scramble Tracker</span>
          </CardTitle>

          <Button
            variant="outline"
            size="sm"
            onClick={onViewSummary}
            className="flex items-center gap-1 text-xs bg-transparent px-2 py-1 h-8 min-w-0 shrink-0"
          >
            <BarChart3 className="w-3 h-3" />
            <span className="hidden xs:inline">Stats</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-2">
        <div className="flex justify-center items-center gap-3 text-sm flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Holes:</span>
            <Badge variant="secondary">{totalScore.completedHoles}/18</Badge>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Shots:</span>
            <Badge variant="secondary">{shots.length}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Score:</span>
            <Badge variant={totalScore.totalToPar <= 0 ? "default" : "destructive"}>
              {totalScore.totalToPar > 0 ? `+${totalScore.totalToPar}` : totalScore.totalToPar}
            </Badge>
          </div>
          {(isSyncing || loadingCourseData) && (
            <div className="flex items-center gap-1 text-blue-600">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-xs">Syncing...</span>
            </div>
          )}
          {!isSyncing && !loadingCourseData && (
            <div className="flex items-center gap-1 text-green-600">
              <Wifi className="w-3 h-3" />
              <span className="text-xs">Online</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
