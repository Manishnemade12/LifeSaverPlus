
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ResponderLocation {
  id: string;
  first_name: string;
  last_name: string;
  responder_type: string;
  location_lat: number;
  location_lng: number;
  distance: number;
}

export const useNearbyResponders = (userLat?: number, userLng?: number) => {
  const [nearbyResponders, setNearbyResponders] = useState<ResponderLocation[]>([]);
  const [loading, setLoading] = useState(false);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (!userLat || !userLng) return;

    const fetchNearbyResponders = async () => {
      setLoading(true);
      try {
        // Get responders who are on duty with their location
        const { data: responders, error } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            responder_details!inner (
              responder_type,
              is_on_duty,
              current_location
            )
          `)
          .eq('user_type', 'responder')
          .eq('responder_details.is_on_duty', true)
          .not('responder_details.current_location', 'is', null);

        if (error) throw error;

        const nearby = responders
          ?.filter(responder => {
            const location = responder.responder_details?.current_location;
            if (!location) return false;
            
            // Parse the point format "(lat,lng)"
            const pointMatch = location.toString().match(/\(([^,]+),([^)]+)\)/);
            if (!pointMatch) return false;
            
            const lat = parseFloat(pointMatch[1]);
            const lng = parseFloat(pointMatch[2]);
            
            const distance = calculateDistance(userLat, userLng, lat, lng);
            return distance <= 50; // Within 50km
          })
          .map(responder => {
            const location = responder.responder_details?.current_location;
            const pointMatch = location.toString().match(/\(([^,]+),([^)]+)\)/);
            const lat = parseFloat(pointMatch![1]);
            const lng = parseFloat(pointMatch![2]);
            const distance = calculateDistance(userLat, userLng, lat, lng);
            
            return {
              id: responder.id,
              first_name: responder.first_name || '',
              last_name: responder.last_name || '',
              responder_type: responder.responder_details?.responder_type || '',
              location_lat: lat,
              location_lng: lng,
              distance
            };
          })
          .sort((a, b) => a.distance - b.distance) || [];

        setNearbyResponders(nearby);
      } catch (error) {
        console.error('Error fetching nearby responders:', error);
        setNearbyResponders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyResponders();
  }, [userLat, userLng]);

  return { nearbyResponders, loading, count: nearbyResponders.length };
};
