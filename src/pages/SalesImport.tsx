import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, Check, AlertCircle, ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SalesImport() {
  const { t, lang, dir } = useLanguage();
  const isAr = lang === "ar";
  const [step, setStep] = useState(0);
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;
  const stepLabels = isAr ? ["رفع الملف", "ربط الأعمدة", "مطابقة الأطباق", "استيراد"] : ["Upload", "Mapping", "Dish Matching", "Import"];

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
          <p className="text-sm text-warning">{isAr ? "هذا الاستيراد للكميات فقط. أعمدة الإيرادات سيتم تجاهلها." : "This import is for volume data only. Revenue columns will be ignored."}</p>
        </div>

        <div className="flex items-center gap-2">
          {stepLabels.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= step ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i < step ? <Check className="w-4 h-4" /> : i + 1}</div>
              <span className={`text-sm hidden sm:inline ${i <= step ? "font-medium" : "text-muted-foreground"}`}>{s}</span>
              {i < stepLabels.length - 1 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            {step === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                <Upload className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-bold mb-2">{isAr ? "اسحب ملف المبيعات" : "Drag sales file"}</h3>
                <p className="text-sm text-muted-foreground mb-4">CSV, XLSX</p>
                <Button onClick={() => setStep(1)} className="gradient-primary border-0"><FileSpreadsheet className="w-4 h-4 me-2" />{isAr ? "اختر ملف" : "Choose File"}</Button>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-bold">{isAr ? "ربط الأعمدة المطلوبة" : "Map Required Columns"}</h3>
                {[{l: isAr ? "التاريخ" : "Date"}, {l: isAr ? "اسم الطبق" : "Dish Name"}, {l: isAr ? "الكمية" : "Quantity"}, {l: isAr ? "القناة (اختياري)" : "Channel (opt)"}].map((m,i) => (
                  <div key={i} className="flex items-center gap-4"><span className="text-sm w-36">{m.l}</span>
                    <Select><SelectTrigger className="w-32"><SelectValue placeholder={isAr ? "عمود" : "Column"} /></SelectTrigger><SelectContent>{["A","B","C","D"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                  </div>
                ))}
              </div>
            )}
            {step === 2 && (
              <div className="space-y-3">
                <h3 className="font-bold">{isAr ? "مطابقة الأطباق" : "Dish Matching"}</h3>
                {[{dish:"كباب",match:"كباب لحم",conf:95},{dish:"شورما",match:"شاورما دجاج",conf:78},{dish:"برياني",match:"برياني دجاج",conf:92}].map((m,i) => (
                  <div key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3">
                    <span className="font-medium text-sm">{m.dish}</span>
                    <div className="flex items-center gap-3">
                      <Badge variant={m.conf > 85 ? "default" : "outline"} className={m.conf > 85 ? "bg-success/20 text-success border-0" : "text-warning border-warning/30"}>{m.conf}%</Badge>
                      <span className="text-sm">{m.match}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {step === 3 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-success" /></div>
                <h3 className="font-bold text-lg">{isAr ? "تم استيراد المبيعات!" : "Sales Imported!"}</h3>
                <p className="text-muted-foreground text-sm mt-2">{isAr ? "تم استيراد 156 صف" : "156 rows imported"}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}>{isAr ? "السابق" : "Back"}</Button>
          <Button className="gradient-primary border-0" disabled={step === 3} onClick={() => setStep(s => s + 1)}>
            {step === 2 ? (isAr ? "استيراد" : "Import") : (isAr ? "التالي" : "Next")} <Arrow className="w-4 h-4 ms-1.5" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
