import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import { useLanguage } from "@/lib/i18n";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Users, Star, Pencil, Trash2, Package, Award, TrendingUp,
  Phone, Mail, MapPin, ShieldCheck, ThumbsUp
} from "lucide-react";

interface Supplier {
  id: string; name_ar: string; name_en: string; contact_person: string;
  phone: string; email: string; address: string; payment_terms: string; notes: string;
  price_score: number; quality_score: number; availability_score: number; is_active: boolean;
}

interface SupplierProduct {
  id: string; supplier_id: string; ingredient_id: string; price: number;
  min_order_qty: number; lead_time_days: number; quality_rating: number;
  discount_pct: number; is_preferred: boolean; last_purchase_date: string | null;
  ingredients?: { name: string; unit: string };
}

interface Ingredient { id: string; name: string; unit: string; }

function weightedScore(s: Supplier) {
  return s.price_score * 0.4 + s.quality_score * 0.35 + s.availability_score * 0.25;
}

function getBadges(s: Supplier, isAr: boolean) {
  const badges: { label: string; color: string }[] = [];
  if (s.price_score >= 4) badges.push({ label: isAr ? "أفضل سعر" : "Best Price", color: "bg-success/10 text-success" });
  else if (s.price_score >= 3) badges.push({ label: isAr ? "سعر جيد" : "Good Price", color: "bg-primary/10 text-primary" });
  if (s.quality_score >= 4) badges.push({ label: isAr ? "جودة عالية" : "Premium Quality", color: "bg-success/10 text-success" });
  else if (s.quality_score >= 3) badges.push({ label: isAr ? "جودة جيدة" : "Standard Quality", color: "bg-primary/10 text-primary" });
  if (s.availability_score >= 4) badges.push({ label: isAr ? "موثوق" : "Reliable", color: "bg-success/10 text-success" });
  else if (s.availability_score >= 3) badges.push({ label: isAr ? "متوسط" : "Moderate", color: "bg-warning/10 text-warning" });
  return badges;
}

