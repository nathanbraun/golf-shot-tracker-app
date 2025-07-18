"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Flag,
  Target,
  Users,
  History,
  BarChart3,
  ArrowLeft,
  MapPin,
  Edit,
  Trash2,
  Save,
  Play,
  Loader2,
  Bug,
  Trophy,
} from "lucide-react"
import SummaryPage from "@/components/summary-page"
import CourseManager from "@/components/course-manager"
import LiveFeed from "@/components/live-feed"
import type { useShotTracking } from "@/hooks/use-shot-tracking"

// Declare SHOT_TYPES and EMOJI_TAGS variables
const SHOT_TYPES = ["Drive", "Approach", "Chip", "Putt", "Sand", "Recovery"]
const EMOJI_TAGS = ["💦", "🛟"]

// The interface now receives all props from the hook
export default function ShotTrackingInterface(props: ReturnType<typeof useShotTracking>) {
  const {
    selectedPlayer,
    selectedTeam,
    selectedRound,
    courseHoles,
    loadingCourseData,
    currentView,
    currentDistance,
    selectedPlayerName,
    selectedShotType,
    shots,
    lastDistance,
    isRecordingShot,
    showSplashScreen,
    currentHole,
    currentPar,
    currentShotNumber,
    distanceUnit,
    useSlider,
    isNut,
    isClutch,
    showMoreOptions,
    showHoleSummary,
    editingShot,
    editStartDistance,
    editEndDistance,
    isSyncing,
    setCurrentView,
    setCurrentDistance,
    setSelectedPlayerName,
    setShotType,
    setDistanceUnit,
    setUseSlider,
    setShowMoreOptions,
    setEditStartDistance,
    setEditEndDistance,
    handleBackToSetup,
    getIntelligentUnit,
    getSliderRange,
    toggleEmojiTag,
    getEmojiState,
    handleShotTypeChange,
    handleStartShot,
    handleContinueFromSplash,
    handleRecordShot,
    handleContinueToNextHole,
    handlePreviousHole,
    handleSelectCourse,
    handleEditShot,
    handleSaveEditedShot,
    handleDeleteShot,
    formatDistance,
    getDistanceColor,
    getScoreInfo,
    getTotalScore,
  } = props

  if (currentView === "courses") {
    return (
      <div className="min-h-screen bg-green-50 p-4">
        <div className="max-w-md mx-auto">
          <CourseManager
            onBack={() => setCurrentView("tracking")}
            onSelectCourse={handleSelectCourse}
            selectedCourse={null}
          />
        </div>
      </div>
    )
  }

  if (currentView === "summary") {
    return (
      <div className="min-h-screen bg-green-50 p-4">
        <div className="max-w-md mx-auto space-y-4">
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentView("tracking")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <BarChart3 className="w-6 h-6" />
                  Round Analysis
                </CardTitle>
                <div className="w-16" />
              </div>
            </CardHeader>
          </Card>
          <SummaryPage shots={shots} />
        </div>
      </div>
    )
  }

  if (currentView === "feed") {
    return (
      <div className="min-h-screen bg-green-50 p-4">
        <div className="max-w-md mx-auto space-y-4">
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentView("tracking")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Trophy className="w-6 h-6" />
                  Live Feed
                </CardTitle>
                <div className="w-16" />
              </div>
            </CardHeader>
          </Card>
          {selectedRound && <LiveFeed roundId={selectedRound.id} currentTeamId={selectedTeam?.id} />}
        </div>
      </div>
    )
  }

  if (currentView === "shot-edit" && editingShot) {
    const PLAYERS = selectedTeam?.players?.map((p) => p.name) || ["Brusda", "Nate", "Mikey", "Strauss"]
    return (
      <div className="min-h-screen bg-green-50 p-4">
        <div className="max-w-md mx-auto space-y-4">
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentView("tracking")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Edit className="w-6 h-6" />
                  Edit Shot
                </CardTitle>
                <div className="w-16" />
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Hole {editingShot.hole} (Par {editingShot.par}) • Shot {editingShot.shotNumber}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Player</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PLAYERS.map((player) => (
                    <Button
                      key={player}
                      variant={selectedPlayerName === player ? "default" : "outline"}
                      onClick={() => setSelectedPlayerName(player)}
                      className="h-12"
                    >
                      {player}
                    </Button>
                  ))}
                  <Button
                    variant={selectedPlayerName === "Team Gimme" ? "default" : "outline"}
                    onClick={() => setSelectedPlayerName("Team Gimme")}
                    className="h-12 col-span-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  >
                    🤝 Team Gimme
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Shot Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {SHOT_TYPES.map((type) => (
                    <Button
                      key={type}
                      variant={selectedShotType === type ? "default" : "outline"}
                      onClick={() => setShotType(type)}
                      size="sm"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDistance">Start Distance</Label>
                  <Input
                    id="startDistance"
                    type="number"
                    placeholder="Start distance"
                    value={editStartDistance}
                    onChange={(e) => setEditStartDistance(e.target.value)}
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDistance">End Distance</Label>
                  <Input
                    id="endDistance"
                    type="number"
                    placeholder="End distance"
                    value={editEndDistance}
                    onChange={(e) => setEditEndDistance(e.target.value)}
                    className="text-lg"
                  />
                </div>
              </div>
              {editStartDistance && editEndDistance && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Shot Distance:</strong>{" "}
                    {Number.parseInt(editStartDistance) - Number.parseInt(editEndDistance)}{" "}
                    {Number.parseInt(editStartDistance) >= 100 ? "yards" : "ft"}
                  </p>
                </div>
              )}
              {editingShot && editStartDistance && editEndDistance && (
                <>
                  {(() => {
                    const nextShot = shots.find(
                      (shot) => shot.hole === editingShot.hole && shot.shotNumber === editingShot.shotNumber + 1,
                    )
                    if (nextShot) {
                      return (
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm text-yellow-700">
                            <strong>Note:</strong> Shot {nextShot.shotNumber} will be updated to start from{" "}
                            {editEndDistance} {Number.parseInt(editEndDistance) >= 100 ? "yards" : "ft"}
                          </p>
                        </div>
                      )
                    }
                    return null
                  })()}
                </>
              )}
              <div className="space-y-2">
                <Label>Tag this shot</Label>
                <div className="flex gap-2 justify-center flex-wrap">
                  {EMOJI_TAGS.map((emoji) => (
                    <Button
                      key={emoji}
                      variant={getEmojiState(emoji) ? "default" : "outline"}
                      onClick={() => toggleEmojiTag(emoji)}
                      className="text-2xl h-12 w-12 p-0"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
                {(isNut || isClutch) && (
                  <div className="text-center text-sm text-muted-foreground">
                    Selected: {isNut && "💦"}
                    {isClutch && "🛟"}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleSaveEditedShot}
                  disabled={!selectedPlayerName || !selectedShotType || !editStartDistance || !editEndDistance}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
                <Button
                  onClick={handleDeleteShot}
                  variant="outline"
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 flex items-center gap-2 bg-transparent"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Shot
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (showSplashScreen) {
    return (
      <div className="min-h-screen bg-green-50 p-4">
        <div className="max-w-md mx-auto space-y-4">
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToSetup}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Setup
                </Button>
                <CardTitle className="flex items-center justify-center gap-2 text-green-700">
                  <Flag className="w-6 h-6" />
                  Golf Scramble Tracker
                </CardTitle>
                <div className="w-16" />
              </div>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="py-4">
              <div className="text-center">
                <div className="text-2xl font-bold">Hole {currentHole}</div>
                <div className="text-green-100 text-sm">
                  Par {currentPar} • Shot {currentShotNumber}
                  {lastDistance && <span className="ml-2">• {formatDistance(lastDistance)} remaining</span>}
                </div>
                {selectedRound?.course && (
                  <div className="text-green-100 text-xs mt-1">{selectedRound.course.name}</div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-green-200">
            <CardContent className="py-12 text-center space-y-6">
              <div className="text-6xl animate-bounce">🏌️‍♂️</div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-green-700">Players are hitting their shots...</h2>
                <p className="text-lg font-semibold text-green-600">
                  Hole {currentHole} • Shot {currentShotNumber}
                </p>
                <p className="text-green-600">
                  {currentShotNumber === 1 ? (
                    <>
                      Starting from <strong>{formatDistance(lastDistance!)}</strong>
                    </>
                  ) : (
                    <>
                      <strong>{formatDistance(lastDistance!)} out</strong>
                    </>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  Wait for all players to complete their shots, then select the best one and continue.
                </p>
              </div>
              <div className="flex justify-center space-x-2 pt-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div
                  className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={handleContinueFromSplash}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Continue to Record Shot
                </Button>
              </div>
            </CardContent>
          </Card>
          {shots.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <History className="w-5 h-5" />
                  Recent Shots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {shots.slice(0, 3).map((shot) => (
                    <div key={shot.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          H{shot.hole}-{shot.shotNumber}
                        </Badge>
                        <span className="font-medium">{shot.player}</span>
                        <span className="text-muted-foreground">{shot.shotType}</span>
                      </div>
                      <Badge className={`text-white ${getDistanceColor(shot.calculatedDistance)}`}>
                        {formatDistance(shot.calculatedDistance)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  if (showHoleSummary) {
    const currentHoleShots = shots.filter((shot) => shot.hole === currentHole)
    const scoreInfo = getScoreInfo(currentHole, currentPar)
    const totalScore = getTotalScore()
    const holePlayerStats = currentHoleShots.reduce(
      (acc, shot) => {
        if (shot.player !== "Team Gimme" && !shot.isGimme) {
          acc[shot.player] = (acc[shot.player] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )
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
          <Card className="bg-gradient-to-r from-blue-500 to-green-500 text-white border-2 border-blue-400">
            <CardContent className="py-6">
              <div className="text-center">
                <div className="text-3xl font-bold">🏌️ Hole {currentHole} Complete!</div>
                <div className="text-blue-100 text-lg mt-2">
                  Par {currentPar} • {currentHoleShots.length} shots
                </div>
                {scoreInfo && (
                  <div className={`text-xl font-bold mt-2 ${scoreInfo.scoreColor.replace("text-", "text-white")}`}>
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
                  <div
                    className={`text-2xl font-bold ${totalScore.totalToPar <= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {totalScore.totalToPar > 0 ? `+${totalScore.totalToPar}` : totalScore.totalToPar}
                  </div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
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
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleContinueToNextHole}
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

  const totalScore = getTotalScore()
  const PLAYERS = selectedTeam?.players?.map((p) => p.name) || ["Brusda", "Nate", "Mikey", "Strauss"]

  return (
    <div className="min-h-screen bg-green-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-center mb-3">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Flag className="w-5 h-5" />
                Golf Scramble Tracker
              </CardTitle>
            </div>

            {/* Main round info */}
            {selectedRound && (
              <div className="text-center space-y-2">
                <div className="text-lg font-semibold text-gray-800">{selectedRound.name}</div>
                {selectedRound.course && (
                  <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedRound.course.name}
                  </div>
                )}

                {/* Team and player info */}
                {selectedTeam && selectedPlayer && (
                  <div className="text-sm text-muted-foreground">
                    {selectedPlayer.name} • {selectedTeam.name}
                  </div>
                )}
              </div>
            )}

            {/* Current hole status */}
            <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">Hole {currentHole}</div>
                <div className="text-xs text-muted-foreground">Par {currentPar}</div>
              </div>

              {totalScore.completedHoles > 0 && (
                <>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <div className="text-center">
                    <div
                      className={`text-lg font-bold ${totalScore.totalToPar <= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {totalScore.totalToPar > 0 ? `+${totalScore.totalToPar}` : totalScore.totalToPar}
                    </div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </>
              )}

              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {isRecordingShot ? currentShotNumber : currentShotNumber}
                </div>
                <div className="text-xs text-muted-foreground">Shot</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-200">
              <Button
                onClick={handleBackToSetup}
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2 bg-transparent"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Setup
              </Button>

              <Button onClick={() => setCurrentView("feed")} variant="outline" size="sm" className="text-xs h-7 px-2">
                <Trophy className="w-3 h-3 mr-1" />
                Live
              </Button>

              {shots.length > 0 && (
                <Button
                  onClick={() => setCurrentView("summary")}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 px-2"
                >
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Stats
                </Button>
              )}

              {isSyncing && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Syncing...
                </div>
              )}
            </div>

            {loadingCourseData && (
              <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading course data...
              </div>
            )}
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="py-4">
            <div className="text-center">
              <div className="text-2xl font-bold">Hole {currentHole}</div>
              <div className="text-green-100 text-sm">
                Par {currentPar} • Shot {isRecordingShot ? currentShotNumber : currentShotNumber}
                {lastDistance && <span className="ml-2">• {formatDistance(lastDistance)} remaining</span>}
              </div>
              {selectedRound?.course && <div className="text-green-100 text-xs mt-1">{selectedRound.course.name}</div>}
            </div>
          </CardContent>
        </Card>

        {/* Round completion banner */}
        {currentHole === 18 && shots.filter((shot) => shot.hole === 18).length > 0 && (
          <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-2 border-yellow-400">
            <CardContent className="py-4">
              <div className="text-center">
                <div className="text-2xl font-bold">🏆 Round Complete!</div>
                <div className="text-yellow-100 text-sm">18 holes finished • {shots.length} total shots</div>
                <div className="text-yellow-100 text-xs mt-1">Check the live feed to see how you compare!</div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5" />
              {isRecordingShot ? "What happened?" : "Distance to hole"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isRecordingShot && (
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handlePreviousHole}
                    variant="outline"
                    size="sm"
                    className="text-sm bg-transparent"
                    disabled={currentHole <= 1}
                  >
                    ← Previous Hole
                  </Button>
                  <Button
                    onClick={handleContinueToNextHole}
                    variant="outline"
                    size="sm"
                    className="text-sm bg-transparent"
                    disabled={currentHole >= 18}
                  >
                    Next Hole →
                  </Button>
                </div>
              </div>
            )}
            {isRecordingShot ? (
              <>
                <p className="text-sm text-blue-700">
                  <strong>
                    Hole {currentHole} (Par {currentPar}) • Shot {currentShotNumber}
                  </strong>{" "}
                  •{" "}
                  {currentShotNumber === 1 ? (
                    <>
                      Started from: <strong>{formatDistance(lastDistance!)}</strong>
                    </>
                  ) : (
                    <>
                      <strong>{formatDistance(lastDistance!)} out</strong>
                    </>
                  )}
                </p>
                <div className="space-y-2">
                  <Label>Whose shot did the team use?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PLAYERS.map((player) => (
                      <Button
                        key={player}
                        variant={selectedPlayerName === player ? "default" : "outline"}
                        onClick={() => setSelectedPlayerName(player)}
                        className="h-12"
                      >
                        {player}
                      </Button>
                    ))}
                    {(lastDistance || 0) <= 5 && distanceUnit === "feet" && selectedShotType === "Putt" && (
                      <Button
                        variant={selectedPlayerName === "Team Gimme" ? "default" : "outline"}
                        onClick={() => setSelectedPlayerName("Team Gimme")}
                        className="h-12 col-span-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                      >
                        🤝 Team Gimme
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Shot type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {SHOT_TYPES.map((type) => (
                      <Button
                        key={type}
                        variant={selectedShotType === type ? "default" : "outline"}
                        onClick={() => handleShotTypeChange(type)}
                        size="sm"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
                {lastDistance && lastDistance <= 30 && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="default"
                      onClick={() => handleRecordShot(true)}
                      disabled={!selectedPlayerName || !selectedShotType}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Hole Out! ⛳
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRecordShot(false, true)}
                      disabled={!selectedPlayerName || !selectedShotType}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      To Gimme 🤝
                    </Button>
                  </div>
                )}
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMoreOptions(!showMoreOptions)}
                    className="w-full text-sm text-muted-foreground hover:text-foreground"
                  >
                    {showMoreOptions ? "Less options ↑" : "More options ↓"}
                  </Button>
                  {showMoreOptions && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-2">
                        <Label>Tag this shot (optional)</Label>
                        <div className="flex gap-2 justify-center flex-wrap">
                          {EMOJI_TAGS.map((emoji) => (
                            <Button
                              key={emoji}
                              variant={getEmojiState(emoji) ? "default" : "outline"}
                              onClick={() => toggleEmojiTag(emoji)}
                              className="text-2xl h-12 w-12 p-0"
                            >
                              {emoji}
                            </Button>
                          ))}
                        </div>
                        {(isNut || isClutch) && (
                          <div className="text-center text-sm text-muted-foreground">
                            Selected: {isNut && "💦"}
                            {isClutch && "🛟"}
                          </div>
                        )}
                      </div>
                      {(!lastDistance || lastDistance > 30) && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="default"
                            onClick={() => handleRecordShot(true)}
                            disabled={!selectedPlayerName || !selectedShotType}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Hole Out! ⛳
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleRecordShot(false, true)}
                            disabled={!selectedPlayerName || !selectedShotType}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                          >
                            To Gimme 🤝
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="distance">Distance remaining for Shot {currentShotNumber + 1}</Label>
                    <Button variant="ghost" size="sm" onClick={() => setUseSlider(!useSlider)} className="text-xs h-6">
                      {useSlider ? "Type" : "Slide"}
                    </Button>
                  </div>
                  {useSlider && selectedShotType ? (
                    <div className="space-y-3">
                      <div className="px-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">
                            {getSliderRange(selectedShotType, lastDistance || undefined).min} {distanceUnit}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-medium">
                              {currentDistance || getSliderRange(selectedShotType, lastDistance || undefined).default}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant={distanceUnit === "yards" ? "default" : "ghost"}
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => {
                                  if (distanceUnit === "feet") {
                                    const currentValue = Number.parseInt(currentDistance) || 0
                                    const yardsValue = Math.round(currentValue / 3)
                                    setCurrentDistance(yardsValue.toString())
                                    setDistanceUnit("yards")
                                  }
                                }}
                              >
                                yd
                              </Button>
                              <Button
                                type="button"
                                variant={distanceUnit === "feet" ? "default" : "ghost"}
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => {
                                  if (distanceUnit === "yards") {
                                    const currentValue = Number.parseInt(currentDistance) || 0
                                    const feetValue = currentValue * 3
                                    setCurrentDistance(feetValue.toString())
                                    setDistanceUnit("feet")
                                  }
                                }}
                              >
                                ft
                              </Button>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {getSliderRange(selectedShotType, lastDistance || undefined).max} {distanceUnit}
                          </span>
                        </div>
                        <Slider
                          value={[
                            Number.parseInt(currentDistance) ||
                              getSliderRange(selectedShotType, lastDistance || undefined).default,
                          ]}
                          onValueChange={(value) => setCurrentDistance(value[0].toString())}
                          min={getSliderRange(selectedShotType, lastDistance || undefined).min}
                          max={getSliderRange(selectedShotType, lastDistance || undefined).max}
                          step={getSliderRange(selectedShotType, lastDistance || undefined).step}
                          className="w-full"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Input
                          id="distance"
                          type="number"
                          placeholder={`Enter ${distanceUnit}`}
                          value={currentDistance}
                          onChange={(e) => {
                            setCurrentDistance(e.target.value)
                            if (e.target.value) {
                              setDistanceUnit(getIntelligentUnit(e.target.value))
                            }
                          }}
                          className="text-lg pr-16"
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                          <Button
                            type="button"
                            variant={distanceUnit === "yards" ? "default" : "ghost"}
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => setDistanceUnit("yards")}
                          >
                            yd
                          </Button>
                          <Button
                            type="button"
                            variant={distanceUnit === "feet" ? "default" : "ghost"}
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => setDistanceUnit("feet")}
                          >
                            ft
                          </Button>
                        </div>
                      </div>
                      <Button onClick={handleStartShot} disabled={!currentDistance} className="whitespace-nowrap">
                        Start Shot
                      </Button>
                    </div>
                  )}
                  {currentDistance && (
                    <div className="text-sm text-muted-foreground">
                      Remaining distance: {currentDistance} {distanceUnit}
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => handleRecordShot()}
                  disabled={!selectedPlayerName || !selectedShotType || !currentDistance}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg flex items-center justify-center gap-2"
                >
                  Record Shot
                </Button>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      id="distance"
                      type="number"
                      placeholder={`Enter ${distanceUnit}`}
                      value={currentDistance}
                      onChange={(e) => {
                        setCurrentDistance(e.target.value)
                        if (e.target.value) {
                          setDistanceUnit(getIntelligentUnit(e.target.value))
                        }
                      }}
                      className="text-lg pr-16"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                      <Button
                        type="button"
                        variant={distanceUnit === "yards" ? "default" : "ghost"}
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setDistanceUnit("yards")}
                      >
                        yd
                      </Button>
                      <Button
                        type="button"
                        variant={distanceUnit === "feet" ? "default" : "ghost"}
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setDistanceUnit("feet")}
                      >
                        ft
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleStartShot} disabled={!currentDistance} className="whitespace-nowrap">
                    Start Shot
                  </Button>
                </div>
                {currentDistance && (
                  <div className="text-sm text-muted-foreground">
                    Distance: {currentDistance} {distanceUnit}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="w-5 h-5" />
              Shot History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border">
              <div className="space-y-2 p-3">
                {shots.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground">No shots recorded yet.</div>
                ) : (
                  shots.map((shot) => (
                    <div
                      key={shot.id}
                      className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleEditShot(shot)}
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          H{shot.hole}-{shot.shotNumber}
                        </Badge>
                        <span className="font-medium">{shot.isGimme ? "Gimme" : shot.player}</span>
                        <span className="text-muted-foreground">{shot.shotType}</span>
                        {shot.isNut && "💦"}
                        {shot.isClutch && "🛟"}
                      </div>
                      <Badge className={`text-white ${getDistanceColor(shot.calculatedDistance)}`}>
                        {shot.isGimme ? "Gimme" : formatDistance(shot.calculatedDistance)}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Debug Panel */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bug className="w-4 h-4" />
                Debug Info
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <pre className="text-xs bg-gray-100 p-2 rounded-md overflow-x-auto">
                {JSON.stringify(
                  {
                    loadingCourseData,
                    selectedRound: selectedRound?.name,
                    selectedTeam: selectedTeam?.name,
                    selectedPlayer: selectedPlayer?.name,
                    courseHolesCount: courseHoles.length,
                    currentHole,
                    currentPar,
                    currentDistance,
                    lastDistance,
                    isRecordingShot,
                    hole1Data: courseHoles.find((h) => h.hole_number === 1),
                  },
                  null,
                  2,
                )}
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
