import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, Globe } from "lucide-react";

export default function Register() {
  const { t, lang, setLang } = useLanguage();
  const isAr = lang === "ar";
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/app/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 end-4">
        <Button variant="ghost" size="sm" onClick={() => setLang(isAr ? "en" : "ar")}><Globe className="w-4 h-4 me-1" />{isAr ? "EN" : "AR"}</Button>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
            </div>
          </Link>
          <CardTitle className="text-2xl">{t("register")}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{isAr ? "أنشئ حسابك وابدأ تجربتك المجانية" : "Create your account and start your free trial"}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t("name")}</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder={isAr ? "الاسم الكامل" : "Full name"} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t("email")}</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" dir="ltr" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t("password")}</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" dir="ltr" />
            </div>
            <Button type="submit" className="w-full gradient-primary border-0">{t("register")}</Button>
          </form>
          <p className="text-sm text-center mt-6 text-muted-foreground">
            {isAr ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
            <Link to="/auth/login" className="text-primary hover:underline">{t("login")}</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
