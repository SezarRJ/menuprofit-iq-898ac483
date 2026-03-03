import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "ar" | "en";
export type Direction = "rtl" | "ltr";

const t_ar: Record<string, string> = {
  dashboard: "لوحة التحكم",
  dataHub: "مركز البيانات",
  ingredients: "المكونات",
  salesData: "بيانات المبيعات",
  operatingCosts: "تكاليف التشغيل",
  fixedCosts: "التكاليف الثابتة",
  hiddenCosts: "التكاليف المخفية",
  suppliers: "الموردون",
  menuStudio: "استوديو القائمة",
  recipes: "الوصفات",
  newRecipe: "وصفة جديدة",
  pricingEngine: "محرك التسعير",
  promotionStudio: "استوديو العروض",
  promotions: "العروض",
  loyalty: "برنامج الولاء",
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
  heroTitle: "حوّل قائمتك إلى آلة أرباح",
  heroSubtitle: "تسعير ذكي، عروض مربحة، وبرنامج ولاء — كل ما يحتاجه مطعمك في الموصل",
  pricingTitle: "اختر الخطة المناسبة لك",
  contactUs: "تواصل معنا",
  termsOfService: "شروط الخدمة",
  privacyPolicy: "سياسة الخصوصية",
  allRightsReserved: "جميع الحقوق محفوظة",
  quickActions: "إجراءات سريعة",
  addIngredient: "إضافة مكون",
  importIngredients: "استيراد المكونات",
  importSales: "استيراد المبيعات",
  createRecipe: "إنشاء وصفة",
  totalRecipes: "إجمالي الوصفات",
  priceChangesNeeded: "تغييرات أسعار مطلوبة",
  highCostRecipes: "وصفات مكلفة",
  suggestedImprovements: "تحسينات مقترحة",
  removeRecipes: "وصفات للحذف",
  promoOpportunities: "فرص ترويجية",
  topActionsToday: "أهم إجراءات اليوم",
  overheadPerPlate: "التكلفة العامة للطبق",
  masterAdmin: "إدارة النظام",
  tenants: "المستأجرون",
  auditLogs: "سجلات المراجعة",
  featureFlags: "إدارة الميزات",
  aiControls: "إعدادات الذكاء",
  bulkImport: "استيراد جماعي",
  minSafePrice: "الحد الأدنى الآمن",
  recommendedPrice: "السعر الموصى",
  attractivePrice: "السعر الجذاب",
  premiumPrice: "السعر المميز",
  generatePricing: "توليد الأسعار",
  bundles: "باقات",
  combos: "كومبو",
  seasonal: "موسمية",
  loyaltyProgram: "برنامج الولاء",
  points: "نقاط",
  customers: "العملاء",
  aiChat: "المساعد الذكي",
};

const t_en: Record<string, string> = {
  dashboard: "Dashboard",
  dataHub: "Data Hub",
  ingredients: "Ingredients",
  salesData: "Sales Data",
  operatingCosts: "Operating Costs",
  fixedCosts: "Fixed Costs",
  hiddenCosts: "Hidden Costs",
  suppliers: "Suppliers",
  menuStudio: "Menu Studio",
  recipes: "Recipes",
  newRecipe: "New Recipe",
  pricingEngine: "Pricing Engine",
  promotionStudio: "Promotion Studio",
  promotions: "Promotions",
  loyalty: "Loyalty Program",
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
  heroTitle: "Turn Your Menu Into a Profit Machine",
  heroSubtitle: "Smart pricing, profitable promotions, and loyalty — everything your Mosul restaurant needs",
  pricingTitle: "Choose the Right Plan",
  contactUs: "Contact Us",
  termsOfService: "Terms of Service",
  privacyPolicy: "Privacy Policy",
  allRightsReserved: "All Rights Reserved",
  quickActions: "Quick Actions",
  addIngredient: "Add Ingredient",
  importIngredients: "Import Ingredients",
  importSales: "Import Sales",
  createRecipe: "Create Recipe",
  totalRecipes: "Total Recipes",
  priceChangesNeeded: "Price Changes Needed",
  highCostRecipes: "High Cost Recipes",
  suggestedImprovements: "Suggested Improvements",
  removeRecipes: "Recipes to Remove",
  promoOpportunities: "Promo Opportunities",
  topActionsToday: "Top Actions Today",
  overheadPerPlate: "Overhead per Plate",
  masterAdmin: "Master Admin",
  tenants: "Tenants",
  auditLogs: "Audit Logs",
  featureFlags: "Feature Flags",
  aiControls: "AI Controls",
  bulkImport: "Bulk Import",
  minSafePrice: "Minimum Safe Price",
  recommendedPrice: "Recommended Price",
  attractivePrice: "Attractive Price",
  premiumPrice: "Premium Price",
  generatePricing: "Generate Pricing",
  bundles: "Bundles",
  combos: "Combos",
  seasonal: "Seasonal",
  loyaltyProgram: "Loyalty Program",
  points: "Points",
  customers: "Customers",
  aiChat: "AI Assistant",
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
