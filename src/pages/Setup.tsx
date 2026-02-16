import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "@/lib/restaurant-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";

const cities = ["أربيل", "بغداد", "البصرة", "السليمانية", "كركوك", "النجف", "الموصل", "دهوك"];

export default function Setup() {
  const navigate = useNavigate();
  const { user, restaurant, refreshRestaurant } = useRestaurant();
  const [name, setName] = useState("");
  const [city, setCity] = useState("أربيل");
  const [currency, setCurrency] = useState("IQD");
  const [margin, setMargin] = useState("60");
  const [loading, setLoading] = useState(false);
  const isFirstTime = !restaurant;

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name);
      setCity(restaurant.city);
      setCurrency(restaurant.default_currency);
      setMargin(String(restaurant.target_margin_pct));
    }
  }, [restaurant]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    if (restaurant) {
      const { error } = await supabase.from("restaurants").update({
        name, city, default_currency: currency, target_margin_pct: Number(margin),
      }).eq("id", restaurant.id);
      if (error) toast.error(error.message);
      else { toast.success("تم حفظ الإعدادات"); await refreshRestaurant(); }
    } else {
      const { error } = await supabase.from("restaurants").insert({
        owner_id: user.id, name, city, default_currency: currency, target_margin_pct: Number(margin),
      });
      if (error) toast.error(error.message);
      else { toast.success("تم إعداد المطعم بنجاح!"); await refreshRestaurant(); navigate("/dashboard"); }
    }
    setLoading(false);
  };

  const content = (
    <Card className="max-w-lg mx-auto shadow-card animate-fade-in">
      <CardHeader>
        <CardTitle>{isFirstTime ? "إعداد المطعم" : "إعدادات المطعم"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label>اسم المطعم</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>المدينة</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>العملة الافتراضية</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="IQD">IQD — دينار عراقي</SelectItem>
                <SelectItem value="USD">USD — دولار أمريكي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>هامش الربح المستهدف %</Label>
            <Input type="number" value={margin} onChange={(e) => setMargin(e.target.value)} min="0" max="100" dir="ltr" className="text-left" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "جاري الحفظ..." : isFirstTime ? "حفظ وبدء الاستخدام" : "حفظ التغييرات"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  if (isFirstTime) {
    return <div className="min-h-screen flex items-center justify-center bg-background p-4">{content}</div>;
  }

  return <AppLayout>{content}</AppLayout>;
}
