import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Ambulance } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const ResponderAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, signIn, user, profile } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    responderType: "",
    badgeId: ""
  });

  const responderTypes = [
    "police",
    "medical",
    "firefighter", 
    "security",
    "volunteer"
  ];

  useEffect(() => {
    if (user && profile) {
      if (profile.user_type === 'responder') {
        navigate("/dashboard/responder");
      } else if (profile.user_type === 'user') {
        navigate("/dashboard/user");
      }
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive"
        });
        return;
      }

      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          user_type: 'responder',
          responder_type: formData.responderType,
          badge_id: formData.badgeId
        });
        
        if (error) {
          toast({
            title: "Registration Failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Registration Submitted",
            description: "Your responder account is pending verification. You'll be notified once approved."
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-gray-900 hover:text-red-600">
            <Shield className="h-8 w-8 text-red-600" />
            <span className="text-2xl font-bold">EmergencyConnect</span>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Ambulance className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              {isLogin ? "Responder Login" : "Responder Registration"}
            </CardTitle>
            <p className="text-gray-600 text-center">
              {isLogin ? "Access your emergency response dashboard" : "Join as a verified emergency responder"}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responderType">Responder Type</Label>
                    <Select onValueChange={(value) => setFormData({...formData, responderType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your responder type" />
                      </SelectTrigger>
                      <SelectContent>
                        {responderTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="badgeId">Badge/ID Number</Label>
                    <Input
                      id="badgeId"
                      name="badgeId"
                      value={formData.badgeId}
                      onChange={handleInputChange}
                      required
                      placeholder="Badge or ID number"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                />
              </div>

              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> All responder accounts require verification. You'll receive an email once your credentials are verified.
                    </p>
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? "Processing..." : (isLogin ? "Sign In" : "Submit for Verification")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                {isLogin ? "Need to register? Sign up" : "Already verified? Sign in"}
              </button>
            </div>

            <div className="mt-4 text-center">
              <Link to="/auth/user" className="text-blue-600 hover:text-blue-800 text-sm">
                Looking for help? User access here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResponderAuth;
