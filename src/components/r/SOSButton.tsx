
// // import React, { useState, useEffect } from 'react';
// // import { Button } from '@/components/ui/button';
// // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// // import { AlertTriangle, Navigation } from 'lucide-react';
// // import { useAuth } from '@/hooks/useAuth';
// // import { supabase } from '@/integrations/supabase/client';
// // import { toast } from '@/hooks/use-toast';

// // const SOSButton = () => {
// //   const { user } = useAuth();
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
// //   const [locationError, setLocationError] = useState<string>('');

// //   useEffect(() => {
// //     if (navigator.geolocation) {
// //       navigator.geolocation.getCurrentPosition(
// //         (position) => {
// //           setLocation(position.coords);
// //         },
// //         (error) => {
// //           setLocationError('Unable to get location. Please enable location services.');
// //           console.error('Location error:', error);
// //         }
// //       );
// //     } else {
// //       setLocationError('Geolocation is not supported by this browser.');
// //     }
// //   }, []);

// //   const sendSOSRequest = async (userLocation: GeolocationCoordinates) => {
// //     if (!user) return;

// //     setIsLoading(true);

// //     try {
// //       const { data: nearbyHospitals, error: hospitalError } = await supabase
// //         .rpc('find_nearby_hospitals', {
// //           user_lat: userLocation.latitude,
// //           user_lon: userLocation.longitude,
// //           radius_km: 5
// //         });

// //       if (hospitalError) throw hospitalError;

// //       if (!nearbyHospitals || nearbyHospitals.length === 0) {
// //         toast({
// //           variant: "destructive",
// //           title: "No Hospitals Available",
// //           description: "No hospitals found within 5km radius. Please call emergency services.",
// //         });
// //         return;
// //       }

// //       const closestHospital = nearbyHospitals[0];

// //       const { error: insertError } = await supabase
// //         .from('sos_requests')
// //         .insert({
// //           user_id: user.id,
// //           user_latitude: userLocation.latitude,
// //           user_longitude: userLocation.longitude,
// //           user_address: 'Current Location',
// //           status: 'pending',
// //           assigned_hospital_id: closestHospital.hospital_id
// //         });

// //       if (insertError) throw insertError;

