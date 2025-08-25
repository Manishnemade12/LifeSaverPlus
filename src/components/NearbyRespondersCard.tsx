
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, MapPin } from "lucide-react";
import { useNearbyResponders } from "@/hooks/useNearbyResponders";

interface NearbyRespondersCardProps {
  userLat?: number;
  userLng?: number;
}

export const NearbyRespondersCard = ({ userLat, userLng }: NearbyRespondersCardProps) => {
  const { nearbyResponders, loading, count } = useNearbyResponders(userLat, userLng);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Nearby Responders</p>
              <p className="text-lg font-semibold">Loading...</p>
            </div>
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Nearby Responders</p>
            <p className="text-lg font-semibold">{count} Available</p>
            <p className="text-xs text-gray-500">Within 50km</p>
          </div>
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        
        {nearbyResponders.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Closest Responders:</p>
            {nearbyResponders.slice(0, 3).map((responder) => (
              <div key={responder.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">
                    {responder.first_name} {responder.last_name}
                  </p>
                  <p className="text-gray-500 capitalize">{responder.responder_type}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {responder.distance.toFixed(1)}km
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
