
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnonymousReport {
  id: string;
  type: string;
  description: string;
  location_lat?: number;
  location_lng?: number;
  location_description?: string;
  status: string;
  created_at: string;
}

export const useAnonymousReports = () => {
  const [reports, setReports] = useState<AnonymousReport[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const subscriptionRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('anonymous_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching anonymous reports:', error);
        throw error;
      }
      
      console.log('Fetched anonymous reports:', data);
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching anonymous reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports.",
        variant: "destructive",
      });
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const cleanupSubscription = useCallback(() => {
    if (subscriptionRef.current && isSubscribedRef.current) {
      console.log('Cleaning up anonymous reports subscription');
      try {
        subscriptionRef.current.unsubscribe();
      } catch (error) {
        console.log('Error during anonymous reports cleanup:', error);
      }
      subscriptionRef.current = null;
      isSubscribedRef.current = false;
    }
  }, []);

  const setupSubscription = useCallback(() => {
    if (isSubscribedRef.current) {
      return;
    }

    try {
      const channelName = `anonymous_reports_${Date.now()}`;
      console.log('Setting up anonymous reports subscription:', channelName);

      const channel = supabase.channel(channelName);
      
      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'anonymous_reports',
          },
          (payload) => {
            console.log('Real-time anonymous report update received:', payload);
            fetchReports();
          }
        )
        .subscribe((status) => {
          console.log('Anonymous reports subscription status:', status);
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true;
          } else if (status === 'CLOSED') {
            isSubscribedRef.current = false;
          }
        });

      subscriptionRef.current = channel;
    } catch (error) {
      console.error('Error setting up anonymous reports subscription:', error);
    }
  }, [fetchReports]);

  const submitReport = async (
    type: string,
    description: string,
    locationData?: { lat: number; lng: number; description: string }
  ) => {
    try {
      console.log('Submitting anonymous report:', { type, description, locationData });
      
      const { data, error } = await supabase
        .from('anonymous_reports')
        .insert({
          type,
          description,
          location_lat: locationData?.lat,
          location_lng: locationData?.lng,
          location_description: locationData?.description,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting report:', error);
        throw error;
      }

      console.log('Report submitted successfully:', data);
      
      toast({
        title: "Report Submitted",
        description: "Your anonymous report has been submitted successfully.",
      });

      fetchReports();
      return { data, error: null };
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your report. Please try again.",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      console.log('Updating report status:', reportId, 'to:', status);
      
      const { data, error } = await supabase
        .from('anonymous_reports')
        .update({ status })
        .eq('id', reportId)
        .select()
        .single();

      if (error) {
        console.error('Error updating report status:', error);
        throw error;
      }

      console.log('Report status updated successfully:', data);

      toast({
        title: "Status Updated",
        description: `Report status updated to ${status}.`,
      });

      fetchReports();
      return { data, error: null };
    } catch (error) {
      console.error('Error updating report status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update report status.",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    // Clean up any existing subscription
    cleanupSubscription();

    // Fetch initial data
    fetchReports();

    // Set up subscription after delay
    const timeoutId = setTimeout(() => {
      setupSubscription();
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      cleanupSubscription();
    };
  }, [fetchReports, setupSubscription, cleanupSubscription]);

  return {
    reports,
    loading,
    submitReport,
    updateReportStatus,
    refreshReports: fetchReports,
  };
};
