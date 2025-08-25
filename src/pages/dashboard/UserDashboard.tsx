import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Ambulance, Phone, MapPin, Users, History, Clock, Flag, User, MoreHorizontalIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEmergencyAlerts } from "@/hooks/useEmergencyAlerts";
import { useEmergencyContacts } from "@/hooks/useEmergencyContacts";
import { useAnonymousReports } from "@/hooks/useAnonymousReports";
import { useToast } from "@/hooks/use-toast";
import { NearbyRespondersCard } from "@/components/NearbyRespondersCard";
import { AnonymousReportDialog } from "@/components/AnonymousReportDialog";
// import { HospitalSOSDialog } from "@/components/HospitalSOSDialog";
import UserProfile from "@/components/UserProfile";
import AnonymousReportForm from "@/components/AnonymousReportForm";
import AnonymousReportsHistory from "@/components/AnonymousReportsHistory";
import { useHospitalSOS } from '@/hooks/useHospitalSOS';
import { supabase } from "@/integrations/supabase/client";
import SOSButton from "@/components/r/SOSButton";
import { sendSOSMail } from "@/hooks/mailhook";
import EmergencyContacts from "@/components/EmergencyContacts";
interface HospitalSOSDialogProps {
  userLocation: { lat: number; lng: number } | null;
}

const UserDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const { alerts, createAlert } = useEmergencyAlerts();
  const { contacts, addContact, removeContact } = useEmergencyContacts();
  const { submitReport } = useAnonymousReports();
  const { toast } = useToast();

  const [sosCountdown, setSosCountdown] = useState(0);
  const [activeSOS, setActiveSOS] = useState(false);
  const [selectedSOSType, setSelectedSOSType] = useState<'medical' | 'safety' | 'general'>('medical');
  const [newContact, setNewContact] = useState({ name: "", phone: "" });
  const [location, setLocation] = useState("Getting location...");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showProfile, setShowProfile] = useState(false);
