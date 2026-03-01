import AppLayout from "@/components/AppLayout";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockSuppliers } from "@/lib/mock-data";
import { Plus, Users } from "lucide-react";

export default function Suppliers() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t("suppliers")}</h3>
          <Button size="sm" className="gradient-primary border-0"><Plus className="w-4 h-4 me-1.5" />{t("add")}</Button>
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{isAr ? "الاتصال" : "Contact"}</TableHead>
                <TableHead>{isAr ? "المنتجات" : "Items"}</TableHead>
                <TableHead>{isAr ? "آخر طلب" : "Last Order"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSuppliers.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.contact}</TableCell>
                  <TableCell>{s.items}</TableCell>
                  <TableCell className="text-muted-foreground">{s.lastOrder}</TableCell>
                </TableRow>
              ))}
              {mockSuppliers.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-12"><Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">{t("noData")}</p></TableCell></TableRow>}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppLayout>
  );
}
