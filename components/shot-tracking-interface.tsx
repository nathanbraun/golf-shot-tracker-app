"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useShotTracking } from "@/hooks/use-shot-tracking"
import ShotTrackerHeader from "./shot-tracker-header"
import ShotTrackerFooter from "./shot-tracker-footer"
import HoleSummary from "./hole-summary"
import TeeShot from "./tee-shot-input"
import ShotRecordingInput from "./shot-recording-input"

const SHOT_TYPES = ["Drive", "Approach", "Chip", "Putt", "Sand", "Recovery"]
const EMOJI_TAGS = ["💦", "🛟"]

interface ShotTrackingInterfaceProps {
  roundId: string
  teamId: string
  playerId: string
  onBack: () => void
}

export default function ShotTrackingInterface({ roundId, teamId, playerId, onBack }: ShotTrackingInterfaceProps) {
  const {
    // State
    currentHole,
    currentPar,
    currentShotNumber,
    lastDistance,
    selectedPlayerName,
    selectedShotType,
    currentDistance,
    distanceUnit,
    useSlider,
    isNut,
    isClutch,
    showMoreOptions,
    players,
    shots,
    holeShots,
    isLoading,
    error,

    // Actions
    setCurrentHole,
    setSelectedPlayerName,
    setSelectedShotType,
    setCurrentDistance,
    setDistanceUnit,
    setUseSlider,
    setIsNut,
    setIsClutch,
    setShowMoreOptions,
    handleRecordShot,
    handleStartShot,
    formatDistance,
    getIntelligentUnit,
    getSliderRange,
  } = useShotTracking(roundId, teamId, playerId)

  const [showHoleSummary, setShowHoleSummary] = useState(false)

  // Show hole summary when hole is complete
  useEffect(() => {
    const holeComplete = holeShots.some((shot) => shot.is_hole_out || shot.is_to_gimme)
    if (holeComplete && holeShots.length > 0) {
      setShowHoleSummary(true)
    } else {
      setShowHoleSummary(false)
    }
  }, [holeShots])

  const handleNextHole = () => {
    setCurrentHole(currentHole + 1)
    setShowHoleSummary(false)
  }

  const handlePreviousHole = () => {
    if (currentHole > 1) {
      setCurrentHole(currentHole - 1)
      setShowHoleSummary(false)
    }
  }

  const getEmojiState = (emoji: string) => {
    if (emoji === "💦") return isNut
    if (emoji === "🛟") return isClutch
    return false
  }

  const handleToggleEmojiTag = (emoji: string) => {
    if (emoji === "💦") {
      setIsNut(!isNut)
    } else if (emoji === "🛟") {
      setIsClutch(!isClutch)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shot tracking...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error}</p>
            <Button onClick={onBack} variant="outline" className="w-full bg-transparent">
              Back to Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <ShotTrackerHeader
        currentHole={currentHole}
        currentPar={currentPar}
        onPreviousHole={handlePreviousHole}
        onNextHole={handleNextHole}
        onBack={onBack}
      />

      <div className="container mx-auto px-4 py-6 pb-24">
        {showHoleSummary ? (
          <HoleSummary
            currentHole={currentHole}
            currentPar={currentPar}
            holeShots={holeShots}
            players={players}
            onNextHole={handleNextHole}
            onEditHole={() => setShowHoleSummary(false)}
            formatDistance={formatDistance}
          />
        ) : currentShotNumber === 1 ? (
          <TeeShot
            currentHole={currentHole}
            currentPar={currentPar}
            players={players}
            selectedPlayerName={selectedPlayerName}
            currentDistance={currentDistance}
            distanceUnit={distanceUnit}
            useSlider={useSlider}
            onPlayerSelect={setSelectedPlayerName}
            onDistanceChange={setCurrentDistance}
            onDistanceUnitChange={setDistanceUnit}
            onToggleSlider={() => setUseSlider(!useSlider)}
            onRecordTeeShot={handleRecordShot}
            formatDistance={formatDistance}
            getIntelligentUnit={getIntelligentUnit}
            getSliderRange={getSliderRange}
          />
        ) : (
          <ShotRecordingInput
            currentHole={currentHole}
            currentPar={currentPar}
            currentShotNumber={currentShotNumber}
            lastDistance={lastDistance}
            selectedPlayerName={selectedPlayerName}
            selectedShotType={selectedShotType}
            currentDistance={currentDistance}
            distanceUnit={distanceUnit}
            useSlider={useSlider}
            isNut={isNut}
            isClutch={isClutch}
            showMoreOptions={showMoreOptions}
            players={players}
            onPlayerSelect={setSelectedPlayerName}
            onShotTypeChange={setSelectedShotType}
            onDistanceChange={setCurrentDistance}
            onDistanceUnitChange={setDistanceUnit}
            onToggleSlider={() => setUseSlider(!useSlider)}
            onToggleMoreOptions={() => setShowMoreOptions(!showMoreOptions)}
            onToggleEmojiTag={handleToggleEmojiTag}
            onRecordShot={handleRecordShot}
            onStartShot={handleStartShot}
            formatDistance={formatDistance}
            getIntelligentUnit={getIntelligentUnit}
            getSliderRange={getSliderRange}
            getEmojiState={getEmojiState}
          />
        )}
      </div>

      <ShotTrackerFooter shots={shots} holeShots={holeShots} players={players} formatDistance={formatDistance} />
    </div>
  )
}
