import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Activity, Eye } from "lucide-react";

export default function AdminPanel() {
  const { isAdmin, roles } = useRestaurant();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) loadAdminData();
  }, [isAdmin]);

  const loadAdminData = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("admin_access_logs").insert({
        admin_id: user.id,
        dataset: "admin_dashboard",
        action_type: "view",
        reason: "لوحة الإدارة - عرض عام",
      });
    }

    const [auditRes, accessRes] = await Promise.all([
      supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("admin_access_logs").select("*").order("created_at", { ascending: false }).limit(50),
    ]);

    setAuditLogs(auditRes.data ?? []);
    setAccessLogs(accessRes.data ?? []);
    setLoading(false);
  };

  // Server-side role check: if not admin, redirect
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const canMutate = roles.includes("master_admin");
  const canExport = roles.includes("master_admin") || roles.includes("billing_admin");

  const formatDate = (d: string) => new Date(d).toLocaleString("ar-IQ");

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
          <Badge variant="outline" className="mr-auto">
            {roles.filter(r => r !== "user").join(", ") || "مدير"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-card">
            <CardContent className="pt-6 flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">الصلاحيات</p>
                <p className="font-bold">{canMutate ? "تعديل كامل" : canExport ? "عرض + تصدير" : "عرض فقط"}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6 flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">سجلات المراجعة</p>
                <p className="font-bold">{auditLogs.length} سجل</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="pt-6 flex items-center gap-3">
              <Eye className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">سجلات الوصول</p>
                <p className="font-bold">{accessLogs.length} عملية</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="audit">
          <TabsList>
            <TabsTrigger value="audit">سجل المراجعة</TabsTrigger>
            <TabsTrigger value="access">سجل وصول المدراء</TabsTrigger>
          </TabsList>

          <TabsContent value="audit">
            <Card className="shadow-card">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الوقت</TableHead>
                      <TableHead>الإجراء</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>المعرف</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs">{formatDate(log.created_at)}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.entity_type}</TableCell>
                        <TableCell className="font-mono text-xs">{log.entity_id?.slice(0, 8)}...</TableCell>
                      </TableRow>
                    ))}
                    {auditLogs.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">لا توجد سجلات بعد</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access">
            <Card className="shadow-card">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الوقت</TableHead>
                      <TableHead>البيانات</TableHead>
                      <TableHead>الإجراء</TableHead>
                      <TableHead>السبب</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs">{formatDate(log.created_at)}</TableCell>
                        <TableCell>{log.dataset}</TableCell>
                        <TableCell>{log.action_type}</TableCell>
                        <TableCell className="text-sm">{log.reason || "—"}</TableCell>
                      </TableRow>
                    ))}
                    {accessLogs.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">لا توجد سجلات بعد</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
