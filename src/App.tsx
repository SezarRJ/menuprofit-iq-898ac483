import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RestaurantProvider, useRestaurant, canAccessFeature } from "@/lib/restaurant-context";
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
import AdminPanel from "./pages/AdminPanel";
import Navigator from "./pages/Navigator";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Set to false for production
const PROTOTYPE_MODE = true;

function ProtectedRoute({ children, feature }: { children: React.ReactNode; feature?: string }) {
  if (PROTOTYPE_MODE) return <>{children}</>;
  const { user, restaurant, loading, plan } = useRestaurant();
  const setupDone = localStorage.getItem("setup_done") === "1";
  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">جاري التحميل...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!restaurant && !setupDone && window.location.pathname !== "/setup") return <Navigate to="/setup" replace />;
  // Plan gating
  if (feature && !canAccessFeature(feature, plan)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <h2 className="text-2xl font-bold">ميزة غير متاحة</h2>
          <p className="text-muted-foreground">هذه الميزة تتطلب ترقية اشتراكك. قم بالترقية للوصول الكامل.</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  if (PROTOTYPE_MODE) return <>{children}</>;
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
            <Route path="/_nav" element={<Navigator />} />
            <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />
            <Route path="/setup" element={<ProtectedRoute feature="setup"><Setup /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute feature="dashboard"><Dashboard /></ProtectedRoute>} />
            <Route path="/costs" element={<ProtectedRoute feature="costs"><Costs /></ProtectedRoute>} />
            <Route path="/ingredients" element={<ProtectedRoute feature="ingredients"><Ingredients /></ProtectedRoute>} />
            <Route path="/recipes" element={<ProtectedRoute feature="recipes"><Recipes /></ProtectedRoute>} />
            <Route path="/recipes/:id" element={<ProtectedRoute feature="recipes"><RecipeDetail /></ProtectedRoute>} />
            <Route path="/discount-rules" element={<ProtectedRoute feature="discount-rules"><DiscountRules /></ProtectedRoute>} />
            <Route path="/sales" element={<ProtectedRoute feature="sales"><Sales /></ProtectedRoute>} />
            <Route path="/ai-assistant" element={<ProtectedRoute feature="ai-assistant"><AIAssistant /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RestaurantProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
