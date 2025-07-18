"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Flag, Users, User, Calendar } from "lucide-react"
import type { Player, Round, Team } from "@/lib/supabase"

interface StartupScreenProps {
  players: Player[]
  rounds: Round[]
  teams: Team[]
  loading: boolean
  selectedRound: Round | null
  selectedTeam: Team | null
  selectedPlayer: Player | null
  onRoundSelect: (round: Round) => void
  onTeamSelect: (team: Team) => void
  onPlayerSelect: (player: Player) => void
  onStartTracking: () => void
}

export default function StartupScreen({
  players,
  rounds,
  teams,
  loading,
  selectedRound,
  selectedTeam,
  selectedPlayer,
  onRoundSelect,
  onTeamSelect,
  onPlayerSelect,
  onStartTracking,
}: StartupScreenProps) {
  const handleRoundChange = (roundId: string) => {
    const round = rounds.find((r) => r.id === roundId)
    if (round) {
      onRoundSelect(round)
    }
  }

  const handleTeamChange = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId)
    if (team) {
      onTeamSelect(team)
    }
  }

  const handlePlayerChange = (playerId: string) => {
    // Note: We need to find the player in the selected team's players list
    const player = selectedTeam?.players?.find((p) => p.id === playerId)
    if (player) {
      onPlayerSelect(player)
    }
  }

  const isStartDisabled = !selectedRound || !selectedTeam || !selectedPlayer

  return (
    <div className="min-h-screen bg-green-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 text-green-700">
              <Flag className="w-8 h-8" />
              <CardTitle className="text-2xl">Golf Scramble Tracker</CardTitle>
            </div>
            <p className="text-muted-foreground">Select your round to begin</p>
          </CardHeader>
          <CardContent className="space-y-8">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : (
              <>
                {/* Round Selection */}
                <div className="space-y-3">
                  <Label htmlFor="round-select" className="flex items-center gap-2 text-base font-medium">
                    <Calendar className="w-4 h-4" />
                    Select Round
                  </Label>
                  <Select onValueChange={handleRoundChange} value={selectedRound?.id}>
                    <SelectTrigger id="round-select" className="h-12 text-lg">
                      <SelectValue placeholder="Choose a round..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {rounds.map((round) => (
                        <SelectItem key={round.id} value={round.id} className="py-3 px-4 text-lg">
                          {round.name} ({round.course?.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Team Selection */}
                {selectedRound && (
                  <div className="space-y-3">
                    <Label htmlFor="team-select" className="flex items-center gap-2 text-base font-medium">
                      <Users className="w-4 h-4" />
                      Select Team
                    </Label>
                    <Select onValueChange={handleTeamChange} value={selectedTeam?.id} disabled={!teams.length}>
                      <SelectTrigger id="team-select" className="h-12 text-lg">
                        <SelectValue
                          placeholder={teams.length > 0 ? "Choose your team..." : "No teams for this round"}
                        />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id} className="py-3 px-4 text-lg">
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Player Selection */}
                {selectedTeam && (
                  <div className="space-y-3">
                    <Label htmlFor="player-select" className="flex items-center gap-2 text-base font-medium">
                      <User className="w-4 h-4" />
                      Select Player
                    </Label>
                    <Select
                      onValueChange={handlePlayerChange}
                      value={selectedPlayer?.id}
                      disabled={!selectedTeam.players?.length}
                    >
                      <SelectTrigger id="player-select" className="h-12 text-lg">
                        <SelectValue
                          placeholder={selectedTeam.players?.length ? "Who are you?" : "No players on this team"}
                        />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {selectedTeam.players?.map((player) => (
                          <SelectItem key={player.id} value={player.id} className="py-3 px-4 text-lg">
                            {player.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <Button
              onClick={onStartTracking}
              disabled={isStartDisabled || loading}
              className="w-full bg-green-600 hover:bg-green-700 text-lg"
              size="lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Start Tracking"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
