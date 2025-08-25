
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type EmergencyAlert = {
  id: string;
  user_id: string;
  type: string;
  status: string;
  location_lat: number | null;
  location_lng: number | null;
  description?: string | null;
  created_at?: string;
  location_description?: string | null;
  responder_id?: string | null;
  updated_at?: string | null;
};

interface EmergencyMapProps {
  userLocation?: [number, number] | null;
}

const EmergencyMap: React.FC<EmergencyMapProps> = ({ userLocation }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [routeControl, setRouteControl] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  // Get user's actual location using geolocation
  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        console.log('Getting user location...');
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log('User location found:', latitude, longitude);
            setCurrentLocation([latitude, longitude]);
          },
          (error) => {
            console.error('Error getting location:', error);
            // Fallback to NYC coordinates if geolocation fails
            setCurrentLocation([40.7549, -73.9840]);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser');
        // Fallback to NYC coordinates
        setCurrentLocation([40.7549, -73.9840]);
      }
    };

    getCurrentLocation();
  }, []);

  // Fetch emergency alerts from Supabase
  useEffect(() => {
    const fetchEmergencyAlerts = async () => {
      try {
        console.log('Fetching emergency alerts...');
        const { data, error } = await supabase
          .from('emergency_alerts')
          .select('*')
          .neq('status', 'complete');

        if (error) {
          console.error('Error fetching emergency alerts:', error);
          return;
        }

        console.log('Fetched emergency alerts:', data);
        setEmergencyAlerts(data || []);
      } catch (error) {
        console.error('Error fetching emergency alerts:', error);
      }
    };

    fetchEmergencyAlerts();
  }, []);

  // Load Leaflet dynamically and initialize map
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Dynamically import Leaflet
        const L = await import('leaflet');

        // Import CSS
        await import('leaflet/dist/leaflet.css');

        if (!mapContainer.current || !currentLocation) return;

        // Fix for default markers in Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        console.log('Initializing map at location:', currentLocation);

        // Initialize map
        mapRef.current = L.map(mapContainer.current).setView(currentLocation, 12);

        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapRef.current);

        // Add user location marker
        const userIcon = L.divIcon({
          html: `
            <div style="
              width: 24px; 
              height: 24px; 
              background: #3b82f6; 
              border: 4px solid white; 
              border-radius: 50%; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.3);
              animation: pulse 2s infinite;
            "></div>
            <div style="
              position: absolute; 
              top: -35px; 
              left: 50%; 
              transform: translateX(-50%); 
              background: #3b82f6; 
              color: white; 
              padding: 4px 8px; 
              border-radius: 4px; 
              font-size: 12px; 
              font-weight: bold; 
              white-space: nowrap;
            ">You are here</div>
            <style>
              @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
              }
            </style>
          `,
          className: 'user-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker(currentLocation, { icon: userIcon }).addTo(mapRef.current);

        // Add 50km radius circle
        L.circle(currentLocation, {
          radius: 50000, // 50km in meters
          fillColor: '#ef4444',
          fillOpacity: 0.1,
          color: '#ef4444',
          weight: 2,
          opacity: 0.8
        }).addTo(mapRef.current);

        setIsMapReady(true);
        console.log('Map initialized successfully');

      } catch (error) {
        console.error('Error loading Leaflet:', error);
      }
    };

    if (currentLocation) {
      loadLeaflet();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [currentLocation]);

  // Function to show route to emergency location
  const showRouteToEmergency = async (alertLat: number, alertLng: number) => {
    if (!mapRef.current || !currentLocation) return;

    try {
      // Remove existing route if any
      if (routeControl) {
        mapRef.current.removeControl(routeControl);
      }

      // Import Leaflet
      const L = await import('leaflet');

      // Create route using OpenRouteService or simple polyline
      const routeUrl = `https://router.project-osrm.org/route/v1/driving/${currentLocation[1]},${currentLocation[0]};${alertLng},${alertLat}?overview=full&geometries=geojson`;

      console.log('Fetching route:', routeUrl);

      const response = await fetch(routeUrl);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);

        // Draw route on map
        const routeLine = L.polyline(coordinates, {
          color: '#ef4444',
          weight: 5,
          opacity: 0.8
        }).addTo(mapRef.current);

        // Store route reference for cleanup
        setRouteControl(routeLine);

        // Show route info
        const distance = (route.distance / 1000).toFixed(1); // Convert to km
        const duration = Math.round(route.duration / 60); // Convert to minutes

        console.log(`Route: ${distance}km, ${duration} minutes`);

        // Fit map to show entire route
        mapRef.current.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

        // Show route popup
        L.popup()
          .setLatLng([alertLat, alertLng])
          .setContent(`
            <div style="font-family: sans-serif; text-align: center;">
              <h4 style="margin: 0 0 8px 0; color: #1f2937;">Route Information</h4>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Distance:</strong> ${distance} km</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Duration:</strong> ${duration} minutes</p>
              <p style="margin: 4px 0; font-size: 12px; color: #6b7280;">Best route to emergency location</p>
            </div>
          `)
          .openOn(mapRef.current);
      }
    } catch (error) {
      console.error('Error fetching route:', error);

      // Fallback: draw straight line
      const L = await import('leaflet');
      const straightLine = L.polyline([currentLocation, [alertLat, alertLng]], {
        color: '#f59e0b',
        weight: 3,
        opacity: 0.7,
        dashArray: '5, 10'
      }).addTo(mapRef.current);

      setRouteControl(straightLine);
      mapRef.current.fitBounds(straightLine.getBounds(), { padding: [50, 50] });
    }
  };

  // Add emergency alert markers
  useEffect(() => {
    if (!mapRef.current || !isMapReady || emergencyAlerts.length === 0 || !currentLocation) return;

    const loadMarkersAsync = async () => {
      try {
        const L = await import('leaflet');

        console.log('Adding emergency alert markers:', emergencyAlerts);

        // Remove old markers
        markers.forEach(marker => mapRef.current.removeLayer(marker));
        const newMarkers: any[] = [];

        // Filter alerts within 50km radius
        const nearbyAlerts = emergencyAlerts.filter(alert => {
          if (
            alert.location_lat === null ||
            alert.location_lng === null ||
            (alert.status !== 'active' && alert.status !== 'acknowledged')
          ) return false;

          const distance = calculateDistance(
            currentLocation[0], currentLocation[1],
            alert.location_lat, alert.location_lng
          );
          return distance <= 50;
        });

        console.log('Nearby alerts within 50km:', nearbyAlerts);

        nearbyAlerts.forEach((alert) => {
          const getAlertColor = (alertType: string): string => {
            switch (alertType) {
              case 'medical': return '#10b981';
              case 'fire': return '#ef4444';
              case 'accident': return '#f59e0b';
              case 'safety': return '#8b5cf6';
              default: return '#6b7280';
            }
          };

          const getAlertIcon = (alertType: string): string => {
            switch (alertType) {
              case 'medical': return '🚑';
              case 'fire': return '🚒';
              case 'accident': return '🚗';
              case 'safety': return '🚓';
              default: return '🚨';
            }
          };

          const color = getAlertColor(alert.type);
          const icon = getAlertIcon(alert.type);

          const distance = calculateDistance(
            currentLocation[0], currentLocation[1],
            alert.location_lat, alert.location_lng
          );

          const alertIcon = L.divIcon({
            html: `
              <div style="
                width: 32px; 
                height: 32px; 
                background: ${color}; 
                border: 2px solid white; 
                border-radius: 50%; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                cursor: pointer;
              ">${icon}</div>
              <div style="
                position: absolute; 
                top: -30px; 
                left: 50%; 
                transform: translateX(-50%); 
                background: #1f2937; 
                color: white; 
                padding: 2px 6px; 
                border-radius: 4px; 
                font-size: 10px; 
                white-space: nowrap;
                border: 1px solid #374151;
              ">${alert.status.toUpperCase()}</div>
            `,
            className: 'alert-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          const marker = L.marker([alert.location_lat, alert.location_lng], { icon: alertIcon })
            .bindPopup(`
              <div style="font-family: sans-serif;">
                <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px;">${alert.type.toUpperCase()} Emergency</h3>
                <p style="margin: 4px 0; font-size: 12px;"><strong>Status:</strong> ${alert.status}</p>
                <p style="margin: 4px 0; font-size: 12px;"><strong>Distance:</strong> ${distance.toFixed(1)} km</p>
                <p style="margin: 4px 0; font-size: 12px;"><strong>Location:</strong> ${alert.location_description || 'Not available'}</p>
                <p style="margin: 4px 0; font-size: 12px;"><strong>Description:</strong> ${alert.description || 'No description'}</p>
                <p style="margin: 4px 0; font-size: 10px; color: #6b7280;">Created: ${new Date(alert.created_at || '').toLocaleString()}</p>
                <button onclick="window.showRoute(${alert.location_lat}, ${alert.location_lng})" style="
                  background: #3b82f6; 
                  color: white; 
                  border: none; 
                  padding: 4px 8px; 
                  border-radius: 4px; 
                  font-size: 11px; 
                  cursor: pointer; 
                  margin-top: 8px;
                ">Show Route</button>
              </div>
            `)
            .addTo(mapRef.current);

          newMarkers.push(marker);
        });

        // Save marker references
        setMarkers(newMarkers);
        (window as any).showRoute = showRouteToEmergency;

      } catch (error) {
        console.error('Error adding markers:', error);
      }
    };

    loadMarkersAsync();
  }, [emergencyAlerts, isMapReady, currentLocation]);

  // Helper function to calculate distance between two points
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const nearbyAlertsCount = emergencyAlerts.filter(alert => {
    if (!currentLocation) return false;

    if (
      alert.location_lat === null ||
      alert.location_lng === null ||
      (alert.status !== 'active' && alert.status !== 'acknowledged')
    ) return false;

    const distance = calculateDistance(
      currentLocation[0], currentLocation[1],
      alert.location_lat, alert.location_lng
    );
    return distance <= 50;
  }).length;

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Map overlay legend */}
      <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm border border-slate-600 rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold text-white mb-2">Legend</h3>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span className="text-xs text-slate-300">Your Location</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-full opacity-20"></div>
          <span className="text-xs text-slate-300">50km Response Zone</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs">🚑</span>
          <span className="text-xs text-slate-300">Medical Emergency</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs">🚒</span>
          <span className="text-xs text-slate-300">Fire Emergency</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs">🚗</span>
          <span className="text-xs text-slate-300">Accident</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs">🚓</span>
          <span className="text-xs text-slate-300">Security Emergency</span>
        </div>
      </div>

      {/* Alert count */}
      <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm border border-slate-600 rounded-lg p-3">
        <div className="text-center">
          <div className="text-lg font-bold text-red-400">{nearbyAlertsCount}</div>
          <div className="text-xs text-slate-300">Nearby Alerts</div>
          <div className="text-xs text-slate-400">(within 50km)</div>
        </div>
      </div>

      {/* Loading indicator */}
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
          <div className="text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            Loading map...
          </div>
        </div>
      )}

      {/* Location permission request */}
      {!currentLocation && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
          <div className="bg-slate-800 rounded-lg p-6 text-center max-w-sm mx-4">
            <div className="text-2xl mb-2">📍</div>
            <h3 className="text-lg font-semibold text-white mb-2">Location Access Required</h3>
            <p className="text-slate-300 text-sm mb-4">
              Please allow location access to show emergency alerts near you.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Retry Location Access
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyMap;