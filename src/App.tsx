import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import GardenRoom from "./pages/GardenRoom";
import TerraceApartment from "./pages/TerraceApartment";
import ModernApartment from "./pages/ModernApartment";
import StoneVaultApartment from "./pages/StoneVaultApartment";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SearchResults from "./pages/SearchResults";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminDashboard from "@/pages/AdminDashboard";
import AvailabilityManagement from "@/pages/AvailabilityManagement";
import PriceManagement from "@/pages/PriceManagement";
import ICalTester from "@/pages/ICalTester";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/rooms/garden-room" element={<GardenRoom />} />
            <Route path="/rooms/terrace-apartment" element={<TerraceApartment />} />
            <Route path="/rooms/modern-apartment" element={<ModernApartment />} />
            <Route path="/rooms/stone-vault-apartment" element={<StoneVaultApartment />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/search-results" element={<SearchResults />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/availability" element={<ProtectedRoute><AvailabilityManagement /></ProtectedRoute>} />
            <Route path="/admin/price-management" element={<ProtectedRoute><PriceManagement /></ProtectedRoute>} />
            <Route path="/admin/ical-tester" element={<ProtectedRoute><ICalTester /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;

