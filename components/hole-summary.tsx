"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Flag, BarChart3, Target, Users, MapPin, Trophy, TrendingUp } from "lucide-react"
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
}

interface HoleComparison {
  teamName: string
  totalShots: number
  scoreToPar: number
  scoreName: string
  scoreColor: string
}

interface LeaderboardEntry {
  teamName: string
  totalToPar: number
  completedHoles: number
  totalShots: number
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
}: HoleSummaryProps) {
  const [holeComparisons, setHoleComparisons] = useState<HoleComparison[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loadingLiveData, setLoadingLiveData] = useState(false)

  const currentHoleShots = shots.filter((shot) => shot.hole === currentHole)
  const scoreInfo = getScoreInfo(currentHole, currentPar)
  const totalScore = getTotalScore()

  // Calculate player contributions for this hole (excluding gimmes)
  const holePlayerStats = currentHoleShots.reduce(
    (acc, shot) => {
      if (shot.player !== "Team Gimme" && !shot.isGimme) {
        acc[shot.player] = (acc[shot.player] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const loadLiveData = async () => {
    if (!selectedRound || !selectedTeam) return

    setLoadingLiveData(true)
    try {
      // Get all hole completions for this round
      const allCompletions = await holeCompletionsApi.getCompletionsByRound(selectedRound.id)

      // Filter out our own team's data
      const otherTeamCompletions = allCompletions.filter((completion) => completion.team_id !== selectedTeam.id)

      // Get hole comparisons for the current hole
      const currentHoleCompletions = otherTeamCompletions.filter((completion) => completion.hole_number === currentHole)

      const comparisons: HoleComparison[] = currentHoleCompletions.map((completion) => {
        const scoreToPar = completion.score_to_par
        let scoreName = "",
          scoreColor = ""

        if (scoreToPar <= -3) {
          scoreName = "Albatross"
          scoreColor = "text-purple-600"
        } else if (scoreToPar === -2) {
          scoreName = "Eagle"
          scoreColor = "text-blue-600"
        } else if (scoreToPar === -1) {
          scoreName = "Birdie"
          scoreColor = "text-green-600"
        } else if (scoreToPar === 0) {
          scoreName = "Par"
          scoreColor = "text-gray-600"
        } else if (scoreToPar === 1) {
          scoreName = "Bogey"
          scoreColor = "text-yellow-600"
        } else if (scoreToPar === 2) {
          scoreName = "Double Bogey"
          scoreColor = "text-orange-600"
        } else {
          scoreName = `+${scoreToPar}`
          scoreColor = "text-red-600"
        }

        return {
          teamName: completion.team?.name || "Unknown Team",
          totalShots: completion.total_shots,
          scoreToPar,
          scoreName,
          scoreColor,
        }
      })

      // Sort by performance (best scores first)
      comparisons.sort((a, b) => a.scoreToPar - b.scoreToPar)
      setHoleComparisons(comparisons)

      // Calculate leaderboard
      const teamTotals = new Map<string, { totalToPar: number; completedHoles: number; totalShots: number }>()

      otherTeamCompletions.forEach((completion) => {
        const teamName = completion.team?.name || "Unknown Team"
        const existing = teamTotals.get(teamName) || { totalToPar: 0, completedHoles: 0, totalShots: 0 }

        teamTotals.set(teamName, {
          totalToPar: existing.totalToPar + completion.score_to_par,
          completedHoles: existing.completedHoles + 1,
          totalShots: existing.totalShots + completion.total_shots,
        })
      })

      const leaderboardData: LeaderboardEntry[] = Array.from(teamTotals.entries()).map(([teamName, data]) => ({
        teamName,
        ...data,
      }))

      // Sort by total score (best first), then by holes completed
      leaderboardData.sort((a, b) => {
        if (a.totalToPar !== b.totalToPar) return a.totalToPar - b.totalToPar
        return b.completedHoles - a.completedHoles
      })

      setLeaderboard(leaderboardData.slice(0, 5)) // Top 5 teams
    } catch (error) {
      console.error("Error loading live data:", error)
    } finally {
      setLoadingLiveData(false)
    }
  }

  useEffect(() => {
    loadLiveData()
  }, [selectedRound, selectedTeam, currentHole])

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
                <div className="text-sm text-muted-foreground">Holes Complete</div>
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

        {/* Player Contributions */}
        {Object.keys(holePlayerStats).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5" />
                Player Contributions - Hole {currentHole}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(holePlayerStats)
                  .sort(([, a], [, b]) => b - a)
                  .map(([player, count], index) => {
                    const maxShots = Math.max(...Object.values(holePlayerStats))
                    const barWidth = (count / maxShots) * 100
                    const colors = ["bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500"]
                    const percentage = Math.round(
                      (count / currentHoleShots.filter((s) => s.player !== "Team Gimme" && !s.isGimme).length) * 100,
                    )
                    return (
                      <div key={player} className="flex items-center gap-2">
                        <div className="w-16 text-sm font-medium text-right">{player}:</div>
                        <div className="flex-1 relative">
                          <div className="w-full bg-gray-200 rounded-full h-6 flex items-center">
                            <div
                              className={`h-6 rounded-full ${colors[index % colors.length]} flex items-center justify-end pr-2`}
                              style={{ width: `${barWidth}%` }}
                            >
                              <span className="text-white text-sm font-medium">{count}</span>
                            </div>
                          </div>
                        </div>
                        <div className="w-10 text-sm text-muted-foreground">{percentage}%</div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Live Feed - Hole Comparison */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5" />
                Hole {currentHole} - Other Teams
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
            {holeComparisons.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                {loadingLiveData ? "Loading other teams..." : "No other teams have completed this hole yet"}
              </div>
            ) : (
              <div className="space-y-2">
                {holeComparisons.map((comparison, index) => (
                  <div key={comparison.teamName} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium text-sm">{comparison.teamName}</span>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium text-sm ${comparison.scoreColor}`}>{comparison.scoreName}</div>
                      <div className="text-xs text-muted-foreground">{comparison.totalShots} shots</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Feed - Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5" />
              Tournament Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                {loadingLiveData ? "Loading leaderboard..." : "No other teams have completed holes yet"}
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div key={entry.teamName} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant={index === 0 ? "default" : "outline"} className="text-xs">
                        #{index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium text-sm">{entry.teamName}</div>
                        <div className="text-xs text-muted-foreground">{entry.completedHoles} holes</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-medium text-sm ${entry.totalToPar <= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {entry.totalToPar > 0 ? `+${entry.totalToPar}` : entry.totalToPar}
                      </div>
                      <div className="text-xs text-muted-foreground">{entry.totalShots} shots</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Hole Preview */}
        {currentHole < 18 && courseHoles.length > 0 && (
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

        {/* Continue Button */}
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
      </div>
    </div>
  )
}
