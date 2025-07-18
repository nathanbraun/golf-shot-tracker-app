"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { History, Bug } from "lucide-react"
import TeeShotInput from "@/components/tee-shot-input"
import ShotRecordingInput from "@/components/shot-recording-input"
import HoleSummary from "@/components/hole-summary"
import DataConflictDialog from "@/components/data-conflict-dialog"
import RefreshRecoveryScreen from "@/components/refresh-recovery-screen"
import { useShotTracking } from "@/hooks/use-shot-tracking"
import StartupScreen from "@/components/startup-screen" // Import StartupScreen
import ShotTrackerHeader from "@/components/shot-tracker-header" // Import ShotTrackerHeader
import ShotTrackerFooter from "@/components/shot-tracker-footer" // Import ShotTrackerFooter

// Declare SHOT_TYPES and EMOJI_TAGS variables
const SHOT_TYPES = ["Drive", "Approach", "Chip", "Putt", "Sand", "Recovery"]
const EMOJI_TAGS = ["💦", "🛟"]

export default function ShotTrackingInterfaceComponent() {
  const hook = useShotTracking()

  if (hook.loadingStartup) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (hook.showRefreshRecovery && hook.refreshRecoveryData) {
    return (
      <RefreshRecoveryScreen
        data={hook.refreshRecoveryData}
        onContinue={hook.handleRefreshRecoveryContinue}
        onStartOver={hook.handleRefreshRecoveryStartOver}
      />
    )
  }

  if (!hook.isSetupComplete) {
    return (
      <StartupScreen
        rounds={hook.rounds}
        teams={hook.teams}
        players={hook.players}
        selectedRound={hook.selectedRound}
        selectedTeam={hook.selectedTeam}
        selectedPlayer={hook.selectedPlayer}
        onRoundSelect={hook.handleRoundSelect}
        onTeamSelect={hook.handleTeamSelect}
        onPlayerSelect={hook.setSelectedPlayer}
        onStartTracking={hook.handleStartTracking}
      />
    )
  }

  if (hook.showDataConflictDialog && hook.existingDataInfo) {
    return (
      <DataConflictDialog
        data={hook.existingDataInfo}
        onResolve={hook.handleDataConflictResolution}
        teamName={hook.selectedTeam?.name || "your team"}
      />
    )
  }

  if (hook.showHoleSummary) {
    const scoreInfo = hook.getScoreInfo(hook.currentHole, hook.currentPar)
    const holeShots = hook.shots.filter((s) => s.hole === hook.currentHole)

    return (
      <HoleSummary
        holeNumber={hook.currentHole}
        par={hook.currentPar}
        scoreInfo={scoreInfo}
        shots={holeShots}
        onContinue={hook.handleContinueToNextHole}
        formatDistance={hook.formatDistance}
      />
    )
  }

  const totalScore = hook.getTotalScore()
  const PLAYERS = hook.selectedTeam?.players?.map((p) => p.name) || ["Brusda", "Nate", "Mikey", "Strauss"]

  return (
    <div className="min-h-screen bg-green-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <ShotTrackerHeader
          currentHole={hook.currentHole}
          currentPar={hook.currentPar}
          currentShotNumber={hook.currentShotNumber}
          isRecordingShot={hook.isRecordingShot}
          totalScore={totalScore}
          shots={hook.shots}
          isSyncing={hook.isSyncing}
          loadingCourseData={hook.loadingCourseData}
          onViewFeed={() => hook.setCurrentView("feed")}
          onViewSummary={() => hook.setCurrentView("summary")}
        />

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="py-4">
            <div className="text-center">
              <div className="text-2xl font-bold">Hole {hook.currentHole}</div>
              <div className="text-green-100 text-sm">
                Par {hook.currentPar} • Shot {hook.isRecordingShot ? hook.currentShotNumber : hook.currentShotNumber}
                {hook.lastDistance && (
                  <span className="ml-2">• {hook.formatDistance(hook.lastDistance)} remaining</span>
                )}
              </div>
              {hook.selectedRound?.course && (
                <div className="text-green-100 text-xs mt-1">{hook.selectedRound.course.name}</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Round completion banner */}
        {hook.currentHole === 18 && hook.shots.filter((shot) => shot.hole === 18).length > 0 && (
          <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-2 border-yellow-400">
            <CardContent className="py-4">
              <div className="text-center">
                <div className="text-2xl font-bold">🏆 Round Complete!</div>
                <div className="text-yellow-100 text-sm">18 holes finished • {hook.shots.length} total shots</div>
                <div className="text-yellow-100 text-xs mt-1">Check the live feed to see how you compare!</div>
              </div>
            </CardContent>
          </Card>
        )}

        {!hook.isRecordingShot ? (
          <TeeShotInput
            currentHole={hook.currentHole}
            currentPar={hook.currentPar}
            currentDistance={hook.currentDistance}
            distanceUnit={hook.distanceUnit}
            onDistanceChange={hook.setCurrentDistance}
            onDistanceUnitChange={hook.setDistanceUnit}
            onStartShot={hook.handleStartShot}
            onPreviousHole={hook.handlePreviousHole}
            onNextHole={hook.handleContinueToNextHole}
            canGoPrevious={hook.currentHole > 1}
            canGoNext={hook.currentHole < 18}
            getIntelligentUnit={hook.getIntelligentUnit}
          />
        ) : (
          <ShotRecordingInput
            selectedPlayerName={hook.selectedPlayerName}
            selectedShotType={hook.selectedShotType}
            currentDistance={hook.currentDistance}
            distanceUnit={hook.distanceUnit}
            useSlider={hook.useSlider}
            isNut={hook.isNut}
            isClutch={hook.isClutch}
            showMoreOptions={hook.showMoreOptions}
            lastDistance={hook.lastDistance}
            currentPar={hook.currentPar}
            currentShotNumber={hook.currentShotNumber}
            selectedTeam={hook.selectedTeam}
            onPlayerSelect={hook.setSelectedPlayerName}
            onShotTypeSelect={hook.handleShotTypeChange}
            onDistanceChange={hook.setCurrentDistance}
            onDistanceUnitChange={hook.setDistanceUnit}
            onSliderToggle={hook.setUseSlider}
            onEmojiToggle={hook.toggleEmojiTag}
            onMoreOptionsToggle={() => hook.setShowMoreOptions(!hook.showMoreOptions)}
            onRecordShot={hook.handleRecordShot}
            getSliderRange={hook.getSliderRange}
            getEmojiState={hook.getEmojiState}
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
                {hook.shots.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground">No shots recorded yet.</div>
                ) : (
                  hook.shots.map((shot) => (
                    <div
                      key={shot.id}
                      className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => hook.handleEditShot(shot)}
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
                      <Badge className={`text-white ${hook.getDistanceColor(shot.calculatedDistance)}`}>
                        {shot.isGimme ? "Gimme" : hook.formatDistance(shot.calculatedDistance)}
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
                    loadingCourseData: hook.loadingCourseData,
                    selectedRound: hook.selectedRound?.name,
                    selectedTeam: hook.selectedTeam?.name,
                    selectedPlayer: hook.selectedPlayer?.name,
                    courseHolesCount: hook.courseHoles.length,
                    currentHole: hook.currentHole,
                    currentPar: hook.currentPar,
                    currentDistance: hook.currentDistance,
                    lastDistance: hook.lastDistance,
                    isRecordingShot: hook.isRecordingShot,
                    hole1Data: hook.courseHoles.find((h) => h.hole_number === 1),
                  },
                  null,
                  2,
                )}
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <ShotTrackerFooter
          selectedRound={hook.selectedRound}
          selectedTeam={hook.selectedTeam}
          selectedPlayer={hook.selectedPlayer}
          onBackToSetup={hook.handleBackToSetup}
        />
      </div>
    </div>
  )
}