export default function SuppliersPage() {
  const { restaurant } = useRestaurant();
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [tab, setTab] = useState("list");

  // Form state
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("cash");
  const [notes, setNotes] = useState("");
  const [priceScore, setPriceScore] = useState(3);
  const [qualityScore, setQualityScore] = useState(3);
  const [availScore, setAvailScore] = useState(3);

  // Product form state
  const [pIngredient, setPIngredient] = useState("");
  const [pPrice, setPPrice] = useState(0);
  const [pMinQty, setPMinQty] = useState(0);
  const [pLeadTime, setPLeadTime] = useState(1);
  const [pQuality, setPQuality] = useState(3);
  const [pDiscount, setPDiscount] = useState(0);
  const [pPreferred, setPPreferred] = useState(false);

  useEffect(() => { if (restaurant) loadAll(); }, [restaurant]);

  const loadAll = async () => {
    setLoading(true);
    const [supRes, ingRes] = await Promise.all([
      supabase.from("suppliers").select("*").eq("restaurant_id", restaurant!.id).order("created_at"),
      supabase.from("ingredients").select("id, name, unit").eq("restaurant_id", restaurant!.id),
    ]);
    const sups = (supRes.data ?? []) as Supplier[];
    setSuppliers(sups);
    setIngredients(ingRes.data ?? []);
    if (sups.length > 0) {
      setSelectedSupplier(sups[0].id);
      await loadProducts(sups[0].id);
    }
    setLoading(false);
  };

  const loadProducts = async (supplierId: string) => {
    const { data } = await supabase
      .from("supplier_products")
      .select("*, ingredients(name, unit)")
      .eq("supplier_id", supplierId);
    setProducts((data ?? []) as SupplierProduct[]);
  };

  const openEdit = (s: Supplier) => {
    setEditing(s); setNameAr(s.name_ar); setNameEn(s.name_en);
    setContactPerson(s.contact_person); setPhone(s.phone); setEmail(s.email);
    setAddress(s.address); setPaymentTerms(s.payment_terms); setNotes(s.notes);
    setPriceScore(s.price_score); setQualityScore(s.quality_score); setAvailScore(s.availability_score);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditing(null); setNameAr(""); setNameEn(""); setContactPerson(""); setPhone("");
    setEmail(""); setAddress(""); setPaymentTerms("cash"); setNotes("");
    setPriceScore(3); setQualityScore(3); setAvailScore(3); setDialogOpen(false);
  };

  const handleSave = async () => {
    const row = {
      restaurant_id: restaurant!.id, name_ar: nameAr, name_en: nameEn,
      contact_person: contactPerson, phone, email, address, payment_terms: paymentTerms,
      notes, price_score: priceScore, quality_score: qualityScore, availability_score: availScore,
    };
    if (editing) {
      await supabase.from("suppliers").update(row).eq("id", editing.id);
    } else {
      await supabase.from("suppliers").insert(row);
    }
    toast({ title: isAr ? "تم الحفظ" : "Saved" });
    resetForm(); loadAll();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("suppliers").delete().eq("id", id);
    toast({ title: isAr ? "تم الحذف" : "Deleted" });
    loadAll();
  };

  const handleSaveProduct = async () => {
    await supabase.from("supplier_products").insert({
      supplier_id: selectedSupplier, ingredient_id: pIngredient,
      price: pPrice, min_order_qty: pMinQty, lead_time_days: pLeadTime,
      quality_rating: pQuality, discount_pct: pDiscount, is_preferred: pPreferred,
    });
    toast({ title: isAr ? "تم إضافة المنتج" : "Product added" });
    setProductDialogOpen(false);
    setPIngredient(""); setPPrice(0); setPMinQty(0); setPLeadTime(1); setPQuality(3); setPDiscount(0); setPPreferred(false);
    loadProducts(selectedSupplier);
  };

  const handleDeleteProduct = async (id: string) => {
    await supabase.from("supplier_products").delete().eq("id", id);
    toast({ title: isAr ? "تم الحذف" : "Deleted" });
    loadProducts(selectedSupplier);
  };

  const currency = restaurant?.default_currency === "USD" ? "$" : "د.ع";
  const sorted = [...suppliers].sort((a, b) => weightedScore(b) - weightedScore(a));
  const preferred = suppliers.filter(s => products.some(p => p.supplier_id === s.id && p.is_preferred)).length;
  const avgRating = suppliers.length > 0 ? (suppliers.reduce((a, s) => a + weightedScore(s), 0) / suppliers.length).toFixed(1) : "0";
  const totalProducts = products.length;

  if (loading) return <AppLayout><div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("suppliers")}</h1>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="rounded-xl gradient-primary border-0">
            <Plus className="w-4 h-4 me-2" />{t("add")}
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: isAr ? "إجمالي الموردين" : "Total Suppliers", value: suppliers.length, icon: Users, color: "text-primary", bg: "bg-primary/10" },
            { label: isAr ? "موردون مفضلون" : "Preferred", value: preferred, icon: Star, color: "text-warning", bg: "bg-warning/10" },
            { label: isAr ? "متوسط التقييم" : "Avg Rating", value: avgRating, icon: Award, color: "text-success", bg: "bg-success/10" },
            { label: isAr ? "إجمالي المنتجات" : "Total Products", value: totalProducts, icon: Package, color: "text-primary", bg: "bg-primary/10" },
          ].map((c, i) => (
            <Card key={i} className="shadow-card rounded-2xl">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                    <p className={`text-2xl font-extrabold ${c.color} mt-1`}>{c.value}</p>
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
            <TabsTrigger value="list">{isAr ? "الموردون" : "Suppliers"}</TabsTrigger>
            <TabsTrigger value="evaluation">{isAr ? "التقييم" : "Evaluation"}</TabsTrigger>
            <TabsTrigger value="products">{isAr ? "المنتجات" : "Products"}</TabsTrigger>
            <TabsTrigger value="recommendations">{isAr ? "التوصيات" : "Recommendations"}</TabsTrigger>
          </TabsList>

          {/* Suppliers List */}
          <TabsContent value="list">
            {suppliers.length === 0 ? (
              <Card className="rounded-2xl"><CardContent className="py-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">{t("noData")}</p>
              </CardContent></Card>
            ) : (
              <Card className="rounded-2xl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("name")}</TableHead>
                      <TableHead>{isAr ? "جهة الاتصال" : "Contact"}</TableHead>
                      <TableHead>{isAr ? "الهاتف" : "Phone"}</TableHead>
                      <TableHead>{isAr ? "شروط الدفع" : "Payment"}</TableHead>
                      <TableHead>{isAr ? "التقييم" : "Score"}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map(s => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="font-medium">{isAr ? s.name_ar : s.name_en || s.name_ar}</div>
                          <div className="text-xs text-muted-foreground">{isAr ? s.name_en : s.name_ar}</div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{s.contact_person}</TableCell>
                        <TableCell className="text-muted-foreground">{s.phone}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{s.payment_terms}</Badge></TableCell>
                        <TableCell>
                          <span className="font-bold text-primary">{weightedScore(s).toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">/5</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          {/* Evaluation Tab */}
          <TabsContent value="evaluation">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sorted.map((s, idx) => (
                <Card key={s.id} className="shadow-card rounded-2xl">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          {idx < 3 && <Badge className="bg-warning/20 text-warning border-0 text-xs">🏆 #{idx + 1}</Badge>}
                          <h3 className="font-semibold">{isAr ? s.name_ar : s.name_en || s.name_ar}</h3>
                        </div>
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          {getBadges(s, isAr).map((b, i) => (
                            <Badge key={i} className={`${b.color} border-0 text-[10px]`}>{b.label}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-extrabold text-primary">{weightedScore(s).toFixed(1)}</p>
                        <p className="text-[10px] text-muted-foreground">{isAr ? "التقييم" : "Score"}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-20 text-muted-foreground">{isAr ? "السعر" : "Price"}</span>
                        <Progress value={s.price_score * 20} className="flex-1 h-2" />
                        <span className="w-8 text-end font-medium">{s.price_score}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-20 text-muted-foreground">{isAr ? "الجودة" : "Quality"}</span>
                        <Progress value={s.quality_score * 20} className="flex-1 h-2" />
                        <span className="w-8 text-end font-medium">{s.quality_score}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-20 text-muted-foreground">{isAr ? "التوفر" : "Availability"}</span>
                        <Progress value={s.availability_score * 20} className="flex-1 h-2" />
                        <span className="w-8 text-end font-medium">{s.availability_score}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {suppliers.length === 0 && (
              <Card className="rounded-2xl"><CardContent className="py-12 text-center">
                <Award className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">{t("noData")}</p>
              </CardContent></Card>
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="space-y-4">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">{isAr ? "اختر المورد" : "Select Supplier"}</label>
                  <Select value={selectedSupplier} onValueChange={v => { setSelectedSupplier(v); loadProducts(v); }}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{isAr ? s.name_ar : s.name_en || s.name_ar}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => setProductDialogOpen(true)} className="rounded-xl" disabled={!selectedSupplier}>
                  <Plus className="w-4 h-4 me-2" />{isAr ? "إضافة منتج" : "Add Product"}
                </Button>
              </div>
              {products.length === 0 ? (
                <Card className="rounded-2xl"><CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">{t("noData")}</p>
                </CardContent></Card>
              ) : (
                <Card className="rounded-2xl">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{isAr ? "المكون" : "Ingredient"}</TableHead>
                        <TableHead>{t("price")}</TableHead>
                        <TableHead>{isAr ? "خصم" : "Discount"}</TableHead>
                        <TableHead>{isAr ? "الحد الأدنى" : "Min Qty"}</TableHead>
                        <TableHead>{isAr ? "التوصيل" : "Lead Time"}</TableHead>
                        <TableHead>{isAr ? "مفضل" : "Preferred"}</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.ingredients?.name}</TableCell>
                          <TableCell>{Number(p.price).toLocaleString()} {currency}</TableCell>
                          <TableCell>{Number(p.discount_pct)}%</TableCell>
                          <TableCell>{Number(p.min_order_qty)} {p.ingredients?.unit}</TableCell>
                          <TableCell>{p.lead_time_days} {isAr ? "يوم" : "days"}</TableCell>
                          <TableCell>{p.is_preferred && <Badge className="bg-success/10 text-success border-0 text-xs"><Star className="w-3 h-3 me-1" />{isAr ? "مفضل" : "Preferred"}</Badge>}</TableCell>
                          <TableCell><Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteProduct(p.id)}><Trash2 className="w-4 h-4" /></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <RecommendationsView suppliers={suppliers} ingredients={ingredients} products={products} isAr={isAr} currency={currency} />
          </TabsContent>
        </Tabs>

        {/* Supplier Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? (isAr ? "تعديل مورد" : "Edit Supplier") : (isAr ? "إضافة مورد" : "Add Supplier")}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium">{isAr ? "الاسم (عربي)" : "Name (Arabic)"}</label><Input value={nameAr} onChange={e => setNameAr(e.target.value)} /></div>
                <div><label className="text-sm font-medium">{isAr ? "الاسم (إنجليزي)" : "Name (English)"}</label><Input value={nameEn} onChange={e => setNameEn(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium">{isAr ? "جهة الاتصال" : "Contact Person"}</label><Input value={contactPerson} onChange={e => setContactPerson(e.target.value)} /></div>
                <div><label className="text-sm font-medium">{isAr ? "الهاتف" : "Phone"}</label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium">{t("email")}</label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
                <div><label className="text-sm font-medium">{isAr ? "شروط الدفع" : "Payment Terms"}</label>
                  <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">{isAr ? "نقدي" : "Cash"}</SelectItem>
                      <SelectItem value="monthly">{isAr ? "شهري" : "Monthly"}</SelectItem>
                      <SelectItem value="credit_15">{isAr ? "آجل 15 يوم" : "Credit 15 days"}</SelectItem>
                      <SelectItem value="credit_30">{isAr ? "آجل 30 يوم" : "Credit 30 days"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><label className="text-sm font-medium">{isAr ? "العنوان" : "Address"}</label><Input value={address} onChange={e => setAddress(e.target.value)} /></div>
              <div><label className="text-sm font-medium">{isAr ? "ملاحظات" : "Notes"}</label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} /></div>
              <div className="border-t pt-3">
                <p className="text-sm font-medium mb-2">{isAr ? "التقييم (1-5)" : "Evaluation (1-5)"}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-xs text-muted-foreground">{isAr ? "السعر (40%)" : "Price (40%)"}</label><Input type="number" min={1} max={5} step={0.5} value={priceScore} onChange={e => setPriceScore(Number(e.target.value))} /></div>
                  <div><label className="text-xs text-muted-foreground">{isAr ? "الجودة (35%)" : "Quality (35%)"}</label><Input type="number" min={1} max={5} step={0.5} value={qualityScore} onChange={e => setQualityScore(Number(e.target.value))} /></div>
                  <div><label className="text-xs text-muted-foreground">{isAr ? "التوفر (25%)" : "Avail. (25%)"}</label><Input type="number" min={1} max={5} step={0.5} value={availScore} onChange={e => setAvailScore(Number(e.target.value))} /></div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>{t("cancel")}</Button>
              <Button onClick={handleSave} disabled={!nameAr}>{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Product Dialog */}
        <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{isAr ? "إضافة منتج" : "Add Product"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><label className="text-sm font-medium">{isAr ? "المكون" : "Ingredient"}</label>
                <Select value={pIngredient} onValueChange={setPIngredient}>
                  <SelectTrigger><SelectValue placeholder={isAr ? "اختر المكون" : "Select ingredient"} /></SelectTrigger>
                  <SelectContent>{ingredients.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium">{t("price")}</label><Input type="number" value={pPrice} onChange={e => setPPrice(Number(e.target.value))} /></div>
                <div><label className="text-sm font-medium">{isAr ? "خصم %" : "Discount %"}</label><Input type="number" value={pDiscount} onChange={e => setPDiscount(Number(e.target.value))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium">{isAr ? "الحد الأدنى" : "Min Order Qty"}</label><Input type="number" value={pMinQty} onChange={e => setPMinQty(Number(e.target.value))} /></div>
                <div><label className="text-sm font-medium">{isAr ? "مدة التوصيل (أيام)" : "Lead Time (days)"}</label><Input type="number" value={pLeadTime} onChange={e => setPLeadTime(Number(e.target.value))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium">{isAr ? "تقييم الجودة" : "Quality Rating"}</label><Input type="number" min={1} max={5} step={0.5} value={pQuality} onChange={e => setPQuality(Number(e.target.value))} /></div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={pPreferred} onChange={e => setPPreferred(e.target.checked)} className="rounded" />
                    <span className="text-sm">{isAr ? "مفضل" : "Preferred"}</span>
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setProductDialogOpen(false)}>{t("cancel")}</Button>
              <Button onClick={handleSaveProduct} disabled={!pIngredient}>{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

// Recommendations sub-component
function RecommendationsView({ suppliers, ingredients, products, isAr, currency }: {
  suppliers: Supplier[]; ingredients: Ingredient[]; products: SupplierProduct[]; isAr: boolean; currency: string;
}) {
  // For each ingredient, find the best supplier
  const recommendations = ingredients.map(ing => {
    const supplierProducts = products.filter(p => p.ingredient_id === ing.id);
    if (supplierProducts.length === 0) return null;

    const scored = supplierProducts.map(sp => {
      const supplier = suppliers.find(s => s.id === sp.supplier_id);
      if (!supplier) return null;
      const effectivePrice = Number(sp.price) * (1 - Number(sp.discount_pct) / 100);
      const maxPrice = Math.max(...supplierProducts.map(p => Number(p.price)));
      const priceScore = maxPrice > 0 ? (1 - effectivePrice / maxPrice) * 5 : 3;
      const total = priceScore * 0.35 + sp.quality_rating * 0.30 + supplier.availability_score * 0.20 + (sp.lead_time_days > 0 ? Math.max(5 - sp.lead_time_days, 1) : 3) * 0.15;
      const reasons: string[] = [];
      if (effectivePrice <= Math.min(...supplierProducts.map(p => Number(p.price) * (1 - Number(p.discount_pct) / 100)))) reasons.push(isAr ? "أفضل سعر" : "Best Price");
      if (sp.quality_rating >= 4) reasons.push(isAr ? "أفضل جودة" : "Best Quality");
      if (supplier.availability_score >= 4) reasons.push(isAr ? "أفضل توفر" : "Best Availability");
      if (sp.lead_time_days <= 1) reasons.push(isAr ? "توصيل سريع" : "Fast Delivery");
      if (Number(sp.discount_pct) > 5) reasons.push(isAr ? "خصم جيد" : "Good Discount");
      return { supplier, product: sp, effectivePrice, total, reasons };
    }).filter(Boolean).sort((a, b) => b!.total - a!.total);

    return { ingredient: ing, recommendations: scored as NonNullable<typeof scored[0]>[] };
  }).filter(Boolean);

  if (recommendations.length === 0) {
    return (
      <Card className="rounded-2xl"><CardContent className="py-12 text-center">
        <ThumbsUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">{isAr ? "أضف موردين ومنتجات للحصول على توصيات" : "Add suppliers and products to get recommendations"}</p>
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map(rec => (
        <Card key={rec!.ingredient.id} className="shadow-card rounded-2xl">
          <CardContent className="pt-5 pb-4">
            <h3 className="font-semibold mb-3">{rec!.ingredient.name}</h3>
            <div className="space-y-2">
              {rec!.recommendations.slice(0, 3).map((r, i) => (
                <div key={i} className={`flex items-center justify-between p-2.5 rounded-xl ${i === 0 ? "bg-success/5 border border-success/20" : "bg-muted/30"}`}>
                  <div className="flex items-center gap-2">
                    {i === 0 && <ShieldCheck className="w-4 h-4 text-success" />}
                    <span className="font-medium text-sm">{isAr ? r.supplier.name_ar : r.supplier.name_en || r.supplier.name_ar}</span>
                    {i === 0 && <Badge className="bg-success/10 text-success border-0 text-[10px]">{isAr ? "موصى به" : "Recommended"}</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-semibold">{r.effectivePrice.toLocaleString()} {currency}</span>
                    <div className="flex gap-1">
                      {r.reasons.slice(0, 2).map((reason, ri) => (
                        <Badge key={ri} variant="outline" className="text-[10px]">{reason}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
