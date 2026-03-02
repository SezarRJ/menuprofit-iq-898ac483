import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { toast } from "sonner";

export default function MasterAdminLogin() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(isAr ? "خطأ في تسجيل الدخول: " + error.message : "Login error: " + error.message);
      setLoading(false);
      return;
    }

    // Check if user has admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);

    const adminRoles = ["master_admin", "billing_admin", "support_agent", "auditor"];
    const hasAdmin = roles?.some(r => adminRoles.includes(r.role));

    if (!hasAdmin) {
      toast.error(isAr ? "ليس لديك صلاحيات المشرف" : "You do not have admin privileges");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    navigate("/master-admin/dashboard");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle>{isAr ? "دخول المشرف" : "Admin Login"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder={isAr ? "البريد الإلكتروني" : "Email"}
              value={email}
              onChange={e => setEmail(e.target.value)}
              dir="ltr"
              required
            />
            <Input
              type="password"
              placeholder={isAr ? "كلمة المرور" : "Password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              dir="ltr"
              required
            />
            <Button type="submit" className="w-full bg-destructive hover:bg-destructive/90" disabled={loading}>
              {loading ? (isAr ? "جاري الدخول..." : "Logging in...") : (isAr ? "دخول" : "Login")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
