"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"

const supabase = createClient()

export interface Shot {
  id: string
  hole: number
  shotNumber: number
  player: string
  shotType: string
  startDistance: number
  endDistance: number
  calculatedDistance: number
  made: boolean
  isGimme: boolean
  isNut: boolean
  isClutch: boolean
  par: number
  timestamp: string
}

export interface Player {
  id: string
  name: string
  email?: string
}

export interface Team {
  id: string
  name: string
  players: Player[]
}

export interface Course {
  id: string
  name: string
  location?: string
}

export interface Round {
  id: string
  name: string
  date: string
  course?: Course
}

export interface CourseHole {
  id: string
  course_id: string
  hole_number: number
  par: number
  distance: number
  handicap?: number
}

export function useShotTracking() {
  // State management
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedRound, setSelectedRound] = useState<Round | null>(null)
  const [courseHoles, setCourseHoles] = useState<CourseHole[]>([])
  const [loadingCourseData, setLoadingCourseData] = useState(false)
  const [currentView, setCurrentView] = useState<string>("tracking")
  const [currentDistance, setCurrentDistance] = useState<number>(150)
  const [selectedPlayerName, setSelectedPlayerName] = useState<string>("")
  const [selectedShotType, setShotType] = useState<string>("Drive")
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

  // Get intelligent unit based on distance
  const getIntelligentUnit = useCallback((distance: number): "yards" | "ft" => {
    return distance >= 100 ? "yards" : "ft"
  }, [])

  // Get slider range based on last distance and shot type
  const getSliderRange = useCallback(
    (lastDist: number, shotType: string) => {
      const unit = getIntelligentUnit(lastDist)
      if (unit === "ft") {
        return { min: 0, max: Math.max(lastDist, 50), step: 1 }
      }

      // For yards
      if (shotType === "Putt") {
        return { min: 0, max: Math.max(lastDist, 20), step: 1 }
      }
      return { min: 0, max: Math.max(lastDist, 200), step: 5 }
    },
    [getIntelligentUnit],
  )

  // Toggle emoji tags
  const toggleEmojiTag = useCallback(
    (emoji: string) => {
      if (emoji === "💦") {
        setIsNut(!isNut)
      } else if (emoji === "🛟") {
        setIsClutch(!isClutch)
      }
    },
    [isNut, isClutch],
  )

  // Get emoji state
  const getEmojiState = useCallback(
    (emoji: string) => {
      if (emoji === "💦") return isNut
      if (emoji === "🛟") return isClutch
      return false
    },
    [isNut, isClutch],
  )

  // Get smart defaults for shot type based on hole and shot number
  const getSmartDefaults = useCallback((hole: number, shotNumber: number, par: number) => {
    if (shotNumber === 1) {
      // First shot - check if it's a par 3
      return par === 3 ? "Approach" : "Drive"
    }
    if (shotNumber === 2) {
      if (par === 3) return "Putt"
      return "Approach"
    }
    if (shotNumber === 3) {
      if (par === 4) return "Putt"
      return "Approach"
    }
    return "Putt"
  }, [])

  // Handle shot type change
  const handleShotTypeChange = useCallback(
    (type: string) => {
      setShotType(type)

      // Auto-adjust distance unit based on shot type
      if (type === "Putt" && lastDistance && lastDistance < 100) {
        setDistanceUnit("ft")
      } else if (type === "Drive" || type === "Approach") {
        setDistanceUnit("yards")
      }
    },
    [lastDistance],
  )

  // Handle starting a shot
  const handleStartShot = useCallback(() => {
    setIsRecordingShot(true)
    setShowSplashScreen(false)

    // Set smart defaults
    const smartShotType = getSmartDefaults(currentHole, currentShotNumber, currentPar)
    setShotType(smartShotType)

    // Set intelligent distance unit
    if (lastDistance) {
      setDistanceUnit(getIntelligentUnit(lastDistance))
      setCurrentDistance(lastDistance)
    }
  }, [currentHole, currentShotNumber, currentPar, lastDistance, getSmartDefaults, getIntelligentUnit])

  // Handle continuing from splash screen
  const handleContinueFromSplash = useCallback(() => {
    setShowSplashScreen(false)
    setIsRecordingShot(true)
  }, [])

  // Handle recording a shot
  const handleRecordShot = useCallback(async () => {
    if (!selectedPlayerName || !selectedShotType || currentDistance === null) return

    const newShot: Shot = {
      id: `${Date.now()}-${Math.random()}`,
      hole: currentHole,
      shotNumber: currentShotNumber,
      player: selectedPlayerName,
      shotType: selectedShotType,
      startDistance: lastDistance || currentDistance,
      endDistance: currentDistance,
      calculatedDistance: (lastDistance || currentDistance) - currentDistance,
      made: currentDistance === 0,
      isGimme: selectedPlayerName === "Team Gimme",
      isNut,
      isClutch,
      par: currentPar,
      timestamp: new Date().toISOString(),
    }

    setShots((prev) => [...prev, newShot])
    setLastDistance(currentDistance)
    setCurrentShotNumber((prev) => prev + 1)
    setIsRecordingShot(false)

    // Reset emoji tags
    setIsNut(false)
    setIsClutch(false)

    // Show splash screen
    setShowSplashScreen(true)
  }, [
    selectedPlayerName,
    selectedShotType,
    currentDistance,
    lastDistance,
    currentHole,
    currentShotNumber,
    currentPar,
    isNut,
    isClutch,
  ])

  // Handle continuing to next hole
  const handleContinueToNextHole = useCallback(() => {
    if (currentHole < 18) {
      setCurrentHole((prev) => prev + 1)
      const nextHole = courseHoles.find((h) => h.hole_number === currentHole + 1)
      setCurrentPar(nextHole?.par || 4)
      setCurrentShotNumber(1)
      setLastDistance(nextHole?.distance || 150)
      setCurrentDistance(nextHole?.distance || 150)
      setIsRecordingShot(false)
      setShowHoleSummary(false)
      setDistanceUnit(getIntelligentUnit(nextHole?.distance || 150))
    }
  }, [currentHole, courseHoles, getIntelligentUnit])

  // Handle previous hole
  const handlePreviousHole = useCallback(() => {
    if (currentHole > 1) {
      setCurrentHole((prev) => prev - 1)
      const prevHole = courseHoles.find((h) => h.hole_number === currentHole - 1)
      setCurrentPar(prevHole?.par || 4)
      setCurrentShotNumber(1)
      setLastDistance(prevHole?.distance || 150)
      setCurrentDistance(prevHole?.distance || 150)
      setIsRecordingShot(false)
      setDistanceUnit(getIntelligentUnit(prevHole?.distance || 150))
    }
  }, [currentHole, courseHoles, getIntelligentUnit])

  // Handle back to setup
  const handleBackToSetup = useCallback(() => {
    // Reset all state
    setSelectedPlayer(null)
    setSelectedTeam(null)
    setSelectedRound(null)
    setCurrentView("tracking")
    setShots([])
    setCurrentHole(1)
    setCurrentPar(4)
    setCurrentShotNumber(1)
    setIsRecordingShot(false)
    setShowSplashScreen(false)
    setShowHoleSummary(false)
  }, [])

  // Handle course selection
  const handleSelectCourse = useCallback((course: Course) => {
    // Implementation for course selection
    console.log("Selected course:", course)
  }, [])

  // Handle shot editing
  const handleEditShot = useCallback((shot: Shot) => {
    setEditingShot(shot)
    setSelectedPlayerName(shot.player)
    setShotType(shot.shotType)
    setEditStartDistance(shot.startDistance.toString())
    setEditEndDistance(shot.endDistance.toString())
    setIsNut(shot.isNut)
    setIsClutch(shot.isClutch)
    setCurrentView("shot-edit")
  }, [])

  // Handle saving edited shot
  const handleSaveEditedShot = useCallback(() => {
    if (!editingShot || !selectedPlayerName || !selectedShotType || !editStartDistance || !editEndDistance) return

    const updatedShot: Shot = {
      ...editingShot,
      player: selectedPlayerName,
      shotType: selectedShotType,
      startDistance: Number.parseInt(editStartDistance),
      endDistance: Number.parseInt(editEndDistance),
      calculatedDistance: Number.parseInt(editStartDistance) - Number.parseInt(editEndDistance),
      made: Number.parseInt(editEndDistance) === 0,
      isGimme: selectedPlayerName === "Team Gimme",
      isNut,
      isClutch,
    }

    setShots((prev) => prev.map((shot) => (shot.id === editingShot.id ? updatedShot : shot)))
    setCurrentView("tracking")
    setEditingShot(null)
  }, [editingShot, selectedPlayerName, selectedShotType, editStartDistance, editEndDistance, isNut, isClutch])

  // Handle deleting shot
  const handleDeleteShot = useCallback(() => {
    if (!editingShot) return

    setShots((prev) => prev.filter((shot) => shot.id !== editingShot.id))
    setCurrentView("tracking")
    setEditingShot(null)
  }, [editingShot])

  // Format distance for display
  const formatDistance = useCallback(
    (distance: number) => {
      const unit = getIntelligentUnit(distance)
      return `${distance} ${unit}`
    },
    [getIntelligentUnit],
  )

  // Get distance color based on range
  const getDistanceColor = useCallback((distance: number) => {
    if (distance >= 200) return "bg-red-500"
    if (distance >= 100) return "bg-orange-500"
    if (distance >= 50) return "bg-yellow-500"
    if (distance >= 20) return "bg-blue-500"
    return "bg-green-500"
  }, [])

  // Get score info for a hole
  const getScoreInfo = useCallback(
    (hole: number, par: number) => {
      const holeShots = shots.filter((shot) => shot.hole === hole)
      if (holeShots.length === 0) return null

      const totalShots = holeShots.length
      const scoreToPar = totalShots - par

      let scoreName = "Par"
      let scoreColor = "text-blue-600"

      if (scoreToPar === -2) {
        scoreName = "Eagle"
        scoreColor = "text-yellow-600"
      } else if (scoreToPar === -1) {
        scoreName = "Birdie"
        scoreColor = "text-green-600"
      } else if (scoreToPar === 1) {
        scoreName = "Bogey"
        scoreColor = "text-orange-600"
      } else if (scoreToPar >= 2) {
        scoreName = "Double+"
        scoreColor = "text-red-600"
      }

      return {
        totalShots,
        scoreToPar,
        scoreName,
        scoreColor,
      }
    },
    [shots],
  )

  // Get total score
  const getTotalScore = useCallback(() => {
    const completedHoles = [...new Set(shots.map((shot) => shot.hole))]
    let totalShots = 0
    let totalPar = 0

    completedHoles.forEach((hole) => {
      const holeShots = shots.filter((shot) => shot.hole === hole)
      const holePar = holeShots[0]?.par || 4
      totalShots += holeShots.length
      totalPar += holePar
    })

    return {
      totalShots,
      totalPar,
      totalToPar: totalShots - totalPar,
      holesCompleted: completedHoles.length,
    }
  }, [shots])

  // Load course data when round is selected
  useEffect(() => {
    if (selectedRound?.course?.id) {
      setLoadingCourseData(true)
      // Simulate loading course data
      setTimeout(() => {
        // Mock course holes data
        const mockHoles: CourseHole[] = Array.from({ length: 18 }, (_, i) => ({
          id: `hole-${i + 1}`,
          course_id: selectedRound.course!.id,
          hole_number: i + 1,
          par: i % 6 === 0 ? 5 : i % 3 === 0 ? 3 : 4,
          distance: i % 6 === 0 ? 520 : i % 3 === 0 ? 165 : 380,
          handicap: i + 1,
        }))

        setCourseHoles(mockHoles)
        setCurrentPar(mockHoles[0]?.par || 4)
        setLastDistance(mockHoles[0]?.distance || 150)
        setCurrentDistance(mockHoles[0]?.distance || 150)
        setDistanceUnit(getIntelligentUnit(mockHoles[0]?.distance || 150))
        setLoadingCourseData(false)
      }, 1000)
    }
  }, [selectedRound, getIntelligentUnit])

  // Check if hole is complete
  useEffect(() => {
    const currentHoleShots = shots.filter((shot) => shot.hole === currentHole)
    const lastShot = currentHoleShots[currentHoleShots.length - 1]

    if (lastShot && (lastShot.made || lastShot.endDistance === 0)) {
      setShowHoleSummary(true)
      setIsRecordingShot(false)
      setShowSplashScreen(false)
    }
  }, [shots, currentHole])

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

    // Setters
    setCurrentView,
    setCurrentDistance,
    setSelectedPlayerName,
    setShotType,
    setDistanceUnit,
    setUseSlider,
    setShowMoreOptions,
    setEditStartDistance,
    setEditEndDistance,
    setSelectedPlayer,
    setSelectedTeam,
    setSelectedRound,

    // Handlers
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
  }
}
