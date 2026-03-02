import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, Users, Calculator, UtensilsCrossed,
  Upload, Swords, BarChart3, Sparkles, AlertTriangle, ClipboardList,
  Settings, LogOut, Menu, X, Bell, Globe, ChevronLeft, ChevronRight,
  Lock, Crown, Building2, User
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useRestaurant, PlanTier } from "@/lib/restaurant-context";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

// PlanTier imported from restaurant-context

interface NavItem {
  path: string;
  labelKey: string;
  icon: any;
  minPlan?: PlanTier;
  children?: { path: string; labelKey: string }[];
}

const navSections: { labelKey: string; items: NavItem[] }[] = [
  { labelKey: "", items: [
    { path: "/app/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  ]},
  { labelKey: "costManagement", items: [
    { path: "/app/ingredients", labelKey: "ingredients", icon: Package },
    { path: "/app/suppliers", labelKey: "suppliers", icon: Users },
    { path: "/app/overhead", labelKey: "overhead", icon: Calculator },
  ]},
  { labelKey: "menu", items: [
    { path: "/app/recipes", labelKey: "recipes", icon: UtensilsCrossed },
    { path: "/app/sales/import", labelKey: "salesImport", icon: Upload, minPlan: "pro" },
  ]},
  { labelKey: "competition", items: [
    { path: "/app/competition/competitors", labelKey: "competitors", icon: Swords, minPlan: "pro" },
    { path: "/app/competition/report", labelKey: "competitionReport", icon: BarChart3, minPlan: "pro" },
  ]},
  { labelKey: "intelligence", items: [
    { path: "/app/recommendations", labelKey: "recommendations", icon: Sparkles, minPlan: "elite" },
    { path: "/app/risk-radar", labelKey: "riskRadar", icon: AlertTriangle, minPlan: "elite" },
    { path: "/app/actions", labelKey: "actions", icon: ClipboardList },
    { path: "/app/reports", labelKey: "reports", icon: BarChart3, minPlan: "pro" },
  ]},
];

const sectionLabels: Record<string, Record<string, string>> = {
  ar: { costManagement: "إدارة التكاليف", menu: "القائمة", competition: "المنافسة", intelligence: "التحليلات" },
  en: { costManagement: "Cost Management", menu: "Menu", competition: "Competition", intelligence: "Intelligence" },
};

// Removed hardcoded plan constant

function canAccess(minPlan: PlanTier | undefined, currentPlan: PlanTier) {
  if (!minPlan) return true;
  const order: PlanTier[] = ["free", "pro", "elite"];
  return order.indexOf(currentPlan) >= order.indexOf(minPlan);
}

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { plan, restaurant } = useRestaurant();

  return (
    <div className="flex flex-col h-full">
      <div className={cn("p-4 border-b border-sidebar-border flex items-center gap-3", collapsed && "justify-center")}>
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
          <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-sm font-bold text-sidebar-primary">MenuProfit</h1>
            <Badge variant="outline" className="mt-0.5 text-[10px] border-sidebar-primary/30 text-sidebar-primary px-1.5 py-0">
              {t(plan)}
            </Badge>
          </div>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
        {navSections.map((section, si) => (
          <div key={si}>
            {section.labelKey && !collapsed && (
              <p className="px-3 py-1 text-[11px] font-medium text-sidebar-foreground/40 uppercase tracking-wider">
                {sectionLabels[lang]?.[section.labelKey] || section.labelKey}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = location.pathname.startsWith(item.path);
                const locked = !canAccess(item.minPlan, plan);
                return (
                  <Link
                    key={item.path}
                    to={locked ? "#" : item.path}
                    onClick={(e) => {
                      if (locked) { e.preventDefault(); return; }
                      onNavigate?.();
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                      collapsed && "justify-center px-2",
                      locked ? "text-sidebar-foreground/25 cursor-not-allowed" :
                      active ? "bg-sidebar-primary/15 text-sidebar-primary font-medium" :
                      "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    title={collapsed ? t(item.labelKey) : undefined}
                  >
                    <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{t(item.labelKey)}</span>
                        {locked && <Lock className="w-3 h-3" />}
                        {item.minPlan && !locked && (
                          <span className="text-[10px] text-sidebar-primary/60 font-medium">{t(item.minPlan)}</span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-2 border-t border-sidebar-border">
        <Link
          to="/app/settings/profile"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent transition-all",
            collapsed && "justify-center px-2",
            location.pathname.startsWith("/app/settings") && "bg-sidebar-primary/15 text-sidebar-primary"
          )}
        >
          <Settings className="w-4.5 h-4.5" />
          {!collapsed && <span>{t("settings")}</span>}
        </Link>
      </div>
    </div>
  );
}

function TopBar({ onMenuClick, collapsed, onToggleSidebar }: { onMenuClick: () => void; collapsed: boolean; onToggleSidebar: () => void }) {
  const { t, lang, dir, setLang } = useLanguage();
  const { restaurant } = useRestaurant();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const pageTitle = navSections.flatMap(s => s.items).find(i => location.pathname.startsWith(i.path))?.labelKey || "dashboard";

  return (
    <header className="h-14 border-b border-border bg-card/50 glass flex items-center justify-between px-4 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {isMobile ? (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="text-muted-foreground">
            <Menu className="w-5 h-5" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="text-muted-foreground">
            {dir === "rtl" ? (collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) :
              (collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />)}
          </Button>
        )}
        <h2 className="text-base font-semibold">{t(pageTitle)}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs border-primary/30 text-primary hidden sm:inline-flex">
          <Building2 className="w-3 h-3 me-1" />
          {restaurant?.name || "MenuProfit"}
        </Badge>

        <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => setLang(lang === "ar" ? "en" : "ar")}>
          <Globe className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <User className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={dir === "rtl" ? "start" : "end"} className="w-48">
            <DropdownMenuItem onClick={() => navigate("/app/settings/profile")}>
              <User className="w-4 h-4 me-2" />{t("profile")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/app/settings/restaurant")}>
              <Building2 className="w-4 h-4 me-2" />{t("restaurant")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={async () => { await supabase.auth.signOut(); navigate("/auth/login"); }}>
              <LogOut className="w-4 h-4 me-2" />{t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const { dir } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (isMobile) {
    return (
      <div className="min-h-screen">
        <TopBar onMenuClick={() => setMobileOpen(true)} collapsed={false} onToggleSidebar={() => {}} />
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side={dir === "rtl" ? "right" : "left"} className="w-72 p-0 bg-sidebar text-sidebar-foreground flex flex-col">
            <VisuallyHidden><SheetTitle>القائمة</SheetTitle></VisuallyHidden>
            <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        <main className="p-4 max-w-7xl mx-auto animate-fade-in">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className={cn(
        "bg-sidebar text-sidebar-foreground flex flex-col fixed top-0 bottom-0 z-30 transition-all duration-300 border-border",
        dir === "rtl" ? "right-0 border-l" : "left-0 border-r",
        collapsed ? "w-16" : "w-60"
      )}>
        <SidebarContent collapsed={collapsed} />
      </aside>
      <div className={cn("flex-1 flex flex-col transition-all duration-300", dir === "rtl" ? (collapsed ? "mr-16" : "mr-60") : (collapsed ? "ml-16" : "ml-60"))}>
        <TopBar onMenuClick={() => {}} collapsed={collapsed} onToggleSidebar={() => setCollapsed(!collapsed)} />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
