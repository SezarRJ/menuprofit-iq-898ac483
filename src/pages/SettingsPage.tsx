import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import { useLanguage } from "@/lib/i18n";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Save, Building2, Crown, Bell, Globe, MapPin, ChefHat } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const { restaurant, plan, refreshRestaurant } = useRestaurant();
  const { t, lang, setLang } = useLanguage();
  const isAr = lang === "ar";

  const [restName, setRestName] = useState(restaurant?.name || "");
  const [currency, setCurrency] = useState(restaurant?.default_currency || "IQD");
  const [targetMargin, setTargetMargin] = useState(String(restaurant?.target_margin_pct || 45));
  const [city, setCity] = useState(restaurant?.city || "الموصل");
  const [saving, setSaving] = useState(false);

  const handleSaveRestaurant = async () => {
    if (!restaurant) return;
    setSaving(true);
    const { error } = await supabase.from("restaurants").update({
      name: restName, default_currency: currency, target_margin_pct: Number(targetMargin), city,
    }).eq("id", restaurant.id);
    if (error) toast.error(error.message);
    else { toast.success(isAr ? "تم الحفظ" : "Saved"); refreshRestaurant(); }
    setSaving(false);
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold">{t("settings")}</h1>

        <Tabs defaultValue="restaurant" dir={isAr ? "rtl" : "ltr"}>
          <TabsList className="rounded-xl">
            <TabsTrigger value="restaurant" className="rounded-lg">{t("restaurant")}</TabsTrigger>
            <TabsTrigger value="profile" className="rounded-lg">{t("profile")}</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg">{t("notifications")}</TabsTrigger>
          </TabsList>

          <TabsContent value="restaurant" className="space-y-4 mt-4">
            <Card className="rounded-2xl shadow-card">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Crown className="w-4 h-4 text-primary" />{isAr ? "الخطة الحالية" : "Current Plan"}</CardTitle></CardHeader>
              <CardContent>
                <Badge className="gradient-primary border-0 text-sm px-3 py-1 mb-3">{t(plan || "free")}</Badge>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm"><span>{t("ingredients")}</span><span className="text-muted-foreground">{plan === "free" ? "/ 30" : "∞"}</span></div>
                  <Progress value={plan === "free" ? 33 : 10} className="h-2" />
                  <div className="flex items-center justify-between text-sm"><span>{t("recipes")}</span><span className="text-muted-foreground">{plan === "free" ? "/ 20" : "∞"}</span></div>
                  <Progress value={plan === "free" ? 50 : 10} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-card">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4" />{isAr ? "معلومات المطعم" : "Restaurant Info"}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><label className="text-sm font-medium mb-1 block">{isAr ? "اسم المطعم" : "Restaurant Name"}</label><Input value={restName} onChange={e => setRestName(e.target.value)} /></div>
                <div><label className="text-sm font-medium mb-1 block">{isAr ? "المدينة" : "City"}</label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="الموصل">الموصل</SelectItem>
                      <SelectItem value="بغداد">بغداد</SelectItem>
                      <SelectItem value="أربيل">أربيل</SelectItem>
                      <SelectItem value="البصرة">البصرة</SelectItem>
                      <SelectItem value="other">{isAr ? "أخرى" : "Other"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><label className="text-sm font-medium mb-1 block">{isAr ? "العملة" : "Currency"}</label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IQD">{isAr ? "دينار عراقي (IQD)" : "Iraqi Dinar (IQD)"}</SelectItem>
                      <SelectItem value="USD">{isAr ? "دولار أمريكي (USD)" : "US Dollar (USD)"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><label className="text-sm font-medium mb-1 block">{isAr ? "هامش الربح المستهدف %" : "Target Margin %"}</label><Input type="number" value={targetMargin} onChange={e => setTargetMargin(e.target.value)} dir="ltr" /></div>
                <Button onClick={handleSaveRestaurant} disabled={saving} className="w-full rounded-xl gradient-primary border-0">
                  <Save className="w-4 h-4 me-2" />{saving ? t("loading") : t("save")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4 mt-4">
            <Card className="rounded-2xl shadow-card">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" />{isAr ? "المعلومات الشخصية" : "Personal Info"}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><label className="text-sm font-medium mb-1 block">{t("name")}</label><Input defaultValue="" /></div>
                <div><label className="text-sm font-medium mb-1 block">{t("email")}</label><Input disabled defaultValue="" dir="ltr" /></div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t("language")}</label>
                  <Select value={lang} onValueChange={(v) => setLang(v as "ar" | "en")}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="gradient-primary border-0 rounded-xl"><Save className="w-4 h-4 me-2" />{t("save")}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-4">
            <Card className="rounded-2xl shadow-card">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4" />{t("notifications")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  isAr ? "تنبيهات ارتفاع أسعار المكونات" : "Ingredient price spike alerts",
                  isAr ? "تحديثات التسعير اليومية" : "Daily pricing updates",
                  isAr ? "تقارير أداء القائمة الأسبوعية" : "Weekly menu performance reports",
                  isAr ? "عروض ترويجية مقترحة" : "Suggested promotions",
                  isAr ? "تنبيهات وصفات خاسرة" : "Loss-maker recipe alerts",
                ].map((label, i) => (
                  <div key={i} className="flex items-center justify-between"><span className="text-sm">{label}</span><Switch defaultChecked={i < 2} /></div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}