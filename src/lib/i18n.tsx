import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "ar" | "en";
export type Direction = "rtl" | "ltr";

const t_ar: Record<string, string> = {
  // Navigation
  dashboard: "لوحة التحكم",
  dataHub: "مركز البيانات",
  ingredients: "المكونات",
  salesData: "بيانات المبيعات",
  operatingCosts: "تكاليف التشغيل",
  fixedCosts: "التكاليف الثابتة",
  hiddenCosts: "التكاليف المخفية",
  overhead: "المصاريف العامة",
  suppliers: "الموردون",
  menuStudio: "استوديو القائمة",
  recipes: "الوصفات",
  newRecipe: "وصفة جديدة",
  pricingEngine: "محرك التسعير",
  promotionStudio: "استوديو العروض",
  promotions: "العروض",
  competition: "المنافسة",
  aiRecommendations: "توصيات الذكاء",
  actions: "الإجراءات",
  riskRadar: "رادار المخاطر",
  reports: "التقارير",
  settings: "الإعدادات",
  profile: "الملف الشخصي",
  restaurant: "إعدادات المطعم",
  inventory: "المخزون",

  // Intelligence section
  intelligenceSection: "الذكاء",
  insightsSection: "الرؤى",
  menuStudioSection: "استوديو القائمة",
  operationsSection: "العمليات",

  // Actions
  add: "إضافة",
  edit: "تعديل",
  delete: "حذف",
  save: "حفظ",
  cancel: "إلغاء",
  search: "بحث...",
  filter: "تصفية",
  export: "تصدير",
  import: "استيراد",

  // Plans
  free: "مجاني",
  pro: "احترافي",
  elite: "مميز",

  // Status
  healthy: "صحي",
  belowTarget: "تحت الهدف",
  critical: "حرج",
  lossMaker: "خاسر",
  noData: "لا توجد بيانات",
  loading: "جاري التحميل...",

  // Fields
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

  // Auth
  login: "تسجيل الدخول",
  register: "إنشاء حساب",
  email: "البريد الإلكتروني",
  password: "كلمة المرور",
  logout: "تسجيل الخروج",

  // Settings
  notifications: "الإشعارات",
  language: "اللغة",
  upgrade: "ترقية",
  lockedFeature: "هذه الميزة تتطلب خطة أعلى",

  // Landing
  startTrial: "ابدأ تجربتك المجانية",
  heroTitle: "حوّل قائمتك إلى آلة أرباح",
  heroSubtitle: "تسعير ذكي، عروض مربحة، وتكلفة مطبخ حقيقية — كل ما يحتاجه مطعمك",
  pricingTitle: "اختر الخطة المناسبة لك",
  contactUs: "تواصل معنا",
  termsOfService: "شروط الخدمة",
  privacyPolicy: "سياسة الخصوصية",
  allRightsReserved: "جميع الحقوق محفوظة",

  // Dashboard
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
  recipesBelow: "وصفات تحت الهدف",
  ingredientAlerts: "تنبيهات مكونات",
  competitionGaps: "فجوات تنافسية",

  // Admin
  masterAdmin: "إدارة النظام",
  tenants: "المستأجرون",
  auditLogs: "سجلات المراجعة",
  featureFlags: "إدارة الميزات",
  aiControls: "إعدادات الذكاء",
  bulkImport: "استيراد جماعي",

  // Pricing
  minSafePrice: "الحد الأدنى الآمن",
  recommendedPrice: "السعر الموصى",
  attractivePrice: "السعر الجذاب",
  premiumPrice: "السعر المميز",
  generatePricing: "توليد الأسعار",

  // Promotions
  bundles: "باقات",
  combos: "كومبو",
  seasonal: "موسمية",
  loyaltyProgram: "برنامج الولاء",
  points: "نقاط",
  customers: "العملاء",

  // AI
  aiChat: "المساعد الذكي",

  // Kitchen Cost Engine
  directCost: "تكلفة مباشرة",
  indirectCost: "تكلفة غير مباشرة",
  kitchenLoad: "حمل المطبخ",
  packagingCost: "تكلفة التغليف",
  washingCost: "تكلفة الغسيل",
  wasteCost: "تكلفة الهدر",
  overheadAllocation: "توزيع المصاريف",
  kitchenProfile: "ملف المطبخ",
  lightCook: "طبخ خفيف",
  mediumCook: "طبخ متوسط",
  heavyCook: "طبخ ثقيل",
  packagingChannel: "قناة التغليف",
  dineIn: "داخل المطعم",
  takeaway: "سفري",
  delivery: "توصيل",
  yieldPct: "نسبة الاستفادة %",
  wastePct: "نسبة الهدر %",
  alertThreshold: "حد التنبيه",
  priceHistory: "سجل الأسعار",

  // Competition
  competitors: "المنافسون",
  marketAverage: "متوسط السوق",
  priceIndex: "مؤشر السعر",
  overpriced: "سعر مرتفع",
  underpriced: "سعر منخفض",

  // Risk
  riskScore: "درجة المخاطر",
  marginRisk: "مخاطر الهامش",
  ingredientRisk: "مخاطر المكونات",
  concentrationRisk: "مخاطر التركيز",

  // Reports
  costMarginReport: "تقرير التكاليف والهوامش",
  ingredientSpikeReport: "تقرير تأثير ارتفاع المكونات",
  competitionReport: "تقرير المنافسة",
  pricingReport: "تقرير فرص التسعير",
  promotionReport: "تقرير فرص العروض",

  // Settings - Kitchen
  kitchenSettings: "إعدادات المطبخ",
  packagingDefaults: "افتراضيات التغليف",
  washingDefaults: "تكلفة الغسيل للطبق",
  wasteAllocation: "ميزانية الهدر الشهرية",
  minMarginFloor: "حد الهامش الأدنى %",
  baselinePlates: "عدد الأطباق الأساسي",
};

