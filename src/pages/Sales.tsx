import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { validateFileSize, validateImportData } from "@/lib/import-validation";

type Step = "upload" | "mapping" | "matching";

interface ParsedRow { [key: string]: string | number; }
interface UnmatchedDish { name: string; recipe_id: string; }

export default function Sales() {
  const { restaurant } = useRestaurant();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [dateCol, setDateCol] = useState("");
  const [dishCol, setDishCol] = useState("");
  const [qtyCol, setQtyCol] = useState("");
  const [unmatchedDishes, setUnmatchedDishes] = useState<UnmatchedDish[]>([]);
  const [recipes, setRecipes] = useState<{ id: string; name: string }[]>([]);
  const [importId, setImportId] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const sizeError = validateFileSize(file);
    if (sizeError) {
      toast.error(sizeError);
      return;
    }

    setFileName(file.name);

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<ParsedRow>(ws);
      if (json.length === 0) { toast.error("الملف فارغ"); return; }

      const hdrs = Object.keys(json[0]);
      setHeaders(hdrs);
      setRows(json);
      setDateCol(hdrs[0]);
      setDishCol(hdrs.length > 1 ? hdrs[1] : hdrs[0]);
      setQtyCol(hdrs.length > 2 ? hdrs[2] : hdrs[0]);
      setStep("mapping");
    } catch {
      toast.error("خطأ في قراءة الملف. تأكد من أنه ملف CSV أو Excel صالح.");
    }
  };

  const handleImport = async () => {
    if (!restaurant || !dateCol || !dishCol || !qtyCol) return;

    // Validate data before import
    const validation = validateImportData(rows, dateCol, dishCol, qtyCol);
    if (!validation.valid) {
      validation.errors.forEach(err => toast.error(err));
      return;
    }
    setValidationWarnings(validation.warnings);

    setLoading(true);

    const { data: imp, error: impErr } = await supabase.from("sales_imports").insert({
      restaurant_id: restaurant.id, file_name: fileName,
    }).select("id").single();

    if (impErr || !imp) { toast.error(impErr?.message ?? "خطأ"); setLoading(false); return; }
    setImportId(imp.id);

    const { data: recs } = await supabase.from("recipes").select("id, name").eq("restaurant_id", restaurant.id);
    setRecipes(recs ?? []);

    const salesRows = validation.sanitizedRows.map(r => ({
      sales_import_id: imp.id,
      sale_date: r[dateCol] ? String(r[dateCol]) : null,
      dish_name: String(r[dishCol] ?? ""),
      quantity: Math.max(0, Number(r[qtyCol]) || 0),
      matched_recipe_id: null as string | null,
    }));

    // Auto-match by name
    const uniqueDishes = [...new Set(salesRows.map(r => r.dish_name))];
    const matchMap: Record<string, string | null> = {};
    for (const dish of uniqueDishes) {
      const match = (recs ?? []).find(r => r.name === dish);
      matchMap[dish] = match?.id ?? null;
    }

    const rowsToInsert = salesRows.map(r => ({
      ...r,
      matched_recipe_id: matchMap[r.dish_name] ?? null,
    }));

    // Insert in batches to avoid timeout
    const BATCH_SIZE = 500;
    for (let i = 0; i < rowsToInsert.length; i += BATCH_SIZE) {
      const batch = rowsToInsert.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from("sales_rows").insert(batch);
      if (error) {
        toast.error(`خطأ في إدخال البيانات: ${error.message}`);
        setLoading(false);
        return;
      }
    }

    // Log audit (best effort)
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        await supabase.from("audit_logs").insert({
          actor_id: currentUser.id,
          action: "sales_import",
          entity_type: "sales_import",
          entity_id: imp.id,
          metadata: { file_name: fileName, row_count: rowsToInsert.length },
        });
      }
    } catch {
      // Don't fail on audit log errors
    }

    const unmatched = uniqueDishes.filter(d => !matchMap[d]).map(d => ({ name: d, recipe_id: "" }));
    setUnmatchedDishes(unmatched);
    setLoading(false);

    if (unmatched.length > 0) {
      setStep("matching");
    } else {
      toast.success("تم استيراد البيانات بنجاح!");
      resetAll();
    }
  };

  const handleMatchSave = async () => {
    setLoading(true);
    for (const dish of unmatchedDishes) {
      if (dish.recipe_id) {
        await supabase.from("sales_rows")
          .update({ matched_recipe_id: dish.recipe_id })
          .eq("sales_import_id", importId)
          .eq("dish_name", dish.name);
      }
    }
    toast.success("تم حفظ المطابقة!");
    setLoading(false);
    resetAll();
  };

  const resetAll = () => {
    setStep("upload"); setFileName(""); setHeaders([]); setRows([]); setDateCol(""); setDishCol(""); setQtyCol("");
    setUnmatchedDishes([]); setImportId(""); setValidationWarnings([]);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold">
          {step === "upload" && "استيراد ملف المبيعات"}
          {step === "mapping" && "مطابقة الأعمدة"}
          {step === "matching" && "مطابقة أسماء الأطباق"}
        </h1>

        {validationWarnings.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {validationWarnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {step === "upload" && (
          <Card className="shadow-card">
            <CardContent className="pt-6 flex flex-col items-center gap-4 py-12">
              <input type="file" ref={fileRef} accept=".csv,.xlsx,.xls" onChange={handleFile} className="hidden" />
              <Button size="lg" onClick={() => fileRef.current?.click()}>
                <Upload className="w-5 h-5 ml-2" />رفع ملف CSV أو Excel
              </Button>
              <p className="text-sm text-muted-foreground">يدعم ملفات CSV و Excel (حد أقصى 10 ميجا)</p>
            </CardContent>
          </Card>
        )}

        {step === "mapping" && (
          <>
            <Card className="shadow-card">
              <CardHeader><CardTitle>معاينة البيانات (أول 10 صفوف)</CardTitle></CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>{headers.map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 10).map((r, i) => (
                      <TableRow key={i}>{headers.map(h => <TableCell key={h}>{String(r[h] ?? "")}</TableCell>)}</TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>اختر عمود التاريخ</Label>
                  <Select value={dateCol} onValueChange={setDateCol}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>اختر عمود اسم الصحن</Label>
                  <Select value={dishCol} onValueChange={setDishCol}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>اختر عمود الكمية</Label>
                  <Select value={qtyCol} onValueChange={setQtyCol}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 inline ml-1 text-primary" />
                  {rows.length.toLocaleString()} صف جاهز للاستيراد
                </div>
                <Button onClick={handleImport} className="w-full" disabled={loading}>
                  {loading ? "جاري الاستيراد..." : "استيراد البيانات"}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {step === "matching" && (
          <Card className="shadow-card">
            <CardContent className="pt-6 space-y-4">
              <p className="text-muted-foreground">بعض أسماء الأطباق لم تتطابق تلقائياً. يرجى مطابقتها يدوياً:</p>
              {unmatchedDishes.map((dish, i) => (
                <div key={i} className="flex items-center gap-3 bg-muted rounded-lg p-3">
                  <span className="font-medium flex-1">"{dish.name}"</span>
                  <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                  <Select value={dish.recipe_id} onValueChange={v => {
                    const updated = [...unmatchedDishes];
                    updated[i] = { ...dish, recipe_id: v };
                    setUnmatchedDishes(updated);
                  }}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="اختر الوصفة" /></SelectTrigger>
                    <SelectContent>{recipes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ))}
              <Button onClick={handleMatchSave} className="w-full" disabled={loading}>
                {loading ? "جاري الحفظ..." : "حفظ المطابقة"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
