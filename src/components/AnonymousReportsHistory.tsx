import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { FileText, MapPin, Clock } from "lucide-react";

interface AnonymousReport {
  id: string;
  title: string;
  description: string;
  location: string | null;
  status: string;
  priority: string;
  created_at: string;
  responded_at: string | null;
  resolution_message: string | null;
}

const AnonymousReportsHistory = () => {
  const [reports, setReports] = useState<AnonymousReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();

    // Set up real-time subscription
    const channel = supabase
      .channel('anonymous-reports-history-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'anonymous_reports'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRealtimeUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    setReports(currentReports => {
      switch (eventType) {
        case 'INSERT':
          return [newRecord as AnonymousReport, ...currentReports.slice(0, 9)]; // Keep only latest 10
        case 'UPDATE':
          return currentReports.map(report => 
            report.id === newRecord.id ? newRecord as AnonymousReport : report
          );
        case 'DELETE':
          return currentReports.filter(report => report.id !== oldRecord.id);
        default:
          return currentReports;
      }
    });
  };

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('anonymous_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Anonymous Reports History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Anonymous Reports History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reports found</p>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{report.title}</h4>
                  <div className="flex space-x-2">
                    <Badge className={getPriorityColor(report.priority)} variant="secondary">
                      {report.priority}
                    </Badge>
                    <Badge className={getStatusColor(report.status)} variant="secondary">
                      {report.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{report.description}</p>
                {report.location && (
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {report.location}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(report.created_at).toLocaleString()}
                </div>
                {report.resolution_message && (
                  <div className="bg-green-50 p-3 rounded-md mt-2">
                    <p className="text-sm font-medium text-green-800">Resolution:</p>
                    <p className="text-sm text-green-700">{report.resolution_message}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnonymousReportsHistory;
