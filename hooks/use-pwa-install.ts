import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    // Check if it's iOS
    const checkIOS = () => {
      const ua = window.navigator.userAgent;
      const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
      const webkit = !!ua.match(/WebKit/i);
      const isIOSDevice = iOS && webkit && !ua.match(/CriOS/i) && !ua.match(/OPiOS/i);
      
      console.log("iOS detection:", { 
        isIOSDevice, 
        userAgent: ua 
      });
      
      return isIOSDevice;
    };

    const isIOSDevice = checkIOS();
    setIsIOS(isIOSDevice);
    
    // For iOS, we'll always allow installation via instructions
    if (isIOSDevice) {
      setIsInstallable(true);
      setDebugInfo("iOS device detected, showing instructions");
      return;
    }

    // Detect if PWA can be installed (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("beforeinstallprompt event fired", e);
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      setDebugInfo("Install prompt captured, app is installable");
    };

    console.log("Adding beforeinstallprompt event listener");
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    const checkIsInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
      
      console.log("Checking if already installed:", { 
        isStandalone,
        displayMode: window.matchMedia('(display-mode: standalone)').matches,
        navigatorStandalone: (window.navigator as any).standalone
      });
      
      if (isStandalone) {
        setIsInstallable(false);
        setDebugInfo("App is already installed");
      }
    };
    
    checkIsInstalled();

    // Set a fallback for Android that doesn't trigger the event
    // This is needed because some browsers don't fire beforeinstallprompt
    // until user interaction
    if (!isIOSDevice && !installPrompt) {
      // Check if this is likely an Android device
      const isAndroid = /android/i.test(window.navigator.userAgent);
      if (isAndroid) {
        console.log("Android device detected, enabling button by default");
        setIsInstallable(true);
        setDebugInfo("Android detected, enabling install button");
      }
    }

    window.addEventListener('appinstalled', () => {
      console.log("App was installed");
      setInstallPrompt(null);
      setIsInstallable(false);
      setDebugInfo("App was installed successfully");
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = async (): Promise<'accepted' | 'dismissed' | 'not_available'> => {
    if (!installPrompt && !isIOS) {
      console.log("No install prompt available");
      
      // For Android, if we don't have the prompt but enabled the button,
      // we'll show manual instructions
      const isAndroid = /android/i.test(window.navigator.userAgent);
      if (isAndroid) {
        alert("To install this app on Android: tap the menu button (⋮) and select 'Add to Home screen' or 'Install app'");
      }
      
      return 'not_available';
    }

    if (isIOS) {
      return 'not_available'; // iOS handled separately
    }

    try {
      console.log("Showing install prompt");
      await installPrompt!.prompt();
      const choiceResult = await installPrompt!.userChoice;
      console.log("User choice:", choiceResult.outcome);
      return choiceResult.outcome;
    } catch (error) {
      console.error('PWA installation failed:', error);
      return 'dismissed';
    }
  };

  return {
    isInstallable,
    isIOS,
    promptInstall,
    debugInfo
  };
}
