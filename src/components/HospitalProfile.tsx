// app/(hospital)/HospitalProfile.tsx
'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const HospitalProfile: React.FC = () => {
  const { profile } = useAuth();

  const hospital = profile?.hospital_details?.[0];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Hospital Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {hospital ? (
            <div className="space-y-2">
              <p><strong>Hospital Name:</strong> {hospital.hospital_name}</p>
              <p><strong>Address:</strong> {hospital.address}</p>
              <p><strong>City:</strong> {hospital.city}</p>
              <p><strong>Phone:</strong> {hospital.phone}</p>
              <p><strong>Specialties:</strong> {hospital.specialties}</p>
            </div>
          ) : (
            <p>No hospital profile details found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HospitalProfile;
