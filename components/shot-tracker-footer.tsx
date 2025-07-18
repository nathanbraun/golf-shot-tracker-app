"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Users } from "lucide-react"

interface ShotTrackerFooterProps {
  selectedRound?: {
    name: string
    course?: {
      name: string
    }
  } | null
  selectedTeam?: {
    name: string
  } | null
  selectedPlayer?: {
    name: string
  } | null
  onBackToSetup: () => void
}

export default function ShotTrackerFooter({
  selectedRound,
  selectedTeam,
  selectedPlayer,
  onBackToSetup,
}: ShotTrackerFooterProps) {
  return (
    <div className="mt-6 pt-4 border-t border-gray-200 bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <Button onClick={onBackToSetup} variant="outline" size="sm" className="text-xs h-8 px-3 bg-white">
          <ArrowLeft className="w-3 h-3 mr-1" />
          Setup
        </Button>

        <div className="text-center text-xs text-muted-foreground space-y-1">
          {selectedRound && <div className="font-medium text-gray-700">{selectedRound.name}</div>}
          {selectedRound?.course && (
            <div className="flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" />
              {selectedRound.course.name}
            </div>
          )}
          {selectedTeam && selectedPlayer && (
            <div className="flex items-center justify-center gap-1">
              <Users className="w-3 h-3" />
              {selectedPlayer.name} • {selectedTeam.name}
            </div>
          )}
        </div>

        <div className="w-16" />
      </div>
    </div>
  )
}
