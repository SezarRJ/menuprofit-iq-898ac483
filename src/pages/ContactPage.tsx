import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, Globe, Send } from "lucide-react";

export default function ContactPage() {
  const { t, lang, setLang } = useLanguage();
  const isAr = lang === "ar";
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 bg-card/50 glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center"><UtensilsCrossed className="w-4 h-4 text-primary-foreground" /></div><span className="font-bold">MenuProfit</span></Link>
          <Button variant="ghost" size="sm" onClick={() => setLang(isAr ? "en" : "ar")}><Globe className="w-4 h-4 me-1" />{isAr ? "EN" : "AR"}</Button>
        </div>
      </nav>
      <div className="max-w-lg mx-auto py-20 px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t("contactUs")}</CardTitle>
            <p className="text-sm text-muted-foreground">{isAr ? "أرسل لنا رسالة وسنرد عليك قريباً" : "Send us a message and we'll get back to you"}</p>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4"><Send className="w-8 h-8 text-success" /></div>
                <h3 className="font-bold text-lg">{isAr ? "تم إرسال رسالتك!" : "Message Sent!"}</h3>
                <p className="text-muted-foreground text-sm mt-2">{isAr ? "سنتواصل معك قريباً" : "We'll get back to you soon"}</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
                <Input placeholder={isAr ? "الاسم" : "Name"} required />
                <Input type="email" placeholder={isAr ? "البريد الإلكتروني" : "Email"} dir="ltr" required />
                <textarea className="w-full min-h-[120px] rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder={isAr ? "رسالتك" : "Your message"} required />
                <Button type="submit" className="w-full gradient-primary border-0">{isAr ? "إرسال" : "Send"}</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
