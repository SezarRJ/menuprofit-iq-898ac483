import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n";
import { RestaurantProvider } from "@/lib/restaurant-context";

// Public pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";

// App pages — 6 SRS modules
import Dashboard from "./pages/Dashboard";
import DataHubIngredients from "./pages/DataHubIngredients";
import IngredientImport from "./pages/IngredientImport";
import DataHubCosts from "./pages/DataHubCosts";
import SalesImport from "./pages/SalesImport";
import MenuStudioRecipes from "./pages/MenuStudioRecipes";
import RecipeBuilder from "./pages/RecipeBuilder";
import PricingEngine from "./pages/PricingEngine";
import PromotionStudio from "./pages/PromotionStudio";
import LoyaltyProgram from "./pages/LoyaltyProgram";
import SettingsPage from "./pages/SettingsPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <I18nProvider>
        <RestaurantProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />

              {/* Dashboard */}
              <Route path="/app/dashboard" element={<Dashboard />} />

              {/* Data Hub */}
              <Route path="/app/data-hub/ingredients" element={<DataHubIngredients />} />
              <Route path="/app/data-hub/ingredients/import" element={<IngredientImport />} />
              <Route path="/app/data-hub/sales" element={<SalesImport />} />
              <Route path="/app/data-hub/operating-costs" element={<DataHubCosts costType="operating" />} />
              <Route path="/app/data-hub/fixed-costs" element={<DataHubCosts costType="fixed" />} />
              <Route path="/app/data-hub/hidden-costs" element={<DataHubCosts costType="hidden" />} />

              {/* Menu Studio */}
              <Route path="/app/menu-studio/recipes" element={<MenuStudioRecipes />} />
              <Route path="/app/menu-studio/recipes/new" element={<RecipeBuilder />} />
              <Route path="/app/menu-studio/recipes/:id" element={<RecipeBuilder />} />

              {/* Pricing Engine */}
              <Route path="/app/pricing-engine" element={<PricingEngine />} />

              {/* Promotion Studio */}
              <Route path="/app/promotion-studio/promotions" element={<PromotionStudio />} />
              <Route path="/app/promotion-studio/loyalty" element={<LoyaltyProgram />} />

              {/* Settings */}
              <Route path="/app/settings" element={<SettingsPage />} />

              {/* Legacy redirects */}
              <Route path="/login" element={<Navigate to="/auth/login" replace />} />
              <Route path="/signup" element={<Navigate to="/auth/register" replace />} />
              <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/app/ingredients" element={<Navigate to="/app/data-hub/ingredients" replace />} />
              <Route path="/app/recipes" element={<Navigate to="/app/menu-studio/recipes" replace />} />
              <Route path="/app/overhead" element={<Navigate to="/app/data-hub/operating-costs" replace />} />
              <Route path="/app/settings/profile" element={<Navigate to="/app/settings" replace />} />
              <Route path="/app/settings/restaurant" element={<Navigate to="/app/settings" replace />} />
              <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/app/data-hub" element={<Navigate to="/app/data-hub/ingredients" replace />} />
              <Route path="/app/menu-studio" element={<Navigate to="/app/menu-studio/recipes" replace />} />
              <Route path="/app/promotion-studio" element={<Navigate to="/app/promotion-studio/promotions" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </RestaurantProvider>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;