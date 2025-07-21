"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Smartphone } from "lucide-react"

interface SettingsPageProps {
  onBack: () => void
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const handleInstallPWA = () => {
    // TODO: Wire up PWA installation logic
    console.log("Install PWA clicked - PWA installation will be implemented here")
  }

  return (
    <div className="min-h-screen bg-green-50 p-4">
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 left-4 text-green-600 hover:text-green-700 hover:bg-green-100"
              onClick={onBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <CardTitle className="text-2xl text-green-700">Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* PWA Installation Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">App Installation</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Install this app on your device for a better experience and offline access.
              </p>
              <Button
                onClick={handleInstallPWA}
                className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Install as App
              </Button>
            </div>

            {/* Future settings sections can go here */}
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground text-center">More settings coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
