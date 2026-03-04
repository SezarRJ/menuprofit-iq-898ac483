import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles, ChevronLeft, DollarSign, Package, UtensilsCrossed,
  Percent, FileSpreadsheet, Check, EyeOff, Gift, Shield, Target
} from "lucide-react";

const features = [
  { icon: EyeOff, title: "التكلفة الحقيقية المخفية", desc: "اكشف التكاليف المخفية في مطبخك — الزيت، التغليف، الهدر، التنظيف" },
  { icon: DollarSign, title: "تسعير ذكي بـ 4 مستويات", desc: "الحد الأدنى، الموصى، الجذاب، المميز — مع شرح لكل سعر" },
  { icon: UtensilsCrossed, title: "ذكاء القائمة", desc: "اعرف أي طبق قوي وأيهم ضعيف — واحصل على توصيات تحسين" },
  { icon: Gift, title: "عروض مربحة بالذكاء", desc: "باقات وكومبو وخصومات آمنة — كلها محسوبة الهامش" },
  { icon: FileSpreadsheet, title: "استيراد بيانات سهل", desc: "استورد المكونات والمبيعات من Excel بخطوات بسيطة" },
  { icon: Sparkles, title: "ذكاء اصطناعي مدمج", desc: "توصيات يومية مدعومة بالذكاء الاصطناعي في كل صفحة" },
];

const plans = [
  {
    name: "مجاني", price: "0",
    features: ["لوحة تحكم القرارات", "إدارة المكونات", "إدارة الوصفات", "حساب التكلفة الحقيقية", "حتى 10 وصفات"],
    cta: "ابدأ مجاناً", highlighted: false,
  },
  {
    name: "احترافي", price: "25",
    features: ["كل ميزات المجاني", "وصفات غير محدودة", "محرك التسعير الذكي", "استوديو العروض", "تصدير التقارير"],
    cta: "اشترك الآن", highlighted: true,
  },
  {
    name: "مميز", price: "49",
    features: ["كل ميزات الاحترافي", "ذكاء اصطناعي متقدم", "تحليل القائمة الكامل", "دعم أولوي", "إشعارات يومية"],
    cta: "ابدأ تجربة مجانية", highlighted: false,
  },
];

const faqs = [
  { q: "ما هو SMARTMENU؟", a: "منصة ذكاء استراتيجي للمطاعم — تحلل قائمتك وتساعدك تسعّر وتروّج بذكاء. مصممة للسوق العراقي." },
  { q: "هل هو نظام POS أو محاسبة؟", a: "لا. SMARTMENU يركز فقط على ذكاء القائمة والتسعير والعروض — ليس نظام نقاط بيع ولا محاسبة." },
  { q: "هل يدعم الدينار العراقي؟", a: "نعم، IQD هي العملة الافتراضية مع إمكانية التبديل لـ USD." },
  { q: "كيف يعمل الذكاء الاصطناعي؟", a: "يحلل بياناتك الفعلية ويقدم توصيات تسعير وعروض — التوصيات لا تُطبق تلقائياً، أنت تقرر." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">SMARTMENU</h1>
          <div className="flex gap-3">
            <Button variant="ghost" asChild><Link to="/auth/login">تسجيل الدخول</Link></Button>
            <Button asChild><Link to="/auth/register">ابدأ مجاناً</Link></Button>
          </div>
        </div>
      </nav>

      <section className="py-20 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            قائمتك هي <span className="text-primary">أقوى أصولك</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            ذكاء القائمة، التسعير الذكي، العروض المربحة، والتكاليف المخفية — كل ما يحتاجه مطعمك في منصة واحدة.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" asChild className="text-lg px-8">
              <Link to="/auth/register">ابدأ مجاناً <ChevronLeft className="w-5 h-5 mr-2" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">ذكاء مطعمك في 6 أدوات</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardContent className="pt-6 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Target className="w-12 h-12 text-primary mx-auto" />
          <h2 className="text-3xl font-bold">ليس ERP — ذكاء قائمة فقط</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            SMARTMENU يركز على شيء واحد: تحويل بيانات مطعمك إلى قرارات يومية ذكية تزيد أرباحك.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-muted"><p className="font-bold mb-1">تسعير ذكي</p><p className="text-muted-foreground">4 مستويات سعر مع شرح</p></div>
            <div className="p-4 rounded-lg bg-muted"><p className="font-bold mb-1">تكاليف مخفية</p><p className="text-muted-foreground">الزيت، التغليف، الهدر</p></div>
            <div className="p-4 rounded-lg bg-muted"><p className="font-bold mb-1">عروض مربحة</p><p className="text-muted-foreground">باقات محسوبة الهامش</p></div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/50" id="pricing">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">خطط الأسعار</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p, i) => (
              <Card key={i} className={`shadow-card ${p.highlighted ? "border-primary border-2 relative" : ""}`}>
                {p.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">الأكثر شيوعاً</div>
                )}
                <CardContent className="pt-8 space-y-4">
                  <h3 className="text-xl font-bold">{p.name}</h3>
                  <div className="flex items-baseline gap-1"><span className="text-4xl font-extrabold">${p.price}</span><span className="text-muted-foreground">/شهر</span></div>
                  <ul className="space-y-2">
                    {p.features.map((f, j) => (<li key={j} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-primary shrink-0" />{f}</li>))}
                  </ul>
                  <Button className="w-full" variant={p.highlighted ? "default" : "outline"} asChild><Link to="/auth/register">{p.cta}</Link></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4" id="faq">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">الأسئلة الشائعة</h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <Card key={i} className="shadow-card">
                <CardContent className="pt-6"><h3 className="font-bold mb-2">{f.q}</h3><p className="text-sm text-muted-foreground">{f.a}</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span>© 2026 SMARTMENU. جميع الحقوق محفوظة.</span>
          <span>صُنع بـ ❤️ للمطاعم العربية</span>
        </div>
      </footer>
    </div>
  );
}