"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { coursesApi, type Course, type CourseHole } from "@/lib/supabase"

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<string>("")
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<{ course: Course; holes: CourseHole[] } | null>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      const result = await coursesApi.testConnection()
      setConnectionStatus(result.success ? "✅ " + result.message : "❌ " + result.message)
    } catch (error) {
      setConnectionStatus(`❌ Error: ${error}`)
    }
    setLoading(false)
  }

  const loadCourses = async () => {
    setLoading(true)
    try {
      const coursesData = await coursesApi.getCourses()
      setCourses(coursesData)
      setConnectionStatus(`✅ Loaded ${coursesData.length} courses`)
    } catch (error) {
      setConnectionStatus(`❌ Error loading courses: ${error}`)
    }
    setLoading(false)
  }

  const loadCourseDetails = async (courseId: string) => {
    setLoading(true)
    try {
      const courseData = await coursesApi.getCourseWithHoles(courseId)
      setSelectedCourse(courseData)
      setConnectionStatus(`✅ Loaded course with ${courseData.holes.length} holes`)
    } catch (error) {
      setConnectionStatus(`❌ Error loading course details: ${error}`)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testConnection} disabled={loading}>
              Test Connection
            </Button>
            <Button onClick={loadCourses} disabled={loading}>
              Load Courses
            </Button>
          </div>

          {connectionStatus && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm">{connectionStatus}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{course.name}</div>
                    {course.location && <div className="text-sm text-muted-foreground">{course.location}</div>}
                  </div>
                  <Button size="sm" onClick={() => loadCourseDetails(course.id)} disabled={loading}>
                    Load Holes
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedCourse.course.name} - Blue Tees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {selectedCourse.holes.map((hole) => (
                <div key={hole.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">Hole {hole.hole_number}</span>
                  <div className="flex gap-2">
                    <Badge variant="secondary">Par {hole.par}</Badge>
                    <Badge variant="outline">{hole.distance} yds</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