const { sendHospitalSOS, loading } = useHospitalSOS();

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserCoords(coords);
          setLocation(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
        },
        () => {
          setLocation("Location unavailable");
        }
      );
    }
  }, []);

  useEffect(() => {
    if (sosCountdown > 0) {
      const timer = setTimeout(() => setSosCountdown(sosCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (sosCountdown === 0 && activeSOS) {
      handleSOSActivated();
    }
  }, [sosCountdown, activeSOS]);






  // Handle SOS button click
  // const handleSOSClick = async (type: "medical" | "safety" | "general") => {
  //   setSelectedSOSType(type); // Store the selected type
  //   setSosCountdown(3);
  //   setActiveSOS(true);

  //   toast({
  //     title: "SOS Alert Starting",
  //     description: `${type.toUpperCase()} emergency alert in 3 seconds. Tap cancel to stop.`,
  //   });

  //   // if (type === "medical") {
  //   //   await handleAutoSendSOS(); // call directly
  //   // }
  // };

  const handleSOSClick = async (type: "medical" | "safety" | "general") => {
  setSelectedSOSType(type);
  setSosCountdown(3);
  setActiveSOS(true);

  toast({
    title: "SOS Alert Starting",
    description: `${type.toUpperCase()} emergency alert in 3 seconds. Tap cancel to stop.`,
  });

  // Optional delay logic ke baad call kar sakte ho
  // ya direct test ke liye yaha bhi call karo:

  try {
    await sendSOSMail(type);
    toast({
      title: `${type.toUpperCase()} SOS Sent`,
      description: "Email has been successfully sent!",
    });
  } catch (error) {
    toast({
      title: "Failed to send SOS",
      description: "Please check your connection or location settings.",
    });
  }
};

  const handleSOSCancel = () => {
    setSosCountdown(0);
    setActiveSOS(false);
    setSelectedSOSType('medical'); // Reset to default
    toast({
      title: "SOS Cancelled",
      description: "Emergency alert has been cancelled.",
    });
  };

  const handleSOSActivated = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            description: location
          };

          // Use the selected SOS type instead of hardcoded "medical"
          await createAlert(selectedSOSType, locationData, `${selectedSOSType.toUpperCase()} emergency assistance needed`);
          setActiveSOS(false);
          setSelectedSOSType('medical'); // Reset to default
        },
        () => {
          toast({
            title: "Location Error",
            description: "Could not get your location for the emergency alert.",
            variant: "destructive"
          });
          setActiveSOS(false);
          setSelectedSOSType('medical'); // Reset to default
        }
      );
    }
  };

  const handleAddContact = async () => {
    if (newContact.name && newContact.phone) {
      await addContact(newContact.name, newContact.phone);
      setNewContact({ name: "", phone: "" });
    }
  };

  const callContact = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const call911 = () => {
    window.open("tel:911");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-red-100 text-red-800";
      case "acknowledged": return "bg-yellow-100 text-yellow-800";
      case "responding": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "medical": return <Ambulance className="h-4 w-4" />;
      case "safety": return <Shield className="h-4 w-4" />;
      case "general": return <Flag className="h-4 w-4" />;
      default: return <Flag className="h-4 w-4" />;
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-red-600" />
              <span className="text-xl font-bold">User Dashboard</span>
              {profile && (
                <span className="text-gray-600 sm:flex hidden">
                  - {profile.first_name} {profile.last_name}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfile(true)}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
  {/* const [showProfile, setShowProfile] = useState(false); */}
              <UserProfile
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
                onProfileUpdate={() => {
                  setShowProfile(false);
                }}
              />

              <Button variant="outline" onClick={signOut}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* SOS Countdown Overlay */}
        {sosCountdown > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-8 text-center">
              <div className="text-6xl font-bold text-red-600 mb-4">{sosCountdown}</div>
              <p className="text-lg mb-4">{selectedSOSType.toUpperCase()} emergency alert activating...</p>
              <Button onClick={handleSOSCancel} variant="outline">
                Cancel SOS
              </Button>
            </Card>
          </div>
        )}

        <Tabs defaultValue="emergency" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          

          <TabsContent value="emergency" className="space-y-6">
            {/* Emergency Actions */}
 
  <SOSButton />


            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Ambulance className="h-5 w-5 text-red-600" />
                  <span>Emergency Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <Button
                    onClick={() => handleSOSClick("medical")}
                    className="h-20 bg-red-600 hover:bg-red-700 text-white"
                    disabled={sosCountdown > 0}
                  >
                    <div className="text-center">
                      <Ambulance className="h-6 w-6 mx-auto mb-1" />
                      <div className="font-semibold">Medical Emergency</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleSOSClick("safety")}
                    className="h-20 bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={sosCountdown > 0}
                  >
                    <div className="text-center">
                      <Shield className="h-6 w-6 mx-auto mb-1" />
                      <div className="font-semibold">Personal Safety</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleSOSClick("general")}
                    className="h-20 bg-yellow-600 hover:bg-yellow-700 text-white"
                    disabled={sosCountdown > 0}
                  >
                    <div className="text-center">
                      <Flag className="h-6 w-6 mx-auto mb-1" />
                      <div className="font-semibold">General Emergency</div>
                    </div>
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-4 gap-4">
                  <Button onClick={call911} variant="outline" className="border-red-600 text-red-600">
                    <Phone className="h-4 w-4 mr-2" />
                    Call 911
                  </Button>
                  <Button variant="outline">
                    <MapPin className="h-4 w-4 mr-2" />
                    Share Location
                  </Button>
                  <Button variant="outline">
                    <MoreHorizontalIcon className="h-4 w-4 mr-2" />
                   New Features
                  </Button>
                  {/* <HospitalSOSDialog
                    userLocation={userCoords}
                    trigger={
                      <Button variant="outline" className="w-full" disabled={!userCoords}>
                        <Ambulance className="h-4 w-4 mr-2" />
                        Find Hospital
                      </Button>
                    }
                  /> */}
                  <AnonymousReportDialog
                    onSubmit={submitReport}
                    trigger={
                      <Button variant="outline" className="w-full">
                        <Flag className="h-4 w-4 mr-2" />
                        Anonymous Report
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Current Location</p>
                      <p className="text-lg font-semibold">{location}</p>
                    </div>
                    <MapPin className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Emergency Contacts</p>
                      <p className="text-lg font-semibold">{contacts.length} Active</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <NearbyRespondersCard
                userLat={userCoords?.lat}
                userLng={userCoords?.lng}
              />
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
           <EmergencyContacts />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>SOS Alert History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(alert.type)}
                          <div>
                            <p className="font-semibold capitalize">{alert.type} Emergency</p>
                            <p className="text-sm text-gray-600">{alert.location_description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(alert.status)}>
                            {alert.status}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(alert.created_at).toLocaleDateString()} {new Date(alert.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      {alert.description && (
                        <div className="mt-2 text-sm text-gray-600">
                          {alert.description}
                        </div>
                      )}
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No emergency alerts yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Anonymous Safety Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <AnonymousReportForm />
              </CardContent>
            </Card>

            <CardContent>
              <Card>
                <AnonymousReportsHistory />
              </Card>
            </CardContent>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;

