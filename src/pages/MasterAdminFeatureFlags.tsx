import { AdminLayout } from "./MasterAdminDashboard";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const flags = [
  { key: "ai_recommendations", label: "AI Recommendations", labelAr: "التوصيات الذكية", enabled: true, plan: "elite" },
  { key: "risk_radar", label: "Risk Radar", labelAr: "رادار المخاطر", enabled: true, plan: "elite" },
  { key: "competition_module", label: "Competition Module", labelAr: "وحدة المنافسة", enabled: true, plan: "pro" },
  { key: "sales_import", label: "Sales Import", labelAr: "استيراد المبيعات", enabled: true, plan: "pro" },
  { key: "bulk_export", label: "Bulk Export", labelAr: "تصدير جماعي", enabled: false, plan: "pro" },
];

export default function MasterAdminFeatureFlags() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  return (
    <AdminLayout>
      <Card>
        <CardHeader><CardTitle className="text-base">{isAr ? "إدارة الميزات" : "Feature Flags"}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {flags.map(f => (
            <div key={f.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3"><span className="text-sm font-medium">{isAr ? f.labelAr : f.label}</span><Badge variant="outline" className="text-[10px]">{f.plan}+</Badge></div>
              <Switch defaultChecked={f.enabled} />
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
