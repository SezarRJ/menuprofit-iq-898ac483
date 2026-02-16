import { Link } from "react-router-dom";

const routes = [
  { path: "/login", label: "تسجيل الدخول" },
  { path: "/signup", label: "إنشاء حساب" },
  { path: "/setup", label: "إعداد المطعم" },
  { path: "/dashboard", label: "لوحة التحكم" },
  { path: "/costs", label: "مصاريف المطعم" },
  { path: "/ingredients", label: "المواد الخام" },
  { path: "/recipes", label: "الوصفات" },
  { path: "/discount-rules", label: "قواعد الخصومات" },
  { path: "/sales", label: "المبيعات" },
  { path: "/ai-assistant", label: "المساعد الذكي" },
];

export default function Navigator() {
  return (
    <div dir="rtl" className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-6">🧭 صفحة التنقل (وضع النموذج الأولي)</h1>
      <ul className="space-y-3">
        {routes.map((r) => (
          <li key={r.path}>
            <Link
              to={r.path}
              className="text-lg text-primary underline hover:text-primary/80"
            >
              {r.label} — <code className="text-sm text-muted-foreground">{r.path}</code>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