const t_en: Record<string, string> = {
  dashboard: "Dashboard",
  dataHub: "Data Hub",
  ingredients: "Ingredients",
  salesData: "Sales Data",
  operatingCosts: "Operating Costs",
  fixedCosts: "Fixed Costs",
  hiddenCosts: "Hidden Costs",
  overhead: "Overhead",
  suppliers: "Suppliers",
  menuStudio: "Menu Studio",
  recipes: "Recipes",
  newRecipe: "New Recipe",
  pricingEngine: "Pricing Engine",
  promotionStudio: "Promotion Studio",
  promotions: "Promotions",
  competition: "Competition",
  aiRecommendations: "AI Recommendations",
  actions: "Actions",
  riskRadar: "Risk Radar",
  reports: "Reports",
  settings: "Settings",
  profile: "Profile",
  restaurant: "Restaurant Settings",
  inventory: "Inventory",
  intelligenceSection: "Intelligence",
  insightsSection: "Insights",
  menuStudioSection: "Menu Studio",
  operationsSection: "Operations",
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
  heroSubtitle: "Smart pricing, profitable promotions, and true kitchen costing — everything your restaurant needs",
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
  recipesBelow: "Below Target",
  ingredientAlerts: "Ingredient Alerts",
  competitionGaps: "Competition Gaps",
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
  directCost: "Direct Cost",
  indirectCost: "Indirect Cost",
  kitchenLoad: "Kitchen Load",
  packagingCost: "Packaging",
  washingCost: "Washing/Cleaning",
  wasteCost: "Waste Allocation",
  overheadAllocation: "Overhead Allocation",
  kitchenProfile: "Kitchen Profile",
  lightCook: "Light Cook",
  mediumCook: "Medium Cook",
  heavyCook: "Heavy Cook",
  packagingChannel: "Packaging Channel",
  dineIn: "Dine-in",
  takeaway: "Takeaway",
  delivery: "Delivery",
  yieldPct: "Yield %",
  wastePct: "Waste %",
  alertThreshold: "Alert Threshold",
  priceHistory: "Price History",
  competitors: "Competitors",
  marketAverage: "Market Average",
  priceIndex: "Price Index",
  overpriced: "Overpriced",
  underpriced: "Underpriced",
  riskScore: "Risk Score",
  marginRisk: "Margin Risk",
  ingredientRisk: "Ingredient Risk",
  concentrationRisk: "Concentration Risk",
  costMarginReport: "Cost & Margin Report",
  ingredientSpikeReport: "Ingredient Spike Impact",
  competitionReport: "Competition Report",
  pricingReport: "Pricing Opportunity Report",
  promotionReport: "Promotion Opportunity Report",
  kitchenSettings: "Kitchen Settings",
  packagingDefaults: "Packaging Defaults",
  washingDefaults: "Washing Cost/Plate",
  wasteAllocation: "Monthly Waste Budget",
  minMarginFloor: "Min Margin Floor %",
  baselinePlates: "Baseline Plates",
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
