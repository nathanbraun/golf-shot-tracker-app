"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Play, RotateCcw, AlertTriangle } from "lucide-react"

interface RefreshRecoveryData {
  roundName: string
  teamName: string
  playerName: string
  currentHole: number
  totalShots: number
  lastActivity: string
}

interface RefreshRecoveryScreenProps {
  recoveryData: RefreshRecoveryData
  onContinueTracking: () => void
  onStartOver: () => void
}

export default function RefreshRecoveryScreen({
  recoveryData,
  onContinueTracking,
  onStartOver,
}: RefreshRecoveryScreenProps) {
  return (
    <div className="min-h-screen bg-green-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 text-blue-700 mb-2">
              <RefreshCw className="w-8 h-8" />
              <CardTitle className="text-xl">Welcome Back!</CardTitle>
            </div>
            <p className="text-blue-600 text-sm">
              It looks like you were tracking a round. Would you like to continue where you left off?
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recovery Data Summary */}
            <Card className="bg-white border border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Your Round in Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Round:</span>
                    <span className="font-medium">{recoveryData.roundName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Team:</span>
                    <span className="font-medium">{recoveryData.teamName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Player:</span>
                    <span className="font-medium">{recoveryData.playerName}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{recoveryData.currentHole}</div>
                      <div className="text-sm text-muted-foreground">Current Hole</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{recoveryData.totalShots}</div>
                      <div className="text-sm text-muted-foreground">Total Shots</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs text-center text-muted-foreground">
                    <strong>Last activity:</strong> {recoveryData.lastActivity}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Options */}
            <div className="space-y-4">
              <div className="text-sm font-medium text-center text-gray-700">What would you like to do?</div>

              <Button
                onClick={onContinueTracking}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-3 h-14 text-lg"
              >
                <Play className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-medium">Continue Tracking</div>
                  <div className="text-sm text-green-100">Pick up where you left off</div>
                </div>
              </Button>

              <Button
                onClick={onStartOver}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-3 h-14 text-lg bg-transparent"
              >
                <RotateCcw className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-medium">Start Over</div>
                  <div className="text-sm text-gray-600">Go back to round selection</div>
                </div>
              </Button>
            </div>

            <div className="text-xs text-center text-muted-foreground bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              <strong>Tip:</strong> Your shot data is safely stored. You can always continue tracking even after closing
              the app.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
