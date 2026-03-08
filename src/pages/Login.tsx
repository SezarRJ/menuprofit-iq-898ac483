import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Globe } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();
  const isAr = lang === "ar";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(isAr ? "خطأ في تسجيل الدخول: " + error.message : "Login error: " + error.message);
    } else {
      // Check if user has a restaurant — if not, redirect to onboarding
      const { data: rest } = await supabase.from("restaurants").select("id").limit(1).maybeSingle();
      if (rest) {
        navigate("/app/dashboard");
      } else {
        navigate("/onboarding");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 end-4">
        <Button variant="ghost" size="sm" onClick={() => setLang(isAr ? "en" : "ar")}><Globe className="w-4 h-4 me-1" />{isAr ? "EN" : "AR"}</Button>
      </div>
      <Card className="w-full max-w-md shadow-card rounded-2xl animate-fade-in">
        <CardHeader className="text-center space-y-2 pb-2">
          <Link to="/" className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="text-xl font-bold text-primary">SMARTMENU</h1>
          <CardTitle className="text-2xl">{t("login")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("email")}</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" dir="ltr" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("password")}</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} dir="ltr" required />
            </div>
            <Button type="submit" className="w-full gradient-primary border-0 rounded-xl" disabled={loading}>
              {loading ? (isAr ? "جاري الدخول..." : "Signing in...") : t("login")}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {isAr ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
            <Link to="/auth/register" className="text-primary font-medium hover:underline">{t("register")}</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
