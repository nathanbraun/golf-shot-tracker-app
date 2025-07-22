"use client"

import { formatDistance as formatDistanceUtil, calculateSkins, type TeamSkinsSummary } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Flag, BarChart3, Target, MapPin, Award, ArrowLeft, ArrowRight } from "lucide-react"
import { holeCompletionsApi, type Round, type Team, type CourseHole } from "@/lib/supabase"

interface LocalShot {
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
}

interface ScoreInfo {
  totalShots: number
  scoreToPar: number
  scoreName: string
  scoreColor: string
}

interface TotalScore {
  completedHoles: number
  totalToPar: number
}

interface HoleSummaryProps {
  currentHole: number
  currentPar: number
  shots: LocalShot[]
  courseHoles: CourseHole[]
  selectedRound: Round | null
  selectedTeam: Team | null
  getScoreInfo: (hole: number, par: number) => ScoreInfo | null
  getTotalScore: () => TotalScore
  formatDistance: (distance: number, unit?: "yards" | "feet") => string
  getDistanceColor: (distance: number) => string
  onContinueToNextHole: () => void
  isReviewingPreviousHole?: boolean
  onReturnToCurrentHole?: () => void
  onNavigateToHole?: (holeNumber: number) => void
}

export default function HoleSummary({
  currentHole,
  currentPar,
  shots,
  courseHoles,
  selectedRound,
  selectedTeam,
  getScoreInfo,
  getTotalScore,
  formatDistance,
  getDistanceColor,
  onContinueToNextHole,
  isReviewingPreviousHole = false,
  onReturnToCurrentHole = () => {},
  onNavigateToHole = () => {},
}: HoleSummaryProps) {
  const [teamSkinsSummary, setTeamSkinsSummary] = useState<TeamSkinsSummary[]>([])
  const [allCompletions, setAllCompletions] = useState<any[]>([])
  const [loadingLiveData, setLoadingLiveData] = useState(false)

  const currentHoleShots = shots.filter((shot) => shot.hole === currentHole)
  const scoreInfo = getScoreInfo(currentHole, currentPar)
  const totalScore = getTotalScore()

  const loadLiveData = async () => {
    if (!selectedRound || !selectedTeam) return

    setLoadingLiveData(true)
    try {
      // Get all hole completions for this round
      const completions = await holeCompletionsApi.getCompletionsByRound(selectedRound.id)
      setAllCompletions(completions)

      // Calculate skins using our utility function
      const { teamSkinsSummary } = calculateSkins(completions)
      setTeamSkinsSummary(teamSkinsSummary)
    } catch (error) {
      console.error("Error loading live data:", error)
    } finally {
      setLoadingLiveData(false)
    }
  }

  useEffect(() => {
    loadLiveData()
  }, [selectedRound, selectedTeam, currentHole])

  // Get all completed holes
  const completedHoles = [...new Set(shots.map(shot => shot.hole))].sort((a, b) => a - b)
  const currentActiveHole = Math.max(...completedHoles)

  return (
    <div className="min-h-screen bg-green-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <Card>
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-green-700">
              <Flag className="w-6 h-6" />
              Golf Scramble Tracker
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Hole Complete Banner */}
        <Card className="bg-gradient-to-r from-blue-500 to-green-500 text-white border-2 border-blue-400">
          <CardContent className="py-6">
            <div className="text-center">
              <div className="text-3xl font-bold">🏌️ Hole {currentHole} Complete!</div>
              <div className="text-blue-100 text-lg mt-2">
                Par {currentPar} • {currentHoleShots.length} shots
              </div>
              {scoreInfo && (
                <div className={`text-xl font-bold mt-2 text-white`}>
                  {scoreInfo.scoreName}
                  {scoreInfo.scoreToPar !== 0 && (
                    <span className="ml-2">
                      ({scoreInfo.scoreToPar > 0 ? "+" : ""}
                      {scoreInfo.scoreToPar})
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Round Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5" />
              Round Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{currentHole}</div>
                <div className="text-sm text-muted-foreground">Current Hole</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{shots.length}</div>
                <div className="text-sm text-muted-foreground">Total Shots</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${totalScore.totalToPar <= 0 ? "text-green-600" : "text-red-600"}`}>
                  {totalScore.totalToPar > 0 ? `+${totalScore.totalToPar}` : totalScore.totalToPar}
                </div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons - Moved here */}
        {isReviewingPreviousHole && (
          <div className="flex justify-between gap-2">
            {/* Previous Hole Button */}
            <Button
              onClick={() => {
                const prevHole = currentHole - 1;
                if (prevHole >= 1) {
                  const prevHoleShots = shots.filter((shot) => shot.hole === prevHole);
                  if (prevHoleShots.length > 0) {
                    onNavigateToHole(prevHole);
                  }
                }
              }}
              variant="outline"
              size="sm"
              className="flex-1 flex items-center justify-center gap-1"
              disabled={currentHole <= 1 || !shots.some(shot => shot.hole === currentHole - 1)}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            
            {/* Return to Current Button */}
            <Button
              onClick={onReturnToCurrentHole}
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1"
            >
              Return to Current
            </Button>
            
            {/* Next Hole Button */}
            <Button
              onClick={() => {
                const nextHole = currentHole + 1;
                if (nextHole <= 18) {
                  const nextHoleShots = shots.filter((shot) => shot.hole === nextHole);
                  if (nextHoleShots.length > 0) {
                    onNavigateToHole(nextHole);
                  }
                }
              }}
              variant="outline"
              size="sm"
              className="flex-1 flex items-center justify-center gap-1"
              disabled={currentHole >= currentActiveHole || !shots.some(shot => shot.hole === currentHole + 1)}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}


        {/* Hole Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5" />
              Hole {currentHole} Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentHoleShots.map((shot) => (
                <div key={shot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs w-12 justify-center">
                      #{shot.shotNumber}
                    </Badge>
                    <div>
                      <div className="font-medium">{shot.isGimme ? "Gimme" : shot.player}</div>
                      <div className="text-sm text-muted-foreground">{shot.shotType}</div>
                    </div>
                    {(shot.isNut || shot.isClutch) && (
                      <div className="text-lg">
                        {shot.isNut && "💦"}
                        {shot.isClutch && "🛟"}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge className={`text-white ${getDistanceColor(shot.calculatedDistance)}`}>
                      {shot.isGimme ? "Gimme" : formatDistance(shot.calculatedDistance)}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDistance(shot.startDistance)} → {shot.made ? "MADE" : formatDistance(shot.endDistance)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skins Leaderboard */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="w-5 h-5" />
                Skins Leaderboard
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={loadLiveData}
                disabled={loadingLiveData}
                className="flex items-center gap-1 bg-transparent"
              >
                <RefreshCw className={`w-4 h-4 ${loadingLiveData ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamSkinsSummary.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  {loadingLiveData ? "Loading skins data..." : "No skins won yet in this round."}
                </div>
              ) : (
                teamSkinsSummary.map((teamSkins, index) => {
                  // Find the highest hole number this team has completed
                  const teamCompletions = allCompletions.filter(c => c.team_id === teamSkins.teamId) || [];
                  const highestHoleCompleted = teamCompletions.length > 0 
                    ? Math.max(...teamCompletions.map(c => c.hole_number)) 
                    : 0;
                  
                  return (
                    <div
                      key={teamSkins.teamId}
                      className={`p-3 rounded-lg border-2 ${
                        teamSkins.teamId === selectedTeam?.id ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-300 font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold">{teamSkins.teamName}</div>
                            <div className="text-sm text-muted-foreground">
                              {teamSkins.skinsWon.length} holes won • Through hole {highestHoleCompleted}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">{teamSkins.totalSkins}</div>
                          <div className="text-xs text-muted-foreground">Total Skins</div>
                        </div>
                      </div>

                      {/* Holes won */}
                      {teamSkins.skinsWon.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex flex-wrap gap-1">
                            {teamSkins.skinsWon.map((skin) => (
                              <Badge key={skin.holeNumber} variant="outline" className="text-xs">
                                Hole {skin.holeNumber} (+{skin.skinsWon})
                                {skin.carryoverHoles.length > 0 && (
                                  <span className="ml-1 text-orange-600">[+{skin.carryoverHoles.join(",")}]</span>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Hole Preview */}
        {!isReviewingPreviousHole && currentHole < 18 && courseHoles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5" />
                Next Up: Hole {currentHole + 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                {(() => {
                  const nextHole = courseHoles.find((h) => h.hole_number === currentHole + 1)
                  if (nextHole) {
                    return (
                      <>
                        <div className="text-3xl font-bold text-green-600">Par {nextHole.par}</div>
                        <div className="text-lg text-muted-foreground">{nextHole.distance} yards</div>
                        <div className="text-sm text-muted-foreground">{selectedRound?.course?.name}</div>
                      </>
                    )
                  }
                  return null
                })()}
              </div>
            </CardContent>
          </Card>
        )}

      {!isReviewingPreviousHole && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={onContinueToNextHole}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 text-xl flex items-center justify-center gap-3"
          >
            <Flag className="w-6 h-6" />
            {currentHole < 18 ? `Tee Off Hole ${currentHole + 1}` : "Finish Round"}
          </Button>
        </div>
      )}
      </div>
    </div>
  )
}
