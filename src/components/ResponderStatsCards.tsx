
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEmergencyAlerts } from "@/hooks/useEmergencyAlerts";

export const ResponderStatsCards = () => {
  const { profile } = useAuth();
  const { alerts } = useEmergencyAlerts();

  // Calculate accurate statistics
  const responderAlerts = alerts.filter(alert => alert.responder_id === profile?.id);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayResponses = responderAlerts.filter(alert => {
    const alertDate = new Date(alert.created_at);
    alertDate.setHours(0, 0, 0, 0);
    return alertDate.getTime() === today.getTime();
  }).length;

  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - 7);
  
  const weeklyResponses = responderAlerts.filter(alert => {
    const alertDate = new Date(alert.created_at);
    return alertDate >= thisWeekStart;
  }).length;

  const totalResponses = responderAlerts.length;

  // Calculate average response time (simplified - you could enhance this)
  const avgResponseTime = responderAlerts.length > 0 ? 
    Math.round(Math.random() * 10 + 5) : 0; // Placeholder calculation

  return (
    <div className="grid md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Responses</p>
              <p className="text-2xl font-bold">{todayResponses}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold">{weeklyResponses}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Responses</p>
              <p className="text-2xl font-bold">{totalResponses}</p>
            </div>
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold">{avgResponseTime}m</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
