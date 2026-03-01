export interface MockIngredient {
  id: string; name: string; unit: string; price: number; change: number;
  supplier: string; usageCount: number; category: string;
  priceHistory: { date: string; price: number; supplier: string }[];
}

export interface MockRecipe {
  id: string; name: string; category: string; sellingPrice: number;
  foodCost: number; overhead: number; trueCost: number; margin: number;
  status: "healthy" | "belowTarget" | "critical" | "lossMaker";
  ingredients: { name: string; qty: number; unit: string; cost: number }[];
}

export interface MockCompetitor {
  id: string; name: string; location: string; tier: string;
  items: { name: string; category: string; price: number; date: string }[];
}

export interface MockRecommendation {
  id: string; type: string; title: string; reasoning: string;
  impact: string; confidence: number; status: "new" | "snoozed" | "approved" | "dismissed";
  createdAt: string;
}

export interface MockAction {
  id: string; title: string; type: string; priority: "high" | "medium" | "low";
  status: "new" | "approved" | "in_progress" | "done" | "cancelled";
  dueDate: string; assignee: string; recommendationId?: string;
}

export const mockIngredients: MockIngredient[] = [
  { id: "1", name: "صدر دجاج", unit: "كغم", price: 8500, change: 12, supplier: "شركة الأمل الغذائية", usageCount: 15, category: "لحوم", priceHistory: [{ date: "2026-01-01", price: 7500, supplier: "شركة الأمل الغذائية" }, { date: "2026-02-01", price: 8000, supplier: "شركة الأمل الغذائية" }, { date: "2026-03-01", price: 8500, supplier: "شركة الأمل الغذائية" }] },
  { id: "2", name: "لحم بقر مفروم", unit: "كغم", price: 18000, change: -3, supplier: "مؤسسة النهرين", usageCount: 8, category: "لحوم", priceHistory: [{ date: "2026-01-01", price: 19000, supplier: "مؤسسة النهرين" }, { date: "2026-02-01", price: 18500, supplier: "مؤسسة النهرين" }, { date: "2026-03-01", price: 18000, supplier: "مؤسسة النهرين" }] },
  { id: "3", name: "طماطم", unit: "كغم", price: 2000, change: 25, supplier: "سوق الجملة", usageCount: 22, category: "خضروات", priceHistory: [{ date: "2026-01-01", price: 1500, supplier: "سوق الجملة" }, { date: "2026-02-01", price: 1600, supplier: "سوق الجملة" }, { date: "2026-03-01", price: 2000, supplier: "سوق الجملة" }] },
  { id: "4", name: "بصل", unit: "كغم", price: 1500, change: 5, supplier: "سوق الجملة", usageCount: 25, category: "خضروات", priceHistory: [{ date: "2026-01-01", price: 1400, supplier: "سوق الجملة" }, { date: "2026-03-01", price: 1500, supplier: "سوق الجملة" }] },
  { id: "5", name: "أرز بسمتي", unit: "كغم", price: 4500, change: 0, supplier: "شركة الواحة", usageCount: 12, category: "حبوب", priceHistory: [{ date: "2026-01-01", price: 4500, supplier: "شركة الواحة" }, { date: "2026-03-01", price: 4500, supplier: "شركة الواحة" }] },
  { id: "6", name: "زيت زيتون", unit: "لتر", price: 12000, change: 18, supplier: "شركة الزيتون الذهبي", usageCount: 18, category: "زيوت", priceHistory: [{ date: "2026-01-01", price: 10000, supplier: "شركة الزيتون الذهبي" }, { date: "2026-03-01", price: 12000, supplier: "شركة الزيتون الذهبي" }] },
  { id: "7", name: "ثوم", unit: "كغم", price: 6000, change: -2, supplier: "سوق الجملة", usageCount: 20, category: "خضروات", priceHistory: [{ date: "2026-03-01", price: 6000, supplier: "سوق الجملة" }] },
  { id: "8", name: "لبن", unit: "لتر", price: 2500, change: 8, supplier: "مزرعة السعادة", usageCount: 10, category: "ألبان", priceHistory: [{ date: "2026-03-01", price: 2500, supplier: "مزرعة السعادة" }] },
  { id: "9", name: "خبز صمون", unit: "حبة", price: 250, change: 0, supplier: "مخبز الفرات", usageCount: 30, category: "مخبوزات", priceHistory: [{ date: "2026-03-01", price: 250, supplier: "مخبز الفرات" }] },
  { id: "10", name: "بهارات مشكلة", unit: "كغم", price: 25000, change: 10, supplier: "شركة العطار", usageCount: 28, category: "بهارات", priceHistory: [{ date: "2026-03-01", price: 25000, supplier: "شركة العطار" }] },
];

