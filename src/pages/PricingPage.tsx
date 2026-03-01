import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Globe, UtensilsCrossed } from "lucide-react";

const plans = [
  { key: "free", priceAr: "مجاني", priceEn: "Free", featuresAr: ["30 مكون", "10 وصفات", "تكلفة الطعام الأساسية", "مورد واحد"], featuresEn: ["30 Ingredients", "10 Recipes", "Basic food costing", "1 Supplier"] },
  { key: "pro", priceAr: "25,000 د.ع/شهر", priceEn: "$19/mo", popular: true, featuresAr: ["مكونات غير محدودة", "وصفات غير محدودة", "تحليل المنافسة", "استيراد المبيعات", "تقارير متقدمة", "موردون متعددون", "تصدير PDF/Excel"], featuresEn: ["Unlimited Ingredients", "Unlimited Recipes", "Competition Analysis", "Sales Import", "Advanced Reports", "Multiple Suppliers", "PDF/Excel Export"] },
  { key: "elite", priceAr: "50,000 د.ع/شهر", priceEn: "$39/mo", featuresAr: ["كل ميزات Pro", "توصيات ذكية AI", "رادار المخاطر", "لوحة الإجراءات", "تنبيهات مخصصة", "دعم أولوية 24/7"], featuresEn: ["Everything in Pro", "AI Recommendations", "Risk Radar", "Action Board", "Custom Alerts", "Priority Support 24/7"] },
];

export default function PricingPage() {
  const { t, lang, setLang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 bg-card/50 glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">MenuProfit</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLang(isAr ? "en" : "ar")}><Globe className="w-4 h-4 me-1" />{isAr ? "EN" : "AR"}</Button>
            <Link to="/auth/login"><Button variant="outline" size="sm">{t("login")}</Button></Link>
          </div>
        </div>
      </nav>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-extrabold text-center mb-4">{t("pricingTitle")}</h1>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">{isAr ? "اختر الخطة التي تناسب حجم مطعمك واحتياجاتك" : "Choose the plan that fits your restaurant size and needs"}</p>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((p) => (
              <Card key={p.key} className={`relative ${p.popular ? "border-primary ring-2 ring-primary/20 scale-105" : ""}`}>
                {p.popular && <Badge className="absolute -top-3 start-4 gradient-primary border-0">{isAr ? "الأكثر شعبية" : "Most Popular"}</Badge>}
                <CardContent className="pt-8 pb-8">
                  <h3 className="text-2xl font-bold mb-1">{t(p.key)}</h3>
                  <p className="text-3xl font-extrabold text-primary mb-8">{isAr ? p.priceAr : p.priceEn}</p>
                  <ul className="space-y-3 mb-8">
                    {(isAr ? p.featuresAr : p.featuresEn).map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />{f}</li>
                    ))}
                  </ul>
                  <Link to="/auth/register"><Button className={`w-full ${p.popular ? "gradient-primary border-0" : ""}`} variant={p.popular ? "default" : "outline"}>{t("startTrial")}</Button></Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
