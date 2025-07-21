"use client"
import { useState } from "react"
import StartupScreen from "@/components/startup-screen"
import ShotTrackingInterface from "@/components/shot-tracking-interface"
import DataConflictDialog from "@/components/data-conflict-dialog"
import RefreshRecoveryScreen from "@/components/refresh-recovery-screen"
import SettingsPage from "@/components/settings-page"
import { useShotTracking } from "@/hooks/use-shot-tracking"

interface Shot {
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
  timestamp: Date
}

interface CourseHole {
  hole: number
  par: number
  distance: number
}

interface Course {
  id: string
  name: string
  holes: CourseHole[]
  createdAt: Date
}

const SHOT_TYPES = ["Drive", "Approach", "Chip", "Putt", "Sand", "Recovery"]
const GIMME_DISTANCE = 3 // feet
const EMOJI_TAGS = ["💦", "🛟"]

// Demo data for 18 holes
const DEMO_HOLES = [
  // Front 9
  {
    hole: 1,
    par: 4,
    shots: [
      { distance: 380, player: "Brusda", type: "Drive", endDistance: 140 },
      { distance: 140, player: "Nate", type: "Approach", endDistance: 15 },
      { distance: 15, player: "Mikey", type: "Chip", endDistance: 3 },
      { distance: 3, player: "Strauss", type: "Putt", endDistance: 0 },
    ],
  },
  {
    hole: 2,
    par: 3,
    shots: [
      { distance: 165, player: "Nate", type: "Drive", endDistance: 25 },
      { distance: 25, player: "Brusda", type: "Chip", endDistance: 0 },
    ],
  },
  {
    hole: 3,
    par: 5,
    shots: [
      { distance: 520, player: "Mikey", type: "Drive", endDistance: 240 },
      { distance: 240, player: "Strauss", type: "Approach", endDistance: 80 },
      { distance: 80, player: "Nate", type: "Approach", endDistance: 12 },
      { distance: 12, player: "Brusda", type: "Putt", endDistance: 0 },
    ],
  },
  {
    hole: 4,
    par: 4,
    shots: [
      { distance: 410, player: "Strauss", type: "Drive", endDistance: 155 },
      { distance: 155, player: "Mikey", type: "Approach", endDistance: 8 },
      { distance: 8, player: "Nate", type: "Putt", endDistance: 0 },
    ],
  },
  {
    hole: 5,
    par: 3,
    shots: [
      { distance: 135, player: "Brusda", type: "Drive", endDistance: 20 },
      { distance: 20, player: "Strauss", type: "Chip", endDistance: 0 },
    ],
  },
  {
    hole: 6,
    par: 4,
    shots: [
      { distance: 365, player: "Nate", type: "Drive", endDistance: 125 },
      { distance: 125, player: "Brusda", type: "Approach", endDistance: 4 },
      { distance: 4, player: "Mikey", type: "Putt", endDistance: 0 },
    ],
  },
  {
    hole: 7,
    par: 5,
    shots: [
      { distance: 485, player: "Mikey", type: "Drive", endDistance: 210 },
      { distance: 210, player: "Nate", type: "Approach", endDistance: 45 },
      { distance: 45, player: "Strauss", type: "Chip", endDistance: 6 },
      { distance: 6, player: "Brusda", type: "Putt", endDistance: 0 },
    ],
  },
  {
    hole: 8,
    par: 4,
    shots: [
      { distance: 395, player: "Strauss", type: "Drive", endDistance: 165 },
      { distance: 165, player: "Nate", type: "Approach", endDistance: 18 },
      { distance: 18, player: "Mikey", type: "Chip", endDistance: 2 },
      { distance: 2, player: "Brusda", type: "Putt", endDistance: 0 },
    ],
  },
  {
    hole: 9,
    par: 4,
    shots: [
      { distance: 425, player: "Brusda", type: "Drive", endDistance: 135 },
      { distance: 135, player: "Mikey", type: "Approach", endDistance: 10 },
      { distance: 10, player: "Strauss", type: "Putt", endDistance: 0 },
    ],
  },
  // Back 9
  {
    hole: 10,
    par: 4,
    shots: [
      { distance: 390, player: "Nate", type: "Drive", endDistance: 145 },
      { distance: 145, player: "Strauss", type: "Approach", endDistance: 12 },
      { distance: 12, player: "Brusda", type: "Putt", endDistance: 0 },
    ],
  },
  {
    hole: 11,
    par: 3,
    shots: [
      { distance: 175, player: "Mikey", type: "Drive", endDistance: 30 },
      { distance: 30, player: "Nate", type: "Chip", endDistance: 0 },
    ],
  },
  {
    hole: 12,
    par: 5,
    shots: [
      { distance: 510, player: "Strauss", type: "Drive", endDistance: 220 },
      { distance: 220, player: "Brusda", type: "Approach", endDistance: 65 },
      { distance: 65, player: "Mikey", type: "Approach", endDistance: 8 },
      { distance: 8, player: "Nate", type: "Putt", endDistance: 0 },
    ],
  },
  {
    hole: 13,
    par: 4,
    shots: [
      { distance: 375, player: "Brusda", type: "Drive", endDistance: 130 },
      { distance: 130, player: "Nate", type: "Approach", endDistance: 15 },
      { distance: 15, player: "Strauss", type: "Chip", endDistance: 0 },
    ],
  },
  {
    hole: 14,
    par: 3,
    shots: [
      { distance: 155, player: "Strauss", type: "Drive", endDistance: 22 },
      { distance: 22, player: "Mikey", type: "Chip", endDistance: 0 },
    ],
  },
  {
    hole: 15,
    par: 4,
    shots: [
      { distance: 420, player: "Mikey", type: "Drive", endDistance: 160 },
      { distance: 160, player: "Brusda", type: "Approach", endDistance: 6 },
      { distance: 6, player: "Nate", type: "Putt", endDistance: 0 },
    ],
  },
  {
    hole: 16,
    par: 5,
    shots: [
      { distance: 495, player: "Nate", type: "Drive", endDistance: 205 },
      { distance: 205, player: "Strauss", type: "Approach", endDistance: 55 },
      { distance: 55, player: "Brusda", type: "Approach", endDistance: 10 },
      { distance: 10, player: "Mikey", type: "Putt", endDistance: 0 },
    ],
  },
  {
    hole: 17,
    par: 3,
    shots: [
      { distance: 145, player: "Brusda", type: "Drive", endDistance: 18 },
      { distance: 18, player: "Nate", type: "Chip", endDistance: 0 },
    ],
  },
  {
    hole: 18,
    par: 4,
    shots: [
      { distance: 435, player: "Strauss", type: "Drive", endDistance: 150 },
      { distance: 150, player: "Mikey", type: "Approach", endDistance: 5 },
      { distance: 5, player: "Brusda", type: "Putt", endDistance: 0 },
    ],
  },
]

