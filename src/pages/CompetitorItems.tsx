import AppLayout from "@/components/AppLayout";
import { useLanguage } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockCompetitors } from "@/lib/mock-data";
import { Plus } from "lucide-react";

export default function CompetitorItems() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const allItems = mockCompetitors.flatMap(c => c.items.map(i => ({ ...i, competitor: c.name })));
  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">{t("competitorItems")}</h3><Button size="sm" className="gradient-primary border-0"><Plus className="w-4 h-4 me-1.5" />{t("add")}</Button></div>
        <Card>
          <Table>
            <TableHeader><TableRow><TableHead>{isAr ? "المنافس" : "Competitor"}</TableHead><TableHead>{t("name")}</TableHead><TableHead>{t("category")}</TableHead><TableHead>{t("price")}</TableHead><TableHead>{t("date")}</TableHead></TableRow></TableHeader>
            <TableBody>
              {allItems.map((item, i) => (
                <TableRow key={i}><TableCell className="text-muted-foreground">{item.competitor}</TableCell><TableCell className="font-medium">{item.name}</TableCell><TableCell>{item.category}</TableCell><TableCell>{item.price.toLocaleString()} {isAr ? "د.ع" : "IQD"}</TableCell><TableCell className="text-muted-foreground">{item.date}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppLayout>
  );
}
