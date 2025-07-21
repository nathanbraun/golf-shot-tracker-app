"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Users, Calendar, Settings } from "lucide-react"

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
  onShowSettings?: () => void  // Add this new prop
}

export default function ShotTrackerFooter({
  selectedRound,
  selectedTeam,
  selectedPlayer,
  onBackToSetup,
  onShowSettings,  // Add this new prop
}: ShotTrackerFooterProps) {
  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardContent className="py-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{selectedRound?.name || "No Round Selected"}</span>
            </div>
            <div className="flex items-center gap-2">
              {onShowSettings && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShowSettings}
                  className="flex items-center gap-1 text-xs h-6 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Settings className="w-3 h-3" />
                  Settings
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToSetup}
                className="flex items-center gap-1 text-xs h-6 px-2"
              >
                <ArrowLeft className="w-3 h-3" />
                Setup
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{selectedRound?.course?.name || "No Course"}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{selectedTeam?.name || "No Team"}</span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {selectedPlayer?.name || "No Player"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