// Lomira Golf Course - Pre-loaded course data
const LOMIRA_COURSE: Course = {
  id: "lomira-golf-course",
  name: "Lomira Golf Course",
  createdAt: new Date("2024-01-01"),
  holes: [
    // Front 9
    { hole: 1, par: 4, distance: 385 },
    { hole: 2, par: 3, distance: 165 },
    { hole: 3, par: 5, distance: 520 },
    { hole: 4, par: 4, distance: 410 },
    { hole: 5, par: 3, distance: 135 },
    { hole: 6, par: 4, distance: 365 },
    { hole: 7, par: 5, distance: 485 },
    { hole: 8, par: 4, distance: 395 },
    { hole: 9, par: 4, distance: 425 },
    // Back 9
    { hole: 10, par: 4, distance: 390 },
    { hole: 11, par: 3, distance: 175 },
    { hole: 12, par: 5, distance: 510 },
    { hole: 13, par: 4, distance: 375 },
    { hole: 14, par: 3, distance: 155 },
    { hole: 15, par: 4, distance: 420 },
    { hole: 16, par: 5, distance: 495 },
    { hole: 17, par: 3, distance: 145 },
    { hole: 18, par: 4, distance: 435 },
  ],
}

export default function Home() {
  const [showSettings, setShowSettings] = useState(false)
  const shotTrackingProps = useShotTracking()

  const {
    isSetupComplete,
    selectedPlayer,
    selectedTeam,
    selectedRound,
    players,
    rounds,
    teams,
    loadingStartup,
    showDataConflictDialog,
    existingDataInfo,
    showRefreshRecovery,
    refreshRecoveryData,
    handleRoundSelect,
    handleTeamSelect,
    setSelectedPlayer,
    handleStartTracking,
    handleDataConflictResolution,
    handleRefreshRecoveryContinue,
    handleRefreshRecoveryStartOver,
  } = shotTrackingProps

  // Show settings page if requested
  if (showSettings) {
    return <SettingsPage onBack={() => setShowSettings(false)} />
  }

  // Show refresh recovery screen first if detected
  if (showRefreshRecovery && refreshRecoveryData) {
    return (
      <RefreshRecoveryScreen
        recoveryData={refreshRecoveryData}
        onContinueTracking={handleRefreshRecoveryContinue}
        onStartOver={handleRefreshRecoveryStartOver}
      />
    )
  }

  // Show data conflict dialog if there's existing data
  if (showDataConflictDialog && existingDataInfo && selectedTeam && selectedRound) {
    return (
      <DataConflictDialog
        existingData={existingDataInfo}
        teamName={selectedTeam.name}
        roundName={selectedRound.name}
        onContinue={() => handleDataConflictResolution("continue")}
        onRestart={() => handleDataConflictResolution("restart")}
        onCancel={() => handleDataConflictResolution("cancel")}
      />
    )
  }

  // Show setup screen if not complete
  if (!isSetupComplete) {
    return (
      <StartupScreen
        players={players}
        rounds={rounds}
        teams={teams}
        loading={loadingStartup}
        selectedRound={selectedRound}
        selectedTeam={selectedTeam}
        selectedPlayer={selectedPlayer}
        onRoundSelect={handleRoundSelect}
        onTeamSelect={handleTeamSelect}
        onPlayerSelect={setSelectedPlayer}
        onStartTracking={handleStartTracking}
        onShowSettings={() => setShowSettings(true)}
      />
    )
  }

  // Show main tracking interface
  return <ShotTrackingInterface {...shotTrackingProps} />
}
