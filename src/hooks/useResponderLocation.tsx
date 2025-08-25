
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useResponderLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const watchIdRef = useRef<number | null>(null);

  const updateLocationInDatabase = async (lat: number, lng: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('responder_details')
        .update({ 
          current_location: `(${lng},${lat})`,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating responder location:', error);
      } else {
        console.log('Responder location updated successfully');
      }
    } catch (error) {
      console.error('Error in updateLocationInDatabase:', error);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setLocationError(null);
        
        // Update location in database
        await updateLocationInDatabase(latitude, longitude);
        
        console.log('Location updated:', { lat: latitude, lng: longitude });
      },
      (error) => {
        console.error('Error getting location:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied by user');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out');
            break;
          default:
            setLocationError('An unknown error occurred');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );

    watchIdRef.current = watchId;
  };

  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  useEffect(() => {
    // Only track location for verified responders
    if (!user || !profile?.responder_details?.is_verified) {
      // Clear watch if user is not verified
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    // Get initial location
    getCurrentLocation();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [user, profile?.responder_details?.is_verified]);

  return {
    currentLocation,
    locationError,
    getCurrentLocation,
    calculateDistance
  };
};
