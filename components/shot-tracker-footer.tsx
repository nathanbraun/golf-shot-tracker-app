"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin } from "lucide-react"

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
    <Card className="bg-gray-50 border-gray-200">
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <Button
            onClick={onBackToSetup}
            variant="ghost"
            size="sm"
            className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Setup
          </Button>
          <div className="text-center flex-1">
            {selectedRound && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-700">{selectedRound.name}</div>
                {selectedRound.course && (
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <MapPin className="w-2.5 h-2.5" />
                    {selectedRound.course.name}
                  </div>
                )}
                {selectedTeam && selectedPlayer && (
                  <div className="text-xs text-muted-foreground">
                    {selectedPlayer.name} • {selectedTeam.name}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="w-12"></div> {/* Spacer to balance the layout */}
        </div>
      </CardContent>
    </Card>
  )
}
