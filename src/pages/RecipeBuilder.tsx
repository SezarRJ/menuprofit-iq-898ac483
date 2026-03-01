import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockIngredients, mockOverhead } from "@/lib/mock-data";
import { Search, Plus, Trash2, AlertTriangle, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RecipeLine { ingredientId: string; name: string; qty: number; unit: string; unitPrice: number }

export default function RecipeBuilder() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [sellingPrice, setSellingPrice] = useState(0);
  const [lines, setLines] = useState<RecipeLine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIngredients = mockIngredients.filter(i => i.name.includes(searchTerm));
  const addIngredient = (id: string) => {
    const ing = mockIngredients.find(i => i.id === id);
    if (!ing || lines.find(l => l.ingredientId === id)) return;
    setLines([...lines, { ingredientId: id, name: ing.name, qty: 1, unit: ing.unit, unitPrice: ing.price }]);
  };
  const updateQty = (idx: number, qty: number) => {
    const nl = [...lines]; nl[idx].qty = qty; setLines(nl);
  };
  const removeLine = (idx: number) => setLines(lines.filter((_, i) => i !== idx));

  const foodCost = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const overhead = mockOverhead.perPlate;
  const trueCost = foodCost + overhead;
  const margin = sellingPrice > 0 ? ((sellingPrice - trueCost) / sellingPrice * 100) : 0;
  const contribution = sellingPrice - trueCost;
  const status = margin < 0 ? "lossMaker" : margin < 20 ? "critical" : margin < 40 ? "belowTarget" : "healthy";
  const statusColor = { lossMaker: "text-destructive", critical: "text-destructive", belowTarget: "text-warning", healthy: "text-success" }[status];

  return (
    <AppLayout>
      <div className="grid lg:grid-cols-[280px_1fr_280px] gap-4 items-start">
        {/* Left: Ingredient Picker */}
        <Card className="sticky top-20">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t("ingredients")}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="relative">
              <Search className="absolute start-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
              <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t("search")} className="ps-8 h-9 text-sm" />
            </div>
            <div className="max-h-[400px] overflow-y-auto space-y-1">
              {filteredIngredients.map(ing => (
                <button key={ing.id} onClick={() => addIngredient(ing.id)}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm hover:bg-accent transition-colors text-start"
                  disabled={!!lines.find(l => l.ingredientId === ing.id)}>
                  <span className={lines.find(l => l.ingredientId === ing.id) ? "text-muted-foreground" : ""}>{ing.name}</span>
                  <span className="text-xs text-muted-foreground">{ing.price.toLocaleString()}/{ing.unit}</span>
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full"><Plus className="w-3.5 h-3.5 me-1" />{t("addIngredient")}</Button>
          </CardContent>
        </Card>

        {/* Center: Recipe Form */}
        <Card>
          <CardHeader><CardTitle className="text-base">{isAr ? "وصفة جديدة" : "New Recipe"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium mb-1 block">{t("name")}</label><Input value={name} onChange={e => setName(e.target.value)} placeholder={isAr ? "اسم الطبق" : "Dish name"} /></div>
              <div><label className="text-sm font-medium mb-1 block">{t("category")}</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder={isAr ? "اختر" : "Select"} /></SelectTrigger>
                  <SelectContent>{["مشويات","ساندويتشات","أطباق رئيسية","مقبلات","سلطات","مشروبات"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><label className="text-sm font-medium mb-1 block">{t("sellingPrice")} ({isAr ? "د.ع" : "IQD"})</label><Input type="number" value={sellingPrice || ""} onChange={e => setSellingPrice(Number(e.target.value))} dir="ltr" /></div>

            <div>
              <h4 className="text-sm font-medium mb-2">{isAr ? "مكونات الوصفة" : "Ingredients"}</h4>
              {lines.length === 0 ? (
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 text-center">{isAr ? "اختر مكونات من القائمة" : "Select ingredients from the list"}</p>
              ) : (
                <div className="space-y-2">
                  {lines.map((l, i) => (
                    <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-lg px-3 py-2">
                      <span className="flex-1 text-sm font-medium">{l.name}</span>
                      <Input type="number" value={l.qty} onChange={e => updateQty(i, Number(e.target.value))} className="w-20 h-8 text-sm" dir="ltr" step="0.01" />
                      <span className="text-xs text-muted-foreground w-10">{l.unit}</span>
                      <span className="text-xs font-medium w-20 text-end">{(l.qty * l.unitPrice).toLocaleString()}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeLine(i)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button className="w-full gradient-primary border-0"><Save className="w-4 h-4 me-2" />{t("save")}</Button>
          </CardContent>
        </Card>

        {/* Right: Live Costing */}
        <Card className="sticky top-20">
          <CardHeader className="pb-2"><CardTitle className="text-sm">{isAr ? "حساب التكلفة" : "Live Costing"}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {[
                { label: t("foodCost"), value: foodCost },
                { label: t("overheadCost"), value: overhead },
                { label: t("trueCost"), value: trueCost, bold: true },
              ].map((row, i) => (
                <div key={i} className={`flex items-center justify-between text-sm ${row.bold ? "font-bold pt-2 border-t border-border" : ""}`}>
                  <span className={row.bold ? "" : "text-muted-foreground"}>{row.label}</span>
                  <span>{row.value.toLocaleString()} {isAr ? "د.ع" : "IQD"}</span>
                </div>
              ))}
            </div>

            <div className="bg-muted rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t("margin")}</p>
              <p className={`text-3xl font-extrabold ${statusColor}`}>{margin.toFixed(1)}%</p>
              <Badge variant="outline" className={`mt-2 text-xs ${statusColor}`}>{t(status)}</Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{isAr ? "المساهمة" : "Contribution"}</span>
              <span className={`font-bold ${contribution < 0 ? "text-destructive" : "text-success"}`}>{contribution.toLocaleString()} {isAr ? "د.ع" : "IQD"}</span>
            </div>

            {sellingPrice > 0 && sellingPrice < trueCost && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-xs text-destructive">{isAr ? "سعر البيع أقل من التكلفة الحقيقية!" : "Selling price is below true cost!"}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
