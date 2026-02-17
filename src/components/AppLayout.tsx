import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, DollarSign, Package, UtensilsCrossed,
  BarChart3, Settings, LogOut, Percent, Menu, X, Sparkles, Shield, Lock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant, canAccessFeature } from "@/lib/restaurant-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const navItems = [
  { path: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard, feature: "dashboard" },
  { path: "/costs", label: "المصاريف", icon: DollarSign, feature: "costs" },
  { path: "/ingredients", label: "المواد الخام", icon: Package, feature: "ingredients" },
  { path: "/recipes", label: "الوصفات", icon: UtensilsCrossed, feature: "recipes" },
  { path: "/sales", label: "المبيعات", icon: BarChart3, feature: "sales" },
  { path: "/discount-rules", label: "قواعد الخصومات", icon: Percent, feature: "discount-rules" },
  { path: "/ai-assistant", label: "المساعد الذكي", icon: Sparkles, feature: "ai-assistant" },
  { path: "/setup", label: "الإعدادات", icon: Settings, feature: "setup" },
];

const planLabels = { free: "مجاني", pro: "احترافي", elite: "مميز" };

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { restaurant, plan, isAdmin } = useRestaurant();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <>
      <div className="p-5 border-b border-sidebar-border">
        <h1 className="text-lg font-bold text-sidebar-primary">MenuProfit</h1>
        {restaurant && (
          <p className="text-sm text-sidebar-foreground/70 mt-1">{restaurant.name}</p>
        )}
        <Badge variant="outline" className="mt-2 text-xs border-sidebar-primary/30 text-sidebar-primary">
          {planLabels[plan]}
        </Badge>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          const accessible = canAccessFeature(item.feature, plan);
          return (
            <Link
              key={item.path}
              to={accessible ? item.path : "#"}
              onClick={(e) => {
                if (!accessible) { e.preventDefault(); return; }
                onNavigate?.();
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                !accessible
                  ? "text-sidebar-foreground/30 cursor-not-allowed"
                  : active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {!accessible && <Lock className="w-3 h-3 mr-auto" />}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            to="/admin"
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mt-4 border-t border-sidebar-border pt-4 ${
              location.pathname.startsWith("/admin")
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
          >
            <Shield className="w-5 h-5" />
            لوحة الإدارة
          </Link>
        )}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          تسجيل الخروج
        </button>
      </div>
    </>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-40 flex items-center justify-between bg-sidebar text-sidebar-foreground px-4 h-14 border-b border-sidebar-border">
          <h1 className="text-base font-bold text-sidebar-primary">MenuProfit</h1>
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="text-sidebar-foreground">
            <Menu className="w-5 h-5" />
          </Button>
        </header>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="w-72 p-0 bg-sidebar text-sidebar-foreground flex flex-col">
            <VisuallyHidden><SheetTitle>القائمة</SheetTitle></VisuallyHidden>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <main className="p-4 max-w-6xl mx-auto">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col fixed top-0 bottom-0 right-0 z-30">
        <SidebarContent />
      </aside>
      <main className="flex-1 mr-64">
        <div className="p-6 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
