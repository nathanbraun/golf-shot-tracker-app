"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart3, ArrowLeft, Edit, Trash2, Save, Trophy } from "lucide-react"
import SummaryPage from "@/components/summary-page"
import CourseManager from "@/components/course-manager"
import LiveFeed from "@/components/live-feed"
import ShotSplashScreen from "@/components/shot-splash-screen"
import type { useShotTracking } from "@/hooks/use-shot-tracking"
import ShotTrackerHeader from "@/components/shot-tracker-header"
import HoleSummary from "@/components/hole-summary"

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
    formatLastDistance,
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
      <ShotSplashScreen
        currentHole={currentHole}
        currentPar={currentPar}
        currentShotNumber={currentShotNumber}
        lastDistance={lastDistance}
        selectedRound={selectedRound}
        formatLastDistance={formatLastDistance}
        onContinue={handleContinueFromSplash}
      />
    )
  }

  if (showHoleSummary) {
    return (
      <HoleSummary
        currentHole={currentHole}
        currentPar={currentPar}
        shots={shots}
        courseHoles={courseHoles}
        selectedRound={selectedRound}
        selectedTeam={selectedTeam}
        getScoreInfo={getScoreInfo}
        getTotalScore={getTotalScore}
        formatDistance={formatDistance}
        getDistanceColor={getDistanceColor}
        onContinueToNextHole={handleContinueToNextHole}
      />
    )
  }

  const totalScore = getTotalScore()
  const PLAYERS = selectedTeam?.players?.map((p) => p.name) || ["Brusda", "Nate", "Mikey", "Strauss"]

  return (
    <div className="min-h-screen bg-green-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <ShotTrackerHeader
          currentHole={currentHole}
          currentPar={currentPar}
          currentShotNumber={currentShotNumber}
          isRecordingShot={isRecordingShot}
          totalScore={total
