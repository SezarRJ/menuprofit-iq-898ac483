import { Link, useLocation, Navigate } from "react-router-dom";
import { useAdmin } from "@/lib/admin-context";
import {
  LayoutDashboard, Users, CreditCard, Flag, Sparkles, FileUp,
  ScrollText, Bell, Activity, LogOut, Shield, Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/admin", label: "Overview", icon: LayoutDashboard },
  { path: "/admin/tenants", label: "Tenants", icon: Users },
  { path: "/admin/plans", label: "Plans", icon: CreditCard },
  { path: "/admin/feature-flags", label: "Feature Flags", icon: Flag },
  { path: "/admin/ai-control", label: "AI Control", icon: Sparkles },
  { path: "/admin/import-monitor", label: "Import Monitor", icon: FileUp },
  { path: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
  { path: "/admin/notifications", label: "Notifications", icon: Bell },
  { path: "/admin/system-health", label: "System Health", icon: Activity },
  { path: "/admin/billing", label: "Billing", icon: Receipt },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading, logout, adminRole } = useAdmin();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center">
        <Skeleton className="w-64 h-8 bg-white/10" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0f0f23] text-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col bg-[#0a0a1f]">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/10">
          <Shield className="w-5 h-5 text-indigo-400" />
          <span className="font-bold text-sm tracking-wide">SmartMenu Admin</span>
        </div>
        <nav className="flex-1 py-3 space-y-0.5 px-2">
          {navItems.map(item => {
            const active = location.pathname === item.path ||
              (item.path !== "/admin" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-indigo-600/20 text-indigo-300 font-medium"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-2">
          <div className="text-xs text-gray-500 px-3">Role: {adminRole}</div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-400 hover:text-red-400"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