// //       toast({
// //         title: "SOS Request Sent",
// //         description: `Emergency request sent to ${closestHospital.hospital_name} (${closestHospital.distance.toFixed(2)}km away).`,
// //       });
// //     } catch (error) {
// //       console.error('Error sending SOS request:', error);
// //       toast({
// //         variant: "destructive",
// //         title: "Error",
// //         description: "Failed to send SOS request. Please try again.",
// //       });
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const handleSOSClick = async () => {
// //     if (!location) {
// //       toast({
// //         variant: "destructive",
// //         title: "Location Required",
// //         description: "Please enable location services to send SOS request.",
// //       });
// //       return;
// //     }

// //     try {
// //       await sendSOSRequest(location);
// //     } catch (error) {
// //       console.error('SOS request failed:', error);
// //     }
// //   };

// //   return (
// //     <Card className="mb-6 border-border">
// //       <CardHeader>
// //         <CardTitle className="flex items-center gap-2 text-foreground">
// //           <AlertTriangle className="w-5 h-5 text-destructive" />
// //           Emergency SOS
// //         </CardTitle>
// //         <CardDescription className="text-muted-foreground">
// //           Press the button below in case of emergency. We'll notify nearby hospitals within 5km.
// //         </CardDescription>
// //       </CardHeader>
// //       <CardContent className="text-center">
// //         {locationError ? (
// //           <div className="p-4 bg-warning/10 text-warning rounded-lg mb-4 border border-warning/20">
// //             <p className="text-sm">{locationError}</p>
// //           </div>
// //         ) : (
// //           <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
// //             <Navigation className="w-4 h-4" />
// //             Location services enabled
// //           </div>
// //         )}

// //         <Button
// //           onClick={handleSOSClick}
// //           disabled={isLoading || !location}
// //           size="lg"
// //           className={`w-full h-20 text-lg font-bold ${
// //             isLoading ? 'pulse-emergency' : ''
// //           } bg-destructive text-destructive-foreground hover:bg-destructive/90`}
// //         >
// //           {isLoading ? (
// //             'Sending SOS...'
// //           ) : (
// //             <>
// //               <AlertTriangle className="w-6 h-6 mr-2" />
// //               EMERGENCY SOS
// //             </>
// //           )}
// //         </Button>
// //       </CardContent>
// //     </Card>
// //   );
// // };

// // export default SOSButton;




// import React, { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import emailjs from '@emailjs/browser';
// import { AlertTriangle, Navigation } from 'lucide-react';
// import { useAuth } from '@/hooks/useAuth';
// import { supabase } from '@/integrations/supabase/client';
// import { toast } from '@/hooks/use-toast';

// const haversineDistance = (
//   lat1: number,
//   lon1: number,
//   lat2: number,
//   lon2: number
// ): number => {
//   const toRad = (x: number) => (x * Math.PI) / 180;
//   const R = 6371; // Radius of Earth in km

//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// };

// const SOSButton = () => {
//   const { user } = useAuth();
//   const [isLoading, setIsLoading] = useState(false);
//   const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
//   const [locationError, setLocationError] = useState<string>('');

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setLocation(position.coords);
//         },
//         (error) => {
//           setLocationError('Unable to get location. Please enable location services.');
//           console.error('Location error:', error);
//         }
//       );
//     } else {
//       setLocationError('Geolocation is not supported by this browser.');
//     }
//   }, []);

//   const sendSOSRequest = async (userLocation: GeolocationCoordinates) => {
//     if (!user) return;
//     setIsLoading(true);

//     try {
//       // Step 1: Fetch all hospitals
//       const { data: hospitals, error: hospitalError } = await supabase
//         .from('hospital_profiles')
//         .select('id, latitude, longitude, hospital_name');

//       if (hospitalError || !hospitals || hospitals.length === 0) {
//         throw new Error('No hospitals found.');
//       }

//       // Step 2: Find nearest hospital
//       const distances = hospitals.map((hospital) => ({
//         ...hospital,
//         distance: haversineDistance(
//           userLocation.latitude,
//           userLocation.longitude,
//           hospital.latitude,
//           hospital.longitude
//         ),
//       }));

//       const sorted = distances.sort((a, b) => a.distance - b.distance);
//       const nearestHospital = sorted[0];

//       // Step 3: Insert SOS request
//       const { error: insertError } = await supabase.from('sos_requests').insert({
//         user_id: user.id,
//         user_latitude: userLocation.latitude,
//         user_longitude: userLocation.longitude,
//         user_address: 'Current Location',
//         status: 'pending',
//         assigned_hospital_id: nearestHospital.id,
//       });

//       if (insertError) throw insertError;

//       toast({
//         title: 'SOS Request Sent',
//         description: `Emergency request sent to ${nearestHospital.hospital_name} (${nearestHospital.distance.toFixed(
//           2
//         )} km away).`,
//       });
//     } catch (error) {
//       console.error('Error sending SOS request:', error);
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Failed to send SOS request. Please try again.',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

// const sendSOSMail = async (): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     navigator.geolocation.getCurrentPosition(async (pos) => {
//       const latitude = pos.coords.latitude.toFixed(6);
//       const longitude = pos.coords.longitude.toFixed(6);

//       const templateParams = {
//         to_email: "jiadu4979@gmail.com", // 👈 Yaha jisko bhejna he uska mail daalo
//         latitude,
//         longitude,
//         location_link: `https://www.google.com/maps?q=${latitude},${longitude}`,
//       };

//       try {
//         await emailjs.send(
//           'service_e6vdbbf',         // ✅ Your EmailJS Service ID
//           'template_azq1t1s',        // ✅ Your EmailJS Template ID
//           templateParams,
//           'uIUZ0HxEtfzAhDQ9S'        // ✅ Your EmailJS Public Key
//         );
//         alert("🚨 SOS email sent!");
//         resolve();
//       } catch (error) {
//         console.error("❌ Error sending email:", error);
//         alert("❌ Failed to send SOS mail.");
//         reject(error);
//       }
//     }, (err) => {
//       console.error("❌ Location access error:", err);
//       alert("❌ Location permission denied or unavailable.");
//       reject(err);
//     });
//   });
// };



//   const handleSOSClick = async () => {
//     if (!location) {
//       toast({
//         variant: 'destructive',
//         title: 'Location Required',
//         description: 'Please enable location services to send SOS request.',
//       });
//       return;
//     }

//     await sendSOSRequest(location);
//     sendSOSMail()
//   };

//   return (
//     <Card className="mb-6 border-border">
//       <CardHeader>
//         <CardTitle className="  gap-2 text-foreground flex items-center justify-center">
//           <AlertTriangle className="w-5 h-5 text-destructive" />
//           Emergency SOS
//         </CardTitle>
//         {/* <CardDescription className="text-muted-foreground text-center pt-[6px]">
//           Press the button below in case of emergency for fased response form nerest hospitals.
//         </CardDescription> */}
//       </CardHeader>
//       <CardContent className="text-center">
//         {locationError ? (
//           <div className="p-4 bg-warning/10 text-warning rounded-lg mb-4 border border-warning/20">
//             <p className="text-sm">{locationError}</p>
//           </div>
//         ) : (
//           <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
//             <Navigation className="w-4 h-4" />
//            Location services are enabled. SOS request can be sent to the nearest hospital within a 5 km radius.
//           </div>
//         )}
//         <div className="flex items-center justify-center">
//           <Button
//             onClick={handleSOSClick}
//             disabled={isLoading || !location}
//             size="icon"
//             className={`
//       ${isLoading ? 'animate-pulse' : ''}
//       bg-red-600 text-white hover:bg-red-700
//       rounded-full w-32 h-32 flex flex-col items-center justify-center
//       shadow-xl border-4 border-white transition-transform duration-150 active:scale-95
//       focus:outline-none focus:ring-4 focus:ring-red-300
//     `}
//             style={{
//               fontSize: "1.5rem",
//               boxShadow: "0 8px 32px 0 rgba(255,0,0,0.25)",
//             }}
//             aria-label="Send Emergency SOS"
//           >
//             <AlertTriangle className="w-14 h-14 mb-2 text-white drop-shadow" />
//             <span className="font-extrabold tracking-widest text-xl">
//               {isLoading ? "Sending..." : "SOS"}
//             </span>
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default SOSButton;
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, Navigation } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { sendSOSMail } from '@/hooks/mailhook'; // <-- Use mailhook here

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Radius of Earth in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const SOSButton = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [locationError, setLocationError] = useState<string>('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords);
        },
        (error) => {
          setLocationError('Unable to get location. Please enable location services.');
          console.error('Location error:', error);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  const sendSOSRequest = async (userLocation: GeolocationCoordinates) => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Step 1: Fetch all hospitals
      const { data: hospitals, error: hospitalError } = await supabase
        .from('hospital_profiles')
        .select('id, latitude, longitude, hospital_name');

      if (hospitalError || !hospitals || hospitals.length === 0) {
        throw new Error('No hospitals found.');
      }

      // Step 2: Find nearest hospital
      const distances = hospitals.map((hospital) => ({
        ...hospital,
        distance: haversineDistance(
          userLocation.latitude,
          userLocation.longitude,
          hospital.latitude,
          hospital.longitude
        ),
      }));

      const sorted = distances.sort((a, b) => a.distance - b.distance);
      const nearestHospital = sorted[0];

      // Step 3: Insert SOS request
      const { error: insertError } = await supabase.from('sos_requests').insert({
        user_id: user.id,
        user_latitude: userLocation.latitude,
        user_longitude: userLocation.longitude,
        user_address: 'Current Location',
        status: 'pending',
        assigned_hospital_id: nearestHospital.id,
      });

      if (insertError) throw insertError;

      toast({
        title: 'SOS Request Sent',
        description: `Emergency request sent to ${nearestHospital.hospital_name} (${nearestHospital.distance.toFixed(
          2
        )} km away).`,
      });
    } catch (error) {
      console.error('Error sending SOS request:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send SOS request. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSOSClick = async () => {
    if (!location) {
      toast({
        variant: 'destructive',
        title: 'Location Required',
        description: 'Please enable location services to send SOS request.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await sendSOSRequest(location);
      await sendSOSMail("medical"); // You can pass "medical" or "safety" if needed
      toast({
        title: "SOS Email Sent",
        description: "Emergency email notification sent successfully.",
      });
    } catch (error) {
      // sendSOSRequest and sendSOSMail already handle their own errors and toasts
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6 border-border">
      <CardHeader>
        <CardTitle className="gap-2 text-foreground flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          Emergency SOS
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        {locationError ? (
          <div className="p-4 bg-warning/10 text-warning rounded-lg mb-4 border border-warning/20">
            <p className="text-sm">{locationError}</p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
            <Navigation className="w-4 h-4" />
            Location services are enabled. SOS request can be sent to the nearest hospital within a 5 km radius.
          </div>
        )}
        <div className="flex items-center justify-center">
          <Button
            onClick={handleSOSClick}
            disabled={isLoading || !location}
            size="icon"
            className={`
              ${isLoading ? 'animate-pulse' : ''}
              bg-red-600 text-white hover:bg-red-700
              rounded-full w-32 h-32 flex flex-col items-center justify-center
              shadow-xl border-4 border-white transition-transform duration-150 active:scale-95
              focus:outline-none focus:ring-4 focus:ring-red-300
            `}
            style={{
              fontSize: "1.5rem",
              boxShadow: "0 8px 32px 0 rgba(255,0,0,0.25)",
            }}
            aria-label="Send Emergency SOS"
          >
            <AlertTriangle className="w-14 h-14 mb-2 text-white drop-shadow" />
            <span className="font-extrabold tracking-widest text-xl">
              {isLoading ? "Sending..." : "SOS"}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>

      );
};

export default SOSButton;