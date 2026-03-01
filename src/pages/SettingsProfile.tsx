import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { User, Save, Globe, Bell } from "lucide-react";

export default function SettingsProfile() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h3 className="text-lg font-semibold">{t("profile")}</h3>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" />{isAr ? "المعلومات الشخصية" : "Personal Info"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">{t("name")}</label><Input defaultValue="أحمد محمد" /></div>
            <div><label className="text-sm font-medium mb-1 block">{t("email")}</label><Input defaultValue="ahmed@example.com" dir="ltr" /></div>
            <div><label className="text-sm font-medium mb-1 block">{t("password")}</label><Input type="password" defaultValue="••••••••" dir="ltr" /></div>
            <Button className="gradient-primary border-0"><Save className="w-4 h-4 me-2" />{t("save")}</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4" />{isAr ? "الإشعارات" : "Notifications"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[isAr ? "تنبيهات ارتفاع الأسعار" : "Price spike alerts", isAr ? "توصيات جديدة" : "New recommendations", isAr ? "تحديثات الاشتراك" : "Subscription updates"].map((label, i) => (
              <div key={i} className="flex items-center justify-between"><span className="text-sm">{label}</span><Switch defaultChecked={i < 2} /></div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
