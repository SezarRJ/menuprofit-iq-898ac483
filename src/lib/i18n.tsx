import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "ar" | "en";
export type Direction = "rtl" | "ltr";

const t_ar: Record<string, string> = {
  dashboard: "لوحة التحكم",
  ingredients: "المكونات",
  suppliers: "الموردون",
  overhead: "التكاليف العامة",
  recipes: "الوصفات",
  newRecipe: "وصفة جديدة",
  salesImport: "استيراد المبيعات",
  competition: "المنافسة",
  competitors: "المنافسون",
  competitorItems: "أصناف المنافسين",
  competitorMapping: "ربط الأصناف",
  competitionReport: "تقرير المنافسة",
  reports: "التقارير",
  recommendations: "التوصيات",
  riskRadar: "رادار المخاطر",
  actions: "الإجراءات",
  settings: "الإعدادات",
  profile: "الملف الشخصي",
  restaurant: "إعدادات المطعم",
  add: "إضافة",
  edit: "تعديل",
  delete: "حذف",
  save: "حفظ",
  cancel: "إلغاء",
  search: "بحث...",
  filter: "تصفية",
  export: "تصدير",
  import: "استيراد",
  free: "مجاني",
  pro: "احترافي",
  elite: "مميز",
  healthy: "صحي",
  belowTarget: "تحت الهدف",
  critical: "حرج",
  lossMaker: "خاسر",
  noData: "لا توجد بيانات",
  loading: "جاري التحميل...",
  name: "الاسم",
  unit: "الوحدة",
  price: "السعر",
  category: "الفئة",
  margin: "الهامش",
  cost: "التكلفة",
  foodCost: "تكلفة الطعام",
  overheadCost: "التكلفة العامة",
  trueCost: "التكلفة الحقيقية",
  sellingPrice: "سعر البيع",
  quantity: "الكمية",
  supplier: "المورد",
  date: "التاريخ",
  status: "الحالة",
  change: "التغيير",
  approve: "موافقة",
  dismiss: "رفض",
  snooze: "تأجيل",
  riskScore: "درجة المخاطر",
  login: "تسجيل الدخول",
  register: "إنشاء حساب",
  email: "البريد الإلكتروني",
  password: "كلمة المرور",
  logout: "تسجيل الخروج",
  notifications: "الإشعارات",
  language: "اللغة",
  upgrade: "ترقية",
  lockedFeature: "هذه الميزة تتطلب خطة أعلى",
  startTrial: "ابدأ تجربتك المجانية",
  heroTitle: "حوّل مطعمك إلى آلة أرباح",
  heroSubtitle: "تتبع التكاليف، حلل المنافسة، واحصل على توصيات ذكية لزيادة أرباحك",
  pricingTitle: "اختر الخطة المناسبة لك",
  contactUs: "تواصل معنا",
  termsOfService: "شروط الخدمة",
  privacyPolicy: "سياسة الخصوصية",
  allRightsReserved: "جميع الحقوق محفوظة",
  quickActions: "إجراءات سريعة",
  addIngredient: "إضافة مكون",
  importIngredients: "استيراد المكونات",
  createRecipe: "إنشاء وصفة",
  addCompetitor: "إضافة منافس",
  riskGauge: "مقياس المخاطر",
  ingredientAlerts: "تنبيهات المكونات",
  overheadPerPlate: "التكلفة العامة للطبق",
  competitionSummary: "ملخص المنافسة",
  aiFeed: "توصيات الذكاء الاصطناعي",
  masterAdmin: "إدارة النظام",
  tenants: "المستأجرون",
  auditLogs: "سجلات المراجعة",
  featureFlags: "إدارة الميزات",
  aiControls: "إعدادات الذكاء",
  bulkImport: "استيراد جماعي",
};

const t_en: Record<string, string> = {
  dashboard: "Dashboard",
  ingredients: "Ingredients",
  suppliers: "Suppliers",
  overhead: "Overhead",
  recipes: "Recipes",
  newRecipe: "New Recipe",
  salesImport: "Sales Import",
  competition: "Competition",
  competitors: "Competitors",
  competitorItems: "Competitor Items",
  competitorMapping: "Item Mapping",
  competitionReport: "Competition Report",
  reports: "Reports",
  recommendations: "Recommendations",
  riskRadar: "Risk Radar",
  actions: "Actions",
  settings: "Settings",
  profile: "Profile",
  restaurant: "Restaurant Settings",
  add: "Add",
  edit: "Edit",
  delete: "Delete",
  save: "Save",
  cancel: "Cancel",
  search: "Search...",
  filter: "Filter",
  export: "Export",
  import: "Import",
  free: "Free",
  pro: "Pro",
  elite: "Elite",
  healthy: "Healthy",
  belowTarget: "Below Target",
  critical: "Critical",
  lossMaker: "Loss Maker",
  noData: "No data available",
  loading: "Loading...",
  name: "Name",
  unit: "Unit",
  price: "Price",
  category: "Category",
  margin: "Margin",
  cost: "Cost",
  foodCost: "Food Cost",
  overheadCost: "Overhead",
  trueCost: "True Cost",
  sellingPrice: "Selling Price",
  quantity: "Quantity",
  supplier: "Supplier",
  date: "Date",
  status: "Status",
  change: "Change",
  approve: "Approve",
  dismiss: "Dismiss",
  snooze: "Snooze",
  riskScore: "Risk Score",
  login: "Login",
  register: "Register",
  email: "Email",
  password: "Password",
  logout: "Logout",
  notifications: "Notifications",
  language: "Language",
  upgrade: "Upgrade",
  lockedFeature: "This feature requires a higher plan",
  startTrial: "Start Free Trial",
  heroTitle: "Turn Your Restaurant Into a Profit Machine",
  heroSubtitle: "Track costs, analyze competition, and get smart recommendations to boost profits",
  pricingTitle: "Choose the Right Plan",
  contactUs: "Contact Us",
  termsOfService: "Terms of Service",
  privacyPolicy: "Privacy Policy",
  allRightsReserved: "All Rights Reserved",
  quickActions: "Quick Actions",
  addIngredient: "Add Ingredient",
  importIngredients: "Import Ingredients",
  createRecipe: "Create Recipe",
  addCompetitor: "Add Competitor",
  riskGauge: "Risk Gauge",
  ingredientAlerts: "Ingredient Alerts",
  overheadPerPlate: "Overhead per Plate",
  competitionSummary: "Competition Summary",
  aiFeed: "AI Recommendations",
  masterAdmin: "Master Admin",
  tenants: "Tenants",
  auditLogs: "Audit Logs",
  featureFlags: "Feature Flags",
  aiControls: "AI Controls",
  bulkImport: "Bulk Import",
};

const translations: Record<Language, Record<string, string>> = { ar: t_ar, en: t_en };

interface I18nContextType {
  lang: Language;
  dir: Direction;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(
    () => (localStorage.getItem("lang") as Language) || "ar"
  );
  const dir: Direction = lang === "ar" ? "rtl" : "ltr";

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    document.documentElement.classList.add("dark");
  }, [lang, dir]);

  const t = (key: string) => translations[lang]?.[key] || translations.ar[key] || key;

  return (
    <I18nContext.Provider value={{ lang, dir, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useLanguage must be used within I18nProvider");
  return ctx;
}
