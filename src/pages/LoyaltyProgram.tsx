import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import { useLanguage } from "@/lib/i18n";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Crown, Users, Plus, Star, Award, Gift } from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string; name: string; phone: string; email: string;
  tier: string; total_points: number; total_spent: number; visit_count: number;
}

export default function LoyaltyProgram() {
  const { restaurant } = useRestaurant();
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => { if (restaurant) load(); }, [restaurant]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("customers").select("*").eq("restaurant_id", restaurant!.id).order("total_points", { ascending: false });
    setCustomers((data ?? []) as Customer[]);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!restaurant || !name || !phone) return;
    const { error } = await supabase.from("customers").insert({
      restaurant_id: restaurant.id, name, phone, email,
    });
    if (error) { toast.error(error.message); return; }
    toast.success(isAr ? "تم إضافة العميل" : "Customer added");
    setName(""); setPhone(""); setEmail(""); setOpen(false); load();
  };

  const tierColors: Record<string, string> = {
    bronze: "bg-amber-900/20 text-amber-600",
    silver: "bg-gray-200/20 text-gray-400",
    gold: "bg-yellow-500/20 text-yellow-500",
  };
  const tierLabels: Record<string, string> = {
    bronze: isAr ? "برونزي" : "Bronze",
    silver: isAr ? "فضي" : "Silver",
    gold: isAr ? "ذهبي" : "Gold",
  };
  const currency = restaurant?.default_currency === "USD" ? "$" : "د.ع";

  if (loading) return <AppLayout><div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}</div></AppLayout>;

  const totalCustomers = customers.length;
  const totalPoints = customers.reduce((s, c) => s + c.total_points, 0);
  const goldCount = customers.filter(c => c.tier === "gold").length;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("loyaltyProgram")}</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="rounded-xl"><Plus className="w-4 h-4 me-2" />{isAr ? "إضافة عميل" : "Add Customer"}</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{isAr ? "إضافة عميل جديد" : "Add New Customer"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>{t("name")}</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="space-y-2"><Label>{isAr ? "رقم الهاتف" : "Phone"}</Label><Input value={phone} onChange={e => setPhone(e.target.value)} dir="ltr" /></div>
                <div className="space-y-2"><Label>{t("email")}</Label><Input value={email} onChange={e => setEmail(e.target.value)} dir="ltr" /></div>
                <Button onClick={handleAdd} className="w-full rounded-xl">{t("save")}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="rounded-2xl shadow-card">
            <CardContent className="pt-5 pb-5 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-extrabold">{totalCustomers}</p>
              <p className="text-xs text-muted-foreground">{t("customers")}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-card">
            <CardContent className="pt-5 pb-5 text-center">
              <Star className="w-8 h-8 text-warning mx-auto mb-2" />
              <p className="text-2xl font-extrabold">{totalPoints.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{t("points")}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-card">
            <CardContent className="pt-5 pb-5 text-center">
              <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-extrabold">{goldCount}</p>
              <p className="text-xs text-muted-foreground">{isAr ? "ذهبي" : "Gold"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Rules */}
        <Card className="rounded-2xl shadow-card">
          <CardHeader><CardTitle className="text-base">{isAr ? "قواعد البرنامج" : "Program Rules"}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-muted/30 rounded-xl p-4">
                <Award className="w-5 h-5 text-primary mb-2" />
                <p className="font-semibold mb-1">{isAr ? "كسب النقاط" : "Earn Points"}</p>
                <p className="text-muted-foreground">{isAr ? "1 نقطة لكل 1,000 د.ع" : "1 point per 1,000 IQD"}</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <Crown className="w-5 h-5 text-warning mb-2" />
                <p className="font-semibold mb-1">{isAr ? "المستويات" : "Tiers"}</p>
                <p className="text-muted-foreground">{isAr ? "برونزي → فضي → ذهبي" : "Bronze → Silver → Gold"}</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <Gift className="w-5 h-5 text-success mb-2" />
                <p className="font-semibold mb-1">{isAr ? "الاستبدال" : "Redeem"}</p>
                <p className="text-muted-foreground">{isAr ? "طبق مجاني بعد 10 نقاط" : "Free dish after 10 points"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Table */}
        <Card className="shadow-card rounded-2xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{isAr ? "الهاتف" : "Phone"}</TableHead>
                  <TableHead>{isAr ? "المستوى" : "Tier"}</TableHead>
                  <TableHead>{t("points")}</TableHead>
                  <TableHead>{isAr ? "الزيارات" : "Visits"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell dir="ltr" className="text-start">{c.phone}</TableCell>
                    <TableCell><Badge className={`${tierColors[c.tier] || ""} border-0`}>{tierLabels[c.tier] || c.tier}</Badge></TableCell>
                    <TableCell className="font-semibold">{c.total_points}</TableCell>
                    <TableCell>{c.visit_count}</TableCell>
                  </TableRow>
                ))}
                {customers.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-12">
                    <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">{isAr ? "لا يوجد عملاء — سيتم إضافتهم تلقائياً من استيراد المبيعات" : "No customers — they'll be added from sales imports"}</p>
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
