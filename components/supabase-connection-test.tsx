"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { coursesApi, type Course, type CourseHole } from "@/lib/supabase"
import { Loader2, CheckCircle, XCircle, Database, Plus } from "lucide-react"

export default function SupabaseConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<{ course: Course; holes: CourseHole[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [newCourseName, setNewCourseName] = useState("")
  const [newCourseLocation, setNewCourseLocation] = useState("")

  // Test connection on component mount
  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    setConnectionStatus("testing")
    setLoading(true)
    try {
      const result = await coursesApi.testConnection()
      if (result.success) {
        setConnectionStatus("success")
        setStatusMessage(result.message)
        // Auto-load courses after successful connection
        await loadCourses()
      } else {
        setConnectionStatus("error")
        setStatusMessage(result.message)
      }
    } catch (error) {
      setConnectionStatus("error")
      setStatusMessage(`Connection failed: ${error}`)
    }
    setLoading(false)
  }

  const loadCourses = async () => {
    setLoading(true)
    try {
      const coursesData = await coursesApi.getCourses()
      setCourses(coursesData)
      setStatusMessage(`✅ Loaded ${coursesData.length} courses from database`)
    } catch (error) {
      setStatusMessage(`❌ Error loading courses: ${error}`)
    }
    setLoading(false)
  }

  const loadCourseDetails = async (courseId: string) => {
    setLoading(true)
    try {
      const courseData = await coursesApi.getCourseWithHoles(courseId)
      setSelectedCourse(courseData)
      setStatusMessage(`✅ Loaded ${courseData.course.name} with ${courseData.holes.length} holes`)
    } catch (error) {
      setStatusMessage(`❌ Error loading course details: ${error}`)
    }
    setLoading(false)
  }

  const createNewCourse = async () => {
    if (!newCourseName.trim()) return

    setLoading(true)
    try {
      const newCourse = await coursesApi.createCourse(newCourseName.trim(), newCourseLocation.trim() || undefined)
      setStatusMessage(`✅ Created new course: ${newCourse.name}`)
      setNewCourseName("")
      setNewCourseLocation("")
      // Reload courses to show the new one
      await loadCourses()
    } catch (error) {
      setStatusMessage(`❌ Error creating course: ${error}`)
    }
    setLoading(false)
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "testing":
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Database className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Supabase Connection Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testConnection} disabled={loading} variant="outline">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Test Connection
            </Button>
            <Button onClick={loadCourses} disabled={loading || connectionStatus !== "success"}>
              Reload Courses
            </Button>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-lg ${
                connectionStatus === "success"
                  ? "bg-green-50 text-green-700"
                  : connectionStatus === "error"
                    ? "bg-red-50 text-red-700"
                    : "bg-blue-50 text-blue-700"
              }`}
            >
              <p className="text-sm">{statusMessage}</p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>URL: https://vsbiqhasauithlqlotec.supabase.co</p>
            <p>Using anon key for public access</p>
          </div>
        </CardContent>
      </Card>

      {/* Create New Course */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Course
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseName">Course Name *</Label>
              <Input
                id="courseName"
                placeholder="e.g., Pebble Beach"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseLocation">Location (optional)</Label>
              <Input
                id="courseLocation"
                placeholder="e.g., Monterey, CA"
                value={newCourseLocation}
                onChange={(e) => setNewCourseLocation(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={createNewCourse}
            disabled={loading || !newCourseName.trim() || connectionStatus !== "success"}
            className="w-full md:w-auto"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Create Course
          </Button>
        </CardContent>
      </Card>

      {/* Available Courses */}
      {courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Courses ({courses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium">{course.name}</div>
                    {course.location && <div className="text-sm text-muted-foreground">{course.location}</div>}
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(course.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => loadCourseDetails(course.id)} disabled={loading} variant="outline">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load Holes"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Details */}
      {selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedCourse.course.name} - Blue Tees</span>
              <Badge variant="secondary">{selectedCourse.holes.length} holes</Badge>
            </CardTitle>
            {selectedCourse.course.location && (
              <p className="text-sm text-muted-foreground">{selectedCourse.course.location}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedCourse.holes.map((hole) => (
                <div key={hole.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Hole {hole.hole_number}</span>
                  <div className="flex gap-2">
                    <Badge variant="secondary">Par {hole.par}</Badge>
                    <Badge variant="outline">{hole.distance} yds</Badge>
                  </div>
                </div>
              ))}
            </div>

            {selectedCourse.holes.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-700">
                  <strong>Course Stats:</strong>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    <div>Total Par: {selectedCourse.holes.reduce((sum, hole) => sum + hole.par, 0)}</div>
                    <div>Total Yards: {selectedCourse.holes.reduce((sum, hole) => sum + hole.distance, 0)}</div>
                    <div>Par 3s: {selectedCourse.holes.filter((h) => h.par === 3).length}</div>
                    <div>Par 4s: {selectedCourse.holes.filter((h) => h.par === 4).length}</div>
                    <div>Par 5s: {selectedCourse.holes.filter((h) => h.par === 5).length}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
