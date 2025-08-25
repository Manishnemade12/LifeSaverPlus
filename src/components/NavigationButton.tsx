
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface NavigationButtonProps {
  userLat?: number;
  userLng?: number;
  destLat?: number;
  destLng?: number;
  className?: string;
}

export const NavigationButton = ({ 
  userLat, 
  userLng, 
  destLat, 
  destLng, 
  className 
}: NavigationButtonProps) => {
  const handleNavigate = () => {
    if (!destLat || !destLng) {
      // Fallback: open general location in Google Maps
      window.open(`https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`, '_blank');
      return;
    }

    let url;
    if (userLat && userLng) {
      // Open directions from user location to destination
      url = `https://www.google.com/maps/dir/${userLat},${userLng}/${destLat},${destLng}`;
    } else {
      // Open destination location only
      url = `https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`;
    }
    
    window.open(url, '_blank');
  };

  return (
    <Button 
      size="sm" 
      variant="outline" 
      onClick={handleNavigate}
      className={className}
      disabled={!destLat || !destLng}
    >
      <MapPin className="h-4 w-4 mr-1" />
      Navigate
    </Button>
  );
};