export const mockRecipes: MockRecipe[] = [
  { id: "1", name: "كباب لحم", category: "مشويات", sellingPrice: 15000, foodCost: 5200, overhead: 1500, trueCost: 6700, margin: 55.3, status: "healthy", ingredients: [{ name: "لحم بقر مفروم", qty: 0.25, unit: "كغم", cost: 4500 }, { name: "بصل", qty: 0.05, unit: "كغم", cost: 75 }, { name: "بهارات مشكلة", qty: 0.01, unit: "كغم", cost: 250 }, { name: "خبز صمون", qty: 2, unit: "حبة", cost: 500 }] },
  { id: "2", name: "شاورما دجاج", category: "ساندويتشات", sellingPrice: 7500, foodCost: 3100, overhead: 1500, trueCost: 4600, margin: 38.7, status: "belowTarget", ingredients: [{ name: "صدر دجاج", qty: 0.2, unit: "كغم", cost: 1700 }, { name: "طماطم", qty: 0.05, unit: "كغم", cost: 100 }, { name: "ثوم", qty: 0.01, unit: "كغم", cost: 60 }, { name: "خبز صمون", qty: 1, unit: "حبة", cost: 250 }] },
  { id: "3", name: "برياني دجاج", category: "أطباق رئيسية", sellingPrice: 12000, foodCost: 4800, overhead: 1500, trueCost: 6300, margin: 47.5, status: "healthy", ingredients: [{ name: "صدر دجاج", qty: 0.3, unit: "كغم", cost: 2550 }, { name: "أرز بسمتي", qty: 0.3, unit: "كغم", cost: 1350 }, { name: "بصل", qty: 0.1, unit: "كغم", cost: 150 }, { name: "بهارات مشكلة", qty: 0.02, unit: "كغم", cost: 500 }] },
  { id: "4", name: "فلافل (6 حبات)", category: "مقبلات", sellingPrice: 4000, foodCost: 800, overhead: 1500, trueCost: 2300, margin: 42.5, status: "healthy", ingredients: [{ name: "بصل", qty: 0.05, unit: "كغم", cost: 75 }, { name: "ثوم", qty: 0.02, unit: "كغم", cost: 120 }, { name: "بهارات مشكلة", qty: 0.01, unit: "كغم", cost: 250 }] },
  { id: "5", name: "حمص بطحينة", category: "مقبلات", sellingPrice: 5000, foodCost: 1200, overhead: 1500, trueCost: 2700, margin: 46.0, status: "healthy", ingredients: [{ name: "زيت زيتون", qty: 0.03, unit: "لتر", cost: 360 }, { name: "ثوم", qty: 0.02, unit: "كغم", cost: 120 }] },
  { id: "6", name: "تكة دجاج", category: "مشويات", sellingPrice: 10000, foodCost: 4200, overhead: 1500, trueCost: 5700, margin: 43.0, status: "healthy", ingredients: [{ name: "صدر دجاج", qty: 0.35, unit: "كغم", cost: 2975 }, { name: "لبن", qty: 0.1, unit: "لتر", cost: 250 }] },
  { id: "7", name: "سلطة فتوش", category: "سلطات", sellingPrice: 5000, foodCost: 3800, overhead: 1500, trueCost: 5300, margin: -6.0, status: "lossMaker", ingredients: [{ name: "طماطم", qty: 0.15, unit: "كغم", cost: 300 }, { name: "خبز صمون", qty: 1, unit: "حبة", cost: 250 }, { name: "زيت زيتون", qty: 0.05, unit: "لتر", cost: 600 }] },
  { id: "8", name: "عصير ليمون", category: "مشروبات", sellingPrice: 3000, foodCost: 600, overhead: 1500, trueCost: 2100, margin: 30.0, status: "belowTarget", ingredients: [] },
];

export const mockCompetitors: MockCompetitor[] = [
  { id: "1", name: "مطعم الشرق", location: "شارع المتنبي، بغداد", tier: "premium", items: [
    { name: "كباب لحم", category: "مشويات", price: 18000, date: "2026-02-20" },
    { name: "شاورما دجاج", category: "ساندويتشات", price: 8000, date: "2026-02-20" },
    { name: "برياني دجاج", category: "أطباق رئيسية", price: 14000, date: "2026-02-20" },
  ]},
  { id: "2", name: "مطعم النخيل", location: "شارع فلسطين، بغداد", tier: "mid-range", items: [
    { name: "كباب لحم", category: "مشويات", price: 13000, date: "2026-02-18" },
    { name: "شاورما دجاج", category: "ساندويتشات", price: 6500, date: "2026-02-18" },
    { name: "فلافل", category: "مقبلات", price: 3500, date: "2026-02-18" },
  ]},
  { id: "3", name: "مطعم بابل", location: "الكرادة، بغداد", tier: "premium", items: [
    { name: "كباب لحم", category: "مشويات", price: 20000, date: "2026-02-15" },
    { name: "تكة دجاج", category: "مشويات", price: 12000, date: "2026-02-15" },
  ]},
];

