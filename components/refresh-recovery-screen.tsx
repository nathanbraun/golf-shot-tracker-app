"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Play, Clock } from "lucide-react"

interface RefreshRecoveryScreenProps {
  recoveryData: {
    roundName: string
    teamName: string
    playerName: string
    currentHole: number
    totalShots: number
    lastActivity: string
  }
  onContinue: () => void
  onStartOver: () => void
}

export default function RefreshRecoveryScreen({ recoveryData, onContinue, onStartOver }: RefreshRecoveryScreenProps) {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`
  }

  return (
    <div className="min-h-screen bg-green-50 p-4 flex items-center justify-center">
      <div className="max-w-md mx-auto space-y-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <RotateCcw className="w-6 h-6" />
              Welcome Back!
            </CardTitle>
            <p className="text-blue-100 text-sm">It looks like you were in the middle of tracking a round</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-center">Your Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Round:</span>
                <Badge variant="secondary">{recoveryData.roundName}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Team:</span>
                <Badge variant="secondary">{recoveryData.teamName}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Player:</span>
                <Badge variant="secondary">{recoveryData.playerName}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Hole:</span>
                <Badge className="bg-green-600">{recoveryData.currentHole}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Shots:</span>
                <Badge className="bg-blue-600">{recoveryData.totalShots}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Last Activity:
                </span>
                <span className="text-sm">{formatTimeAgo(recoveryData.lastActivity)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            onClick={onContinue}
            className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 h-12"
          >
            <Play className="w-4 h-4" />
            Continue Tracking
          </Button>

          <Button
            onClick={onStartOver}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 h-12 bg-transparent"
          >
            <RotateCcw className="w-4 h-4" />
            Start Over
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Your progress is automatically saved as you track shots
        </div>
      </div>
    </div>
  )
}
