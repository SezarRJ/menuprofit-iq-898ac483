import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Shield, Users, BarChart3, Flag, Sparkles, FileText } from "lucide-react";
import { mockTenants } from "@/lib/mock-data";

function AdminLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const links = [
    { path: "/master-admin/dashboard", label: isAr ? "الرئيسية" : "Dashboard", icon: BarChart3 },
    { path: "/master-admin/tenants", label: isAr ? "المستأجرون" : "Tenants", icon: Users },
    { path: "/master-admin/audit-logs", label: isAr ? "السجلات" : "Audit Logs", icon: FileText },
    { path: "/master-admin/feature-flags", label: isAr ? "الميزات" : "Features", icon: Flag },
    { path: "/master-admin/ai-controls", label: isAr ? "AI" : "AI", icon: Sparkles },
  ];
  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border bg-destructive/5 flex items-center px-6 gap-4">
        <Shield className="w-5 h-5 text-destructive" />
        <span className="font-bold">{isAr ? "لوحة إدارة النظام" : "Master Admin"}</span>
        <div className="flex-1" />
        {links.map(l => <Link key={l.path} to={l.path} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"><l.icon className="w-3.5 h-3.5" />{l.label}</Link>)}
      </header>
      <main className="p-6 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}

export { AdminLayout };

export default function MasterAdminDashboard() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const active = mockTenants.filter(t => t.status === "active").length;
  const plans = { free: mockTenants.filter(t => t.plan === "free").length, pro: mockTenants.filter(t => t.plan === "pro").length, elite: mockTenants.filter(t => t.plan === "elite").length };
  const suspended = mockTenants.filter(t => t.status === "suspended").length;

  return (
    <AdminLayout>
      <div className="grid sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-extrabold">{mockTenants.length}</p><p className="text-sm text-muted-foreground">{isAr ? "إجمالي المستأجرين" : "Total Tenants"}</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><div className="flex justify-center gap-3"><Badge className="bg-success/20 text-success border-0">Free: {plans.free}</Badge><Badge className="bg-primary/20 text-primary border-0">Pro: {plans.pro}</Badge><Badge className="bg-warning/20 text-warning border-0">Elite: {plans.elite}</Badge></div><p className="text-sm text-muted-foreground mt-2">{isAr ? "توزيع الخطط" : "Plan Distribution"}</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-extrabold text-destructive">{suspended}</p><p className="text-sm text-muted-foreground">{isAr ? "معلق" : "Suspended"}</p></CardContent></Card>
      </div>
    </AdminLayout>
  );
}
