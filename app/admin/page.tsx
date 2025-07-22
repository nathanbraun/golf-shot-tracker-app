"use client"
import AdminDashboard from "@/components/admin-dashboard"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()
  
  const handleBack = () => {
    router.push("/")
  }

  return <AdminDashboard onBack={handleBack} />
}
