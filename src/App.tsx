import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n";

// Public pages
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ContactPage from "./pages/ContactPage";

// App pages
import Dashboard from "./pages/Dashboard";
import Ingredients from "./pages/Ingredients";
import IngredientImport from "./pages/IngredientImport";
import Suppliers from "./pages/Suppliers";
import Overhead from "./pages/Overhead";
import Recipes from "./pages/Recipes";
import RecipeBuilder from "./pages/RecipeBuilder";
import SalesImport from "./pages/SalesImport";
import Competitors from "./pages/Competitors";
import CompetitorItems from "./pages/CompetitorItems";
import CompetitorMapping from "./pages/CompetitorMapping";
import CompetitionReport from "./pages/CompetitionReport";
import Reports from "./pages/Reports";
import Recommendations from "./pages/Recommendations";
import RiskRadar from "./pages/RiskRadar";
import Actions from "./pages/Actions";
import SettingsProfile from "./pages/SettingsProfile";
import SettingsRestaurant from "./pages/SettingsRestaurant";

// Master Admin pages
import MasterAdminLogin from "./pages/MasterAdminLogin";
import MasterAdminDashboard from "./pages/MasterAdminDashboard";
import MasterAdminTenants from "./pages/MasterAdminTenants";
import MasterAdminAuditLogs from "./pages/MasterAdminAuditLogs";
import MasterAdminFeatureFlags from "./pages/MasterAdminFeatureFlags";
import MasterAdminAIControls from "./pages/MasterAdminAIControls";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <I18nProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* App */}
            <Route path="/app/dashboard" element={<Dashboard />} />
            <Route path="/app/ingredients" element={<Ingredients />} />
            <Route path="/app/ingredients/import" element={<IngredientImport />} />
            <Route path="/app/suppliers" element={<Suppliers />} />
            <Route path="/app/overhead" element={<Overhead />} />
            <Route path="/app/recipes" element={<Recipes />} />
            <Route path="/app/recipes/new" element={<RecipeBuilder />} />
            <Route path="/app/recipes/:id" element={<RecipeBuilder />} />
            <Route path="/app/sales/import" element={<SalesImport />} />
            <Route path="/app/competition/competitors" element={<Competitors />} />
            <Route path="/app/competition/items" element={<CompetitorItems />} />
            <Route path="/app/competition/mapping" element={<CompetitorMapping />} />
            <Route path="/app/competition/report" element={<CompetitionReport />} />
            <Route path="/app/reports" element={<Reports />} />
            <Route path="/app/recommendations" element={<Recommendations />} />
            <Route path="/app/risk-radar" element={<RiskRadar />} />
            <Route path="/app/actions" element={<Actions />} />
            <Route path="/app/settings/profile" element={<SettingsProfile />} />
            <Route path="/app/settings/restaurant" element={<SettingsRestaurant />} />

            {/* Master Admin */}
            <Route path="/master-admin/login" element={<MasterAdminLogin />} />
            <Route path="/master-admin/dashboard" element={<MasterAdminDashboard />} />
            <Route path="/master-admin/tenants" element={<MasterAdminTenants />} />
            <Route path="/master-admin/audit-logs" element={<MasterAdminAuditLogs />} />
            <Route path="/master-admin/feature-flags" element={<MasterAdminFeatureFlags />} />
            <Route path="/master-admin/ai-controls" element={<MasterAdminAIControls />} />

            {/* Redirects */}
            <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/master-admin" element={<Navigate to="/master-admin/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
