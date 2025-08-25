import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Clock, User, AlertTriangle, History, Building2, Phone, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// ProfileModal for updating profile according to your schema
const ProfileModal = ({ open, onClose, profile, onProfileUpdate }: any) => {
  const [form, setForm] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    phone: profile?.phone || "",
    email: profile?.email || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      phone: profile?.phone || "",
      email: profile?.email || "",
    });
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    await onProfileUpdate(form);
    setSaving(false);
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4">Update Profile</h2>
        <div className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            name="first_name"
            placeholder="First Name"
            value={form.first_name}
            onChange={handleChange}
          />
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            name="last_name"
            placeholder="Last Name"
            value={form.last_name}
            onChange={handleChange}
          />
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
          />
          <input
            className="w-full border rounded px-3 py-2 text-sm bg-gray-100"
            name="email"
            placeholder="Email"
            value={form.email}
            disabled
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Stats Cards Component
const HospitalStatsCards = ({ sosRequests, historyRequests }: any) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <Card>
      <CardContent className="p-4">
        <div className="text-2xl font-bold text-red-600">{sosRequests.length}</div>
        <div className="text-sm text-gray-600">Active Emergencies</div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        <div className="text-2xl font-bold text-green-600">{historyRequests.filter((r: any) => r.status === 'resolved').length}</div>
        <div className="text-sm text-gray-600">Resolved Today</div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        <div className="text-2xl font-bold text-blue-600">{historyRequests.length}</div>
        <div className="text-sm text-gray-600">Total Handled</div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        <div className="text-2xl font-bold text-yellow-600">5min</div>
        <div className="text-sm text-gray-600">Avg Response</div>
      </CardContent>
    </Card>
  </div>
);

interface SOSRequest {
  id: string;
  user_id: string;
  user_address: string | null;
  user_latitude: number;
  user_longitude: number;
  assigned_hospital_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  estimated_arrival: string | null;
  notes: string | null;
  status: string;
}

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string;
  user_type: string;
}

