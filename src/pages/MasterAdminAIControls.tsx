import { AdminLayout } from "./MasterAdminDashboard";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Sparkles } from "lucide-react";

export default function MasterAdminAIControls() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />{isAr ? "إعدادات الذكاء الاصطناعي" : "AI Controls"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">{isAr ? "الحد الشهري (توكن)" : "Monthly Cap (tokens)"}</label><Input type="number" defaultValue="100000" dir="ltr" /></div>
            <div><label className="text-sm font-medium mb-1 block">{isAr ? "المزود" : "Provider"}</label>
              <Select defaultValue="gemini"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="gemini">Google Gemini</SelectItem><SelectItem value="gpt">OpenAI GPT</SelectItem></SelectContent></Select>
            </div>
            <div><label className="text-sm font-medium mb-1 block">{isAr ? "النموذج" : "Model"}</label>
              <Select defaultValue="gemini-2.5-flash"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem><SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem><SelectItem value="gpt-5-mini">GPT-5 Mini</SelectItem></SelectContent></Select>
            </div>
            <Button className="w-full gradient-primary border-0"><Save className="w-4 h-4 me-2" />{isAr ? "حفظ" : "Save"}</Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
