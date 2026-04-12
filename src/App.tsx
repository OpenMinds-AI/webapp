import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import ChoosePath from "./pages/ChoosePath.tsx";
import TalentOnboarding from "./pages/TalentOnboarding.tsx";
import JoinOnboarding from "./pages/JoinOnboarding.tsx";
import AdminReview from "./pages/AdminReview.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import Collective from "./pages/Collective.tsx";
import MyProfile from "./pages/MyProfile.tsx";
import Pending from "./pages/Pending.tsx";
import NotFound from "./pages/NotFound.tsx";
import PreJoin from "./pages/PreJoin.tsx";
import PreVentures from "./pages/PreVentures.tsx";
import PrePartners from "./pages/PrePartners.tsx";
import VenturesOnboarding from "./pages/VenturesOnboarding.tsx";
import PartnersOnboarding from "./pages/PartnersOnboarding.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/choose-path"
              element={
                <ProtectedRoute>
                  <ChoosePath />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/talent"
              element={
                <ProtectedRoute>
                  <TalentOnboarding />
                </ProtectedRoute>
              }
            />
            <Route path="/join" element={<JoinOnboarding />} />
            <Route path="/pre-join" element={<PreJoin />} />
            <Route path="/pre-ventures" element={<PreVentures />} />
            <Route path="/pre-partners" element={<PrePartners />} />
            <Route path="/ventures" element={<VenturesOnboarding />} />
            <Route path="/partners" element={<PartnersOnboarding />} />
            {/* TODO: restore ProtectedRoute on /admin before publishing */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route
              path="/admin/review/:id"
              element={
                <ProtectedRoute>
                  <AdminReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collective"
              element={
                <ProtectedRoute>
                  <Collective />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collective/profile"
              element={
                <ProtectedRoute>
                  <MyProfile />
                </ProtectedRoute>
              }
            />
            <Route path="/pending" element={<Pending />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
