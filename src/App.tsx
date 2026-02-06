import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AccommodationPage from "./pages/AccommodationPage";
import RidesPage from "./pages/RidesPage";
import EventsPage from "./pages/EventsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OwnerLoginPage from "./pages/owner/OwnerLoginPage";
import OwnerSignupPage from "./pages/owner/OwnerSignupPage";
import OwnerDashboardPage from "./pages/owner/OwnerDashboardPage";
import OwnerSettingsPage from "./pages/owner/OwnerSettingsPage";
import OwnerListingsPage from "./pages/owner/OwnerListingsPage";
import OwnerBookingsPage from "./pages/owner/OwnerBookingsPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminListingsPage from "./pages/admin/AdminListingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/accommodation" element={<AccommodationPage />} />
          <Route path="/rides" element={<RidesPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Provider Routes */}
          <Route path="/owner/login" element={<OwnerLoginPage />} />
          <Route path="/owner/signup" element={<OwnerSignupPage />} />
          <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
          <Route path="/owner/settings" element={<OwnerSettingsPage />} />
          <Route path="/owner/accommodations" element={<OwnerListingsPage />} />
          <Route path="/owner/rides" element={<OwnerListingsPage />} />
          <Route path="/owner/events" element={<OwnerListingsPage />} />
          <Route path="/owner/bookings" element={<OwnerBookingsPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/accommodations" element={<AdminListingsPage />} />
          <Route path="/admin/rides" element={<AdminListingsPage />} />
          <Route path="/admin/events" element={<AdminListingsPage />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
