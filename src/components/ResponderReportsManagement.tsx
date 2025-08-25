import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Eye, MapPin, Clock, CheckCircle, XCircle } from "lucide-react";

interface AnonymousReport {
  id: string;
  title: string;
  description: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  priority: string;
  created_at: string;
  responded_at: string | null;
  responder_id: string | null;
  resolution_message: string | null;
}

const ResponderReportsManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<AnonymousReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolutionMessage, setResolutionMessage] = useState("");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);

  useEffect(() => {
    fetchReports();

    // Set up real-time subscription
    const channel = supabase
      .channel('responder-reports-changes')
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
          return [newRecord as AnonymousReport, ...currentReports];
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
    setLoading(false);
  };

  const updateReportStatus = async (reportId: string, status: string, message?: string) => {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'investigating') {
        updateData.responder_id = user?.id;
        updateData.responded_at = new Date().toISOString();
      }

      if (status === 'resolved' && message) {
        updateData.resolution_message = message;
      }

      const { error } = await supabase
        .from('anonymous_reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Report status updated to ${status}`,
      });

      // Close dialog if it was a resolve action
      if (status === 'resolved') {
        setIsResolveDialogOpen(false);
        setResolutionMessage("");
        setSelectedReportId(null);
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive",
      });
    }
  };

  const handleResolveWithMessage = () => {
    if (selectedReportId) {
      updateReportStatus(selectedReportId, 'resolved', resolutionMessage);
    }
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

  const pendingReports = reports.filter(report => report.status === 'pending');
  const activeReports = reports.filter(report => ['investigating'].includes(report.status));
  const completedReports = reports.filter(report => ['resolved', 'dismissed'].includes(report.status));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Anonymous Reports Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const renderReportCard = (report: AnonymousReport) => (
    <div key={report.id} className="border rounded-lg p-4 space-y-3">
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
        <div className="bg-green-50 p-3 rounded-md">
          <p className="text-sm font-medium text-green-800">Resolution Message:</p>
          <p className="text-sm text-green-700">{report.resolution_message}</p>
        </div>
      )}

      {report.latitude && report.longitude && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const url = `https://maps.google.com/maps?q=${report.latitude},${report.longitude}`;
            window.open(url, '_blank');
          }}
        >
          <MapPin className="h-4 w-4 mr-1" />
          View Location
        </Button>
      )}

      {report.status === 'pending' && (
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={() => updateReportStatus(report.id, 'investigating')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Eye className="h-4 w-4 mr-1" />
            Investigate
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateReportStatus(report.id, 'dismissed')}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Dismiss
          </Button>
        </div>
      )}

      {report.status === 'investigating' && (
        <div className="flex space-x-2">
          <Dialog open={isResolveDialogOpen && selectedReportId === report.id} onOpenChange={setIsResolveDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedReportId(report.id);
                  setIsResolveDialogOpen(true);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Resolve
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Resolve Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Add a resolution message to explain what action was taken:
                  </p>
                  <Textarea
                    value={resolutionMessage}
                    onChange={(e) => setResolutionMessage(e.target.value)}
                    placeholder="Describe what was done to resolve this report..."
                    rows={4}
                  />
                </div>
                <div className="flex space-x-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsResolveDialogOpen(false);
                      setResolutionMessage("");
                      setSelectedReportId(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleResolveWithMessage}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Resolve Report
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateReportStatus(report.id, 'dismissed')}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Pending Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Pending Reports
            </span>
            <Badge variant="secondary">{pendingReports.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingReports.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending reports</p>
            ) : (
              pendingReports.map(renderReportCard)
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Active Investigations
            </span>
            <Badge variant="secondary">{activeReports.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeReports.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active investigations</p>
            ) : (
              activeReports.map(renderReportCard)
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completed Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Completed Reports
            </span>
            <Badge variant="secondary">{completedReports.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedReports.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No completed reports</p>
            ) : (
              completedReports.slice(0, 5).map(renderReportCard)
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResponderReportsManagement;
