import { useState, useEffect } from 'react';

const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-script';

let loadPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (loadPromise) return loadPromise;

  if (window.google?.maps?.places) {
    loadPromise = Promise.resolve();
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    if (document.getElementById(GOOGLE_MAPS_SCRIPT_ID)) {
      // Script tag exists but hasn't loaded yet — wait for it.
      const check = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=ro`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Failed to load Google Maps script'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function useGoogleMapsLoader() {
  const [isLoaded, setIsLoaded] = useState(!!window.google?.maps?.places);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setLoadError('Google Maps API key not configured');
      return;
    }

    if (isLoaded) return;

    loadGoogleMapsScript(apiKey)
      .then(() => setIsLoaded(true))
      .catch((err) => setLoadError(err.message));
  }, [isLoaded]);

  return { isLoaded, loadError };
}