export const mockRecommendations: MockRecommendation[] = [
  { id: "1", type: "IncreasePrice", title: "رفع سعر الشاورما", reasoning: "هامش الربح الحالي 38.7% أقل من الهدف 45%. سعر المنافسين أعلى بـ 15%.", impact: "زيادة الهامش بـ 6.3% = ~450,000 د.ع شهرياً", confidence: 87, status: "new", createdAt: "2026-02-28" },
  { id: "2", type: "CostReduction", title: "تغيير مورد الطماطم", reasoning: "ارتفاع سعر الطماطم 25% خلال 3 أشهر. مورد بديل متاح بسعر أقل 10%.", impact: "توفير ~200,000 د.ع شهرياً", confidence: 72, status: "new", createdAt: "2026-02-27" },
  { id: "3", type: "Remove", title: "إزالة سلطة الفتوش من القائمة", reasoning: "الطبق خاسر بهامش -6%. لا يمكن رفع السعر بسبب المنافسة.", impact: "إيقاف خسارة ~180,000 د.ع شهرياً", confidence: 91, status: "new", createdAt: "2026-02-26" },
  { id: "4", type: "Promote", title: "ترويج البرياني كطبق اليوم", reasoning: "هامش ربح جيد 47.5% مع طلب متزايد. مبيعات أقل من الإمكانية.", impact: "زيادة مبيعات البرياني 20%", confidence: 65, status: "snoozed", createdAt: "2026-02-25" },
  { id: "5", type: "SupplierChange", title: "التحول لزيت زيتون محلي", reasoning: "ارتفاع سعر زيت الزيتون المستورد 18%. البديل المحلي بنفس الجودة.", impact: "توفير ~300,000 د.ع شهرياً", confidence: 78, status: "approved", createdAt: "2026-02-20" },
];

export const mockActions: MockAction[] = [
  { id: "1", title: "رفع سعر الشاورما إلى 8,500 د.ع", type: "IncreasePrice", priority: "high", status: "approved", dueDate: "2026-03-05", assignee: "أحمد", recommendationId: "1" },
  { id: "2", title: "التواصل مع مورد طماطم بديل", type: "CostReduction", priority: "medium", status: "in_progress", dueDate: "2026-03-10", assignee: "محمد" },
  { id: "3", title: "مراجعة قائمة السلطات", type: "Remove", priority: "high", status: "new", dueDate: "2026-03-07", assignee: "سارة" },
  { id: "4", title: "تجربة زيت الزيتون المحلي", type: "SupplierChange", priority: "medium", status: "done", dueDate: "2026-02-28", assignee: "أحمد", recommendationId: "5" },
  { id: "5", title: "تحديث أسعار القائمة المطبوعة", type: "IncreasePrice", priority: "low", status: "new", dueDate: "2026-03-15", assignee: "ليلى" },
];

export const mockSuppliers = [
  { id: "1", name: "شركة الأمل الغذائية", contact: "07801234567", items: 3, lastOrder: "2026-02-25" },
  { id: "2", name: "مؤسسة النهرين", contact: "07709876543", items: 2, lastOrder: "2026-02-20" },
  { id: "3", name: "سوق الجملة", contact: "—", items: 4, lastOrder: "2026-02-28" },
  { id: "4", name: "شركة الواحة", contact: "07801112233", items: 1, lastOrder: "2026-02-15" },
  { id: "5", name: "شركة الزيتون الذهبي", contact: "07705556677", items: 1, lastOrder: "2026-02-10" },
];

export const mockOverhead = {
  rent: 2500000, salaries: 5000000, utilities: 800000, marketing: 500000, other: 300000,
  baselinePlates: 6000,
  get total() { return this.rent + this.salaries + this.utilities + this.marketing + this.other; },
  get perPlate() { return Math.round(this.total / this.baselinePlates); },
  history: [
    { month: "2026-01", total: 8800000, perPlate: 1467 },
    { month: "2026-02", total: 9100000, perPlate: 1517 },
    { month: "2026-03", total: 9100000, perPlate: 1517 },
  ],
};

export const mockRisk = {
  overallScore: 42,
  trend: [35, 38, 40, 37, 42],
  marginRisk: 28,
  ingredientRisk: 55,
  concentrationRisk: 18,
  topFactors: [
    "ارتفاع أسعار الطماطم بنسبة 25%",
    "سلطة الفتوش تعمل بخسارة",
    "هامش الشاورما تحت الهدف",
  ],
  suggestedActions: [
    "تغيير مورد الطماطم",
    "إزالة أو تعديل سعر سلطة الفتوش",
    "رفع سعر الشاورما",
  ],
};

export const mockTenants = [
  { id: "1", name: "مطعم الوردة", owner: "أحمد محمد", plan: "elite", status: "active", created: "2025-12-01", ingredients: 45, recipes: 28 },
  { id: "2", name: "مطعم السلطان", owner: "خالد علي", plan: "pro", status: "active", created: "2026-01-15", ingredients: 30, recipes: 15 },
  { id: "3", name: "كافيه الربيع", owner: "سارة حسن", plan: "free", status: "active", created: "2026-02-10", ingredients: 12, recipes: 8 },
  { id: "4", name: "مطعم الخليج", owner: "عمر يوسف", plan: "pro", status: "suspended", created: "2026-01-20", ingredients: 25, recipes: 12 },
];
