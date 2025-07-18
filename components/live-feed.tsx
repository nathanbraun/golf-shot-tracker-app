"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { RefreshCw, Trophy, Target, Users, Clock, TrendingUp, TrendingDown, Award } from "lucide-react"
import { holeCompletionsApi, type TeamHoleCompletion } from "@/lib/supabase"

interface LiveFeedProps {
  roundId: string
  currentTeamId?: string
}

interface SkinResult {
  holeNumber: number
  winningTeam: {
    id: string
    name: string
    score: number
    scoreToPar: number
  }
  skinsWon: number
  totalTeams: number
  carryoverHoles: number[]
}

interface TeamSkinsSummary {
  teamId: string
  teamName: string
  totalSkins: number
  skinsWon: SkinResult[]
}

export default function LiveFeed({ roundId, currentTeamId }: LiveFeedProps) {
  const [completions, setCompletions] = useState<TeamHoleCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const loadCompletions = async () => {
    try {
      setLoading(true)
      const data = await holeCompletionsApi.getCompletionsByRound(roundId)
      setCompletions(data)
      setLastRefresh(new Date())
    } catch (error) {
      console.error("Error loading completions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompletions()

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadCompletions, 30000)
    return () => clearInterval(interval)
  }, [roundId])

  const getScoreColor = (scoreToPar: number) => {
    if (scoreToPar <= -2) return "text-purple-600 bg-purple-50"
    if (scoreToPar === -1) return "text-green-600 bg-green-50"
    if (scoreToPar === 0) return "text-gray-600 bg-gray-50"
    if (scoreToPar === 1) return "text-yellow-600 bg-yellow-50"
    if (scoreToPar === 2) return "text-orange-600 bg-orange-50"
    return "text-red-600 bg-red-50"
  }

  const getScoreName = (scoreToPar: number, par: number) => {
    if (scoreToPar <= -3) return "Albatross"
    if (scoreToPar === -2) return "Eagle"
    if (scoreToPar === -1) return "Birdie"
    if (scoreToPar === 0) return "Par"
    if (scoreToPar === 1) return "Bogey"
    if (scoreToPar === 2) return "Double"
    return `+${scoreToPar}`
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const completedAt = new Date(date)
    const diffInMinutes = Math.floor((now.getTime() - completedAt.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours}h ${diffInMinutes % 60}m ago`
  }

  const calculateSkins = (): { skinResults: SkinResult[]; teamSkinsSummary: TeamSkinsSummary[] } => {
    // Group completions by hole
    const holeCompletionsMap = completions.reduce(
      (acc, completion) => {
        if (!acc[completion.hole_number]) {
          acc[completion.hole_number] = []
        }
        acc[completion.hole_number].push(completion)
        return acc
      },
      {} as Record<number, TeamHoleCompletion[]>,
    )

    // Get all unique teams in the round
    const allTeams = [...new Set(completions.map((c) => c.team_id))]
    const totalTeams = allTeams.length

    if (totalTeams === 0) {
      return { skinResults: [], teamSkinsSummary: [] }
    }

    const skinResults: SkinResult[] = []
    let carryoverSkins = 0 // Track skins that carry over from tied holes
    const carryoverHoles: number[] = [] // Track which holes contributed to carryover

    // Get all hole numbers that have been completed and sort them
    const completedHoles = Object.keys(holeCompletionsMap)
      .map(Number)
      .filter((holeNumber) => holeCompletionsMap[holeNumber].length === totalTeams)
      .sort((a, b) => a - b)

    // Process holes in order
    for (const holeNumber of completedHoles) {
      const holeCompletions = holeCompletionsMap[holeNumber]

      // Find the best score (lowest total shots)
      const bestScore = Math.min(...holeCompletions.map((c) => c.total_shots))
      const winners = holeCompletions.filter((c) => c.total_shots === bestScore)

      if (winners.length === 1) {
        // Clear winner - they get this hole's skins plus any carryover
        const winner = winners[0]
        const baseSkinsForHole = totalTeams - 1 // Base skins for this hole
        const totalSkinsWon = baseSkinsForHole + carryoverSkins

        skinResults.push({
          holeNumber,
          winningTeam: {
            id: winner.team_id,
            name: winner.team?.name || "Unknown Team",
            score: winner.total_shots,
            scoreToPar: winner.score_to_par,
          },
          skinsWon: totalSkinsWon,
          totalTeams,
          carryoverHoles: [...carryoverHoles], // Include holes that contributed to carryover
        })

        // Reset carryover tracking
        carryoverSkins = 0
        carryoverHoles.length = 0
      } else {
        // Tie - skins carry over to next hole
        carryoverSkins += totalTeams - 1
        carryoverHoles.push(holeNumber)
      }
    }

    // Calculate team skins summary
    const teamSkinsSummary: TeamSkinsSummary[] = allTeams
      .map((teamId) => {
        const team = completions.find((c) => c.team_id === teamId)?.team
        const teamSkins = skinResults.filter((skin) => skin.winningTeam.id === teamId)

        return {
          teamId,
          teamName: team?.name || "Unknown Team",
          totalSkins: teamSkins.reduce((sum, skin) => sum + skin.skinsWon, 0),
          skinsWon: teamSkins,
        }
      })
      .sort((a, b) => b.totalSkins - a.totalSkins)

    return { skinResults, teamSkinsSummary }
  }

  const getTeamStats = () => {
    const teamStats = completions.reduce(
      (acc, completion) => {
        const teamId = completion.team_id
        if (!acc[teamId]) {
          acc[teamId] = {
            team: completion.team,
            holesCompleted: 0,
            totalScore: 0,
            bestHole: null as TeamHoleCompletion | null,
            worstHole: null as TeamHoleCompletion | null,
          }
        }

        acc[teamId].holesCompleted++
        acc[teamId].totalScore += completion.score_to_par

        if (!acc[teamId].bestHole || completion.score_to_par < acc[teamId].bestHole!.score_to_par) {
          acc[teamId].bestHole = completion
        }

        if (!acc[teamId].worstHole || completion.score_to_par > acc[teamId].worstHole!.score_to_par) {
          acc[teamId].worstHole = completion
        }

        return acc
      },
      {} as Record<string, any>,
    )

    return Object.values(teamStats).sort((a: any, b: any) => {
      // Sort by total score, then by holes completed
      if (a.totalScore !== b.totalScore) return a.totalScore - b.totalScore
      return b.holesCompleted - a.holesCompleted
    })
  }

  const teamStats = getTeamStats()
  const { skinResults, teamSkinsSummary } = calculateSkins()

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5" />
              Live Leaderboard
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadCompletions}
              disabled={loading}
              className="flex items-center gap-2 bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">Last updated: {lastRefresh.toLocaleTimeString()}</div>
        </CardHeader>
      </Card>

      {/* Skins Leaderboard */}
      {teamSkinsSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5" />
              Skins Won
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamSkinsSummary.map((teamSkins, index) => (
                <div
                  key={teamSkins.teamId}
                  className={`p-3 rounded-lg border-2 ${
                    teamSkins.teamId === currentTeamId ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-300 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{teamSkins.teamName}</div>
                        <div className="text-sm text-muted-foreground">{teamSkins.skinsWon.length} holes won</div>
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
              ))}

              {teamSkinsSummary.every((team) => team.totalSkins === 0) && (
                <div className="text-center text-sm text-muted-foreground py-4">
                  No skins won yet. Complete holes to start earning skins!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Leaderboard */}
      {teamStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5" />
              Team Standings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamStats.map((team: any, index: number) => (
                <div
                  key={team.team?.id}
                  className={`p-3 rounded-lg border-2 ${
                    team.team?.id === currentTeamId ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-300 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{team.team?.name}</div>
                        <div className="text-sm text-muted-foreground">{team.holesCompleted} holes completed</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${team.totalScore <= 0 ? "text-green-600" : "text-red-600"}`}>
                        {team.totalScore > 0 ? `+${team.totalScore}` : team.totalScore}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Score</div>
                    </div>
                  </div>

                  {/* Best/Worst holes */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span>Best: Hole {team.bestHole?.hole_number}</span>
                      <Badge className={`text-xs ${getScoreColor(team.bestHole?.score_to_par || 0)}`}>
                        {getScoreName(team.bestHole?.score_to_par || 0, team.bestHole?.par || 4)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <TrendingDown className="w-3 h-3 text-red-600" />
                      <span>Worst: Hole {team.worstHole?.hole_number}</span>
                      <Badge className={`text-xs ${getScoreColor(team.worstHole?.score_to_par || 0)}`}>
                        {getScoreName(team.worstHole?.score_to_par || 0, team.worstHole?.par || 4)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-3">
              {completions.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No hole completions yet. Be the first to finish a hole!
                </div>
              ) : (
                completions.map((completion) => (
                  <div
                    key={completion.id}
                    className={`p-3 rounded-lg border ${
                      completion.team_id === currentTeamId ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                          {completion.hole_number}
                        </div>
                        <div>
                          <div className="font-semibold">{completion.team?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Par {completion.par} • {completion.total_shots} shots
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getScoreColor(completion.score_to_par)} border-0`}>
                          {getScoreName(completion.score_to_par, completion.par)}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(completion.completed_at)}
                        </div>
                      </div>
                    </div>

                    {/* Longest shot info */}
                    {completion.longest_shot_distance && completion.longest_shot_player && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Target className="w-3 h-3" />
                          <span>Longest shot: {completion.longest_shot_distance} yards</span>
                          <span>
                            ({completion.longest_shot_type} by {completion.longest_shot_player?.name})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
