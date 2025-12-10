import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Vendors from "./pages/Vendors";
import VendorProfile from "./pages/VendorProfile";
import Documents from "./pages/Documents";
import Assessments from "./pages/Assessments";
import AssessmentComparison from "./pages/AssessmentComparison";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import RiskAnalytics from "./pages/RiskAnalytics";
import RemediationTracking from "./pages/RemediationTracking";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import VendorPortal from "./pages/VendorPortal";
import Auth from "./pages/Auth";
import SuperAdmin from "./pages/SuperAdmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/portal" element={<VendorPortal />} />
          <Route path="/super-admin" element={<SuperAdmin />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Index />} />
              <Route path="/executive" element={<ExecutiveDashboard />} />
              <Route path="/analytics" element={<RiskAnalytics />} />
              <Route path="/remediation" element={<RemediationTracking />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/vendors/:id" element={<VendorProfile />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/assessments" element={<Assessments />} />
              <Route path="/assessments/compare" element={<AssessmentComparison />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