const HospitalDashboard: React.FC = () => {
  const [sosRequests, setSosRequests] = useState<SOSRequest[]>([]);
  const [historyRequests, setHistoryRequests] = useState<SOSRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const navigate = useNavigate();
  const subscriptionRef = useRef<any>(null);

  // Fetch hospital id for the logged-in user and profile
  useEffect(() => {
    const fetchHospitalIdAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch hospital id
        const { data: hospital, error: hospitalError } = await supabase
          .from('hospital_profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        if (hospital) {
          setHospitalId(hospital.id);
        } else {
          toast({
            title: 'Profile Not Found',
            description: 'No hospital profile found for this account.',
            variant: 'destructive',
          });
          navigate('/auth/hospital');
        }
        // Fetch profile
        const { data: prof, error: profError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (prof) {
          setProfile(prof as Profile);
        }
        setProfileLoading(false);
      }
    };
    fetchHospitalIdAndProfile();
    // eslint-disable-next-line
  }, []);

  // Fetch and subscribe to SOS requests assigned to this hospital
  useEffect(() => {
    if (!hospitalId) return;
    setLoading(true);

    // Initial fetch
    const fetchSOSRequests = async () => {
      const { data, error } = await supabase
        .from('sos_requests')
        .select('*')
        .eq('assigned_hospital_id', hospitalId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSosRequests(data.filter((req: SOSRequest) => req.status === 'active' || req.status === 'pending'));
        setHistoryRequests(
          data.filter(
            (req: SOSRequest) =>
              req.status === 'resolved' || req.status === 'dismissed'
          )
        );
      }
      setLoading(false);
    };

    fetchSOSRequests();

    // Clean up previous subscription if any
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }

    // Real-time subscription
    const channel = supabase
      .channel('realtime:sos_requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sos_requests',
          filter: `assigned_hospital_id=eq.${hospitalId}`,
        },
        (payload) => {
          setSosRequests((prev) => {
            let updated = prev;
            if (payload.eventType === 'INSERT') {
              if (payload.new.status === 'active' || payload.new.status === 'pending') {
                if (!prev.some((req) => req.id === payload.new.id)) {
                  updated = [payload.new as SOSRequest, ...prev];
                }
              }
            } else if (payload.eventType === 'UPDATE') {
              if (payload.new.status !== 'active' && payload.new.status !== 'pending') {
                updated = prev.filter((req) => req.id !== payload.new.id);
              } else {
                updated = prev.map((req) =>
                  req.id === payload.new.id ? (payload.new as SOSRequest) : req
                );
              }
            } else if (payload.eventType === 'DELETE') {
              updated = prev.filter((req) => req.id !== payload.old.id);
            }
            return updated;
          });
          setHistoryRequests((prev) => {
            let updated = prev;
            if (payload.eventType === 'INSERT') {
              if (
                payload.new.status === 'resolved' ||
                payload.new.status === 'dismissed'
              ) {
                if (!prev.some((req) => req.id === payload.new.id)) {
                  updated = [payload.new as SOSRequest, ...prev];
                }
              }
            } else if (payload.eventType === 'UPDATE') {
              if (
                payload.new.status === 'resolved' ||
                payload.new.status === 'dismissed'
              ) {
                if (!prev.some((req) => req.id === payload.new.id)) {
                  updated = [payload.new as SOSRequest, ...prev];
                }
              } else {
                updated = prev.filter((req) => req.id !== payload.new.id);
              }
            } else if (payload.eventType === 'DELETE') {
              updated = prev.filter((req) => req.id !== payload.old.id);
            }
            return updated;
          });
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [hospitalId, toast]);

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Immediate UI update on status change (optimistic)
  const handleStatusUpdate = async (id: string, status: string) => {
    setSosRequests((prev) =>
      prev
        .map((req) => (req.id === id ? { ...req, status } : req))
        .filter((req) => req.status === 'active' || req.status === 'pending')
    );
    if (status === 'resolved' || status === 'dismissed') {
      setHistoryRequests((prev) => [
        ...prev,
        sosRequests.find((req) => req.id === id) as SOSRequest,
      ]);
    }
    const { error } = await supabase
      .from('sos_requests')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Could not update status.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Status Updated',
        description: `Request marked as ${status}.`,
      });
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth/hospital');
  };

  const handleProfileUpdate = async (updated: any) => {
    if (!profile) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: updated.first_name,
        last_name: updated.last_name,
        phone: updated.phone,
      })
      .eq('id', profile.id);
    if (!error) {
      setProfile({ ...profile, ...updated });
      toast({ title: "Profile Updated", description: "Your profile has been updated." });
    } else {
      toast({ title: "Error", description: "Could not update profile.", variant: "destructive" });
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Row - Brand and User Actions */}
          <div className="flex items-center justify-between py-4">
            {/* Brand Section */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Building2 className="h-7 w-7 text-blue-600" />
                <div className="flex flex-col">
                  <span className="text-lg sm:text-xl font-bold text-gray-900">Hospital Dashboard</span>
                  {profile && (
                    <span className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                      {profile.first_name} {profile.last_name} • Hospital Staff
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* User Actions */}
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
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </Button>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Status Row */}
          <div className="pb-4">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
                HOSPITAL ACTIVE
              </Badge>
              
              <Badge variant="outline" className="text-green-600 border-green-300">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="hidden sm:inline">System Online</span>
                <span className="sm:hidden">Online</span>
              </Badge>
              
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                <span className="hidden sm:inline">{sosRequests.length} Active Cases</span>
                <span className="sm:hidden">{sosRequests.length} Cases</span>
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Tabs defaultValue="emergency" className="space-y-6 w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="emergency" className="text-xs sm:text-sm px-2 py-3">
              <span className="hidden sm:inline">Emergency Requests</span>
              <span className="sm:hidden">Emergency</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm px-2 py-3">
              <span className="hidden sm:inline">Response History</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="emergency" className="space-y-6">
            <HospitalStatsCards sosRequests={sosRequests} historyRequests={historyRequests} />

            {/* Enhanced Emergency Requests Section */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg sm:text-xl text-gray-900">Emergency Requests</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">Active SOS requests assigned to your hospital</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {sosRequests.length} Active
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                      Live
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-4">
                  {sosRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear</h3>
                      <p className="text-gray-500 text-sm max-w-sm mx-auto">
                        No emergency requests assigned to your hospital at the moment.
                      </p>
                    </div>
                  ) : (
                    sosRequests.map((request) => (
                      <Card key={request.id} className="border-l-4 border-l-red-500 hover:shadow-md transition-all duration-200 bg-white">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
                            {/* Request Information */}
                            <div className="flex items-start space-x-4 flex-1 min-w-0">
                              <div className="flex-shrink-0 p-2 bg-red-50 rounded-lg">
                                <User className="h-4 w-4 text-red-600" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                {/* Badge Row */}
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  <Badge className={`${getStatusColor(request.status)} text-xs font-medium`}>
                                    {request.status.toUpperCase()}
                                  </Badge>
                                  <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs">
                                    ID: {request.user_id.slice(0, 8)}...
                                  </Badge>
                                  <span className="text-xs text-gray-500 ml-auto">
                                    {formatTime(request.created_at)}
                                  </span>
                                </div>

                                {/* Location and Details */}
                                <div className="space-y-2">
                                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                                    {request.user_address || 'Emergency Location'}
                                  </h3>
                                  
                                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                                    <MapPin className="h-4 w-4" />
                                    <span>
                                      {request.user_latitude?.toFixed(6)}, {request.user_longitude?.toFixed(6)}
                                    </span>
                                    <a
                                      href={`https://www.google.com/maps?q=${request.user_latitude},${request.user_longitude}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-center p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition ml-2"
                                      title="Open in Maps"
                                    >
                                      <Navigation className="h-3 w-3" />
                                    </a>
                                  </div>
                                  
                                  {request.notes && (
                                    <p className="text-sm text-gray-700 break-words">
                                      <span className="font-medium">Notes: </span>
                                      {request.notes}
                                    </p>
                                  )}
                                  
                                  {request.estimated_arrival && (
                                    <p className="text-sm text-gray-700">
                                      <span className="font-medium">ETA: </span>
                                      {request.estimated_arrival}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col space-y-2 lg:w-40 lg:flex-shrink-0">
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(request.id, 'resolved')}
                                className="bg-green-600 hover:bg-green-700 text-white w-full"
                              >
                                Resolve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(request.id, 'dismissed')}
                                className="w-full border-gray-300 hover:bg-gray-50"
                              >
                                Dismiss
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <History className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg sm:text-xl text-gray-900">Response History</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">Previously handled emergency requests</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {historyRequests.length} Completed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-4">
                  {historyRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <History className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No History Yet</h3>
                      <p className="text-gray-500 text-sm max-w-sm mx-auto">
                        Resolved and dismissed requests will appear here.
                      </p>
                    </div>
                  ) : (
                    historyRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge className={`${getStatusColor(request.status)} text-xs`}>
                                  {request.status.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="text-blue-600 text-xs">
                                  ID: {request.user_id.slice(0, 8)}...
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {formatTime(request.created_at)}
                                </span>
                              </div>
                              <p className="font-semibold text-sm sm:text-base truncate">
                                {request.user_address || 'Emergency Location'}
                              </p>
                              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                                <MapPin className="h-3 w-3" />
                                <span>
                                  {request.user_latitude?.toFixed(6)}, {request.user_longitude?.toFixed(6)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ProfileModal
        open={showProfile}
        onClose={() => setShowProfile(false)}
        profile={profile}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default HospitalDashboard;
