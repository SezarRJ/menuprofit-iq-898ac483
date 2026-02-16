import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RestaurantProvider, useRestaurant } from "@/lib/restaurant-context";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Setup from "./pages/Setup";
import Dashboard from "./pages/Dashboard";
import Costs from "./pages/Costs";
import Ingredients from "./pages/Ingredients";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import DiscountRules from "./pages/DiscountRules";
import Sales from "./pages/Sales";
import AIAssistant from "./pages/AIAssistant";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, restaurant, loading } = useRestaurant();
  const setupDone = localStorage.getItem("setup_done") === "1";
  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">جاري التحميل...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!restaurant && !setupDone && window.location.pathname !== "/setup") return <Navigate to="/setup" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, restaurant, loading } = useRestaurant();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">جاري التحميل...</p></div>;
  if (user && restaurant) return <Navigate to="/dashboard" replace />;
  if (user && !restaurant) return <Navigate to="/setup" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RestaurantProvider>
          <Routes>
            <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />
            <Route path="/setup" element={<ProtectedRoute><Setup /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/costs" element={<ProtectedRoute><Costs /></ProtectedRoute>} />
            <Route path="/ingredients" element={<ProtectedRoute><Ingredients /></ProtectedRoute>} />
            <Route path="/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
            <Route path="/recipes/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
            <Route path="/discount-rules" element={<ProtectedRoute><DiscountRules /></ProtectedRoute>} />
            <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
            <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RestaurantProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
