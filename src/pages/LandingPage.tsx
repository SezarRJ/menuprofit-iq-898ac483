import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  UtensilsCrossed, BarChart3, Shield, Sparkles, ChevronLeft,
  DollarSign, Package, Percent, FileSpreadsheet, Check
} from "lucide-react";

const features = [
  { icon: DollarSign, title: "حساب التكلفة الحقيقية", desc: "احسب التكلفة الفعلية لكل طبق شاملة المصاريف التشغيلية" },
  { icon: Package, title: "إدارة المواد الخام", desc: "تتبع أسعار المكونات وتحديثها بسهولة" },
  { icon: UtensilsCrossed, title: "إدارة الوصفات", desc: "أنشئ وصفات مفصلة مع حساب الهوامش تلقائياً" },
  { icon: FileSpreadsheet, title: "استيراد المبيعات", desc: "استورد بيانات المبيعات من Excel مع مطابقة ذكية" },
  { icon: Sparkles, title: "مساعد ذكي بالعربية", desc: "احصل على تحليلات واقتراحات مدعومة بالذكاء الاصطناعي" },
  { icon: Percent, title: "عروض ذكية", desc: "اقتراحات خصومات آمنة بناءً على حجم المبيعات" },
];

const plans = [
  {
    name: "مجاني",
    price: "0",
    features: ["لوحة تحكم كاملة", "إدارة المواد الخام", "إدارة الوصفات", "حساب التكلفة الحقيقية", "حتى 10 وصفات"],
    cta: "ابدأ مجاناً",
    highlighted: false,
  },
  {
    name: "احترافي",
    price: "25",
    features: ["كل ميزات المجاني", "وصفات غير محدودة", "استيراد المبيعات", "قواعد الخصومات", "تصدير التقارير"],
    cta: "اشترك الآن",
    highlighted: true,
  },
  {
    name: "مميز",
    price: "49",
    features: ["كل ميزات الاحترافي", "المساعد الذكي (AI)", "تحليلات متقدمة", "دعم أولوي", "100,000 توكن/شهر"],
    cta: "ابدأ تجربة مجانية",
    highlighted: false,
  },
];

const faqs = [
  { q: "ما هو MenuProfit؟", a: "منصة متخصصة في تحليل تكاليف المطاعم وتسعير الأطباق، مصممة للسوق العراقي والعربي." },
  { q: "هل البيانات آمنة؟", a: "نعم، نستخدم تشفير متقدم وعزل كامل للبيانات بين المطاعم مع سجلات مراجعة شاملة." },
  { q: "هل يدعم الدينار العراقي؟", a: "نعم، يدعم MenuProfit الدينار العراقي (IQD) والدولار الأمريكي (USD)." },
  { q: "كيف يعمل المساعد الذكي؟", a: "يحلل بيانات مطعمك الفعلية ويقدم توصيات لتحسين الأسعار وتقليل التكاليف — توصيات فقط ولا تُطبق تلقائياً." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">MenuProfit</h1>
          <div className="flex gap-3">
            <Button variant="ghost" asChild><Link to="/login">تسجيل الدخول</Link></Button>
            <Button asChild><Link to="/signup">ابدأ مجاناً</Link></Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            اعرف <span className="text-primary">التكلفة الحقيقية</span> لكل طبق
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            منصة ذكية لتحليل تكاليف المطاعم وتسعير الأطباق بدقة. صُممت للسوق العراقي والعربي.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" asChild className="text-lg px-8">
              <Link to="/signup">ابدأ مجاناً <ChevronLeft className="w-5 h-5 mr-2" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/50" id="features">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">كل ما تحتاجه لإدارة تكاليف مطعمك</h2>
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

      {/* Security */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Shield className="w-12 h-12 text-primary mx-auto" />
          <h2 className="text-3xl font-bold">أمان على مستوى المؤسسات</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-muted">
              <p className="font-bold mb-1">عزل كامل للبيانات</p>
              <p className="text-muted-foreground">كل مطعم معزول تماماً عن الآخر</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="font-bold mb-1">سجل مراجعة شامل</p>
              <p className="text-muted-foreground">كل تعديل مسجل مع التفاصيل</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="font-bold mb-1">تحكم بالصلاحيات</p>
              <p className="text-muted-foreground">أدوار متعددة مع صلاحيات دقيقة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 bg-muted/50" id="pricing">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">خطط الأسعار</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p, i) => (
              <Card key={i} className={`shadow-card ${p.highlighted ? "border-primary border-2 relative" : ""}`}>
                {p.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    الأكثر شيوعاً
                  </div>
                )}
                <CardContent className="pt-8 space-y-4">
                  <h3 className="text-xl font-bold">{p.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">${p.price}</span>
                    <span className="text-muted-foreground">/شهر</span>
                  </div>
                  <ul className="space-y-2">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={p.highlighted ? "default" : "outline"} asChild>
                    <Link to="/signup">{p.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4" id="faq">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">الأسئلة الشائعة</h2>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <Card key={i} className="shadow-card">
                <CardContent className="pt-6">
                  <h3 className="font-bold mb-2">{f.q}</h3>
                  <p className="text-sm text-muted-foreground">{f.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span>© 2026 MenuProfit. جميع الحقوق محفوظة.</span>
          <span>صُنع بـ ❤️ للمطاعم العربية</span>
        </div>
      </footer>
    </div>
  );
}
