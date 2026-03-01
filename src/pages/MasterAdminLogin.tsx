import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function MasterAdminLogin() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-4"><Shield className="w-6 h-6 text-destructive" /></div>
          <CardTitle>{isAr ? "دخول المشرف" : "Admin Login"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={e => { e.preventDefault(); navigate("/master-admin/dashboard"); }} className="space-y-4">
            <Input placeholder={isAr ? "البريد الإلكتروني" : "Email"} dir="ltr" />
            <Input type="password" placeholder={isAr ? "كلمة المرور" : "Password"} dir="ltr" />
            <Button type="submit" className="w-full bg-destructive hover:bg-destructive/90">{isAr ? "دخول" : "Login"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
