import { AdminLayout } from "./MasterAdminDashboard";
import { useLanguage } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockTenants } from "@/lib/mock-data";
import { Search } from "lucide-react";
import { useState } from "react";

export default function MasterAdminTenants() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const [search, setSearch] = useState("");
  const filtered = mockTenants.filter(t => t.name.includes(search) || t.owner.includes(search));
  const planColors: Record<string,string> = { free: "bg-muted text-muted-foreground", pro: "bg-primary/20 text-primary", elite: "bg-warning/20 text-warning" };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="relative max-w-sm"><Search className="absolute start-3 top-2.5 w-4 h-4 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder={isAr ? "بحث..." : "Search..."} className="ps-9" /></div>
        <Card>
          <Table>
            <TableHeader><TableRow><TableHead>{isAr ? "المطعم" : "Restaurant"}</TableHead><TableHead>{isAr ? "المالك" : "Owner"}</TableHead><TableHead>{isAr ? "الخطة" : "Plan"}</TableHead><TableHead>{isAr ? "الحالة" : "Status"}</TableHead><TableHead>{isAr ? "التاريخ" : "Created"}</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-muted-foreground">{t.owner}</TableCell>
                  <TableCell><Badge className={`border-0 ${planColors[t.plan]}`}>{t.plan}</Badge></TableCell>
                  <TableCell><Badge variant={t.status === "active" ? "default" : "destructive"} className={t.status === "active" ? "bg-success/20 text-success border-0" : ""}>{t.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{t.created}</TableCell>
                  <TableCell><Button variant="outline" size="sm">{t.status === "active" ? (isAr ? "تعليق" : "Suspend") : (isAr ? "استعادة" : "Restore")}</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminLayout>
  );
}
