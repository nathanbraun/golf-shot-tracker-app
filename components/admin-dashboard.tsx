"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  Users,
  MapPin,
  Settings,
  Mail,
  Trophy,
  MapIcon,
  Loader2,
  DollarSign,
} from "lucide-react"
import {
  coursesApi,
  playersApi,
  type Course,
  type Player,
  roundsApi,
  teamsApi,
  type Round,
  type Team,
} from "@/lib/supabase"

interface AdminDashboardProps {
  onBack: () => void
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  // State for players
  const [players, setPlayers] = useState<Player[]>([])
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false)
  const [playerForm, setPlayerForm] = useState({
    name: "",
    email: "",
    rating: "",
    handicap: "",
    city: "",
  })

  // State for courses
  const [courses, setCourses] = useState<Course[]>([])
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false)
  const [courseForm, setCourseForm] = useState({
    name: "",
    location: "",
  })

  // State for rounds
  const [rounds, setRounds] = useState<Round[]>([])
  const [editingRound, setEditingRound] = useState<Round | null>(null)
  const [isRoundDialogOpen, setIsRoundDialogOpen] = useState(false)
  const [roundForm, setRoundForm] = useState({
    name: "",
    description: "",
    course_id: "",
    round_date: "",
    start_time: "",
    status: "upcoming" as const,
    money_per_skin: "",
  })

  // State for teams
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedRoundId, setSelectedRoundId] = useState<string>("")
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false)
  const [teamForm, setTeamForm] = useState({
    name: "",
    players: [] as { player_id: string; win_share: string }[],
  })

  // Loading states
  const [loading, setLoading] = useState(false)
  const [playersLoading, setPlayersLoading] = useState(true)
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [roundsLoading, setRoundsLoading] = useState(true)
  const [teamsLoading, setTeamsLoading] = useState(false)

  // Load data on mount
  useEffect(() => {
    loadPlayers()
    loadCourses()
    loadRounds()
  }, [])

  // Player functions
  const loadPlayers = async () => {
    setPlayersLoading(true)
    try {
      const data = await playersApi.getPlayers()
      setPlayers(data)
    } catch (error) {
      console.error("Error loading players:", error)
    }
    setPlayersLoading(false)
  }

  const handlePlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const playerData = {
        name: playerForm.name,
        email: playerForm.email || undefined,
        rating: playerForm.rating ? Number.parseFloat(playerForm.rating) : undefined,
        handicap: playerForm.handicap ? Number.parseFloat(playerForm.handicap) : undefined,
        city: playerForm.city || undefined,
      }

      if (editingPlayer) {
        await playersApi.updatePlayer(editingPlayer.id, playerData)
      } else {
        await playersApi.createPlayer(playerData)
      }

      await loadPlayers()
      setIsPlayerDialogOpen(false)
      resetPlayerForm()
    } catch (error) {
      console.error("Error saving player:", error)
    }
    setLoading(false)
  }

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player)
    setPlayerForm({
      name: player.name,
      email: player.email || "",
      rating: player.rating?.toString() || "",
      handicap: player.handicap?.toString() || "",
      city: player.city || "",
    })
    setIsPlayerDialogOpen(true)
  }

  const handleDeletePlayer = async (id: string) => {
    setLoading(true)
    try {
      await playersApi.deletePlayer(id)
      await loadPlayers()
    } catch (error) {
      console.error("Error deleting player:", error)
    }
    setLoading(false)
  }

  const resetPlayerForm = () => {
    setEditingPlayer(null)
    setPlayerForm({
      name: "",
      email: "",
      rating: "",
      handicap: "",
      city: "",
    })
  }

  // Course functions
  const loadCourses = async () => {
    setCoursesLoading(true)
    try {
      const data = await coursesApi.getCourses()
      setCourses(data)
    } catch (error) {
      console.error("Error loading courses:", error)
    }
    setCoursesLoading(false)
  }

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingCourse) {
        await coursesApi.updateCourse(editingCourse.id, courseForm.name, courseForm.location || undefined)
      } else {
        await coursesApi.createCourse(courseForm.name, courseForm.location || undefined)
      }

      await loadCourses()
      setIsCourseDialogOpen(false)
      resetCourseForm()
    } catch (error) {
      console.error("Error saving course:", error)
    }
    setLoading(false)
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setCourseForm({
      name: course.name,
      location: course.location || "",
    })
    setIsCourseDialogOpen(true)
  }

  const handleDeleteCourse = async (id: string) => {
    setLoading(true)
    try {
      await coursesApi.deleteCourse(id)
      await loadCourses()
    } catch (error) {
      console.error("Error deleting course:", error)
    }
    setLoading(false)
  }

  const resetCourseForm = () => {
    setEditingCourse(null)
    setCourseForm({
      name: "",
      location: "",
    })
  }

  // Round functions
  const loadRounds = async () => {
    setRoundsLoading(true)
    try {
      const data = await roundsApi.getRounds()
      setRounds(data)
    } catch (error) {
      console.error("Error loading rounds:", error)
    }
    setRoundsLoading(false)
  }

  const handleRoundSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const roundData = {
        name: roundForm.name,
        description: roundForm.description || undefined,
        course_id: roundForm.course_id,
        round_date: roundForm.round_date,
        start_time: roundForm.start_time || undefined,
        status: roundForm.status,
        money_per_skin: roundForm.money_per_skin ? Number.parseFloat(roundForm.money_per_skin) : undefined,
      }

      if (editingRound) {
        await roundsApi.updateRound(editingRound.id, roundData)
      } else {
        await roundsApi.createRound(roundData)
      }

      await loadRounds()
      setIsRoundDialogOpen(false)
      resetRoundForm()
    } catch (error) {
      console.error("Error saving round:", error)
    }
    setLoading(false)
  }

  const handleEditRound = (round: Round) => {
    setEditingRound(round)
    setRoundForm({
      name: round.name,
      description: round.description || "",
      course_id: round.course_id,
      round_date: round.round_date,
      start_time: round.start_time || "",
      status: round.status,
      money_per_skin: round.money_per_skin?.toString() || "",
    })
    setIsRoundDialogOpen(true)
  }

  const handleDeleteRound = async (id: string) => {
    setLoading(true)
    try {
      await roundsApi.deleteRound(id)
      await loadRounds()
      // Clear teams if the deleted round was selected
      if (selectedRoundId === id) {
        setSelectedRoundId("")
        setTeams([])
      }
    } catch (error) {
      console.error("Error deleting round:", error)
    }
    setLoading(false)
  }

  const resetRoundForm = () => {
    setEditingRound(null)
    setRoundForm({
      name: "",
      description: "",
      course_id: "",
      round_date: "",
      start_time: "",
      status: "upcoming",
      money_per_skin: "",
    })
  }

  // Team functions
  const loadTeams = async (roundId: string) => {
    setTeamsLoading(true)
    try {
      const data = await teamsApi.getTeamsByRound(roundId)
      setTeams(data)
    } catch (error) {
      console.error("Error loading teams:", error)
    }
    setTeamsLoading(false)
  }

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoundId) return

    setLoading(true)

    try {
      const teamData = {
        round_id: selectedRoundId,
        name: teamForm.name,
      }

      let teamId: string
      if (editingTeam) {
        const updatedTeam = await teamsApi.updateTeam(editingTeam.id, { name: teamForm.name })
        teamId = updatedTeam.id
      } else {
        const newTeam = await teamsApi.createTeam(teamData)
        teamId = newTeam.id
      }

      // Update team players
      if (editingTeam) {
        // Remove all existing players
        const existingPlayers = await teamsApi.getTeamPlayers(teamId)
        for (const tp of existingPlayers) {
          await teamsApi.removePlayerFromTeam(teamId, tp.player_id)
        }
      }

      // Add selected players
      for (const player of teamForm.players) {
        const winShareValue = Number.parseFloat(player.win_share) || 1.0
        await teamsApi.addPlayerToTeam(teamId, player.player_id, winShareValue)
      }

      await loadTeams(selectedRoundId)
      setIsTeamDialogOpen(false)
      resetTeamForm()
    } catch (error) {
      console.error("Error saving team:", error)
    }
    setLoading(false)
  }

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team)
    setTeamForm({
      name: team.name,
      players:
        team.players?.map((p) => ({
          player_id: p.id,
          win_share: p.win_share?.toString() || "1.0",
        })) || [],
    })
    setIsTeamDialogOpen(true)
  }

  const handleDeleteTeam = async (id: string) => {
    setLoading(true)
    try {
      await teamsApi.deleteTeam(id)
      await loadTeams(selectedRoundId)
    } catch (error) {
      console.error("Error deleting team:", error)
    }
    setLoading(false)
  }

  const resetTeamForm = () => {
    setEditingTeam(null)
    setTeamForm({
      name: "",
      players: [],
    })
  }

  const handleRoundSelect = (roundId: string) => {
    setSelectedRoundId(roundId)
    if (roundId) {
      loadTeams(roundId)
    } else {
      setTeams([])
    }
  }

  const togglePlayerInTeam = (playerId: string) => {
    setTeamForm((prev) => {
      const playerExists = prev.players.some((p) => p.player_id === playerId)
      const newPlayers = playerExists
        ? prev.players.filter((p) => p.player_id !== playerId)
        : [...prev.players, { player_id: playerId, win_share: "1.0" }]

      const selectedPlayerNames = newPlayers
        .map((p) => players.find((pl) => pl.id === p.player_id)?.name)
        .filter(Boolean)
        .sort()
        .join("/")

      return {
        ...prev,
        players: newPlayers,
        name: selectedPlayerNames || prev.name,
      }
    })
  }

  const handleWinShareChange = (playerId: string, value: string) => {
    setTeamForm((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.player_id === playerId ? { ...p, win_share: value } : p)),
    }))
  }

  return (
    <div className="min-h-screen bg-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={onBack} className="flex items-center gap-2 bg-transparent">
                <ArrowLeft className="w-4 h-4" />
                Back to App
              </Button>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Settings className="w-6 h-6" />
                Admin Dashboard
              </CardTitle>
              <div className="w-20" /> {/* Spacer */}
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="players" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="players" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Players
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="rounds" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Rounds
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Teams
            </TabsTrigger>
          </TabsList>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Players ({players.length})
                  </CardTitle>
                  <Dialog open={isPlayerDialogOpen} onOpenChange={setIsPlayerDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetPlayerForm} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Player
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingPlayer ? "Edit Player" : "Add New Player"}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handlePlayerSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="playerName">Name *</Label>
                          <Input
                            id="playerName"
                            value={playerForm.name}
                            onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                            placeholder="Player name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="playerEmail">Email</Label>
                          <Input
                            id="playerEmail"
                            type="email"
                            value={playerForm.email}
                            onChange={(e) => setPlayerForm({ ...playerForm, email: e.target.value })}
                            placeholder="player@example.com"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="playerRating">Rating</Label>
                            <Input
                              id="playerRating"
                              type="number"
                              step="0.1"
                              min="0"
                              max="50"
                              value={playerForm.rating}
                              onChange={(e) => setPlayerForm({ ...playerForm, rating: e.target.value })}
                              placeholder="15.2"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="playerHandicap">Handicap</Label>
                            <Input
                              id="playerHandicap"
                              type="number"
                              step="0.1"
                              min="-10"
                              max="54"
                              value={playerForm.handicap}
                              onChange={(e) => setPlayerForm({ ...playerForm, handicap: e.target.value })}
                              placeholder="14.8"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="playerCity">City</Label>
                          <Input
                            id="playerCity"
                            value={playerForm.city}
                            onChange={(e) => setPlayerForm({ ...playerForm, city: e.target.value })}
                            placeholder="Milwaukee, WI"
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button type="submit" disabled={loading || !playerForm.name} className="flex-1">
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            {editingPlayer ? "Update" : "Create"} Player
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setIsPlayerDialogOpen(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {playersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading players...
                  </div>
                ) : players.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No players found</p>
                    <p className="text-sm">Add your first player to get started</p>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {players.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium">{player.name}</h3>
                              {player.email && (
                                <Badge variant="outline" className="text-xs">
                                  <Mail className="w-3 h-3 mr-1" />
                                  {player.email}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                              {player.rating && (
                                <span className="text-sm text-muted-foreground">Rating: {player.rating}</span>
                              )}
                              {player.handicap && (
                                <Badge variant="secondary" className="text-xs">
                                  <Trophy className="w-3 h-3 mr-1" />
                                  {player.handicap} HCP
                                </Badge>
                              )}
                              {player.city && (
                                <span className="text-sm text-muted-foreground">
                                  <MapIcon className="w-3 h-3 inline mr-1" />
                                  {player.city}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Created: {new Date(player.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditPlayer(player)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 bg-transparent"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Player</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {player.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePlayer(player.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Courses ({courses.length})
                  </CardTitle>
                  <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetCourseForm} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Course
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCourseSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="courseName">Course Name *</Label>
                          <Input
                            id="courseName"
                            value={courseForm.name}
                            onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                            placeholder="Pebble Beach Golf Links"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="courseLocation">Location</Label>
                          <Input
                            id="courseLocation"
                            value={courseForm.location}
                            onChange={(e) => setCourseForm({ ...courseForm, location: e.target.value })}
                            placeholder="Pebble Beach, CA"
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button type="submit" disabled={loading || !courseForm.name} className="flex-1">
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            {editingCourse ? "Update" : "Create"} Course
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setIsCourseDialogOpen(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {coursesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading courses...
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No courses found</p>
                    <p className="text-sm">Add your first course to get started</p>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {courses.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <h3 className="font-medium">{course.name}</h3>
                            {course.location && (
                              <div className="text-sm text-muted-foreground mt-1">
                                <MapIcon className="w-3 h-3 inline mr-1" />
                                {course.location}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">
                              Created: {new Date(course.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditCourse(course)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 bg-transparent"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Course</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {course.name}? This will also delete all associated
                                    hole data. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteCourse(course.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rounds Tab */}
          <TabsContent value="rounds" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Rounds ({rounds.length})
                  </CardTitle>
                  <Dialog open={isRoundDialogOpen} onOpenChange={setIsRoundDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetRoundForm} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Round
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{editingRound ? "Edit Round" : "Add New Round"}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleRoundSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="roundName">Round Name *</Label>
                          <Input
                            id="roundName"
                            value={roundForm.name}
                            onChange={(e) => setRoundForm({ ...roundForm, name: e.target.value })}
                            placeholder="Weekly Scramble - January 2025"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="roundDescription">Description</Label>
                          <Input
                            id="roundDescription"
                            value={roundForm.description}
                            onChange={(e) => setRoundForm({ ...roundForm, description: e.target.value })}
                            placeholder="Regular weekly scramble tournament"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="courseSelect">Course *</Label>
                          <select
                            id="courseSelect"
                            value={roundForm.course_id}
                            onChange={(e) => setRoundForm({ ...roundForm, course_id: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          >
                            <option value="">Select a course</option>
                            {courses.map((course) => (
                              <option key={course.id} value={course.id}>
                                {course.name} {course.location && `- ${course.location}`}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="roundDate">Date *</Label>
                            <Input
                              id="roundDate"
                              type="date"
                              value={roundForm.round_date}
                              onChange={(e) => setRoundForm({ ...roundForm, round_date: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                              id="startTime"
                              type="time"
                              value={roundForm.start_time}
                              onChange={(e) => setRoundForm({ ...roundForm, start_time: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                              id="status"
                              value={roundForm.status}
                              onChange={(e) => setRoundForm({ ...roundForm, status: e.target.value as any })}
                              className="w-full p-2 border border-gray-300 rounded-md"
                            >
                              <option value="upcoming">Upcoming</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="moneyPerSkin">Money per Skin ($)</Label>
                            <Input
                              id="moneyPerSkin"
                              type="number"
                              step="0.01"
                              min="0"
                              value={roundForm.money_per_skin}
                              onChange={(e) => setRoundForm({ ...roundForm, money_per_skin: e.target.value })}
                              placeholder="5.00"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button
                            type="submit"
                            disabled={loading || !roundForm.name || !roundForm.course_id || !roundForm.round_date}
                            className="flex-1"
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            {editingRound ? "Update" : "Create"} Round
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setIsRoundDialogOpen(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {roundsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading rounds...
                  </div>
                ) : rounds.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No rounds found</p>
                    <p className="text-sm">Add your first round to get started</p>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {rounds.map((round) => (
                        <div
                          key={round.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium">{round.name}</h3>
                              <Badge
                                variant={
                                  round.status === "completed"
                                    ? "default"
                                    : round.status === "in_progress"
                                      ? "secondary"
                                      : "outline"
                                }
                                className={
                                  round.status === "completed"
                                    ? "bg-green-600"
                                    : round.status === "in_progress"
                                      ? "bg-blue-600"
                                      : round.status === "cancelled"
                                        ? "bg-red-600"
                                        : ""
                                }
                              >
                                {round.status.replace("_", " ")}
                              </Badge>
                              {round.money_per_skin && (
                                <Badge variant="outline" className="text-xs">
                                  <DollarSign className="w-3 h-3 mr-1" />${round.money_per_skin}/skin
                                </Badge>
                              )}
                            </div>
                            {round.description && (
                              <div className="text-sm text-muted-foreground mt-1">{round.description}</div>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-muted-foreground">
                                📅 {new Date(round.round_date).toLocaleDateString()}
                              </span>
                              {round.start_time && (
                                <span className="text-sm text-muted-foreground">🕐 {round.start_time}</span>
                              )}
                              {round.course && (
                                <span className="text-sm text-muted-foreground">
                                  <MapIcon className="w-3 h-3 inline mr-1" />
                                  {round.course.name}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Created: {new Date(round.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditRound(round)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 bg-transparent"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Round</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{round.name}"? This will also delete all associated
                                    teams and cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteRound(round.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-4">
            {/* Round Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Select Round
                </CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={selectedRoundId}
                  onChange={(e) => handleRoundSelect(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a round to manage teams</option>
                  {rounds.map((round) => (
                    <option key={round.id} value={round.id}>
                      {round.name} - {new Date(round.round_date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Teams Management */}
            {selectedRoundId && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Teams ({teams.length})
                    </CardTitle>
                    <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={resetTeamForm} className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Add Team
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>{editingTeam ? "Edit Team" : "Add New Team"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleTeamSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="teamName">Team Name</Label>
                            <Input
                              id="teamName"
                              value={teamForm.name}
                              onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                              placeholder="Select players to auto-generate name"
                              className="bg-gray-50"
                            />
                            <div className="text-xs text-muted-foreground">
                              Team name will auto-update as you select players, or you can customize it manually
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Select Players</Label>
                            <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-2">
                              {players.map((player) => {
                                const teamPlayer = teamForm.players.find((p) => p.player_id === player.id)
                                const isSelected = !!teamPlayer

                                return (
                                  <div key={player.id} className="p-2 rounded-md transition-colors hover:bg-gray-50">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={`player-${player.id}`}
                                        checked={isSelected}
                                        onChange={() => togglePlayerInTeam(player.id)}
                                        className="rounded"
                                      />
                                      <label
                                        htmlFor={`player-${player.id}`}
                                        className="text-sm font-medium cursor-pointer flex-1"
                                      >
                                        {player.name}
                                        {player.handicap && (
                                          <span className="text-xs text-muted-foreground ml-2">
                                            ({player.handicap} HCP)
                                          </span>
                                        )}
                                      </label>
                                    </div>
                                    {isSelected && (
                                      <div className="pl-6 mt-2 space-y-1">
                                        <Label htmlFor={`win-share-${player.id}`} className="text-xs font-normal">
                                          Win Share
                                        </Label>
                                        <Input
                                          id={`win-share-${player.id}`}
                                          type="number"
                                          step="0.1"
                                          min="0"
                                          placeholder="1.0"
                                          value={teamPlayer.win_share}
                                          onChange={(e) => handleWinShareChange(player.id, e.target.value)}
                                          className="h-8"
                                        />
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Selected: {teamForm.players.length} players
                            </div>
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button type="submit" disabled={loading || !teamForm.name} className="flex-1">
                              {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <Save className="w-4 h-4 mr-2" />
                              )}
                              {editingTeam ? "Update" : "Create"} Team
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setIsTeamDialogOpen(false)}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {teamsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      Loading teams...
                    </div>
                  ) : teams.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No teams found for this round</p>
                      <p className="text-sm">Add your first team to get started</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {teams.map((team) => (
                          <div
                            key={team.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex-1">
                              <h3 className="font-medium">{team.name}</h3>
                              <div className="flex items-center gap-2 mt-2">
                                {team.players && team.players.length > 0 ? (
                                  team.players.map((player) => (
                                    <Badge key={player.id} variant="secondary" className="text-xs">
                                      {player.name}
                                      {player.handicap && ` (${player.handicap})`}
                                      {player.win_share != null && player.win_share !== 1.0 && (
                                        <span className="ml-1.5 font-mono bg-black/10 px-1.5 py-0.5 rounded">
                                          x{player.win_share}
                                        </span>
                                      )}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-sm text-muted-foreground">No players assigned</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {team.players?.length || 0} players
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditTeam(team)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 bg-transparent"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Team</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{team.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteTeam(team.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
