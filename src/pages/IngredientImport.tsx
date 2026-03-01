import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, Check, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

const steps = { ar: ["رفع الملف", "معاينة", "ربط الأعمدة", "التحقق", "الاستيراد"], en: ["Upload", "Preview", "Mapping", "Validate", "Import"] };

export default function IngredientImport() {
  const { t, lang, dir } = useLanguage();
  const isAr = lang === "ar";
  const [step, setStep] = useState(0);
  const stepLabels = steps[lang] || steps.ar;
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Steps */}
        <div className="flex items-center gap-2">
          {stepLabels.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= step ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
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
                <h3 className="font-bold mb-2">{isAr ? "اسحب الملف هنا أو اضغط للرفع" : "Drag file here or click to upload"}</h3>
                <p className="text-sm text-muted-foreground mb-4">CSV, XLSX — {isAr ? "حد أقصى 10 ميغابايت" : "Max 10MB"}</p>
                <Button onClick={() => setStep(1)} className="gradient-primary border-0"><FileSpreadsheet className="w-4 h-4 me-2" />{isAr ? "اختر ملف" : "Choose File"}</Button>
              </div>
            )}
            {step === 1 && (
              <div>
                <h3 className="font-bold mb-4">{isAr ? "معاينة أول 20 صف" : "Preview first 20 rows"}</h3>
                <Table>
                  <TableHeader><TableRow><TableHead>A</TableHead><TableHead>B</TableHead><TableHead>C</TableHead><TableHead>D</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {[["صدر دجاج","كغم","8500","شركة الأمل"],["لحم بقر مفروم","كغم","18000","مؤسسة النهرين"],["طماطم","كغم","2000","سوق الجملة"]].map((r,i) => (
                      <TableRow key={i}>{r.map((c,j) => <TableCell key={j}>{c}</TableCell>)}</TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-bold">{isAr ? "ربط الأعمدة" : "Column Mapping"}</h3>
                {[{label: isAr ? "الاسم (مطلوب)" : "Name (required)", col: "A"}, {label: isAr ? "الوحدة (مطلوب)" : "Unit (required)", col: "B"}, {label: isAr ? "السعر (مطلوب)" : "Price (required)", col: "C"}, {label: isAr ? "المورد (اختياري)" : "Supplier (optional)", col: "D"}].map((m,i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-sm w-40">{m.label}</span>
                    <Select defaultValue={m.col}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent>{["A","B","C","D","E"].map(c => <SelectItem key={c} value={c}>{isAr ? "عمود" : "Col"} {c}</SelectItem>)}</SelectContent></Select>
                  </div>
                ))}
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-bold">{isAr ? "نتائج التحقق" : "Validation Results"}</h3>
                <div className="flex gap-4">
                  <Badge className="bg-success/20 text-success border-0">{isAr ? "صحيح: 8" : "Valid: 8"}</Badge>
                  <Badge className="bg-warning/20 text-warning border-0">{isAr ? "تحذيرات: 1" : "Warnings: 1"}</Badge>
                  <Badge className="bg-destructive/20 text-destructive border-0">{isAr ? "أخطاء: 1" : "Errors: 1"}</Badge>
                </div>
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                  <div className="text-sm"><p className="font-medium text-destructive">{isAr ? "صف 7: سعر سالب" : "Row 7: Negative price"}</p></div>
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-success" /></div>
                <h3 className="font-bold text-lg mb-2">{isAr ? "تم الاستيراد بنجاح!" : "Import Complete!"}</h3>
                <div className="flex justify-center gap-4 mt-4">
                  <Badge className="bg-success/20 text-success border-0">{isAr ? "أُضيف: 7" : "Inserted: 7"}</Badge>
                  <Badge className="bg-primary/20 text-primary border-0">{isAr ? "حُدّث: 1" : "Updated: 1"}</Badge>
                  <Badge className="bg-destructive/20 text-destructive border-0">{isAr ? "فشل: 1" : "Failed: 1"}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}>{isAr ? "السابق" : "Back"}</Button>
          <Button className="gradient-primary border-0" disabled={step === 4} onClick={() => setStep(s => s + 1)}>
            {step === 3 ? (isAr ? "استيراد" : "Import") : (isAr ? "التالي" : "Next")} <Arrow className="w-4 h-4 ms-1.5" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
