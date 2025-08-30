import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Header } from "./components/shared/Header";
import { AppSidebar } from "./components/shared/Sidebar";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ProducerDashboard from "./pages/ProducerDashboard";
import RegulatorDashboard from "./pages/RegulatorDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import PublicLedger from "./pages/PublicLedger";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/producer" element={
                      <ProtectedRoute requiredRole="producer">
                        <ProducerDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/regulator" element={
                      <ProtectedRoute requiredRole="regulator">
                        <RegulatorDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/buyer" element={
                      <ProtectedRoute requiredRole="buyer">
                        <BuyerDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/public" element={<PublicLedger />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
