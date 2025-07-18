"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface Player {
  id: string
  name: string
  email?: string
}

interface Team {
  id: string
  name: string
  players: Player[]
}

interface Course {
  id: string
  name: string
  holes: CourseHole[]
}

interface CourseHole {
  id: string
  hole_number: number
  par: number
  distance_yards: number
}

interface Round {
  id: string
  name: string
  date: string
  course?: Course
  teams: Team[]
}

interface Shot {
  id: string
  hole: number
  shotNumber: number
  player: string
  shotType: string
  startDistance: number
  endDistance: number
  calculatedDistance: number
  par: number
  isNut: boolean
  isClutch: boolean
  isGimme: boolean
  timestamp: string
}

interface RecoveryData {
  roundId: string
  teamId: string
  playerId: string
  roundName: string
  teamName: string
  playerName: string
  currentHole: number
  totalShots: number
  lastActivity: string
}

const RECOVERY_KEY = "golf_tracker_recovery"

export function useShotTracking() {
  // Core state
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedRound, setSelectedRound] = useState<Round | null>(null)
  const [courseHoles, setCourseHoles] = useState<CourseHole[]>([])
  const [loadingCourseData, setLoadingCourseData] = useState(false)

  // UI state
  const [currentView, setCurrentView] = useState<
    "setup" | "tracking" | "summary" | "courses" | "feed" | "shot-edit" | "recovery"
  >("setup")
  const [currentDistance, setCurrentDistance] = useState("")
  const [selectedPlayerName, setSelectedPlayerName] = useState("")
  const [selectedShotType, setShotType] = useState("")
  const [shots, setShots] = useState<Shot[]>([])
  const [lastDistance, setLastDistance] = useState<number | null>(null)
  const [isRecordingShot, setIsRecordingShot] = useState(false)
  const [showSplashScreen, setShowSplashScreen] = useState(false)
  const [currentHole, setCurrentHole] = useState(1)
  const [currentPar, setCurrentPar] = useState(4)
  const [currentShotNumber, setCurrentShotNumber] = useState(1)
  const [distanceUnit, setDistanceUnit] = useState<"yards" | "ft">("yards")
  const [useSlider, setUseSlider] = useState(false)
  const [isNut, setIsNut] = useState(false)
  const [isClutch, setIsClutch] = useState(false)
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [showHoleSummary, setShowHoleSummary] = useState(false)
  const [editingShot, setEditingShot] = useState<Shot | null>(null)
  const [editStartDistance, setEditStartDistance] = useState("")
  const [editEndDistance, setEditEndDistance] = useState("")
  const [isSyncing, setIsSyncing] = useState(false)
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null)

  // Check for recovery data on mount
  useEffect(() => {
    const checkRecoveryData = async () => {
      try {
        const stored = localStorage.getItem(RECOVERY_KEY)
        if (!stored) return

        const data: RecoveryData = JSON.parse(stored)

        // Validate that the data is still valid (round/team/player exist)
        const { data: round } = await supabase
          .from("rounds")
          .select(`
            *,
            course:courses(*),
            teams:round_teams(
              team:teams(
                *,
                players:team_players(
                  player:players(*)
                )
              )
            )
          `)
          .eq("id", data.roundId)
          .single()

        if (round) {
          const team = round.teams?.find((t: any) => t.team.id === data.teamId)
          const player = team?.team.players?.find((p: any) => p.player.id === data.playerId)

          if (team && player) {
            setRecoveryData(data)
            setCurrentView("recovery")
            return
          }
        }

        // If validation fails, clear the recovery data
        localStorage.removeItem(RECOVERY_KEY)
      } catch (error) {
        console.error("Error checking recovery data:", error)
        localStorage.removeItem(RECOVERY_KEY)
      }
    }

    checkRecoveryData()
  }, [])

  // Save recovery data whenever key state changes
  const saveRecoveryData = useCallback(() => {
    if (selectedRound && selectedTeam && selectedPlayer && currentView === "tracking") {
      const recoveryData: RecoveryData = {
        roundId: selectedRound.id,
        teamId: selectedTeam.id,
        playerId: selectedPlayer.id,
        roundName: selectedRound.name,
        teamName: selectedTeam.name,
        playerName: selectedPlayer.name,
        currentHole,
        totalShots: shots.length,
        lastActivity: new Date().toISOString(),
      }
      localStorage.setItem(RECOVERY_KEY, JSON.stringify(recoveryData))
    }
  }, [selectedRound, selectedTeam, selectedPlayer, currentView, currentHole, shots.length])

  // Save recovery data when shots change
  useEffect(() => {
    saveRecoveryData()
  }, [saveRecoveryData])

  const handleContinueFromRecovery = async () => {
    if (!recoveryData) return

    try {
      // Load the round data
      const { data: round } = await supabase
        .from("rounds")
        .select(`
          *,
          course:courses(*),
          teams:round_teams(
            team:teams(
              *,
              players:team_players(
                player:players(*)
              )
            )
          )
        `)
        .eq("id", recoveryData.roundId)
        .single()

      if (round) {
        setSelectedRound(round)

        const team = round.teams?.find((t: any) => t.team.id === recoveryData.teamId)
        if (team) {
          setSelectedTeam(team.team)

          const player = team.team.players?.find((p: any) => p.player.id === recoveryData.playerId)
          if (player) {
            setSelectedPlayer(player.player)
            setSelectedPlayerName(player.player.name)
          }
        }

        // Load course data if available
        if (round.course) {
          setLoadingCourseData(true)
          const { data: holes } = await supabase
            .from("course_holes")
            .select("*")
            .eq("course_id", round.course.id)
            .order("hole_number")

          if (holes) {
            setCourseHoles(holes)
            const currentHoleData = holes.find((h) => h.hole_number === recoveryData.currentHole)
            if (currentHoleData) {
              setCurrentPar(currentHoleData.par)
            }
          }
          setLoadingCourseData(false)
        }

        // Load existing shots
        const { data: existingShots } = await supabase
          .from("shots")
          .select("*")
          .eq("round_id", recoveryData.roundId)
          .eq("team_id", recoveryData.teamId)
          .order("hole", { ascending: true })
          .order("shot_number", { ascending: true })

        if (existingShots) {
          const formattedShots = existingShots.map((shot) => ({
            id: shot.id,
            hole: shot.hole,
            shotNumber: shot.shot_number,
            player: shot.player_name,
            shotType: shot.shot_type,
            startDistance: shot.start_distance,
            endDistance: shot.end_distance,
            calculatedDistance: shot.calculated_distance,
            par: shot.par,
            isNut: shot.is_nut || false,
            isClutch: shot.is_clutch || false,
            isGimme: shot.is_gimme || false,
            timestamp: shot.created_at,
          }))
          setShots(formattedShots)

          // Set current hole and shot number
          setCurrentHole(recoveryData.currentHole)
          const holeShots = formattedShots.filter((s) => s.hole === recoveryData.currentHole)
          setCurrentShotNumber(holeShots.length + 1)

          if (holeShots.length > 0) {
            const lastShot = holeShots[holeShots.length - 1]
            setLastDistance(lastShot.endDistance)
            setIsRecordingShot(lastShot.endDistance > 0)
          }
        }

        setCurrentView("tracking")
        setRecoveryData(null)
      }
    } catch (error) {
      console.error("Error continuing from recovery:", error)
      handleStartOverFromRecovery()
    }
  }

  const handleStartOverFromRecovery = () => {
    localStorage.removeItem(RECOVERY_KEY)
    setRecoveryData(null)
    setCurrentView("setup")
    // Reset all state
    setSelectedPlayer(null)
    setSelectedTeam(null)
    setSelectedRound(null)
    setShots([])
    setCurrentHole(1)
    setCurrentShotNumber(1)
    setLastDistance(null)
    setIsRecordingShot(false)
  }

  const loadShotsFromSupabase = async () => {
    if (!selectedRound || !selectedTeam) return

    try {
      setIsSyncing(true)
      const { data: existingShots, error } = await supabase
        .from("shots")
        .select("*")
        .eq("round_id", selectedRound.id)
        .eq("team_id", selectedTeam.id)
        .order("hole", { ascending: true })
        .order("shot_number", { ascending: true })

      if (error) throw error

      if (existingShots) {
        const formattedShots = existingShots.map((shot) => ({
          id: shot.id,
          hole: shot.hole,
          shotNumber: shot.shot_number,
          player: shot.player_name,
          shotType: shot.shot_type,
          startDistance: shot.start_distance,
          endDistance: shot.end_distance,
          calculatedDistance: shot.calculated_distance,
          par: shot.par,
          isNut: shot.is_nut || false,
          isClutch: shot.is_clutch || false,
          isGimme: shot.is_gimme || false,
          timestamp: shot.created_at,
        }))
        setShots(formattedShots)

        // Find the current state based on shots
        let maxHole = 1
        let maxShotNumber = 1
        let lastShotDistance = null

        for (const shot of formattedShots) {
          if (shot.hole > maxHole || (shot.hole === maxHole && shot.shotNumber >= maxShotNumber)) {
            maxHole = shot.hole
            maxShotNumber = shot.shotNumber + 1
            lastShotDistance = shot.endDistance
          }
        }

        setCurrentHole(maxHole)
        setCurrentShotNumber(maxShotNumber)
        setLastDistance(lastShotDistance)
        setIsRecordingShot(lastShotDistance !== null && lastShotDistance > 0)

        // Set par for current hole
        const holeData = courseHoles.find((h) => h.hole_number === maxHole)
        if (holeData) {
          setCurrentPar(holeData.par)
        }
      }
    } catch (error) {
      console.error("Error loading shots:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    if (selectedRound && selectedTeam && courseHoles.length > 0) {
      loadShotsFromSupabase()
    }
  }, [selectedRound, selectedTeam, courseHoles])

  const saveShotToSupabase = async (shot: Omit<Shot, "id" | "timestamp">) => {
    if (!selectedRound || !selectedTeam) return null

    try {
      setIsSyncing(true)

      // Handle Team Gimme conversion
      let actualPlayerName = shot.player
      let isGimme = shot.isGimme

      if (shot.player === "Team Gimme") {
        const lastPlayer = getLastPlayerOnHole(shot.hole)
        actualPlayerName = lastPlayer || selectedTeam.players[0]?.name || "Unknown"
        isGimme = true
      }

      const { data, error } = await supabase
        .from("shots")
        .insert({
          round_id: selectedRound.id,
          team_id: selectedTeam.id,
          hole: shot.hole,
          shot_number: shot.shotNumber,
          player_name: actualPlayerName,
          shot_type: shot.shotType,
          start_distance: shot.startDistance,
          end_distance: shot.endDistance,
          calculated_distance: shot.calculatedDistance,
          par: shot.par,
          is_nut: shot.isNut,
          is_clutch: shot.isClutch,
          is_gimme: isGimme,
        })
        .select()
        .single()

      if (error) throw error

      const formattedShot: Shot = {
        id: data.id,
        hole: data.hole,
        shotNumber: data.shot_number,
        player: actualPlayerName,
        shotType: data.shot_type,
        startDistance: data.start_distance,
        endDistance: data.end_distance,
        calculatedDistance: data.calculated_distance,
        par: data.par,
        isNut: data.is_nut || false,
        isClutch: data.is_clutch || false,
        isGimme: isGimme,
        timestamp: data.created_at,
      }

      return formattedShot
    } catch (error) {
      console.error("Error saving shot:", error)
      return null
    } finally {
      setIsSyncing(false)
    }
  }

  const getLastPlayerOnHole = (hole: number): string | null => {
    const holeShots = shots.filter((s) => s.hole === hole && s.player !== "Team Gimme")
    if (holeShots.length === 0) return null
    return holeShots[holeShots.length - 1].player
  }

  const handleBackToSetup = () => {
    localStorage.removeItem(RECOVERY_KEY)
    setCurrentView("setup")
    setSelectedPlayer(null)
    setSelectedTeam(null)
    setSelectedRound(null)
    setShots([])
    setCurrentHole(1)
    setCurrentShotNumber(1)
    setLastDistance(null)
    setIsRecordingShot(false)
  }

  const getIntelligentUnit = (distance: number): "yards" | "ft" => {
    return distance >= 100 ? "yards" : "ft"
  }

  const getSliderRange = (lastDist: number) => {
    if (lastDist >= 100) {
      return { min: 0, max: lastDist, step: 5 }
    } else {
      return { min: 0, max: lastDist, step: 1 }
    }
  }

  const toggleEmojiTag = (emoji: string) => {
    if (emoji === "💦") {
      setIsNut(!isNut)
    } else if (emoji === "🛟") {
      setIsClutch(!isClutch)
    }
  }

  const getEmojiState = (emoji: string) => {
    if (emoji === "💦") return isNut
    if (emoji === "🛟") return isClutch
    return false
  }

  const handleShotTypeChange = (type: string) => {
    setShotType(type)
    if (type === "Putt") {
      setDistanceUnit("ft")
    } else if (lastDistance && lastDistance >= 100) {
      setDistanceUnit("yards")
    }
  }

  const handleStartShot = () => {
    if (!currentDistance) return

    const distance = Number.parseInt(currentDistance)
    setLastDistance(distance)
    setIsRecordingShot(true)
    setCurrentDistance("")
    setSelectedPlayerName("")
    setShotType("")
    setIsNut(false)
    setIsClutch(false)
    setShowMoreOptions(false)

    setShowSplashScreen(true)
  }

  const handleContinueFromSplash = () => {
    setShowSplashScreen(false)
  }

  const handleRecordShot = async (endDistance?: number, isHoleOut = false, isGimme = false) => {
    if (!selectedPlayerName || !selectedShotType) return
    if (!isHoleOut && !isGimme && !endDistance && endDistance !== 0) return

    const finalEndDistance = isHoleOut || isGimme ? 0 : endDistance!
    const calculatedDistance = (lastDistance || 0) - finalEndDistance

    const shotData: Omit<Shot, "id" | "timestamp"> = {
      hole: currentHole,
      shotNumber: currentShotNumber,
      player: selectedPlayerName,
      shotType: selectedShotType,
      startDistance: lastDistance || 0,
      endDistance: finalEndDistance,
      calculatedDistance,
      par: currentPar,
      isNut,
      isClutch,
      isGimme,
    }

    const savedShot = await saveShotToSupabase(shotData)
    if (savedShot) {
      setShots((prev) => [...prev, savedShot])
    }

    if (isHoleOut || isGimme) {
      setShowHoleSummary(true)
    } else {
      setLastDistance(finalEndDistance)
      setCurrentShotNumber((prev) => prev + 1)
    }

    setIsRecordingShot(finalEndDistance > 0)
    setSelectedPlayerName("")
    setShotType("")
    setCurrentDistance("")
    setIsNut(false)
    setIsClutch(false)
    setShowMoreOptions(false)
  }

  const handleContinueToNextHole = () => {
    if (currentHole < 18) {
      const nextHole = currentHole + 1
      setCurrentHole(nextHole)
      setCurrentShotNumber(1)
      setLastDistance(null)
      setIsRecordingShot(false)
      setShowHoleSummary(false)

      const holeData = courseHoles.find((h) => h.hole_number === nextHole)
      if (holeData) {
        setCurrentPar(holeData.par)
      }
    }
  }

  const handlePreviousHole = () => {
    if (currentHole > 1) {
      const prevHole = currentHole - 1
      setCurrentHole(prevHole)

      const holeData = courseHoles.find((h) => h.hole_number === prevHole)
      if (holeData) {
        setCurrentPar(holeData.par)
      }

      const holeShots = shots.filter((s) => s.hole === prevHole)
      if (holeShots.length > 0) {
        const lastShot = holeShots[holeShots.length - 1]
        setLastDistance(lastShot.endDistance)
        setCurrentShotNumber(holeShots.length + 1)
        setIsRecordingShot(lastShot.endDistance > 0)
      } else {
        setLastDistance(null)
        setCurrentShotNumber(1)
        setIsRecordingShot(false)
      }
    }
  }

  const handleSelectCourse = async (courseId: string) => {
    if (!selectedRound) return

    try {
      setLoadingCourseData(true)

      const { error: updateError } = await supabase
        .from("rounds")
        .update({ course_id: courseId })
        .eq("id", selectedRound.id)

      if (updateError) throw updateError

      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single()

      if (courseError) throw courseError

      const { data: holes, error: holesError } = await supabase
        .from("course_holes")
        .select("*")
        .eq("course_id", courseId)
        .order("hole_number")

      if (holesError) throw holesError

      setCourseHoles(holes || [])
      setSelectedRound((prev) => (prev ? { ...prev, course } : null))

      const hole1 = holes?.find((h) => h.hole_number === 1)
      if (hole1) {
        setCurrentPar(hole1.par)
      }

      setCurrentView("tracking")
    } catch (error) {
      console.error("Error selecting course:", error)
    } finally {
      setLoadingCourseData(false)
    }
  }

  const handleEditShot = (shot: Shot) => {
    setEditingShot(shot)
    setSelectedPlayerName(shot.player)
    setShotType(shot.shotType)
    setEditStartDistance(shot.startDistance.toString())
    setEditEndDistance(shot.endDistance.toString())
    setIsNut(shot.isNut)
    setIsClutch(shot.isClutch)
    setCurrentView("shot-edit")
  }

  const handleSaveEditedShot = async () => {
    if (!editingShot || !selectedPlayerName || !selectedShotType || !editStartDistance || !editEndDistance) return

    try {
      setIsSyncing(true)

      const startDist = Number.parseInt(editStartDistance)
      const endDist = Number.parseInt(editEndDistance)
      const calculatedDist = startDist - endDist

      const { error } = await supabase
        .from("shots")
        .update({
          player_name: selectedPlayerName,
          shot_type: selectedShotType,
          start_distance: startDist,
          end_distance: endDist,
          calculated_distance: calculatedDist,
          is_nut: isNut,
          is_clutch: isClutch,
        })
        .eq("id", editingShot.id)

      if (error) throw error

      setShots((prev) =>
        prev.map((shot) =>
          shot.id === editingShot.id
            ? {
                ...shot,
                player: selectedPlayerName,
                shotType: selectedShotType,
                startDistance: startDist,
                endDistance: endDist,
                calculatedDistance: calculatedDist,
                isNut,
                isClutch,
              }
            : shot,
        ),
      )

      const nextShot = shots.find(
        (shot) => shot.hole === editingShot.hole && shot.shotNumber === editingShot.shotNumber + 1,
      )

      if (nextShot) {
        const { error: nextShotError } = await supabase
          .from("shots")
          .update({
            start_distance: endDist,
          })
          .eq("id", nextShot.id)

        if (nextShotError) throw nextShotError

        setShots((prev) => prev.map((shot) => (shot.id === nextShot.id ? { ...shot, startDistance: endDist } : shot)))
      }

      setCurrentView("tracking")
      setEditingShot(null)
    } catch (error) {
      console.error("Error updating shot:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDeleteShot = async () => {
    if (!editingShot) return

    try {
      setIsSyncing(true)

      const { error } = await supabase.from("shots").delete().eq("id", editingShot.id)

      if (error) throw error

      setShots((prev) => prev.filter((shot) => shot.id !== editingShot.id))
      setCurrentView("tracking")
      setEditingShot(null)
    } catch (error) {
      console.error("Error deleting shot:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  const formatDistance = (distance: number): string => {
    if (distance >= 100) {
      return `${distance}y`
    } else {
      return `${distance}ft`
    }
  }

  const getDistanceColor = (distance: number): string => {
    if (distance >= 200) return "bg-red-500"
    if (distance >= 100) return "bg-orange-500"
    if (distance >= 50) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getScoreInfo = (hole: number) => {
    const holeShots = shots.filter((s) => s.hole === hole)
    if (holeShots.length === 0) return null

    const par = holeShots[0]?.par || 4
    const score = holeShots.length
    const scoreName =
      score === par - 2
        ? "Eagle"
        : score === par - 1
          ? "Birdie"
          : score === par
            ? "Par"
            : score === par + 1
              ? "Bogey"
              : score === par + 2
                ? "Double Bogey"
                : `+${score - par}`

    return { score, par, scoreName }
  }

  const getTotalScore = () => {
    const totalShots = shots.length
    const totalPar = shots.reduce((sum, shot) => {
      const holeShots = shots.filter((s) => s.hole === shot.hole)
      return holeShots.length === 1 ? sum + shot.par : sum
    }, 0)

    return totalShots - totalPar
  }

  return {
    // State
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
    recoveryData,

    // Setters
    setSelectedPlayer,
    setSelectedTeam,
    setSelectedRound,
    setCurrentView,
    setCurrentDistance,
    setSelectedPlayerName,
    setShotType,
    setDistanceUnit,
    setUseSlider,
    setShowMoreOptions,
    setEditStartDistance,
    setEditEndDistance,

    // Handlers
    handleBackToSetup,
    handleContinueFromRecovery,
    handleStartOverFromRecovery,
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
  }
}
