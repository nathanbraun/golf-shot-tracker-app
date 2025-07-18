"use client"

import { useState, useEffect } from "react"
import {
  shotsApi,
  holeCompletionsApi,
  playersApi,
  roundsApi,
  teamsApi,
  coursesApi,
  type Player,
  type Round,
  type Team,
  type CourseHole,
} from "@/lib/supabase"

const GIMME_DISTANCE = 3 // feet

// Local shot interface for the UI
interface LocalShot {
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
  isGimme: boolean // NEW: Track if this is a gimme shot
  timestamp: Date
}

// Data conflict resolution options
type DataConflictAction = "continue" | "restart" | "cancel"

interface ExistingDataInfo {
  totalShots: number
  completedHoles: number[]
  lastHole: number
  lastShotNumber: number
  lastActivity: Date
}

// Recovery data for refresh detection
interface RefreshRecoveryData {
  roundName: string
  teamName: string
  playerName: string
  currentHole: number
  totalShots: number
  lastActivity: string
}

export function useShotTracking() {
  // Startup state
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedRound, setSelectedRound] = useState<Round | null>(null)

  // Data conflict handling
  const [showDataConflictDialog, setShowDataConflictDialog] = useState(false)
  const [existingDataInfo, setExistingDataInfo] = useState<ExistingDataInfo | null>(null)
  const [conflictAction, setConflictAction] = useState<DataConflictAction | null>(null)

  // Refresh recovery handling
  const [showRefreshRecovery, setShowRefreshRecovery] = useState(false)
  const [refreshRecoveryData, setRefreshRecoveryData] = useState<RefreshRecoveryData | null>(null)

  // Course data from database
  const [courseHoles, setCourseHoles] = useState<CourseHole[]>([])
  const [loadingCourseData, setLoadingCourseData] = useState(false)

  // Startup data
  const [players, setPlayers] = useState<Player[]>([])
  const [rounds, setRounds] = useState<Round[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loadingStartup, setLoadingStartup] = useState(true)

  const [currentView, setCurrentView] = useState<
    "tracking" | "summary" | "courses" | "shot-edit" | "supabase-test" | "admin" | "feed"
  >("tracking")
  const [currentDistance, setCurrentDistance] = useState<string>("")
  const [selectedPlayerName, setSelectedPlayerName] = useState<string>("")
  const [selectedShotType, setShotType] = useState<string>("")
  const [shots, setShots] = useState<LocalShot[]>([])
  const [lastDistance, setLastDistance] = useState<number | null>(null)
  const [isRecordingShot, setIsRecordingShot] = useState(false)
  const [showSplashScreen, setShowSplashScreen] = useState(false)
  const [currentHole, setCurrentHole] = useState<number>(1)
  const [currentPar, setCurrentPar] = useState<number>(4)
  const [currentShotNumber, setCurrentShotNumber] = useState<number>(1)
  const [distanceUnit, setDistanceUnit] = useState<"yards" | "feet">("yards")
  const [useSlider, setUseSlider] = useState(true)
  const [isNut, setIsNut] = useState(false)
  const [isClutch, setIsClutch] = useState(false)
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [showHoleSummary, setShowHoleSummary] = useState(false)

  // Shot editing state
  const [editingShot, setEditingShot] = useState<LocalShot | null>(null)
  const [editStartDistance, setEditStartDistance] = useState<string>("")
  const [editEndDistance, setEditEndDistance] = useState<string>("")

  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [pendingShots, setPendingShots] = useState<LocalShot[]>([]) // For offline support

  // Local storage keys
  const STORAGE_KEYS = {
    ROUND_ID: "golf_tracker_round_id",
    TEAM_ID: "golf_tracker_team_id",
    PLAYER_ID: "golf_tracker_player_id",
    LAST_ACTIVITY: "golf_tracker_last_activity",
  }

  // Save tracking state to localStorage
  const saveTrackingState = () => {
    if (selectedRound && selectedTeam && selectedPlayer) {
      localStorage.setItem(STORAGE_KEYS.ROUND_ID, selectedRound.id)
      localStorage.setItem(STORAGE_KEYS.TEAM_ID, selectedTeam.id)
      localStorage.setItem(STORAGE_KEYS.PLAYER_ID, selectedPlayer.id)
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, new Date().toISOString())
    }
  }

  // Clear tracking state from localStorage
  const clearTrackingState = () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  }

  // Check for existing tracking state on load
  const checkForRefreshRecovery = async () => {
    const roundId = localStorage.getItem(STORAGE_KEYS.ROUND_ID)
    const teamId = localStorage.getItem(STORAGE_KEYS.TEAM_ID)
    const playerId = localStorage.getItem(STORAGE_KEYS.PLAYER_ID)
    const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY)

    if (roundId && teamId && playerId && lastActivity) {
      try {
        // Load the data to verify it still exists
        const [roundsData, playersData] = await Promise.all([roundsApi.getRounds(), playersApi.getPlayers()])

        const round = roundsData.find((r) => r.id === roundId)
        const player = playersData.find((p) => p.id === playerId)

        if (round && player) {
          const teamsData = await teamsApi.getTeamsByRound(roundId)
          const team = teamsData.find((t) => t.id === teamId)

          if (team) {
            // Check if there are any shots for this team/round
            const existingShots = await shotsApi.getShotsByTeamAndRound(teamId, roundId)

            if (existingShots.length > 0) {
              const lastActivityDate = new Date(lastActivity)
              const timeSinceLastActivity = Date.now() - lastActivityDate.getTime()
              const hoursAgo = Math.floor(timeSinceLastActivity / (1000 * 60 * 60))

              let lastActivityText = "Just now"
              if (hoursAgo >= 24) {
                const daysAgo = Math.floor(hoursAgo / 24)
                lastActivityText = `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`
              } else if (hoursAgo >= 1) {
                lastActivityText = `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`
              } else {
                const minutesAgo = Math.floor(timeSinceLastActivity / (1000 * 60))
                if (minutesAgo >= 1) {
                  lastActivityText = `${minutesAgo} minute${minutesAgo > 1 ? "s" : ""} ago`
                }
              }

              const completedHoles = [...new Set(existingShots.map((shot) => shot.hole_number))]
              const currentHole = Math.max(...completedHoles)

              setRefreshRecoveryData({
                roundName: round.name,
                teamName: team.name,
                playerName: player.name,
                currentHole,
                totalShots: existingShots.length,
                lastActivity: lastActivityText,
              })

              // Store the selections for potential recovery
              setSelectedRound(round)
              setSelectedTeam(team)
              setSelectedPlayer(player)

              setShowRefreshRecovery(true)
              return true // Found recovery data
            }
          }
        }
      } catch (error) {
        console.error("Error checking for refresh recovery:", error)
      }
    }

    // Clear invalid/old data
    clearTrackingState()
    return false // No recovery data found
  }

  // Load startup data
  useEffect(() => {
    loadStartupData()
  }, [])

  const loadStartupData = async () => {
    setLoadingStartup(true)
    try {
      // First check for refresh recovery
      const hasRecoveryData = await checkForRefreshRecovery()

      if (!hasRecoveryData) {
        // Load normal startup data
        const [playersData, roundsData] = await Promise.all([playersApi.getPlayers(), roundsApi.getRounds()])

        setPlayers(playersData)
        setRounds(roundsData.filter((r) => r.status === "upcoming" || r.status === "in_progress"))
      }
    } catch (error) {
      console.error("Error loading startup data:", error)
    }
    setLoadingStartup(false)
  }

  const handleRefreshRecoveryContinue = async () => {
    setShowRefreshRecovery(false)
    if (selectedRound && selectedTeam && selectedPlayer) {
      await loadCourseData(selectedRound.course_id)
      await loadShotsFromSupabase("continue")
      setIsSetupComplete(true)
    }
  }

  const handleRefreshRecoveryStartOver = () => {
    setShowRefreshRecovery(false)
    clearTrackingState()
    setSelectedRound(null)
    setSelectedTeam(null)
    setSelectedPlayer(null)
    // Load fresh startup data
    loadStartupData()
  }

  const handleRoundSelect = async (round: Round) => {
    setSelectedRound(round)
    // Reset team and player when round changes
    setSelectedTeam(null)
    setSelectedPlayer(null)
    setTeams([])
    try {
      const teamsData = await teamsApi.getTeamsByRound(round.id)
      setTeams(teamsData)
    } catch (error) {
      console.error("Error loading teams:", error)
    }
  }

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team)
    // Reset player when team changes
    setSelectedPlayer(null)
  }

  const checkExistingData = async (teamId: string, roundId: string): Promise<ExistingDataInfo | null> => {
    try {
      const existingShots = await shotsApi.getShotsByTeamAndRound(teamId, roundId)

      if (existingShots.length === 0) {
        return null
      }

      const completedHoles = [...new Set(existingShots.map((shot) => shot.hole_number))].sort((a, b) => a - b)
      const lastShot = existingShots.reduce((latest, shot) => {
        const shotTime = new Date(shot.created_at)
        const latestTime = new Date(latest.created_at)
        return shotTime > latestTime ? shot : latest
      })

      return {
        totalShots: existingShots.length,
        completedHoles,
        lastHole: lastShot.hole_number,
        lastShotNumber: lastShot.shot_number,
        lastActivity: new Date(lastShot.created_at),
      }
    } catch (error) {
      console.error("Error checking existing data:", error)
      return null
    }
  }

  const loadCourseData = async (roundId: string) => {
    setLoadingCourseData(true)
    try {
      console.log("DEBUG: Loading course data for round:", roundId)
      const { course, holes } = await coursesApi.getCourseWithHoles(roundId, "Blue")
      console.log(`DEBUG: Loaded ${holes.length} total hole records from DB for tee "Blue".`)

      if (holes.length > 0) {
        setCourseHoles(holes)

        const hole1 = holes.find((h) => h.hole_number === 1)
        if (hole1) {
          console.log("DEBUG: Setting up hole 1:", hole1)
          setCurrentHole(1)
          setCurrentPar(hole1.par)
          setCurrentDistance(hole1.distance.toString())
          setDistanceUnit("yards")
          setCurrentShotNumber(1)
          setLastDistance(null)
          setIsRecordingShot(false)
          setShowSplashScreen(false)
        } else {
          console.error(`DEBUG: Course data loaded, but could not find data for Hole 1.`)
          setCurrentDistance("")
        }
      } else {
        console.error("DEBUG: No course holes found for this round's course in the database for 'Blue' tees.")
        setCurrentDistance("")
      }
    } catch (error) {
      console.error("DEBUG: Error in loadCourseData function:", error)
      setCurrentDistance("")
    } finally {
      setLoadingCourseData(false)
    }
  }

  const loadShotsFromSupabase = async (action?: DataConflictAction) => {
    if (!selectedTeam || !selectedRound) return

    try {
      setIsSyncing(true)

      if (action === "restart") {
        // Delete all existing shots for this team/round
        const existingShots = await shotsApi.getShotsByTeamAndRound(selectedTeam.id, selectedRound.id)
        for (const shot of existingShots) {
          await shotsApi.deleteShot(shot.id)
        }

        // Also delete hole completions
        const existingCompletions = await holeCompletionsApi.getCompletionsByTeam(selectedTeam.id, selectedRound.id)
        for (const completion of existingCompletions) {
          await holeCompletionsApi.deleteCompletion(completion.id)
        }

        setShots([])
        setCurrentHole(1)
        setCurrentShotNumber(1)
        const hole1 = courseHoles.find((h) => h.hole_number === 1)
        if (hole1) {
          setCurrentPar(hole1.par)
          setCurrentDistance(hole1.distance.toString())
        }
        setLastDistance(null)
        setIsRecordingShot(false)
        setShowSplashScreen(false)
        setLastSyncTime(new Date())
        return
      }

      const supabaseShots = await shotsApi.getShotsByTeamAndRound(selectedTeam.id, selectedRound.id)

      const localShots: LocalShot[] = supabaseShots.map((shot) => ({
        id: shot.id,
        hole: shot.hole_number,
        par: getParForHole(shot.hole_number),
        shotNumber: shot.shot_number,
        player: shot.player?.name || "Unknown",
        shotType: shot.shot_type,
        startDistance: shot.start_distance,
        endDistance: shot.end_distance,
        calculatedDistance: shot.calculated_distance,
        made: shot.made,
        isNut: shot.is_nut,
        isClutch: shot.is_clutch,
        isGimme: shot.is_gimme, // NEW: Load gimme flag from database
        timestamp: new Date(shot.created_at),
      }))

      setShots(localShots)

      if (action === "continue" && localShots.length > 0) {
        // Find the current state based on existing shots
        const completedHoles = [...new Set(localShots.map((shot) => shot.hole))].sort((a, b) => a - b)
        const lastCompletedHole = completedHoles[completedHoles.length - 1]

        // Check if the last hole is actually completed (has a made shot)
        const lastHoleShots = localShots.filter((shot) => shot.hole === lastCompletedHole)
        const lastHoleCompleted = lastHoleShots.some((shot) => shot.made)

        if (lastHoleCompleted && lastCompletedHole < 18) {
          // Move to next hole
          const nextHole = lastCompletedHole + 1
          setCurrentHole(nextHole)
          setCurrentShotNumber(1)
          const nextHoleData = courseHoles.find((h) => h.hole_number === nextHole)
          if (nextHoleData) {
            setCurrentPar(nextHoleData.par)
            setCurrentDistance(nextHoleData.distance.toString())
          }
          setLastDistance(null)
          setIsRecordingShot(false)
          setShowSplashScreen(false)
        } else {
          // Continue from where we left off on the current hole
          const currentHoleShots = lastHoleShots.sort((a, b) => b.shotNumber - a.shotNumber)
          const lastShot = currentHoleShots[0]

          setCurrentHole(lastCompletedHole)
          setCurrentShotNumber(lastShot.shotNumber + 1)
          setCurrentPar(getParForHole(lastCompletedHole))
          setLastDistance(lastShot.endDistance)
          setCurrentDistance("")
          setIsRecordingShot(false)
          setShowSplashScreen(true) // Show splash to continue from last shot
        }
      }

      setLastSyncTime(new Date())
    } catch (error) {
      console.error("Error loading shots from Supabase:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  const getParForHole = (holeNumber: number): number => {
    const hole = courseHoles.find((h) => h.hole_number === holeNumber)
    return hole ? hole.par : 4
  }

  const getDistanceForHole = (holeNumber: number): number => {
    const hole = courseHoles.find((h) => h.hole_number === holeNumber)
    return hole ? hole.distance : 400
  }

  // Get the last player who hit a shot on this hole
  const getLastPlayerOnHole = (holeNumber: number): string => {
    const holeShots = shots.filter((shot) => shot.hole === holeNumber).sort((a, b) => b.shotNumber - a.shotNumber)
    if (holeShots.length > 0) {
      return holeShots[0].player
    }
    // If no shots on this hole yet, use the selected player or first team player
    return selectedPlayer?.name || selectedTeam?.players?.[0]?.name || "Unknown"
  }

  const saveShotToSupabase = async (shot: LocalShot) => {
    if (!selectedTeam || !selectedRound) return

    try {
      // Handle "Team Gimme" by using the last player who hit a shot
      let actualPlayerName = shot.player
      if (shot.player === "Team Gimme") {
        actualPlayerName = getLastPlayerOnHole(shot.hole)
      }

      const playerInTeam = selectedTeam.players?.find((p) => p.name === actualPlayerName)
      if (!playerInTeam) {
        console.error("Player not found in team:", actualPlayerName)
        return
      }

      const supabaseShot = {
        round_id: selectedRound.id,
        team_id: selectedTeam.id,
        player_id: playerInTeam.id,
        hole_number: shot.hole,
        shot_number: shot.shotNumber,
        shot_type: shot.shotType as any,
        start_distance: shot.startDistance,
        end_distance: shot.endDistance,
        calculated_distance: shot.calculatedDistance,
        made: shot.made,
        is_nut: shot.isNut,
        is_clutch: shot.isClutch,
        is_gimme: shot.isGimme || shot.player === "Team Gimme", // Mark as gimme if it was a team gimme
      }

      await shotsApi.createShot(supabaseShot)

      // Update last activity after successful save
      saveTrackingState()
    } catch (error) {
      console.error("Error saving shot to Supabase:", error)
      setPendingShots((prev) => [...prev, shot])
    }
  }

  const createHoleCompletion = async (holeNumber: number, holeShots: LocalShot[]) => {
    if (!selectedTeam || !selectedRound || holeShots.length === 0) return

    try {
      // Filter out gimme shots when finding the longest shot for completion stats
      const nonGimmeShots = holeShots.filter((shot) => !shot.isGimme)
      const longestShot =
        nonGimmeShots.length > 0
          ? nonGimmeShots.reduce((longest, current) =>
              current.calculatedDistance > longest.calculatedDistance ? current : longest,
            )
          : holeShots[0] // Fallback to any shot if all are gimmes

      const longestShotPlayer = selectedTeam.players?.find((p) => p.name === longestShot.player)

      const completion = {
        round_id: selectedRound.id,
        team_id: selectedTeam.id,
        hole_number: holeNumber,
        par: getParForHole(holeNumber),
        total_shots: holeShots.length,
        score_to_par: holeShots.length - getParForHole(holeNumber),
        completed_at: new Date().toISOString(),
        longest_shot_distance: longestShot.calculatedDistance,
        longest_shot_player_id: longestShotPlayer?.id,
        longest_shot_type: longestShot.shotType,
      }

      await holeCompletionsApi.upsertCompletion(completion)

      // Update last activity after successful save
      saveTrackingState()
    } catch (error) {
      console.error("Error creating hole completion:", error)
    }
  }

  const handleStartTracking = async () => {
    if (!selectedRound || !selectedTeam || !selectedPlayer) {
      console.error("DEBUG: Cannot start tracking, missing selection.")
      return
    }

    console.log("DEBUG: Starting tracking with:", {
      player: selectedPlayer.name,
      team: selectedTeam.name,
      round: selectedRound.name,
    })

    // Save tracking state
    saveTrackingState()

    await loadCourseData(selectedRound.course_id)

    // Check for existing data
    const existingData = await checkExistingData(selectedTeam.id, selectedRound.id)

    if (existingData) {
      setExistingDataInfo(existingData)
      setShowDataConflictDialog(true)
      return // Don't proceed until user makes a choice
    }

    // No existing data, proceed normally
    await loadShotsFromSupabase()
    setIsSetupComplete(true)
  }

  const handleDataConflictResolution = async (action: DataConflictAction) => {
    setConflictAction(action)
    setShowDataConflictDialog(false)

    if (action === "cancel") {
      // Go back to setup
      return
    }

    await loadShotsFromSupabase(action)
    setIsSetupComplete(true)
  }

  const handleBackToSetup = () => {
    clearTrackingState()
    setIsSetupComplete(false)
    setShots([])
    setCourseHoles([])
    setCurrentHole(1)
    setCurrentShotNumber(1)
    setCurrentPar(4)
    setCurrentDistance("")
    setLastDistance(null)
    setIsRecordingShot(false)
    setShowSplashScreen(false)
    setShowHoleSummary(false)
    setShowDataConflictDialog(false)
    setExistingDataInfo(null)
    setConflictAction(null)
    setSelectedRound(null)
    setSelectedTeam(null)
    setSelectedPlayer(null)
  }

  const getIntelligentUnit = (distance: string) => {
    const num = Number.parseInt(distance)
    if (num && num < 50) return "feet"
    return "yards"
  }

  const getSliderRange = (shotType: string, startDistance?: number) => {
    if (distanceUnit === "feet") {
      const maxDistance = startDistance || 60
      const minReasonableMax = 15
      const actualMax = Math.max(maxDistance, minReasonableMax)
      let defaultValue = Math.round(actualMax / 3)
      if (shotType === "Putt") {
        defaultValue = Math.round(actualMax / 2)
      }
      return { min: 0, max: actualMax, default: defaultValue, step: 1 }
    }

    const maxDistance = startDistance || 500
    let typicalShotDistance = 0
    switch (shotType) {
      case "Drive":
        typicalShotDistance = Math.min(250, maxDistance)
        break
      case "Approach":
        typicalShotDistance = Math.min(100, maxDistance)
        break
      case "Chip":
        typicalShotDistance = Math.min(20, maxDistance)
        break
      case "Putt":
        typicalShotDistance = Math.min(8, maxDistance)
        break
      case "Sand":
        typicalShotDistance = Math.min(30, maxDistance)
        break
      case "Recovery":
        typicalShotDistance = Math.min(50, maxDistance)
        break
      default:
        typicalShotDistance = Math.min(100, maxDistance)
        break
    }
    const remainingAfterTypicalShot = Math.max(0, maxDistance - typicalShotDistance)
    const step = shotType === "Putt" || shotType === "Chip" ? 1 : 5
    return { min: 0, max: maxDistance, default: remainingAfterTypicalShot, step: step }
  }

  const toggleEmojiTag = (emoji: string) => {
    if (emoji === "💦") setIsNut(!isNut)
    if (emoji === "🛟") setIsClutch(!isClutch)
  }

  const getEmojiState = (emoji: string) => {
    if (emoji === "💦") return isNut
    if (emoji === "🛟") return isClutch
    return false
  }

  const getSmartDefaults = (par: number, shotNumber: number) => {
    let defaultShotType = "Drive"
    let defaultUnit: "yards" | "feet" = "yards"
    if (par === 3) {
      if (shotNumber === 1) {
        defaultShotType = "Approach" // Changed from "Drive" to "Approach" for par 3s
        defaultUnit = "yards"
      } else {
        defaultShotType = "Putt"
        defaultUnit = "feet"
      }
    } else if (par === 4) {
      if (shotNumber === 1) {
        defaultShotType = "Drive"
        defaultUnit = "yards"
      } else if (shotNumber === 2) {
        defaultShotType = "Approach"
        defaultUnit = "yards"
      } else {
        defaultShotType = "Putt"
        defaultUnit = "feet"
      }
    } else if (par === 5) {
      if (shotNumber === 1) {
        defaultShotType = "Drive"
        defaultUnit = "yards"
      } else if (shotNumber === 2 || shotNumber === 3) {
        defaultShotType = "Approach"
        defaultUnit = "yards"
      } else {
        defaultShotType = "Putt"
        defaultUnit = "feet"
      }
    }
    return { defaultShotType, defaultUnit }
  }

  const handleShotTypeChange = (shotType: string) => {
    setShotType(shotType)
    if (shotType === "Putt" || shotType === "Chip") setDistanceUnit("feet")
    else setDistanceUnit("yards")
    if (useSlider && isRecordingShot) {
      const range = getSliderRange(shotType, lastDistance || undefined)
      setCurrentDistance(range.default.toString())
    }
  }

  const handleStartShot = () => {
    const distance = Number.parseInt(currentDistance)
    if (distance && distance > 0 && currentPar) {
      setLastDistance(distance)
      setShowSplashScreen(true)
      setCurrentDistance("")
    }
  }

  const handleContinueFromSplash = () => {
    setShowSplashScreen(false)
    setIsRecordingShot(true)
    const { defaultShotType, defaultUnit } = getSmartDefaults(currentPar, currentShotNumber)
    setShotType(defaultShotType)
    setDistanceUnit(defaultUnit)
    if (useSlider) {
      const range = getSliderRange(defaultShotType, lastDistance!)
      setCurrentDistance(range.default.toString())
    } else {
      setCurrentDistance("")
    }
  }

  const handleRecordShot = async (isHoleOut = false, isToGimme = false) => {
    if (selectedPlayerName && selectedShotType && lastDistance !== null) {
      const endDistance = isHoleOut ? 0 : isToGimme ? GIMME_DISTANCE : Number.parseInt(currentDistance) || 0
      const calculatedDistance = isHoleOut ? lastDistance : lastDistance - endDistance

      // For Team Gimme, use the last player who hit a shot and mark as gimme
      let actualPlayerName = selectedPlayerName
      let isGimmeShot = false

      if (selectedPlayerName === "Team Gimme") {
        actualPlayerName = getLastPlayerOnHole(currentHole)
        isGimmeShot = true
      }

      // Create the main shot
      const newShot: LocalShot = {
        id: Date.now().toString(),
        hole: currentHole,
        par: currentPar,
        shotNumber: currentShotNumber,
        player: actualPlayerName, // Use actual player name, not "Team Gimme"
        shotType: selectedShotType,
        startDistance: lastDistance,
        endDistance: endDistance,
        calculatedDistance: calculatedDistance,
        made: isHoleOut,
        isNut: isNut,
        isClutch: isClutch,
        isGimme: isGimmeShot, // Mark as gimme if it was a team gimme
        timestamp: new Date(),
      }

      await saveShotToSupabase(newShot)
      let updatedShots = [newShot, ...shots]
      setShots(updatedShots)

      // Handle hole completion scenarios
      if (isHoleOut) {
        // Direct hole out - hole is complete with just this shot
        const holeShots = shots.filter((s) => s.hole === currentHole)
        await createHoleCompletion(currentHole, [...holeShots, newShot])
        handleNextHole()
        return
      }

      if (isToGimme) {
        // "To gimme" means this shot + automatic gimme putt = hole complete
        // Assign the gimme putt to the SAME player who hit the approach shot
        const gimmeShot: LocalShot = {
          id: (Date.now() + 1).toString(),
          hole: currentHole,
          par: currentPar,
          shotNumber: currentShotNumber + 1,
          player: actualPlayerName, // Use actual player name
          shotType: "Putt",
          startDistance: GIMME_DISTANCE,
          endDistance: 0,
          calculatedDistance: GIMME_DISTANCE,
          made: true,
          isNut: false,
          isClutch: false,
          isGimme: true, // Mark this as a gimme shot
          timestamp: new Date(),
        }

        // Save the gimme shot to database
        await saveShotToSupabase(gimmeShot)
        updatedShots = [gimmeShot, ...updatedShots]
        setShots(updatedShots)

        // Create hole completion with BOTH shots (the approach + gimme)
        const holeShots = shots.filter((s) => s.hole === currentHole)
        await createHoleCompletion(currentHole, [...holeShots, newShot, gimmeShot])
        handleNextHole()
        return
      }

      // Regular shot - continue playing
      setIsNut(false)
      setIsClutch(false)
      setCurrentShotNumber(currentShotNumber + 1)
      setSelectedPlayerName("")
      setShotType("")
      setLastDistance(endDistance)
      setCurrentDistance("")
      setIsRecordingShot(false)
      setShowSplashScreen(true)
    }
  }

  const handleNextHole = () => {
    if (currentHole + 1 > 18) return
    setShowHoleSummary(true)
  }

  const handleContinueToNextHole = () => {
    const nextHole = currentHole + 1
    setCurrentHole(nextHole)
    setIsNut(false)
    setIsClutch(false)
    const nextHolePar = getParForHole(nextHole)
    const nextHoleDistance = getDistanceForHole(nextHole)
    console.log(`DEBUG: Setting up hole ${nextHole}: par ${nextHolePar}, distance ${nextHoleDistance}`)
    setCurrentPar(nextHolePar)
    setCurrentDistance(nextHoleDistance.toString())
    setDistanceUnit("yards")
    setCurrentShotNumber(1)
    setLastDistance(null)
    setIsRecordingShot(false)
    setShowSplashScreen(false)
    setSelectedPlayerName("")
    setShotType("")
    setShowHoleSummary(false)
  }

  const handlePreviousHole = () => {
    if (currentHole <= 1) return
    const prevHole = currentHole - 1
    setCurrentHole(prevHole)
    setIsNut(false)
    setIsClutch(false)
    const prevHolePar = getParForHole(prevHole)
    const prevHoleDistance = getDistanceForHole(prevHole)
    console.log(`DEBUG: Setting up hole ${prevHole}: par ${prevHolePar}, distance ${prevHoleDistance}`)
    setCurrentPar(prevHolePar)
    setCurrentDistance(prevHoleDistance.toString())
    setDistanceUnit("yards")
    setLastDistance(null)
    setIsRecordingShot(false)
    setShowSplashScreen(false)
    setSelectedPlayerName("")
    setShotType("")
    setCurrentShotNumber(1)
  }

  const handleSelectCourse = (course: any) => {
    console.log("Course selection not used - loading from database")
  }

  const handleEditShot = (shot: LocalShot) => {
    setEditingShot(shot)
    setSelectedPlayerName(shot.player)
    setShotType(shot.shotType)
    setEditStartDistance(shot.startDistance.toString())
    setEditEndDistance(shot.endDistance.toString())
    setIsNut(shot.isNut)
    setIsClutch(shot.isClutch)
    setCurrentView("shot-edit")
  }

  const handleSaveEditedShot = () => {
    if (!editingShot) return
    const startDistance = Number.parseInt(editStartDistance) || 0
    const endDistance = Number.parseInt(editEndDistance) || 0
    const calculatedDistance = startDistance - endDistance
    const updatedShot: LocalShot = {
      ...editingShot,
      player: selectedPlayerName,
      shotType: selectedShotType,
      startDistance: startDistance,
      endDistance: endDistance,
      calculatedDistance: calculatedDistance,
      made: endDistance === 0,
      isNut: isNut,
      isClutch: isClutch,
    }
    const updatedShots = shots.map((shot) => {
      if (shot.id === editingShot.id) return updatedShot
      if (shot.hole === editingShot.hole && shot.shotNumber === editingShot.shotNumber + 1) {
        return { ...shot, startDistance: endDistance, calculatedDistance: endDistance - shot.endDistance }
      }
      return shot
    })
    setShots(updatedShots)
    setCurrentView("tracking")
    setEditingShot(null)
  }

  const handleDeleteShot = () => {
    if (!editingShot) return
    setShots(shots.filter((shot) => shot.id !== editingShot.id))
    setCurrentView("tracking")
    setEditingShot(null)
  }

  const formatDistance = (distance: number, unit: "yards" | "feet" = "yards") => {
    if (unit === "feet" || distance < 50) return `${distance} ft`
    return `${distance} yards`
  }

  const getDistanceColor = (distance: number) => {
    if (distance >= 250) return "bg-green-500"
    if (distance >= 150) return "bg-blue-500"
    if (distance >= 50) return "bg-yellow-500"
    return "bg-purple-500"
  }

  const getScoreInfo = (hole: number, par: number) => {
    const holeShots = shots.filter((shot) => shot.hole === hole)
    if (holeShots.length === 0) return null
    const totalShots = holeShots.length
    const scoreToPar = totalShots - par
    let scoreName = "",
      scoreColor = ""
    if (scoreToPar <= -3) {
      scoreName = "Albatross"
      scoreColor = "text-purple-600"
    } else if (scoreToPar === -2) {
      scoreName = "Eagle"
      scoreColor = "text-blue-600"
    } else if (scoreToPar === -1) {
      scoreName = "Birdie"
      scoreColor = "text-green-600"
    } else if (scoreToPar === 0) {
      scoreName = "Par"
      scoreColor = "text-gray-600"
    } else if (scoreToPar === 1) {
      scoreName = "Bogey"
      scoreColor = "text-yellow-600"
    } else if (scoreToPar === 2) {
      scoreName = "Double Bogey"
      scoreColor = "text-orange-600"
    } else {
      scoreName = `+${scoreToPar}`
      scoreColor = "text-red-600"
    }
    return { totalShots, scoreToPar, scoreName, scoreColor }
  }

  const getTotalScore = () => {
    const completedHoles = [...new Set(shots.map((shot) => shot.hole))]
    let totalToPar = 0
    completedHoles.forEach((hole) => {
      const holeShots = shots.filter((shot) => shot.hole === hole)
      if (holeShots.length > 0) {
        totalToPar += holeShots.length - holeShots[0].par
      }
    })
    return { completedHoles: completedHoles.length, totalToPar }
  }

  return {
    isSetupComplete,
    selectedPlayer,
    selectedTeam,
    selectedRound,
    courseHoles,
    loadingCourseData,
    players,
    rounds,
    teams,
    loadingStartup,
    showDataConflictDialog,
    existingDataInfo,
    showRefreshRecovery,
    refreshRecoveryData,
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
    setIsSetupComplete,
    setSelectedPlayer,
    setSelectedTeam,
    setSelectedRound,
    setPlayers,
    setRounds,
    setTeams,
    setLoadingStartup,
    setCurrentView,
    setCurrentDistance,
    setSelectedPlayerName,
    setShotType,
    setShots,
    setLastDistance,
    setIsRecordingShot,
    setShowSplashScreen,
    setCurrentHole,
    setCurrentPar,
    setCurrentShotNumber,
    setDistanceUnit,
    setUseSlider,
    setIsNut,
    setIsClutch,
    setShowMoreOptions,
    setShowHoleSummary,
    setEditingShot,
    setEditStartDistance,
    setEditEndDistance,
    handleRoundSelect,
    handleTeamSelect,
    handleStartTracking,
    handleDataConflictResolution,
    handleRefreshRecoveryContinue,
    handleRefreshRecoveryStartOver,
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
    getLastPlayerOnHole,
  }
}
