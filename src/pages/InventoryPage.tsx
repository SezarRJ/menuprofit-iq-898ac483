import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import { useLanguage } from "@/lib/i18n";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  Package, AlertTriangle, TrendingUp, TrendingDown, Plus,
  ShoppingCart, Trash2, RotateCcw, Pencil, BarChart3,
  AlertCircle, CheckCircle2, Clock
} from "lucide-react";

interface InventoryItem {
  id: string; ingredient_id: string; current_stock: number; min_stock_level: number;
  max_stock_level: number; unit: string; unit_cost: number; last_restock_date: string | null;
  ingredients?: { name: string; unit: string };
}

interface Transaction {
  id: string; inventory_item_id: string; type: string; quantity: number;
  unit_cost: number; total_cost: number; reason: string; notes: string;
  transaction_date: string; supplier_id: string | null;
  inventory_items?: { ingredients?: { name: string } };
}

interface Ingredient { id: string; name: string; unit: string; unit_price: number; }
interface Supplier { id: string; name_ar: string; name_en: string; }

type StockStatus = "healthy" | "low" | "out" | "normal";

function getStatus(item: InventoryItem): StockStatus {
  if (Number(item.current_stock) === 0) return "out";
  if (Number(item.current_stock) <= Number(item.min_stock_level)) return "low";
  return "healthy";
}

const statusConfig: Record<StockStatus, { label_ar: string; label_en: string; color: string; bg: string; icon: any }> = {
  healthy: { label_ar: "مخزون جيد", label_en: "Well Stocked", color: "text-success", bg: "bg-success/10", icon: CheckCircle2 },
  low: { label_ar: "مخزون منخفض", label_en: "Low Stock", color: "text-warning", bg: "bg-warning/10", icon: AlertTriangle },
  out: { label_ar: "نفد المخزون", label_en: "Out of Stock", color: "text-destructive", bg: "bg-destructive/10", icon: AlertCircle },
  normal: { label_ar: "طبيعي", label_en: "Normal", color: "text-primary", bg: "bg-primary/10", icon: Package },
};

const txTypes = [
  { value: "purchase", label_ar: "شراء", label_en: "Purchase", icon: ShoppingCart, color: "text-success" },
  { value: "usage", label_ar: "استخدام", label_en: "Usage", icon: Package, color: "text-warning" },
  { value: "waste", label_ar: "هدر", label_en: "Waste", icon: Trash2, color: "text-destructive" },
  { value: "adjustment", label_ar: "تعديل", label_en: "Adjustment", icon: Pencil, color: "text-muted-foreground" },
  { value: "return", label_ar: "إرجاع", label_en: "Return", icon: RotateCcw, color: "text-muted-foreground" },
];

const wasteReasons = [
  { value: "spoilage", ar: "تلف", en: "Spoilage" },
  { value: "expired", ar: "منتهي الصلاحية", en: "Expired" },
  { value: "damaged", ar: "تالف", en: "Damaged" },
  { value: "over_prep", ar: "تحضير زائد", en: "Over Preparation" },
  { value: "other", ar: "أخرى", en: "Other" },
];

