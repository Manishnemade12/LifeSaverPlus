
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import UserAuth from "./pages/auth/UserAuth";
import ResponderAuth from "./pages/auth/ResponderAuth";
import HospitalAuth from "./pages/auth/HospitalAuth";
import UserDashboard from "./pages/dashboard/UserDashboard";
import ResponderDashboard from "./pages/dashboard/ResponderDashboard";
import HospitalDashboard from "./pages/dashboard/HospitalDashboard";
import NotFound from "./pages/NotFound";
import ResolvedHistory from "./components/ResolvedHistory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/user" element={<UserAuth />} />
            <Route path="/auth/responder" element={<ResponderAuth />} />
            <Route path="/auth/hospital" element={<HospitalAuth />} />
            <Route
              path="/dashboard/user"
              element={
                <ProtectedRoute requiredUserType="user">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/responder"
              element={
                <ProtectedRoute requiredUserType="responder">
                  <ResponderDashboard />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/dashboard/hospital"
              element={
                <ProtectedRoute requiredUserType="hospital">
                  <HospitalDashboard />
                </ProtectedRoute>
              }
            /> */}
            <Route
              path="/dashboard/hospital"
              element={
                <ProtectedRoute >
                  <HospitalDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/hospital/history"
              element={
                <ProtectedRoute requiredUserType="hospital">
                  <ResolvedHistory />
                </ProtectedRoute>
              }
            />


            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
