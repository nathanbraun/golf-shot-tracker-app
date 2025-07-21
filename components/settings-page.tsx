"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Smartphone, InfoIcon } from "lucide-react"
import { usePWAInstall } from "@/hooks/use-pwa-install"

interface SettingsPageProps {
  onBack: () => void
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { isInstallable, isIOS, promptInstall, debugInfo } = usePWAInstall();
  const [installing, setInstalling] = useState(false);

  const handleInstallPWA = async () => {
    setInstalling(true);
    
    if (isIOS) {
      // For iOS, we just show instructions
      alert("To install this app on iOS: tap the Share button, then 'Add to Home Screen'");
      setInstalling(false);
      return;
    }
    
    try {
      const outcome = await promptInstall();
      
      if (outcome === 'accepted') {
        // Optional: show success message
        alert("Installation started! Check your home screen after it completes.");
      } else if (outcome === 'not_available') {
        alert("Installation is not available on this device or browser.");
      }
    } catch (error) {
      console.error("Installation error:", error);
      alert("There was a problem installing the app. Please try again.");
    } finally {
      setInstalling(false);
    }
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
              
              {isIOS && (
                <div className="bg-blue-50 p-3 rounded-md flex items-start gap-2 text-sm">
                  <InfoIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-700">
                    On iOS, tap the share button and select "Add to Home Screen" to install.
                  </p>
                </div>
              )}
              
              <Button
                onClick={handleInstallPWA}
                className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2"
                disabled={!isInstallable || installing}
              >
                <Download className="w-4 h-4" />
                {installing ? 'Installing...' : isIOS ? 'Add to Home Screen' : 'Install as App'}
              </Button>

              {/* Debug info - you can remove this in production */}
              <div className="text-xs text-gray-500 mt-2">
                Status: {isInstallable ? 'Installable' : 'Not installable'} 
                {debugInfo ? ` (${debugInfo})` : ''}
              </div>
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
