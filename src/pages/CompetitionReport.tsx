import AppLayout from "@/components/AppLayout";
import { useLanguage } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const report = [
  { dish: "كباب لحم", yourPrice: 15000, marketAvg: 17000, index: 0.88, rec: "سعرك أقل من السوق — فرصة لرفع السعر" },
  { dish: "شاورما دجاج", yourPrice: 7500, marketAvg: 7250, index: 1.03, rec: "سعرك قريب من السوق — مناسب" },
  { dish: "برياني دجاج", yourPrice: 12000, marketAvg: 14000, index: 0.86, rec: "سعرك أقل بكثير — ارفع السعر أو عزز القيمة المضافة" },
  { dish: "فلافل (6 حبات)", yourPrice: 4000, marketAvg: 3500, index: 1.14, rec: "سعرك أعلى من السوق — راقب حجم الطلب" },
];

export default function CompetitionReport() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  return (
    <AppLayout>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t("competitionReport")}</h3>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isAr ? "الطبق" : "Dish"}</TableHead>
                <TableHead>{isAr ? "سعرك" : "Your Price"}</TableHead>
                <TableHead>{isAr ? "متوسط السوق" : "Market Avg"}</TableHead>
                <TableHead>{isAr ? "مؤشر السعر" : "Price Index"}</TableHead>
                <TableHead>{isAr ? "التوصية" : "Recommendation"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{r.dish}</TableCell>
                  <TableCell>{r.yourPrice.toLocaleString()}</TableCell>
                  <TableCell>{r.marketAvg.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={r.index < 0.95 ? "text-success border-success/30" : r.index > 1.05 ? "text-warning border-warning/30" : "text-muted-foreground"}>
                      {r.index < 0.95 ? <TrendingDown className="w-3 h-3 me-1" /> : r.index > 1.05 ? <TrendingUp className="w-3 h-3 me-1" /> : <Minus className="w-3 h-3 me-1" />}
                      {r.index.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px]">{r.rec}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppLayout>
  );
}
