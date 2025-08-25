import { useEffect, useMemo, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Shield,
  MapPin,
  Clock,
  Ambulance,
  Phone,
  History,
  Flag,
  Navigation,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEmergencyAlerts } from "@/hooks/useEmergencyAlerts";
import { useResponderData } from "@/hooks/useResponderData";
import { useResponderLocation } from "@/hooks/useResponderLocation";
import { ResponderStatsCards } from "@/components/ResponderStatsCards";
import { NavigationButton } from "@/components/NavigationButton";
import { AnonymousReportsManager } from "@/components/AnonymousReportsManager";
import ResponderProfile from "@/components/ResponderProfile";
import EmergencyMap from "@/components/r/map";
import { Separator } from "@/components/ui/separator";

const ResponderDashboard = () => {
  const { profile, signOut } = useAuth();

  // Only subscribe to alerts when it actually makes sense (prevents loops / needless re-subscribes)
  const isVerified = !!profile?.responder_details?.is_verified;
  const { onDuty, updateDutyStatus, loading: responderLoading } = useResponderData();
  const shouldSubscribeAlerts = isVerified && onDuty;

  const {
    alerts,
    acknowledgeAlert,
    respondToAlert,
    completeAlert,
    loading: alertsLoading,
  } = useEmergencyAlerts(shouldSubscribeAlerts);

  const {
    currentLocation,
    locationError,
    calculateDistance,
  } = useResponderLocation();

  const [showProfile, setShowProfile] = useState(false);

  // ===== helpers (memoized) =====
  const contactUser = useCallback((phone: string) => {
    if (!phone) return;
    window.open(`tel:${phone}`);
  }, []);

  const getAlertTypeColor = useCallback((type: string) => {
    switch (type) {
      case "medical":
        return "bg-red-100 text-red-800";
      case "safety":
        return "bg-orange-100 text-orange-800";
      case "general":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800";
      case "acknowledged":
        return "bg-yellow-100 text-yellow-800";
      case "responding":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  const getAlertIcon = useCallback((type: string) => {
    switch (type) {
      case "medical":
        return <Ambulance className="h-4 w-4" />;
      case "safety":
        return <Shield className="h-4 w-4" />;
      case "general":
        return <Flag className="h-4 w-4" />;
      default:
        return <Flag className="h-4 w-4" />;
    }
  }, []);

  const getDistanceToAlert = useCallback(
    (alert: any) => {
      if (!currentLocation || !alert.location_lat || !alert.location_lng) return null;
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        alert.location_lat,
        alert.location_lng
      );
      return distance.toFixed(1) + " km";
    },
    [currentLocation, calculateDistance]
  );

  const filterAlertsWithinRadius = useCallback(
    (list: any[]) => {
      if (!currentLocation) return [];
      return list.filter((alert) => {
        if (!alert.location_lat || !alert.location_lng) return false;
        const distance = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          alert.location_lat,
          alert.location_lng
        );
        return distance <= 50;
      });
    },
    [currentLocation, calculateDistance]
  );

  // ===== derived data (memoized) =====
  const visibleAlerts = useMemo(() => {
    if (!shouldSubscribeAlerts) return [];
    const active = alerts.filter((a) => a.status !== "completed");
    return filterAlertsWithinRadius(active);
  }, [alerts, filterAlertsWithinRadius, shouldSubscribeAlerts]);

  const responderHistory = useMemo(
    () => alerts.filter((a) => a.responder_id === profile?.id),
    [alerts, profile?.id]
  );

  // ===== loading gate to avoid early mounts thrashing state =====
  const isReady = useMemo(
    () => typeof isVerified !== "undefined" && typeof onDuty !== "undefined",
    [isVerified, onDuty]
  );

  if (!isReady || alertsLoading || responderLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-7 w-7 text-red-600" />
                <div className="flex flex-col">
                  <span className="text-lg sm:text-xl font-bold text-gray-900">
                    Responder Dashboard
                  </span>
                  {profile && (
                    <span className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                      {profile.first_name} {profile.last_name} •{" "}
                      {profile.responder_details?.responder_type}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfile(true)}
                className="hidden sm:flex"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfile(true)}
                className="sm:hidden"
              >
                <User className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                Logout
              </Button>
            </div>
          </div>

          <Separator className="my-2" />

          <div className="pb-4">
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              {isVerified && (
                <div className="flex items-center justify-center lg:justify-start">
                  <div className="flex items-center space-x-4 bg-gray-50 rounded-lg px-4 py-2">
                    <span className="text-sm font-medium text-gray-700">
                      Duty Status:
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Off</span>
                      <Switch checked={onDuty} onCheckedChange={updateDutyStatus} />
                      <span className="text-sm text-gray-600">On</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2">
                <Badge
                  variant={onDuty ? "default" : "secondary"}
                  className={`${
                    onDuty ? "bg-green-600 hover:bg-green-700" : "bg-gray-500"
                  } text-white`}
                >
                  {onDuty ? "ON DUTY" : "OFF DUTY"}
                </Badge>

                {!isVerified && (
                  <Badge
                    variant="outline"
                    className="text-yellow-600 border-yellow-300"
                  >
                    PENDING VERIFICATION
                  </Badge>
                )}

                {currentLocation && (
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-300"
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Location Active</span>
                    <span className="sm:hidden">GPS</span>
                  </Badge>
                )}

                {locationError && (
                  <Badge
                    variant="outline"
                    className="text-red-600 border-red-300"
                  >
                    <span className="hidden sm:inline">Location Error</span>
                    <span className="sm:hidden">GPS Error</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {!isVerified && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start space-x-3">
                <Clock className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 text-sm sm:text-base">
                    Account Pending Verification
                  </h3>
                  <p className="text-yellow-700 text-xs sm:text-sm mt-1">
                    Your responder account is currently being verified. You will
                    receive access to emergency alerts once your credentials are
                    approved.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="alerts" className="space-y-6 w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="alerts" className="text-xs sm:text-sm px-2 py-3">
              <span className="hidden sm:inline">Active Alerts</span>
              <span className="sm:hidden">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="text-xs sm:text-sm px-2 py-3">
              <span className="hidden sm:inline">Area Map</span>
              <span className="sm:hidden">Map</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm px-2 py-3">
              <span className="hidden sm:inline">Response History</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm px-2 py-3">
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-6">
            <ResponderStatsCards />

            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <Ambulance className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg sm:text-xl text-gray-900">
                        Emergency Alerts
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Active emergencies in your area
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200"
                    >
                      {visibleAlerts.length} Active
                    </Badge>
                    {onDuty && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        Live
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-4 sm:px-6">
                {!isVerified && (
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800 text-sm">
                          Verification Required
                        </h4>
                        <p className="text-yellow-700 text-xs sm:text-sm mt-1">
                          Complete your account verification to start receiving
                          emergency alerts.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isVerified && !onDuty && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800 text-sm">
                          Currently Off Duty
                        </h4>
                        <p className="text-blue-700 text-xs sm:text-sm mt-1">
                          Switch to "On Duty" to start receiving emergency alerts
                          in your area.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {visibleAlerts.map((alert) => {
                    const distance = getDistanceToAlert(alert);

                    return (
                      <Card
                        key={alert.id}
                        className="border-l-4 border-l-red-500 hover:shadow-md transition-all duration-200 bg-white"
                      >
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
                            <div className="flex items-start space-x-4 flex-1 min-w-0">
                              <div className="flex-shrink-0 p-2 bg-red-50 rounded-lg">
                                {getAlertIcon(alert.type)}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  <Badge
                                    className={`${getAlertTypeColor(
                                      alert.type
                                    )} text-xs font-medium`}
                                  >
                                    {alert.type.toUpperCase()}
                                  </Badge>
                                  <Badge
                                    className={`${getStatusColor(
                                      alert.status
                                    )} text-xs font-medium`}
                                  >
                                    {alert.status.toUpperCase()}
                                  </Badge>
                                  {distance && (
                                    <Badge
                                      variant="outline"
                                      className="text-blue-600 border-blue-200 text-xs"
                                    >
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {distance}
                                    </Badge>
                                  )}
                                  <span className="text-xs text-gray-500 ml-auto">
                                    {new Date(alert.created_at).toLocaleTimeString()}
                                  </span>
                                </div>

                                <div className="space-y-2">
                                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                    {alert.location_description}
                                  </h3>

                                  {alert.description && (
                                    <p className="text-sm text-gray-700 break-words">
                                      {alert.description}
                                    </p>
                                  )}

                                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                                    <Phone className="h-4 w-4" />
                                    <span>
                                      Contact: {alert.profiles?.phone || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col space-y-2 lg:w-40 lg:flex-shrink-0">
                              {alert.profiles?.phone && (
                                <Button
                                  size="sm"
                                  onClick={() => contactUser(alert.profiles.phone)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                                >
                                  <Phone className="h-4 w-4 mr-2" />
                                  Contact
                                </Button>
                              )}

                              {alert.status === "active" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => acknowledgeAlert(alert.id)}
                                  className="w-full border-gray-300 hover:bg-gray-50"
                                >
                                  Acknowledge
                                </Button>
                              )}

                              {alert.status === "acknowledged" && (
                                <Button
                                  size="sm"
                                  onClick={() => respondToAlert(alert.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white w-full"
                                >
                                  Respond
                                </Button>
                              )}

                              {alert.status === "responding" && (
                                <Button
                                  size="sm"
                                  onClick={() => completeAlert(alert.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white w-full"
                                >
                                  Complete
                                </Button>
                              )}

                              <NavigationButton
                                userLat={currentLocation?.lat}
                                userLng={currentLocation?.lng}
                                destLat={alert.location_lat}
                                destLng={alert.location_lng}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {visibleAlerts.length === 0 && isVerified && onDuty && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        All Clear
                      </h3>
                      <p className="text-gray-500 text-sm max-w-sm mx-auto">
                        No active emergency alerts in your area. You'll be
                        notified immediately when new emergencies are reported.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Area Coverage Map</CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <div className="h-64 sm:h-96 w-full">
                  <EmergencyMap userLocation={null} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <History className="h-5 w-5" />
                  <span>Response History</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-4">
                  {responderHistory.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold capitalize text-sm sm:text-base">
                            {alert.type} Emergency
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            {alert.location_description}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {new Date(alert.created_at).toLocaleDateString()} at{" "}
                            {new Date(alert.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge className={getStatusColor(alert.status)}>
                            {alert.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  {responderHistory.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No response history yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <AnonymousReportsManager />
          </TabsContent>
        </Tabs>
      </div>

      <ResponderProfile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onProfileUpdate={() => setShowProfile(false)}
      />
    </div>
  );
};

export default ResponderDashboard;