export default function InventoryPage() {
  const { restaurant } = useRestaurant();
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("stock");
  const [itemDialog, setItemDialog] = useState(false);
  const [txDialog, setTxDialog] = useState(false);

  // Item form
  const [fIngredient, setFIngredient] = useState("");
  const [fMinStock, setFMinStock] = useState(5);
  const [fMaxStock, setFMaxStock] = useState(100);
  const [fCurrentStock, setFCurrentStock] = useState(0);
  const [fUnitCost, setFUnitCost] = useState(0);

  // Transaction form
  const [txItem, setTxItem] = useState("");
  const [txType, setTxType] = useState("purchase");
  const [txQty, setTxQty] = useState(0);
  const [txUnitCost, setTxUnitCost] = useState(0);
  const [txReason, setTxReason] = useState("");
  const [txNotes, setTxNotes] = useState("");
  const [txSupplier, setTxSupplier] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => { if (restaurant) loadAll(); }, [restaurant]);

  const loadAll = async () => {
    setLoading(true);
    const [itemsRes, ingRes, supRes, txRes] = await Promise.all([
      supabase.from("inventory_items").select("*, ingredients(name, unit)").eq("restaurant_id", restaurant!.id),
      supabase.from("ingredients").select("id, name, unit, unit_price").eq("restaurant_id", restaurant!.id),
      supabase.from("suppliers").select("id, name_ar, name_en").eq("restaurant_id", restaurant!.id),
      supabase.from("inventory_transactions").select("*, inventory_items(ingredients(name))").eq("restaurant_id", restaurant!.id).order("transaction_date", { ascending: false }).limit(100),
    ]);
    setItems((itemsRes.data ?? []) as InventoryItem[]);
    setIngredients(ingRes.data ?? []);
    setSuppliers((supRes.data ?? []) as Supplier[]);
    setTransactions((txRes.data ?? []) as Transaction[]);
    setLoading(false);
  };

  const handleSaveItem = async () => {
    const ing = ingredients.find(i => i.id === fIngredient);
    await supabase.from("inventory_items").insert({
      restaurant_id: restaurant!.id, ingredient_id: fIngredient,
      current_stock: fCurrentStock, min_stock_level: fMinStock, max_stock_level: fMaxStock,
      unit: ing?.unit || "كغم", unit_cost: fUnitCost || ing?.unit_price || 0,
    });
    toast({ title: isAr ? "تم الحفظ" : "Saved" });
    setItemDialog(false); setFIngredient(""); setFCurrentStock(0); setFMinStock(5); setFMaxStock(100); setFUnitCost(0);
    loadAll();
  };

  const handleSaveTx = async () => {
    const totalCost = txQty * txUnitCost;
    await supabase.from("inventory_transactions").insert({
      inventory_item_id: txItem, restaurant_id: restaurant!.id,
      supplier_id: txSupplier || null, type: txType, quantity: txQty,
      unit_cost: txUnitCost, total_cost: totalCost, reason: txReason,
      notes: txNotes, transaction_date: txDate,
    });

    // Update stock
    const item = items.find(i => i.id === txItem);
    if (item) {
      let newStock = Number(item.current_stock);
      if (txType === "purchase") newStock += txQty;
      else if (txType === "usage" || txType === "waste" || txType === "return") newStock -= txQty;
      else newStock += txQty; // adjustment
      await supabase.from("inventory_items").update({
        current_stock: Math.max(newStock, 0),
        ...(txType === "purchase" ? { last_restock_date: txDate, unit_cost: txUnitCost } : {}),
      }).eq("id", txItem);
    }

    toast({ title: isAr ? "تم تسجيل المعاملة" : "Transaction recorded" });
    setTxDialog(false); setTxItem(""); setTxType("purchase"); setTxQty(0); setTxUnitCost(0); setTxReason(""); setTxNotes(""); setTxSupplier("");
    loadAll();
  };

  const handleDeleteItem = async (id: string) => {
    await supabase.from("inventory_items").delete().eq("id", id);
    toast({ title: isAr ? "تم الحذف" : "Deleted" });
    loadAll();
  };

  const currency = restaurant?.default_currency === "USD" ? "$" : "د.ع";
  const totalValue = items.reduce((a, i) => a + Number(i.current_stock) * Number(i.unit_cost), 0);
  const lowStock = items.filter(i => getStatus(i) === "low").length;
  const outOfStock = items.filter(i => getStatus(i) === "out").length;

  // Efficiency metrics
  const purchaseTx = transactions.filter(tx => tx.type === "purchase");
  const wasteTx = transactions.filter(tx => tx.type === "waste");
  const usageTx = transactions.filter(tx => tx.type === "usage");
  const totalPurchases = purchaseTx.reduce((a, tx) => a + Number(tx.total_cost), 0);
  const totalWaste = wasteTx.reduce((a, tx) => a + Number(tx.total_cost), 0);
  const totalUsage = usageTx.reduce((a, tx) => a + Number(tx.total_cost), 0);
  const wastePct = totalPurchases > 0 ? (totalWaste / totalPurchases * 100) : 0;
  const efficiencyScore = Math.max(0, 100 - wastePct - (outOfStock > 0 ? 10 : 0));

  if (loading) return <AppLayout><div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{isAr ? "المخزون" : "Inventory"}</h1>
          <div className="flex gap-2">
            <Button onClick={() => setTxDialog(true)} variant="outline" className="rounded-xl">
              <ShoppingCart className="w-4 h-4 me-2" />{isAr ? "معاملة جديدة" : "New Transaction"}
            </Button>
            <Button onClick={() => setItemDialog(true)} className="rounded-xl gradient-primary border-0">
              <Plus className="w-4 h-4 me-2" />{isAr ? "إضافة صنف" : "Add Item"}
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: isAr ? "إجمالي الأصناف" : "Total Items", value: items.length, icon: Package, color: "text-primary", bg: "bg-primary/10" },
            { label: isAr ? "مخزون منخفض" : "Low Stock", value: lowStock, icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
            { label: isAr ? "نفد المخزون" : "Out of Stock", value: outOfStock, icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
            { label: isAr ? "القيمة الإجمالية" : "Total Value", value: `${totalValue.toLocaleString()} ${currency}`, icon: BarChart3, color: "text-success", bg: "bg-success/10" },
          ].map((c, i) => (
            <Card key={i} className="shadow-card rounded-2xl">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                    <p className={`text-xl font-extrabold ${c.color} mt-1`}>{c.value}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
                    <c.icon className={`w-4 h-4 ${c.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="rounded-xl">
            <TabsTrigger value="stock">{isAr ? "المخزون" : "Stock"}</TabsTrigger>
            <TabsTrigger value="transactions">{isAr ? "المعاملات" : "Transactions"}</TabsTrigger>
            <TabsTrigger value="waste">{isAr ? "الهدر" : "Waste"}</TabsTrigger>
            <TabsTrigger value="efficiency">{isAr ? "الكفاءة" : "Efficiency"}</TabsTrigger>
            <TabsTrigger value="alerts">{isAr ? "التنبيهات" : "Alerts"}</TabsTrigger>
          </TabsList>

          {/* Stock Tab */}
          <TabsContent value="stock">
            {items.length === 0 ? (
              <Card className="rounded-2xl"><CardContent className="py-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">{t("noData")}</p>
              </CardContent></Card>
            ) : (
              <Card className="rounded-2xl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isAr ? "الصنف" : "Item"}</TableHead>
                      <TableHead>{isAr ? "الحالة" : "Status"}</TableHead>
                      <TableHead>{isAr ? "المخزون" : "Stock"}</TableHead>
                      <TableHead>{isAr ? "الحد الأدنى" : "Min"}</TableHead>
                      <TableHead>{isAr ? "سعر الوحدة" : "Unit Cost"}</TableHead>
                      <TableHead>{isAr ? "القيمة" : "Value"}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => {
                      const status = getStatus(item);
                      const cfg = statusConfig[status];
                      const Icon = cfg.icon;
                      const stockValue = Number(item.current_stock) * Number(item.unit_cost);
                      const stockPct = Number(item.max_stock_level) > 0 ? (Number(item.current_stock) / Number(item.max_stock_level)) * 100 : 0;
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.ingredients?.name}</TableCell>
                          <TableCell>
                            <Badge className={`${cfg.bg} ${cfg.color} border-0 text-xs`}>
                              <Icon className="w-3 h-3 me-1" />{isAr ? cfg.label_ar : cfg.label_en}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{Number(item.current_stock)}</span>
                              <span className="text-xs text-muted-foreground">{item.unit}</span>
                            </div>
                            <Progress value={Math.min(stockPct, 100)} className="h-1.5 mt-1 w-20" />
                          </TableCell>
                          <TableCell className="text-muted-foreground">{Number(item.min_stock_level)}</TableCell>
                          <TableCell>{Number(item.unit_cost).toLocaleString()} {currency}</TableCell>
                          <TableCell className="font-semibold">{stockValue.toLocaleString()} {currency}</TableCell>
                          <TableCell>
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteItem(item.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            {transactions.length === 0 ? (
              <Card className="rounded-2xl"><CardContent className="py-12 text-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">{t("noData")}</p>
              </CardContent></Card>
            ) : (
              <Card className="rounded-2xl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isAr ? "الصنف" : "Item"}</TableHead>
                      <TableHead>{isAr ? "النوع" : "Type"}</TableHead>
                      <TableHead>{t("quantity")}</TableHead>
                      <TableHead>{isAr ? "التكلفة" : "Cost"}</TableHead>
                      <TableHead>{isAr ? "السبب" : "Reason"}</TableHead>
                      <TableHead>{t("date")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map(tx => {
                      const txCfg = txTypes.find(t => t.value === tx.type);
                      const TxIcon = txCfg?.icon || Package;
                      return (
                        <TableRow key={tx.id}>
                          <TableCell className="font-medium">{tx.inventory_items?.ingredients?.name || "—"}</TableCell>
                          <TableCell>
                            <div className={`flex items-center gap-1.5 text-sm ${txCfg?.color}`}>
                              <TxIcon className="w-3.5 h-3.5" />
                              {isAr ? txCfg?.label_ar : txCfg?.label_en}
                            </div>
                          </TableCell>
                          <TableCell>{Number(tx.quantity)}</TableCell>
                          <TableCell>{Number(tx.total_cost).toLocaleString()} {currency}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{tx.reason}</TableCell>
                          <TableCell className="text-muted-foreground">{tx.transaction_date}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          {/* Waste Tab */}
          <TabsContent value="waste">
            {wasteTx.length === 0 ? (
              <Card className="rounded-2xl"><CardContent className="py-12 text-center">
                <Trash2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">{isAr ? "لا يوجد هدر مسجل" : "No waste recorded"}</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-4">
                <Card className="rounded-2xl border-destructive/20">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{isAr ? "إجمالي الهدر" : "Total Waste"}</p>
                        <p className="text-2xl font-extrabold text-destructive">{totalWaste.toLocaleString()} {currency}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{isAr ? "نسبة الهدر" : "Waste %"}</p>
                        <p className="text-2xl font-extrabold text-destructive">{wastePct.toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{isAr ? "الصنف" : "Item"}</TableHead>
                        <TableHead>{t("quantity")}</TableHead>
                        <TableHead>{isAr ? "التكلفة" : "Cost"}</TableHead>
                        <TableHead>{isAr ? "السبب" : "Reason"}</TableHead>
                        <TableHead>{t("date")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wasteTx.map(tx => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-medium">{tx.inventory_items?.ingredients?.name || "—"}</TableCell>
                          <TableCell>{Number(tx.quantity)}</TableCell>
                          <TableCell className="text-destructive font-semibold">{Number(tx.total_cost).toLocaleString()} {currency}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{tx.reason}</TableCell>
                          <TableCell className="text-muted-foreground">{tx.transaction_date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Efficiency Tab */}
          <TabsContent value="efficiency">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="shadow-card rounded-2xl">
                <CardContent className="pt-5 pb-5">
                  <p className="text-sm text-muted-foreground mb-2">{isAr ? "نسبة الكفاءة" : "Efficiency Score"}</p>
                  <p className={`text-4xl font-extrabold ${efficiencyScore >= 80 ? "text-success" : efficiencyScore >= 50 ? "text-warning" : "text-destructive"}`}>
                    {efficiencyScore.toFixed(0)}%
                  </p>
                  <Progress value={efficiencyScore} className="h-3 mt-3" />
                </CardContent>
              </Card>
              <Card className="shadow-card rounded-2xl">
                <CardContent className="pt-5 pb-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{isAr ? "إجمالي المشتريات" : "Total Purchases"}</span>
                    <span className="font-semibold text-success">{totalPurchases.toLocaleString()} {currency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{isAr ? "إجمالي الاستخدام" : "Total Usage"}</span>
                    <span className="font-semibold text-primary">{totalUsage.toLocaleString()} {currency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{isAr ? "إجمالي الهدر" : "Total Waste"}</span>
                    <span className="font-semibold text-destructive">{totalWaste.toLocaleString()} {currency}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-muted-foreground">{isAr ? "نسبة الهدر" : "Waste %"}</span>
                    <span className="font-semibold text-destructive">{wastePct.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>
              {/* Stock velocity */}
              {items.length > 0 && (
                <Card className="shadow-card rounded-2xl md:col-span-2">
                  <CardContent className="pt-5 pb-5">
                    <p className="text-sm font-medium mb-3">{isAr ? "سرعة تدوير المخزون" : "Stock Velocity"}</p>
                    <div className="space-y-2">
                      {items.map(item => {
                        const itemUsage = transactions.filter(tx => tx.inventory_item_id === item.id && tx.type === "usage");
                        const monthlyUsage = itemUsage.reduce((a, tx) => a + Number(tx.quantity), 0);
                        const dailyUsage = monthlyUsage / 30;
                        const daysOfStock = dailyUsage > 0 ? Number(item.current_stock) / dailyUsage : 999;
                        const isSlowMoving = daysOfStock > 60;
                        return (
                          <div key={item.id} className="flex items-center gap-3 text-sm">
                            <span className="w-32 truncate font-medium">{item.ingredients?.name}</span>
                            <Progress value={Math.min(100, (dailyUsage / (Number(item.max_stock_level) / 30)) * 100)} className="flex-1 h-2" />
                            <span className="w-24 text-end text-muted-foreground">
                              {daysOfStock < 999 ? `${daysOfStock.toFixed(0)} ${isAr ? "يوم" : "days"}` : "—"}
                            </span>
                            {isSlowMoving && daysOfStock < 999 && (
                              <Badge className="bg-warning/10 text-warning border-0 text-[10px]">
                                <Clock className="w-3 h-3 me-1" />{isAr ? "بطيء" : "Slow"}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <div className="space-y-3">
              {items.filter(i => getStatus(i) === "out").map(item => (
                <Card key={item.id} className="rounded-2xl border-destructive/30">
                  <CardContent className="py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-destructive">{isAr ? "تنبيه حرج" : "Critical Alert"}</p>
                      <p className="text-sm text-muted-foreground">{item.ingredients?.name} — {isAr ? "نفد المخزون! يجب الشراء فوراً" : "Out of stock! Purchase immediately"}</p>
                    </div>
                    <Badge className="bg-destructive/10 text-destructive border-0">{isAr ? "عاجل" : "Urgent"}</Badge>
                  </CardContent>
                </Card>
              ))}
              {items.filter(i => getStatus(i) === "low").map(item => (
                <Card key={item.id} className="rounded-2xl border-warning/30">
                  <CardContent className="py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-warning">{isAr ? "تحذير" : "Warning"}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.ingredients?.name} — {isAr ? `المتبقي: ${Number(item.current_stock)} ${item.unit}` : `Remaining: ${Number(item.current_stock)} ${item.unit}`}
                      </p>
                    </div>
                    <Badge className="bg-warning/10 text-warning border-0">{isAr ? "تحذير" : "Warning"}</Badge>
                  </CardContent>
                </Card>
              ))}
              {items.filter(i => getStatus(i) !== "out" && getStatus(i) !== "low").length === items.length && items.length > 0 && (
                <Card className="rounded-2xl border-success/30">
                  <CardContent className="py-8 text-center">
                    <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                    <p className="font-semibold text-success">{isAr ? "كل شيء على ما يرام!" : "Everything looks good!"}</p>
                  </CardContent>
                </Card>
              )}
              {items.length === 0 && (
                <Card className="rounded-2xl"><CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">{t("noData")}</p>
                </CardContent></Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Item Dialog */}
        <Dialog open={itemDialog} onOpenChange={setItemDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>{isAr ? "إضافة صنف للمخزون" : "Add Inventory Item"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><label className="text-sm font-medium">{isAr ? "المكون" : "Ingredient"}</label>
                <Select value={fIngredient} onValueChange={v => { setFIngredient(v); const ing = ingredients.find(i => i.id === v); if (ing) setFUnitCost(ing.unit_price); }}>
                  <SelectTrigger><SelectValue placeholder={isAr ? "اختر المكون" : "Select ingredient"} /></SelectTrigger>
                  <SelectContent>{ingredients.filter(i => !items.some(it => it.ingredient_id === i.id)).map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-sm font-medium">{isAr ? "المخزون الحالي" : "Current Stock"}</label><Input type="number" value={fCurrentStock} onChange={e => setFCurrentStock(Number(e.target.value))} /></div>
                <div><label className="text-sm font-medium">{isAr ? "الحد الأدنى" : "Min Level"}</label><Input type="number" value={fMinStock} onChange={e => setFMinStock(Number(e.target.value))} /></div>
                <div><label className="text-sm font-medium">{isAr ? "الحد الأقصى" : "Max Level"}</label><Input type="number" value={fMaxStock} onChange={e => setFMaxStock(Number(e.target.value))} /></div>
              </div>
              <div><label className="text-sm font-medium">{isAr ? "سعر الوحدة" : "Unit Cost"}</label><Input type="number" value={fUnitCost} onChange={e => setFUnitCost(Number(e.target.value))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setItemDialog(false)}>{t("cancel")}</Button>
              <Button onClick={handleSaveItem} disabled={!fIngredient}>{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Transaction Dialog */}
        <Dialog open={txDialog} onOpenChange={setTxDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>{isAr ? "معاملة جديدة" : "New Transaction"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><label className="text-sm font-medium">{isAr ? "الصنف" : "Item"}</label>
                <Select value={txItem} onValueChange={setTxItem}>
                  <SelectTrigger><SelectValue placeholder={isAr ? "اختر الصنف" : "Select item"} /></SelectTrigger>
                  <SelectContent>{items.map(i => <SelectItem key={i.id} value={i.id}>{i.ingredients?.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium">{isAr ? "النوع" : "Type"}</label>
                  <Select value={txType} onValueChange={setTxType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{txTypes.map(t => <SelectItem key={t.value} value={t.value}>{isAr ? t.label_ar : t.label_en}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><label className="text-sm font-medium">{t("quantity")}</label><Input type="number" value={txQty} onChange={e => setTxQty(Number(e.target.value))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium">{isAr ? "سعر الوحدة" : "Unit Cost"}</label><Input type="number" value={txUnitCost} onChange={e => setTxUnitCost(Number(e.target.value))} /></div>
                <div><label className="text-sm font-medium">{t("date")}</label><Input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} /></div>
              </div>
              {txType === "purchase" && (
                <div><label className="text-sm font-medium">{t("supplier")}</label>
                  <Select value={txSupplier} onValueChange={setTxSupplier}>
                    <SelectTrigger><SelectValue placeholder={isAr ? "اختياري" : "Optional"} /></SelectTrigger>
                    <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{isAr ? s.name_ar : s.name_en || s.name_ar}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {txType === "waste" && (
                <div><label className="text-sm font-medium">{isAr ? "سبب الهدر" : "Waste Reason"}</label>
                  <Select value={txReason} onValueChange={setTxReason}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{wasteReasons.map(r => <SelectItem key={r.value} value={r.value}>{isAr ? r.ar : r.en}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <div><label className="text-sm font-medium">{isAr ? "ملاحظات" : "Notes"}</label><Textarea value={txNotes} onChange={e => setTxNotes(e.target.value)} rows={2} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTxDialog(false)}>{t("cancel")}</Button>
              <Button onClick={handleSaveTx} disabled={!txItem || txQty <= 0}>{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
