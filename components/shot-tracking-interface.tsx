"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Bug,
  Trophy,
} from "lucide-react"
import SummaryPage from "@/components/summary-page"
import CourseManager from "@/components/course-manager"
import LiveFeed from "@/components/live-feed"
import ShotSplashScreen from "@/components/shot-splash-screen"
import type { useShotTracking } from "@/hooks/use-shot-tracking"
import ShotTrackerHeader from "@/components/shot-tracker-header"
import ShotTrackerFooter from "@/components/shot-tracker-footer"
import TeeShotInput from "@/components/tee-shot-input"
import ShotRecordingInput from "@/components/shot-recording-input"

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
      <ShotSplashScreen
        currentHole={currentHole}
        currentPar={currentPar}
        currentShotNumber={currentShotNumber}
        lastDistance={lastDistance}
        selectedRound={selectedRound}
        formatDistance={formatDistance}
        onContinue={handleContinueFromSplash}
      />
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
        <ShotTrackerHeader
          currentHole={currentHole}
          currentPar={currentPar}
          currentShotNumber={currentShotNumber}
          isRecordingShot={isRecordingShot}
          totalScore={totalScore}
          shots={shots}
          isSyncing={isSyncing}
          loadingCourseData={loadingCourseData}
          onViewFeed={() => setCurrentView("feed")}
          onViewSummary={() => setCurrentView("summary")}
        />

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

        {!isRecordingShot ? (
          <TeeShotInput
            currentHole={currentHole}
            currentPar={currentPar}
            currentDistance={currentDistance}
            distanceUnit={distanceUnit}
            onDistanceChange={setCurrentDistance}
            onDistanceUnitChange={setDistanceUnit}
            onStartShot={handleStartShot}
            onPreviousHole={handlePreviousHole}
            onNextHole={handleContinueToNextHole}
            canGoPrevious={currentHole > 1}
            canGoNext={currentHole < 18}
            getIntelligentUnit={getIntelligentUnit}
          />
        ) : (
          <ShotRecordingInput
            currentHole={currentHole}
            currentPar={currentPar}
            currentShotNumber={currentShotNumber}
            lastDistance={lastDistance!}
            selectedPlayerName={selectedPlayerName}
            selectedShotType={selectedShotType}
            currentDistance={currentDistance}
            distanceUnit={distanceUnit}
            useSlider={useSlider}
            isNut={isNut}
            isClutch={isClutch}
            showMoreOptions={showMoreOptions}
            players={PLAYERS}
            onPlayerSelect={setSelectedPlayerName}
            onShotTypeChange={handleShotTypeChange}
            onDistanceChange={setCurrentDistance}
            onDistanceUnitChange={setDistanceUnit}
            onToggleSlider={() => setUseSlider(!useSlider)}
            onToggleMoreOptions={() => setShowMoreOptions(!showMoreOptions)}
            onToggleEmojiTag={toggleEmojiTag}
            onRecordShot={handleRecordShot}
            onStartShot={handleStartShot}
            formatDistance={formatDistance}
            getIntelligentUnit={getIntelligentUnit}
            getSliderRange={getSliderRange}
            getEmojiState={getEmojiState}
          />
        )}

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
        <ShotTrackerFooter
          selectedRound={selectedRound}
          selectedTeam={selectedTeam}
          selectedPlayer={selectedPlayer}
          onBackToSetup={handleBackToSetup}
        />
      </div>
    </div>
  )
}
