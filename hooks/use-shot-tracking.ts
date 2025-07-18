"use client"

import { useState, useEffect, useCallback } from "react"
import { shotsApi, holeCompletionsApi } from "@/lib/supabase"

export interface ShotData {
  id?: string
  player: string
  shotType: string
  startDistance: number
  endDistance: number
  made: boolean
  isNut: boolean
  isClutch: boolean
  isGimme: boolean
}

export interface HoleData {
  holeNumber: number
  par: number
  distance: number
  shots: ShotData[]
  completed: boolean
  totalShots: number
  scoreRelativeToPar: number
}

interface UseShotTrackingProps {
  roundId: string
  teamId: string
  courseHoles: Array<{ hole_number: number; par: number; distance: number }>
  teamPlayers: string[]
}

export function useShotTracking({ roundId, teamId, courseHoles, teamPlayers }: UseShotTrackingProps) {
  const [currentHole, setCurrentHole] = useState(1)
  const [holes, setHoles] = useState<Record<number, HoleData>>({})
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // Initialize holes from course data
  useEffect(() => {
    const initialHoles: Record<number, HoleData> = {}
    courseHoles.forEach((hole) => {
      initialHoles[hole.hole_number] = {
        holeNumber: hole.hole_number,
        par: hole.par,
        distance: hole.distance,
        shots: [],
        completed: false,
        totalShots: 0,
        scoreRelativeToPar: 0,
      }
    })
    setHoles(initialHoles)
  }, [courseHoles])

  // Load existing shots from database
  const loadExistingShots = useCallback(async () => {
    if (!roundId || !teamId) return

    setLoading(true)
    try {
      const shots = await shotsApi.getShotsByTeamAndRound(teamId, roundId)
      const updatedHoles = { ...holes }

      // Group shots by hole
      shots.forEach((shot) => {
        const holeNumber = shot.hole_number
        if (updatedHoles[holeNumber]) {
          const shotData: ShotData = {
            id: shot.id,
            player: shot.player?.name || "Unknown",
            shotType: shot.shot_type,
            startDistance: shot.start_distance,
            endDistance: shot.end_distance,
            made: shot.made,
            isNut: shot.is_nut,
            isClutch: shot.is_clutch,
            isGimme: shot.is_gimme,
          }
          updatedHoles[holeNumber].shots.push(shotData)
        }
      })

      // Calculate totals for each hole
      Object.keys(updatedHoles).forEach((holeNumStr) => {
        const holeNum = Number.parseInt(holeNumStr)
        const hole = updatedHoles[holeNum]
        hole.totalShots = hole.shots.length
        hole.scoreRelativeToPar = hole.totalShots - hole.par
        hole.completed = hole.shots.length > 0 && hole.shots[hole.shots.length - 1].endDistance === 0
      })

      setHoles(updatedHoles)

      // Find the current hole (first incomplete hole)
      const incompleteHole = Object.values(updatedHoles).find((hole) => !hole.completed)
      if (incompleteHole) {
        setCurrentHole(incompleteHole.holeNumber)
      }
    } catch (error) {
      console.error("Error loading existing shots:", error)
    }
    setLoading(false)
  }, [roundId, teamId, holes])

  // Add a shot to the current hole
  const addShot = useCallback(
    (shotData: Omit<ShotData, "id">) => {
      setHoles((prev) => {
        const updated = { ...prev }
        const hole = updated[currentHole]
        if (hole) {
          hole.shots.push(shotData)
          hole.totalShots = hole.shots.length
          hole.scoreRelativeToPar = hole.totalShots - hole.par
          hole.completed = shotData.endDistance === 0
        }
        return updated
      })
    },
    [currentHole],
  )

  // Complete the current hole and move to next
  const completeHole = useCallback(async () => {
    const hole = holes[currentHole]
    if (!hole || hole.shots.length === 0) return

    setSyncing(true)
    try {
      // Save all shots for this hole to database
      const shotsToSave = hole.shots
        .filter((shot) => !shot.id) // Only save new shots
        .map((shot, index) => ({
          round_id: roundId,
          team_id: teamId,
          player_id: teamPlayers.find((p) => p === shot.player) || teamPlayers[0], // Find player ID
          hole_number: currentHole,
          shot_number: hole.shots.indexOf(shot) + 1,
          shot_type: shot.shotType as any,
          start_distance: shot.startDistance,
          end_distance: shot.endDistance,
          calculated_distance: shot.startDistance - shot.endDistance,
          made: shot.made,
          is_nut: shot.isNut,
          is_clutch: shot.isClutch,
          is_gimme: shot.isGimme,
        }))

      if (shotsToSave.length > 0) {
        await shotsApi.createShots(shotsToSave)
      }

      // Save hole completion
      const longestShot = hole.shots.reduce(
        (longest, shot) => {
          const distance = shot.startDistance - shot.endDistance
          return distance > longest.distance ? { distance, shot } : longest
        },
        { distance: 0, shot: null as ShotData | null },
      )

      await holeCompletionsApi.upsertCompletion({
        round_id: roundId,
        team_id: teamId,
        hole_number: currentHole,
        par: hole.par,
        total_shots: hole.totalShots,
        score_to_par: hole.scoreRelativeToPar,
        completed_at: new Date().toISOString(),
        longest_shot_distance: longestShot.distance > 0 ? longestShot.distance : undefined,
        longest_shot_player_id: longestShot.shot ? teamPlayers.find((p) => p === longestShot.shot!.player) : undefined,
        longest_shot_type: longestShot.shot?.shotType,
      })

      // Move to next hole
      const nextHole = currentHole + 1
      if (holes[nextHole]) {
        setCurrentHole(nextHole)
      }
    } catch (error) {
      console.error("Error completing hole:", error)
    }
    setSyncing(false)
  }, [holes, currentHole, roundId, teamId, teamPlayers])

  // Get smart defaults for shot type based on context
  const getSmartDefaults = useCallback(
    (shotNumber: number, holeNumber: number) => {
      const hole = holes[holeNumber]
      if (!hole) return { shotType: "Drive", startDistance: 150 }

      const par = hole.par
      const holeDistance = hole.distance

      // First shot defaults
      if (shotNumber === 1) {
        if (par === 3) {
          return { shotType: "Approach", startDistance: holeDistance }
        } else {
          return { shotType: "Drive", startDistance: holeDistance }
        }
      }

      // Subsequent shots - look at previous shot
      const previousShot = hole.shots[shotNumber - 2]
      if (previousShot) {
        if (previousShot.endDistance <= 30) {
          return { shotType: "Putt", startDistance: previousShot.endDistance }
        } else if (previousShot.endDistance <= 100) {
          return { shotType: "Chip", startDistance: previousShot.endDistance }
        } else {
          return { shotType: "Approach", startDistance: previousShot.endDistance }
        }
      }

      // Default fallback
      return { shotType: "Approach", startDistance: 150 }
    },
    [holes],
  )

  // Navigate to specific hole
  const goToHole = useCallback(
    (holeNumber: number) => {
      if (holes[holeNumber]) {
        setCurrentHole(holeNumber)
      }
    },
    [holes],
  )

  // Get current hole data
  const getCurrentHole = useCallback(() => {
    return holes[currentHole] || null
  }, [holes, currentHole])

  // Get summary stats
  const getSummaryStats = useCallback(() => {
    const completedHoles = Object.values(holes).filter((hole) => hole.completed)
    const totalShots = completedHoles.reduce((sum, hole) => sum + hole.totalShots, 0)
    const totalPar = completedHoles.reduce((sum, hole) => sum + hole.par, 0)
    const scoreRelativeToPar = totalShots - totalPar

    return {
      holesCompleted: completedHoles.length,
      totalHoles: Object.keys(holes).length,
      totalShots,
      scoreRelativeToPar,
      completedHoles,
    }
  }, [holes])

  return {
    currentHole,
    holes,
    loading,
    syncing,
    addShot,
    completeHole,
    loadExistingShots,
    getSmartDefaults,
    goToHole,
    getCurrentHole,
    getSummaryStats,
  }
}
