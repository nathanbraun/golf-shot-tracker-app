"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MapPin, Plus, Trash2, Edit, Save, ArrowLeft } from "lucide-react"

interface CourseHole {
  hole: number
  par: number
  distance: number
}

interface Course {
  id: string
  name: string
  holes: CourseHole[]
  createdAt: Date
}

interface CourseManagerProps {
  onBack: () => void
  onSelectCourse: (course: Course) => void
  selectedCourse?: Course | null
}

export default function CourseManager({ onBack, onSelectCourse, selectedCourse }: CourseManagerProps) {
  const [courses, setCourses] = useState<Course[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("golf-courses")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const [isCreating, setIsCreating] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [courseName, setCourseName] = useState("")
  const [holes, setHoles] = useState<CourseHole[]>(() =>
    Array.from({ length: 18 }, (_, i) => ({
      hole: i + 1,
      par: 4,
      distance: 400,
    })),
  )

  const saveCourses = (updatedCourses: Course[]) => {
    setCourses(updatedCourses)
    if (typeof window !== "undefined") {
      localStorage.setItem("golf-courses", JSON.stringify(updatedCourses))
    }
  }

  const handleCreateCourse = () => {
    setIsCreating(true)
    setEditingCourse(null)
    setCourseName("")
    setHoles(
      Array.from({ length: 18 }, (_, i) => ({
        hole: i + 1,
        par: 4,
        distance: 400,
      })),
    )
  }

  const handleEditCourse = (course: Course) => {
    setIsCreating(true)
    setEditingCourse(course)
    setCourseName(course.name)
    setHoles([...course.holes])
  }

  const handleSaveCourse = () => {
    if (!courseName.trim()) return

    const course: Course = {
      id: editingCourse?.id || Date.now().toString(),
      name: courseName.trim(),
      holes: [...holes],
      createdAt: editingCourse?.createdAt || new Date(),
    }

    let updatedCourses
    if (editingCourse) {
      updatedCourses = courses.map((c) => (c.id === editingCourse.id ? course : c))
    } else {
      updatedCourses = [...courses, course]
    }

    saveCourses(updatedCourses)
    setIsCreating(false)
    setEditingCourse(null)
  }

  const handleDeleteCourse = (courseId: string) => {
    const updatedCourses = courses.filter((c) => c.id !== courseId)
    saveCourses(updatedCourses)
  }

  const updateHole = (holeIndex: number, field: "par" | "distance", value: number) => {
    const updatedHoles = [...holes]
    updatedHoles[holeIndex] = { ...updatedHoles[holeIndex], [field]: value }
    setHoles(updatedHoles)
  }

  const getParColor = (par: number) => {
    switch (par) {
      case 3:
        return "bg-yellow-500"
      case 4:
        return "bg-blue-500"
      case 5:
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  if (isCreating) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreating(false)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <MapPin className="w-5 h-5" />
                {editingCourse ? "Edit Course" : "Create Course"}
              </CardTitle>
              <Button onClick={handleSaveCourse} disabled={!courseName.trim()} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Course Name */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Course Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="courseName">Course Name</Label>
              <Input
                id="courseName"
                placeholder="Enter course name"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Holes Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hole Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {holes.map((hole, index) => (
                  <div key={hole.hole} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="font-medium">
                        Hole {hole.hole}
                      </Badge>
                      <Badge className={`text-white ${getParColor(hole.par)}`}>Par {hole.par}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Par</Label>
                        <div className="flex gap-1">
                          {[3, 4, 5].map((par) => (
                            <Button
                              key={par}
                              variant={hole.par === par ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateHole(index, "par", par)}
                              className="flex-1"
                            >
                              {par}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Distance (yards)</Label>
                        <Input
                          type="number"
                          value={hole.distance}
                          onChange={(e) => updateHole(index, "distance", Number.parseInt(e.target.value) || 0)}
                          className="text-center"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={onBack} className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <MapPin className="w-5 h-5" />
              Course Manager
            </CardTitle>
            <Button onClick={handleCreateCourse} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Course
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Current Course */}
      {selectedCourse && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-700">Current Course</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-green-800">{selectedCourse.name}</h3>
                <p className="text-sm text-green-600">18 holes configured</p>
              </div>
              <Badge variant="default" className="bg-green-600">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Saved Courses ({courses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No courses saved yet</p>
              <p className="text-sm">Create your first course to get started</p>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {courses.map((course, index) => (
                  <div key={course.id}>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{course.name}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-muted-foreground">18 holes</span>
                          <div className="flex gap-1">
                            {[3, 4, 5].map((par) => {
                              const count = course.holes.filter((h) => h.par === par).length
                              return count > 0 ? (
                                <Badge key={par} variant="secondary" className="text-xs">
                                  {count} Par {par}s
                                </Badge>
                              ) : null
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectCourse(course)}
                          className={selectedCourse?.id === course.id ? "bg-green-50 border-green-200" : ""}
                        >
                          {selectedCourse?.id === course.id ? "Selected" : "Select"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditCourse(course)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCourse(course.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {index < courses.length - 1 && <Separator className="mt-3" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
