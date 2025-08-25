
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flag, MapPin } from "lucide-react";

interface AnonymousReportDialogProps {
  onSubmit: (type: string, description: string, location?: { lat: number; lng: number; description: string }) => void;
  trigger?: React.ReactNode;
}

export const AnonymousReportDialog = ({ onSubmit, trigger }: AnonymousReportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [locationDescription, setLocationDescription] = useState("");
  const [includeLocation, setIncludeLocation] = useState(false);

  const [latitude, setLatitude] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<string | null>(null);

  useEffect(() => {
    if (includeLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setLatitude(lat.toString());
          setLongitude(lng.toString());

          // Reverse geocode to get readable address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          if (data?.display_name) {
            setLocationDescription(data.display_name);
          }
        },
        (error) => {
          console.error("Location error:", error);
        }
      );
    }
  }, [includeLocation]);




  const handleSubmit = () => {
    if (!type || !description) return;

    let locationData;
    if (includeLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          locationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            description: locationDescription,
          };
          onSubmit(type, description, locationData);
        },
        () => {
          // Submit without location if geolocation fails
          onSubmit(type, description);
        }
      );
    } else {
      onSubmit(type, description);
    }

    // Reset form
    setType("");
    setDescription("");
    setLocationDescription("");
    setIncludeLocation(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full">
            <Flag className="h-4 w-4 mr-2" />
            Submit Anonymous Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Anonymous Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="report-type">Report Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="safety">Safety Concern</SelectItem>
                <SelectItem value="suspicious">Suspicious Activity</SelectItem>
                <SelectItem value="infrastructure">Infrastructure Issue</SelectItem>
                <SelectItem value="environmental">Environmental Hazard</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue or concern..."
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="include-location"
              checked={includeLocation}
              onChange={(e) => setIncludeLocation(e.target.checked)}
            />
            <Label htmlFor="include-location" className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              Include my current location
            </Label>
          </div>

          {includeLocation && (
            <div>
              <Label htmlFor="location-desc">Location Description (Auto-Filled)</Label>
              <Input
                id="location-desc"
                value={locationDescription}
                onChange={(e) => setLocationDescription(e.target.value)}
                placeholder="e.g., Near the park entrance"
              />
            </div>
          )}


          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!type || !description}
            >
              Submit Reported
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

