
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HospitalSOSData {
  user_name: string;
  user_phone: string;
  latitude: number;
  longitude: number;
  emergency_type: string;
  description: string;
}

export const useHospitalSOS = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendHospitalSOS = async (sosData: HospitalSOSData) => {
    setLoading(true);
    try {
      // Find hospitals within 5km radius using the hospital_details table
      const { data: nearbyHospitals, error: hospitalError } = await supabase
        .from('hospital_details')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (hospitalError) {
        throw hospitalError;
      }

      if (!nearbyHospitals || nearbyHospitals.length === 0) {
        toast({
          title: "No Hospitals Found",
          description: "No hospitals found in your area.",
          variant: "destructive"
        });
        return;
      }

      // Create SOS request for hospitals
      const { error: sosError } = await supabase
        .from('sos_requests')
        .insert({
          user_name: sosData.user_name,
          user_phone: sosData.user_phone,
          latitude: sosData.latitude,
          longitude: sosData.longitude,
          emergency_type: sosData.emergency_type,
          description: sosData.description,
          status: 'active',
          created_at: new Date().toISOString()
        });

      if (sosError) {
        throw sosError;
      }

      toast({
        title: "Hospital SOS Sent",
        description: `Emergency request sent to ${nearbyHospitals.length} nearby hospitals.`,
      });

    } catch (error: any) {
      console.error('Error sending hospital SOS:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send emergency request to hospitals.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    sendHospitalSOS,
    loading
  };
};
