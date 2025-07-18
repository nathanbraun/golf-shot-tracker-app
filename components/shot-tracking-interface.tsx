"use client"

import { useShotTracking } from "@/hooks/use-shot-tracking"
import StartupScreen from "./startup-screen"
import DataConflictDialog from "./data-conflict-dialog"
import ShotSplashScreen from "./shot-splash-screen"
import ShotTrackerHeader from "./shot-tracker-header"
import ShotTrackerFooter from "./shot-tracker-footer"
import TeeShot from "./tee-shot-input"
import ShotRecordingInput from "./shot-recording-input"
import HoleSummary from "./hole-summary"
import SummaryPage from "./summary-page"
import CourseManager from "./course-manager"
import SupabaseTest from "./supabase-test"
import AdminDashboard from "./admin-dashboard"
import LiveFeed from "./live-feed"

export default function ShotTrackingInterface() {
  const {
    isSetupComplete,
    selectedPlayer,
    selectedTeam,
    selectedRound,
    courseHoles,
    loadingCourseData,
    players: teamPlayers,
    rounds,
    teams,
    loadingStartup,
    showDataConflictDialog,
    existingDataInfo,
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
    lastSyncTime,
    pendingShots,
    setCurrentView,
    setCurrentDistance,
    setSelectedPlayerName,
    setShotType,
    setDistanceUnit,
    setUseSlider,
    setIsNut,
    setIsClutch,
    setShowMoreOptions,
    handleRoundSelect,
    handleTeamSelect,
    handleStartTracking,
    handleDataConflictResolution,
    handleBackToSetup,
    getIntelligentUnit,
    getSliderRange,
    toggleEmojiTag,
    getEmojiState,
    getSmartDefaults,
    handleShotTypeChange,
    handleStartShot,
    handleContinueFromSplash,
    handleRecordShot,
    handleNextHole,
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
    loadShotsFromSupabase,
    saveShotToSupabase,
    createHoleCompletion,
    getParForHole,
    getDistanceForHole,
  } = useShotTracking()

  const players = selectedTeam?.players?.map((p) => p.name) || []

  if (!isSetupComplete) {
    return (
      <>
        <StartupScreen
          players={teamPlayers}
          rounds={rounds}
          teams={teams}
          selectedPlayer={selectedPlayer}
          selectedTeam={selectedTeam}
          selectedRound={selectedRound}
          loadingStartup={loadingStartup}
          loadingCourseData={loadingCourseData}
          onPlayerSelect={setSelectedPlayerName}
          onTeamSelect={handleTeamSelect}
          onRoundSelect={handleRoundSelect}
          onStartTracking={handleStartTracking}
        />
        {showDataConflictDialog && existingDataInfo && (
          <DataConflictDialog existingDataInfo={existingDataInfo} onResolve={handleDataConflictResolution} />
        )}
      </>
    )
  }

  if (currentView === "summary") {
    return (
      <SummaryPage
        shots={shots}
        courseHoles={courseHoles}
        selectedRound={selectedRound}
        selectedTeam={selectedTeam}
        getScoreInfo={getScoreInfo}
        getTotalScore={getTotalScore}
        formatDistance={formatDistance}
        getDistanceColor={getDistanceColor}
        onBackToTracking={() => setCurrentView("tracking")}
        onEditShot={handleEditShot}
      />
    )
  }

  if (currentView === "courses") {
    return <CourseManager onBack={() => setCurrentView("tracking")} />
  }

  if (currentView === "supabase-test") {
    return <SupabaseTest onBack={() => setCurrentView("tracking")} />
  }

  if (currentView === "admin") {
    return <AdminDashboard onBack={() => setCurrentView("tracking")} />
  }

  if (currentView === "feed") {
    return (
      <div className="min-h-screen bg-green-50 p-4">
        <div className="max-w-md mx-auto">
          <ShotTrackerHeader
            currentView={currentView}
            onViewChange={setCurrentView}
            onBackToSetup={handleBackToSetup}
          />
          <div className="mt-4">
            <LiveFeed roundId={selectedRound?.id || ""} currentTeamId={selectedTeam?.id} />
          </div>
        </div>
      </div>
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

  if (showSplashScreen) {
    return (
      <ShotSplashScreen
        currentHole={currentHole}
        currentPar={currentPar}
        currentShotNumber={currentShotNumber}
        selectedRound={selectedRound}
        onContinue={handleContinueFromSplash}
      />
    )
  }

  return (
    <div className="min-h-screen bg-green-50">
      <ShotTrackerHeader currentView={currentView} onViewChange={setCurrentView} onBackToSetup={handleBackToSetup} />

      <div className="p-4">
        <div className="max-w-md mx-auto space-y-4">
          {!isRecordingShot ? (
            <TeeShot
              currentHole={currentHole}
              currentPar={currentPar}
              currentDistance={currentDistance}
              distanceUnit={distanceUnit}
              useSlider={useSlider}
              onDistanceChange={setCurrentDistance}
              onDistanceUnitChange={setDistanceUnit}
              onUseSliderChange={setUseSlider}
              onStartShot={handleStartShot}
              onPreviousHole={handlePreviousHole}
              onNextHole={handleNextHole}
            />
          ) : (
            <ShotRecordingInput
              players={players}
              selectedPlayerName={selectedPlayerName}
              selectedShotType={selectedShotType}
              currentDistance={currentDistance}
              distanceUnit={distanceUnit}
              useSlider={useSlider}
              lastDistance={lastDistance}
              isNut={isNut}
              isClutch={isClutch}
              showMoreOptions={showMoreOptions}
              onPlayerChange={setSelectedPlayerName}
              onShotTypeChange={handleShotTypeChange}
              onDistanceChange={setCurrentDistance}
              onDistanceUnitChange={setDistanceUnit}
              onUseSliderChange={setUseSlider}
              onToggleEmojiTag={toggleEmojiTag}
              onToggleMoreOptions={() => setShowMoreOptions(!showMoreOptions)}
              onRecordShot={handleRecordShot}
              getSliderRange={getSliderRange}
              getEmojiState={getEmojiState}
            />
          )}
        </div>
      </div>

      <ShotTrackerFooter
        selectedRound={selectedRound}
        selectedTeam={selectedTeam}
        currentHole={currentHole}
        shots={shots}
        getTotalScore={getTotalScore}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        pendingShots={pendingShots}
      />
    </div>
  )
}
