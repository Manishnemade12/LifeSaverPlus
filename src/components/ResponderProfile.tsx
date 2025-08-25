import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ResponderProfileProps {
    isOpen: boolean;
    onClose: () => void;
    onProfileUpdate: () => void;
}

const ResponderProfile = ({ isOpen, onClose, onProfileUpdate }: ResponderProfileProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [responderType, setResponderType] = useState("");
    const [badgeId, setBadgeId] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            fetchProfile();
        }
    }, [isOpen, user]);

    const fetchProfile = async () => {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            const { data: responderDetails } = await supabase
                .from('responder_details')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setFirstName(profile.first_name || "");
                setLastName(profile.last_name || "");
                setPhone(profile.phone || "");
            }

            if (responderDetails) {
                setResponderType(responderDetails.responder_type || "");
                setBadgeId(responderDetails.badge_id || "");
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // Update profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone,
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // Update responder_details table
            const { error: responderError } = await supabase
                .from('responder_details')
                .update({
                    responder_type: responderType,
                    badge_id: badgeId,
                })
                .eq('id', user.id);

            if (responderError) throw responderError;

            toast({
                title: "Profile Updated",
                description: "Your profile has been successfully updated.",
            });

            onProfileUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        }
        setLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Enter first name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Enter last name"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter phone number"
                        />
                    </div>

                    <div>
                        <Label htmlFor="responderType">Responder Type</Label>
                        <Select value={responderType} onValueChange={setResponderType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select responder type" />
                            </SelectTrigger>
                            {/* <SelectContent>
                <SelectItem value="Police Officer">Police Officer</SelectItem>
                <SelectItem value="Firefighter">Firefighter</SelectItem>
                <SelectItem value="EMT">EMT</SelectItem>
                <SelectItem value="Paramedic">Paramedic</SelectItem>
                <SelectItem value="Security Guard">Security Guard</SelectItem>
              </SelectContent> */}

                            <SelectContent>
                                <SelectItem value="police">Police</SelectItem>
                                <SelectItem value="medical">Medical</SelectItem>
                                <SelectItem value="firefighter">Firefighter</SelectItem>
                                <SelectItem value="security">Security</SelectItem>
                                <SelectItem value="volunteer">Volunteer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="badgeId">Badge ID</Label>
                        <Input
                            id="badgeId"
                            value={badgeId}
                            onChange={(e) => setBadgeId(e.target.value)}
                            placeholder="Enter badge ID"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ResponderProfile;