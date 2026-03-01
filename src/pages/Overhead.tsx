import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockOverhead } from "@/lib/mock-data";
import { Calculator, DollarSign, Save } from "lucide-react";

export default function Overhead() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [rent, setRent] = useState(mockOverhead.rent);
  const [salaries, setSalaries] = useState(mockOverhead.salaries);
  const [utilities, setUtilities] = useState(mockOverhead.utilities);
  const [marketing, setMarketing] = useState(mockOverhead.marketing);
  const [other, setOther] = useState(mockOverhead.other);
  const [plates, setPlates] = useState(mockOverhead.baselinePlates);

  const total = rent + salaries + utilities + marketing + other;
  const perPlate = plates > 0 ? Math.round(total / plates) : 0;

  const fields = [
    { label: isAr ? "الإيجار" : "Rent", value: rent, set: setRent },
    { label: isAr ? "الرواتب" : "Salaries", value: salaries, set: setSalaries },
    { label: isAr ? "المرافق" : "Utilities", value: utilities, set: setUtilities },
    { label: isAr ? "التسويق" : "Marketing", value: marketing, set: setMarketing },
    { label: isAr ? "أخرى" : "Other", value: other, set: setOther },
  ];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><DollarSign className="w-6 h-6 text-primary" /></div>
              <div><p className="text-xs text-muted-foreground">{isAr ? "إجمالي شهري" : "Monthly Total"}</p><p className="text-xl font-extrabold">{total.toLocaleString()}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center"><Calculator className="w-6 h-6 text-warning" /></div>
              <div><p className="text-xs text-muted-foreground">{t("overheadPerPlate")}</p><p className="text-xl font-extrabold">{perPlate.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{isAr ? "د.ع" : "IQD"}</span></p></div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">{isAr ? "المصاريف الشهرية" : "Monthly Costs"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {fields.map(f => (
              <div key={f.label} className="flex items-center gap-4">
                <label className="w-28 text-sm font-medium">{f.label}</label>
                <Input type="number" value={f.value} onChange={e => f.set(Number(e.target.value))} className="flex-1" dir="ltr" />
              </div>
            ))}
            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <label className="w-28 text-sm font-medium">{isAr ? "عدد الأطباق" : "Baseline Plates"}</label>
              <Input type="number" value={plates} onChange={e => setPlates(Number(e.target.value))} className="flex-1" dir="ltr" />
            </div>
            <Button className="w-full gradient-primary border-0"><Save className="w-4 h-4 me-2" />{t("save")}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{isAr ? "السجل الشهري" : "Monthly History"}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockOverhead.history.map((h, i) => (
                <div key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2.5">
                  <span className="text-sm font-medium">{h.month}</span>
                  <div className="flex gap-6">
                    <span className="text-sm">{h.total.toLocaleString()} {isAr ? "د.ع" : "IQD"}</span>
                    <span className="text-sm text-muted-foreground">{h.perPlate.toLocaleString()} / {isAr ? "طبق" : "plate"}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
