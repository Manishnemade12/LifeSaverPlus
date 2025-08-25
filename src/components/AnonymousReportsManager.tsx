
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flag, MapPin, Clock, History } from "lucide-react";
import { useAnonymousReports } from "@/hooks/useAnonymousReports";
import AnonymousReportsHistory from "./AnonymousReportsHistory";
import ResponderReportsManagement from "./ResponderReportsManagement";

export const AnonymousReportsManager = () => {
  const { reports, loading, updateReportStatus } = useAnonymousReports();
  const [activeTab, setActiveTab] = useState("active");
  const [updatingReports, setUpdatingReports] = useState<Set<string>>(new Set());
  return (

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Anonymous Community Reports</span>
          <Badge variant="outline">
            Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active Reports</TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>







          <TabsContent value="active" className="mt-4">
            <div className="space-y-4">

              <div className="py-8">
                {/* <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" /> */}
                {/* <p className="text-gray-600">No active reports</p> */}

      <ResponderReportsManagement />
              </div>

            </div>
          </TabsContent>




          <TabsContent value="history" className="mt-4">
            {/* <div className="space-y-4">

              <div className="text-center py-8"> */}
                {/* <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No completed reports</p> */}


                <AnonymousReportsHistory />



              {/* </div>
            </div> */}

          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

  );
};


