// app/(hospital)/ResolvedHistory.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin, Phone, User } from 'lucide-react';

interface SOSRequest {
  id: string;
  user_name: string;
  user_phone: string;
  latitude: number;
  longitude: number;
  emergency_type: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
}

const ResolvedHistory: React.FC = () => {
  const [history, setHistory] = useState<SOSRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResolvedRequests();
  }, []);

  const fetchResolvedRequests = async () => {
    const { data, error } = await supabase
      .from('sos_requests')
      .select('*')
      .eq('status', 'resolved')
      .order('updated_at', { ascending: false })
      .limit(50);

    if (!error && data) setHistory(data);
    setLoading(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Resolved SOS Requests History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading history...</p>
          ) : history.length === 0 ? (
            <p>No resolved requests found.</p>
          ) : (
            <div className="space-y-4">
              {history.map((req) => (
                <div key={req.id} className="border p-4 rounded-md space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="font-semibold">{req.user_name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Type:</span> {req.emergency_type}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Description:</span> {req.description}
                  </div>
                  <div className="text-sm flex flex-wrap gap-4 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(req.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{req.user_phone}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{req.latitude.toFixed(4)}, {req.longitude.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResolvedHistory;
