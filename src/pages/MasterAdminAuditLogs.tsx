import { AdminLayout } from "./MasterAdminDashboard";
import { useLanguage } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const logs = [
  { id: "1", actor: "admin@menuprofit.com", action: "suspend_tenant", entity: "مطعم الخليج", timestamp: "2026-02-28 14:30", reason: "فشل الدفع" },
  { id: "2", actor: "admin@menuprofit.com", action: "view_dataset", entity: "audit_logs", timestamp: "2026-02-28 12:00", reason: "مراجعة أمنية" },
  { id: "3", actor: "support@menuprofit.com", action: "view_tenant", entity: "مطعم الوردة", timestamp: "2026-02-27 16:45", reason: "طلب دعم فني" },
];

export default function MasterAdminAuditLogs() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  return (
    <AdminLayout>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>{isAr ? "الوقت" : "Time"}</TableHead><TableHead>{isAr ? "المستخدم" : "Actor"}</TableHead><TableHead>{isAr ? "الإجراء" : "Action"}</TableHead><TableHead>{isAr ? "الكيان" : "Entity"}</TableHead><TableHead>{isAr ? "السبب" : "Reason"}</TableHead></TableRow></TableHeader>
          <TableBody>
            {logs.map(l => (
              <TableRow key={l.id}><TableCell className="text-muted-foreground text-sm">{l.timestamp}</TableCell><TableCell className="text-sm">{l.actor}</TableCell><TableCell><Badge variant="outline" className="text-[10px]">{l.action}</Badge></TableCell><TableCell className="font-medium text-sm">{l.entity}</TableCell><TableCell className="text-muted-foreground text-sm">{l.reason}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AdminLayout>
  );
}
