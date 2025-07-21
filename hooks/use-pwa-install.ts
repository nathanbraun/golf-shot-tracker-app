import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const checkIOS = () => {
      const ua = window.navigator.userAgent;
      const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
      const webkit = !!ua.match(/WebKit/i);
      return iOS && webkit && !ua.match(/CriOS/i) && !ua.match(/OPiOS/i);
    };

    setIsIOS(checkIOS());

    // Detect if PWA can be installed (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if it's already installed
    const checkIsInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          window.navigator.standalone === true) {
        setIsInstallable(false);
      }
    };
    
    checkIsInstalled();
    window.addEventListener('appinstalled', () => {
      setInstallPrompt(null);
      setIsInstallable(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = async (): Promise<'accepted' | 'dismissed' | 'not_available'> => {
    if (!installPrompt) {
      return 'not_available';
    }

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      return choiceResult.outcome;
    } catch (error) {
      console.error('PWA installation failed:', error);
      return 'dismissed';
    }
  };

  return {
    isInstallable,
    isIOS,
    promptInstall
  };
}

