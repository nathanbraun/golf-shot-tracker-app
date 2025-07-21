"use client"

import { feetToYards, shouldDisplayInFeet, formatDistance as formatDistanceUtil } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Trophy, Target, TrendingUp, MapPin, Users } from "lucide-react"

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
  isGimme: boolean
  timestamp: Date
}

interface SummaryPageProps {
  shots: Shot[]
}

export default function SummaryPage({ shots }: SummaryPageProps) {
  // Filter out gimme shots for main statistics
  const nonGimmeShots = shots.filter((shot) => !shot.isGimme)

  // Player statistics
  const playerStats = nonGimmeShots.reduce(
    (acc, shot) => {
      if (!acc[shot.player]) {
        acc[shot.player] = {
          totalShots: 0,
          totalDistance: 0,
          shotTypes: {},
          bestShot: 0,
          nutShots: 0,
          clutchShots: 0,
          holes: new Set(),
        }
      }

      acc[shot.player].totalShots++
      acc[shot.player].totalDistance += shot.calculatedDistance
      acc[shot.player].shotTypes[shot.shotType] = (acc[shot.player].shotTypes[shot.shotType] || 0) + 1
      acc[shot.player].bestShot = Math.max(acc[shot.player].bestShot, shot.calculatedDistance)
      if (shot.isNut) acc[shot.player].nutShots++
      if (shot.isClutch) acc[shot.player].clutchShots++

      return acc
    },
    {} as Record<string, any>,
  )

  // Shot type breakdown (use non-gimme shots)
  const shotTypeStats = nonGimmeShots.reduce(
    (acc, shot) => {
      acc[shot.shotType] = (acc[shot.shotType] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Hole-by-hole breakdown
  const holeStats = shots.reduce(
    (acc, shot) => {
      if (!acc[shot.hole]) {
        acc[shot.hole] = {
          par: shot.par,
          shots: [],
          totalShots: 0,
        }
      }
      acc[shot.hole].shots.push(shot)
      acc[shot.hole].totalShots++
      return acc
    },
    {} as Record<number, any>,
  )

  const totalShots = nonGimmeShots.length
  const totalDistance = nonGimmeShots.reduce((sum, shot) => sum + shot.calculatedDistance, 0)
  const avgDistance = totalShots > 0 ? Math.round(totalDistance / totalShots) : 0
  const longestShot = Math.max(...nonGimmeShots.map((shot) => shot.calculatedDistance), 0)
  const holesPlayed = new Set(nonGimmeShots.map((shot) => shot.hole)).size

  const formatDistance = (distance: number, shotType?: string) => {
    return formatDistanceUtil(distance, shotType || "")
  }

  const getDistanceColor = (distance: number) => {
    // For shot types typically measured in feet (like putts)
    if (shouldDisplayInFeet(distance)) {
      if (distance >= 30) return "text-purple-600"
      if (distance >= 15) return "text-blue-600" 
      if (distance >= 5) return "text-yellow-600"
      return "text-green-600"
    }
    
    // For shots typically measured in yards
    const yards = feetToYards(distance)
    if (yards >= 250) return "text-green-600"
    if (yards >= 150) return "text-blue-600"
    if (yards >= 50) return "text-yellow-600"
    return "text-purple-600"
  }

  const sortedPlayers = Object.entries(playerStats).sort(([, a], [, b]) => b.totalShots - a.totalShots)

  // Modify the getPlayerColorForName function to return both class name and actual color value
  const getPlayerColorForName = (playerName: string) => {
    const playerColorMap: Record<string, { class: string, color: string }> = {
      Brusda: { class: "bg-blue-500", color: "#3b82f6" },  // blue-500
      Nate: { class: "bg-green-500", color: "#22c55e" },   // green-500
      Mikey: { class: "bg-yellow-500", color: "#eab308" }, // yellow-500
      Strauss: { class: "bg-purple-500", color: "#a855f7" }, // purple-500
      "Team Gimme": { class: "bg-gray-400", color: "#9ca3af" }, // gray-400
    }
    return playerColorMap[playerName] || { class: "bg-red-500", color: "#ef4444" } // red-500 as fallback
  }

  // Update the getPlayerColor function as well (for backwards compatibility)
  const getPlayerColor = (index: number) => {
    const colors = [
      { class: "bg-blue-500", color: "#3b82f6" },
      { class: "bg-green-500", color: "#22c55e" },
      { class: "bg-yellow-500", color: "#eab308" },
      { class: "bg-purple-500", color: "#a855f7" },
      { class: "bg-red-500", color: "#ef4444" }
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Round Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600">{holesPlayed}</div>
              <div className="text-sm text-muted-foreground">Holes Played</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">{totalShots}</div>
              <div className="text-sm text-muted-foreground">Total Shots</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600">
                {nonGimmeShots.filter((shot) => shot.isNut || shot.isClutch).length}
              </div>
              <div className="text-sm text-muted-foreground">Tagged Shots</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">{formatDistance(avgDistance)}</div>
              <div className="text-sm text-muted-foreground">Avg Distance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Player Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedPlayers.map(([player, stats], index) => {
              const percentage = Math.round((stats.totalShots / totalShots) * 100)
              const avgPlayerDistance = Math.round(stats.totalDistance / stats.totalShots)
              const playerColor = getPlayerColorForName(player)

              return (
                <div key={player} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Customize the badge for the winner */}
                      <Badge 
                        variant={index === 0 ? "outline" : "outline"} 
                        className={`w-16 justify-center ${index === 0 ? "border-yellow-400 text-yellow-500" : ""}`}
                      >
                        {index === 0 ? "🏆" : `#${index + 1}`}
                      </Badge>
                      <div>
                        <div className="font-medium">{player}</div>
                        <div className="text-sm text-muted-foreground">
                          {stats.totalShots} shots • {formatDistance(avgPlayerDistance)} avg • {stats.nutShots}💦{" "}
                          {stats.clutchShots}🛟
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{percentage}%</div>
                      <div className="text-sm text-muted-foreground">of shots</div>
                    </div>
                  </div>
                  {/* Custom progress bar implementation */}
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: playerColor.color 
                      }}
                    ></div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(stats.shotTypes).map(([type, count]) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}: {count}
                      </Badge>
                    ))}
                  </div>
                  {index < sortedPlayers.length - 1 && <Separator className="mt-4" />}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Shot Type Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Shot Type Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(shotTypeStats)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count], index) => {
                const percentage = Math.round((count / totalShots) * 100)
                // Use a different color for each shot type
                const shotTypeColors = [
                  "#3b82f6", // blue-500
                  "#22c55e", // green-500
                  "#eab308", // yellow-500
                  "#a855f7", // purple-500
                  "#ef4444"  // red-500
                ]
                const color = shotTypeColors[index % shotTypeColors.length]
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{type}</span>
                      <span className="text-sm text-muted-foreground">{count} shots</span>
                    </div>
                    {/* Custom progress bar implementation */}
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${percentage}%`, 
                          backgroundColor: color 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground">{percentage}% of total</div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Drive Breakdown Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🏌️</span>
            Drive Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const driveShots = nonGimmeShots.filter((shot) => shot.shotType === "Drive")
            if (driveShots.length === 0) {
              return <div className="text-center text-sm text-muted-foreground py-8">No drives recorded yet</div>
            }

            const driveStats = driveShots.reduce(
              (acc, shot) => {
                acc[shot.player] = (acc[shot.player] || 0) + 1
                return acc
              },
              {} as Record<string, number>,
            )

            const totalDrives = driveShots.length
            const sortedDriveStats = Object.entries(driveStats).sort(([, a], [, b]) => b - a)

            // Calculate angles for pie chart
            let currentAngle = 0
            const pieSlices = sortedDriveStats.map(([player, count], index) => {
              const percentage = (count / totalDrives) * 100
              const angle = (count / totalDrives) * 360
              const startAngle = currentAngle
              currentAngle += angle

              return {
                player,
                count,
                percentage: Math.round(percentage),
                startAngle,
                angle,
                color: getPlayerColorForName(player).color, // Use the actual color value
              }
            })

            return (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {pieSlices.map((slice, index) => {
                        const radius = 40
                        const centerX = 50
                        const centerY = 50

                        const startAngleRad = (slice.startAngle * Math.PI) / 180
                        const endAngleRad = ((slice.startAngle + slice.angle) * Math.PI) / 180

                        const x1 = centerX + radius * Math.cos(startAngleRad)
                        const y1 = centerY + radius * Math.sin(startAngleRad)
                        const x2 = centerX + radius * Math.cos(endAngleRad)
                        const y2 = centerY + radius * Math.sin(endAngleRad)

                        const largeArcFlag = slice.angle > 180 ? 1 : 0

                        const pathData = [
                          `M ${centerX} ${centerY}`,
                          `L ${x1} ${y1}`,
                          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                          "Z",
                        ].join(" ")

                        return (
                          <path
                            key={slice.player}
                            d={pathData}
                            style={{ fill: slice.color }} // Use inline style instead of className
                            className="stroke-white stroke-2"
                          />
                        )
                      })}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{totalDrives}</div>
                        <div className="text-xs text-muted-foreground">Drives</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {sortedDriveStats.map(([player, count], index) => (
                    <div key={player} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${getPlayerColorForName(player).class}`}></div>
                      <span className="text-sm font-medium">{player}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} ({Math.round((count / totalDrives) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </CardContent>
      </Card>

      {/* Approach Breakdown Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Approach Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const approachShots = nonGimmeShots.filter((shot) => shot.shotType === "Approach")
            if (approachShots.length === 0) {
              return (
                <div className="text-center text-sm text-muted-foreground py-8">No approach shots recorded yet</div>
              )
            }

            const approachStats = approachShots.reduce(
              (acc, shot) => {
                acc[shot.player] = (acc[shot.player] || 0) + 1
                return acc
              },
              {} as Record<string, number>,
            )

            const totalApproaches = approachShots.length
            const sortedApproachStats = Object.entries(approachStats).sort(([, a], [, b]) => b - a)

            // Calculate angles for pie chart
            let currentAngle = 0
            const pieSlices = sortedApproachStats.map(([player, count], index) => {
              const percentage = (count / totalApproaches) * 100
              const angle = (count / totalApproaches) * 360
              const startAngle = currentAngle
              currentAngle += angle

              return {
                player,
                count,
                percentage: Math.round(percentage),
                startAngle,
                angle,
                color: getPlayerColorForName(player).color, // Use the actual color value
              }
            })

            return (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {pieSlices.map((slice, index) => {
                        const radius = 40
                        const centerX = 50
                        const centerY = 50

                        const startAngleRad = (slice.startAngle * Math.PI) / 180
                        const endAngleRad = ((slice.startAngle + slice.angle) * Math.PI) / 180

                        const x1 = centerX + radius * Math.cos(startAngleRad)
                        const y1 = centerY + radius * Math.sin(startAngleRad)
                        const x2 = centerX + radius * Math.cos(endAngleRad)
                        const y2 = centerY + radius * Math.sin(endAngleRad)

                        const largeArcFlag = slice.angle > 180 ? 1 : 0

                        const pathData = [
                          `M ${centerX} ${centerY}`,
                          `L ${x1} ${y1}`,
                          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                          "Z",
                        ].join(" ")

                        return (
                          <path
                            key={slice.player}
                            d={pathData}
                            style={{ fill: slice.color }} // Use inline style instead of className
                            className="stroke-white stroke-2"
                          />
                        )
                      })}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{totalApproaches}</div>
                        <div className="text-xs text-muted-foreground">Approaches</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {sortedApproachStats.map(([player, count], index) => (
                    <div key={player} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${getPlayerColorForName(player).class}`}></div>
                      <span className="text-sm font-medium">{player}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} ({Math.round((count / totalApproaches) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </CardContent>
      </Card>

      {/* Putt Breakdown Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">⛳</span>
            Putt Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const puttShots = nonGimmeShots.filter((shot) => shot.shotType === "Putt")
            if (puttShots.length === 0) {
              return <div className="text-center text-sm text-muted-foreground py-8">No putts recorded yet</div>
            }

            const puttStats = puttShots.reduce(
              (acc, shot) => {
                acc[shot.player] = (acc[shot.player] || 0) + 1
                return acc
              },
              {} as Record<string, number>,
            )

            const totalPutts = puttShots.length
            const sortedPuttStats = Object.entries(puttStats).sort(([, a], [, b]) => b - a)

            // Calculate angles for pie chart
            let currentAngle = 0
            const pieSlices = sortedPuttStats.map(([player, count], index) => {
              const percentage = (count / totalPutts) * 100
              const angle = (count / totalPutts) * 360
              const startAngle = currentAngle
              currentAngle += angle

              return {
                player,
                count,
                percentage: Math.round(percentage),
                startAngle,
                angle,
                color: getPlayerColorForName(player).color, // Use the actual color value
              }
            })

            return (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {pieSlices.map((slice, index) => {
                        const radius = 40
                        const centerX = 50
                        const centerY = 50

                        const startAngleRad = (slice.startAngle * Math.PI) / 180
                        const endAngleRad = ((slice.startAngle + slice.angle) * Math.PI) / 180

                        const x1 = centerX + radius * Math.cos(startAngleRad)
                        const y1 = centerY + radius * Math.sin(startAngleRad)
                        const x2 = centerX + radius * Math.cos(endAngleRad)
                        const y2 = centerY + radius * Math.sin(endAngleRad)

                        const largeArcFlag = slice.angle > 180 ? 1 : 0

                        const pathData = [
                          `M ${centerX} ${centerY}`,
                          `L ${x1} ${y1}`,
                          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                          "Z",
                        ].join(" ")

                        return (
                          <path
                            key={slice.player}
                            d={pathData}
                            style={{ fill: slice.color }} // Use inline style instead of className
                            className="stroke-white stroke-2"
                          />
                        )
                      })}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{totalPutts}</div>
                        <div className="text-xs text-muted-foreground">Putts</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {sortedPuttStats.map(([player, count], index) => (
                    <div key={player} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${getPlayerColorForName(player).class}`}></div>
                      <span className="text-sm font-medium">{player}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} ({Math.round((count / totalPutts) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </CardContent>
      </Card>

      {/* Emoji Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🏷️</span>
            Shot Tag Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[
              { emoji: "💦", label: "Nut Shots", count: shots.filter((shot) => shot.isNut).length, color: "#3b82f6" },
              { emoji: "🛟", label: "Clutch Shots", count: shots.filter((shot) => shot.isClutch).length, color: "#22c55e" },
            ].map(({ emoji, label, count, color }) => {
              const percentage = totalShots > 0 ? Math.round((count / totalShots) * 100) : 0
              return (
                <div key={emoji} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium flex items-center gap-2">
                      <span className="text-xl">{emoji}</span>
                      {label}
                    </span>
                    <span className="text-sm text-muted-foreground">{count} shots</span>
                  </div>
                  {/* Custom progress bar implementation */}
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: color 
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground">{percentage}% of total</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Player Shot Contribution Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Shot Contribution by Player
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedPlayers.map(([player, stats], index) => {
              const maxShots = Math.max(...sortedPlayers.map(([, s]) => s.totalShots))
              const barWidth = (stats.totalShots / maxShots) * 100
              const playerColor = getPlayerColorForName(player)

              return (
                <div key={player} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{player}</span>
                    <span className="text-sm text-muted-foreground">{stats.totalShots} shots</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-8 flex items-center">
                      <div
                        className={`h-8 rounded-full ${playerColor.class} flex items-center justify-end pr-3 transition-all duration-500 ease-out`}
                        style={{ width: `${barWidth}%` }}
                      >
                        <span className="text-white text-sm font-medium">
                          {Math.round((stats.totalShots / totalShots) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 text-xs">
                    {stats.nutShots > 0 && <span>💦{stats.nutShots}</span>}
                    {stats.clutchShots > 0 && <span>🛟{stats.clutchShots}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Hole-by-Hole Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Hole-by-Hole Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-4">
              {Object.entries(holeStats)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([hole, stats]) => (
                  <div key={hole} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Hole {hole}</Badge>
                        <Badge variant="secondary">Par {stats.par}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{stats.totalShots} shots</div>
                    </div>
                    <div className="space-y-2">
                      {stats.shots.map((shot: Shot, index: number) => (
                        <div key={shot.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs w-12 justify-center">
                              #{shot.shotNumber}
                            </Badge>
                            <span className="font-medium">{shot.isGimme ? "Gimme" : shot.player}</span>
                            <span className="text-muted-foreground">{shot.shotType}</span>
                            {(shot.isNut || shot.isClutch) && (
                              <span className="text-xs">
                                {shot.isNut && "💦"}
                                {shot.isClutch && "🛟"}
                              </span>
                            )}
                          </div>
                          <div className={`font-medium ${getDistanceColor(shot.calculatedDistance)}`}>
                            {shot.isGimme ? "Gimme" : formatDistance(shot.calculatedDistance)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Longest Drives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Longest Drives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {nonGimmeShots
              .filter((shot) => shot.shotType === "Drive")
              .sort((a, b) => b.calculatedDistance - a.calculatedDistance)
              .slice(0, 5)
              .map((shot, index) => (
                <div key={shot.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={index === 0 ? "default" : "outline"}
                      className="w-8 h-8 rounded-full p-0 flex items-center justify-center"
                    >
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="font-medium">{shot.player}</div>
                      <div className="text-sm text-muted-foreground">
                        Hole {shot.hole}
                        {(shot.isNut || shot.isClutch) && (
                          <span className="ml-2">
                            {shot.isNut && "💦"}
                            {shot.isClutch && "🛟"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${getDistanceColor(shot.calculatedDistance)}`}>
                    {formatDistance(shot.calculatedDistance)}
                  </div>
                </div>
              ))}
            {nonGimmeShots.filter((shot) => shot.shotType === "Drive").length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-4">No drives recorded yet</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Longest Putts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Longest Putts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {nonGimmeShots
              .filter((shot) => shot.shotType === "Putt")
              .sort((a, b) => b.calculatedDistance - a.calculatedDistance)
              .slice(0, 5)
              .map((shot, index) => (
                <div key={shot.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={index === 0 ? "default" : "outline"}
                      className="w-8 h-8 rounded-full p-0 flex items-center justify-center"
                    >
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="font-medium">{shot.player}</div>
                      <div className="text-sm text-muted-foreground">
                        Hole {shot.hole}
                        {(shot.isNut || shot.isClutch) && (
                          <span className="ml-2">
                            {shot.isNut && "💦"}
                            {shot.isClutch && "🛟"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${getDistanceColor(shot.calculatedDistance)}`}>
                    {formatDistance(shot.calculatedDistance)}
                  </div>
                </div>
              ))}
            {nonGimmeShots.filter((shot) => shot.shotType === "Putt").length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-4">No putts recorded yet</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
