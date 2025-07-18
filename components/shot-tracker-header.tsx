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
      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewFeed}
            className="flex items-center gap-2 text-xs bg-transparent"
          >
            <Trophy className="w-3 h-3" />
            Feed
          </Button>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Flag className="w-5 h-5" />
            Golf Scramble Tracker
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onViewSummary}
            className="flex items-center gap-2 text-xs bg-transparent"
          >
            <BarChart3 className="w-3 h-3" />
            Stats
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-center items-center gap-4 text-sm">
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
