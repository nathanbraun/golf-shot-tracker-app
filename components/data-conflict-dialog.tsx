"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, RotateCcw, Play, X } from "lucide-react"

interface ExistingDataInfo {
  totalShots: number
  completedHoles: number[]
  lastHole: number
  lastShotNumber: number
  lastActivity: Date
}

interface DataConflictDialogProps {
  existingData: ExistingDataInfo
  teamName: string
  roundName: string
  onContinue: () => void
  onRestart: () => void
  onCancel: () => void
}

export default function DataConflictDialog({
  existingData,
  teamName,
  roundName,
  onContinue,
  onRestart,
  onCancel,
}: DataConflictDialogProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    const hours = Math.floor(diffInMinutes / 60)
    if (hours < 24) return `${hours} hours ago`
    const days = Math.floor(hours / 24)
    return `${days} days ago`
  }

  return (
    <div className="min-h-screen bg-green-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 text-orange-700 mb-2">
              <AlertTriangle className="w-8 h-8" />
              <CardTitle className="text-xl">Existing Data Found</CardTitle>
            </div>
            <p className="text-orange-600 text-sm">
              We found existing shot data for <strong>{teamName}</strong> in <strong>{roundName}</strong>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing Data Summary */}
            <Card className="bg-white border border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Current Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{existingData.totalShots}</div>
                    <div className="text-sm text-muted-foreground">Total Shots</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{existingData.completedHoles.length}</div>
                    <div className="text-sm text-muted-foreground">Holes Completed</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Completed Holes:</div>
                  <div className="flex flex-wrap gap-1">
                    {existingData.completedHoles.map((hole) => (
                      <Badge key={hole} variant="secondary" className="text-xs">
                        {hole}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="text-sm text-muted-foreground">
                    <strong>Last activity:</strong> Hole {existingData.lastHole}, Shot {existingData.lastShotNumber}
                  </div>
                  <div className="text-xs text-muted-foreground">{formatTimeAgo(existingData.lastActivity)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Action Options */}
            <div className="space-y-4">
              <div className="text-sm font-medium text-center text-gray-700">What would you like to do?</div>

              <Button
                onClick={onContinue}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-3 h-14 text-lg"
              >
                <Play className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-medium">Continue Playing</div>
                  <div className="text-sm text-green-100">Pick up where you left off</div>
                </div>
              </Button>

              <Button
                onClick={onRestart}
                variant="outline"
                className="w-full border-red-200 text-red-700 hover:bg-red-50 flex items-center justify-center gap-3 h-14 text-lg bg-transparent"
              >
                <RotateCcw className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-medium">Start Over</div>
                  <div className="text-sm text-red-600">Delete existing data and restart</div>
                </div>
              </Button>

              <Button
                onClick={onCancel}
                variant="ghost"
                className="w-full text-gray-600 hover:bg-gray-100 flex items-center justify-center gap-2 h-12 text-base"
              >
                <X className="w-5 h-5" />
                Cancel
              </Button>
            </div>

            <div className="text-xs text-center text-muted-foreground bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <strong>Note:</strong> "Start Over" will permanently delete all existing shots and hole completions for
              this team in this round. This cannot be undone.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
