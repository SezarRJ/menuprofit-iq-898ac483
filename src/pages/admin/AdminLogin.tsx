import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error("Login failed: " + error.message);
      setLoading(false);
      return;
    }

    // Server-side verified: check platform_admin_users
    const { data: admin } = await supabase
      .from("platform_admin_users")
      .select("role, is_active")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (!admin?.is_active) {
      toast.error("You do not have platform admin access.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    // Log the login
    await supabase.from("platform_audit_logs").insert({
      actor_user_id: data.user.id,
      action: "admin_login",
      target_type: "session",
      target_id: data.user.id,
      reason: "Admin console login",
    });

    toast.success("Welcome, admin.");
    navigate("/admin");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-[#1a1a3e] border-white/10 text-gray-100">
        <CardHeader className="text-center pb-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-7 h-7 text-indigo-400" />
          </div>
          <CardTitle className="text-lg">Platform Admin</CardTitle>
          <p className="text-xs text-gray-500">SmartMenu Owner Console</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-3">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-gray-100 placeholder:text-gray-500"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-gray-100 placeholder:text-gray-500"
            />
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
