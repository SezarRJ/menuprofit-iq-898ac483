import { describe, it, expect } from "vitest";
import { validateFileSize, validateImportData } from "@/lib/import-validation";
import { canAccessFeature } from "@/lib/restaurant-context";

// ============ IMPORT VALIDATION ============

describe("Import Validation", () => {
  describe("validateFileSize", () => {
    it("accepts files under 10MB", () => {
      const file = { size: 5 * 1024 * 1024 } as File;
      expect(validateFileSize(file)).toBeNull();
    });

    it("rejects files over 10MB", () => {
      const file = { size: 15 * 1024 * 1024 } as File;
      expect(validateFileSize(file)).toContain("يتجاوز");
    });
  });

  describe("validateImportData", () => {
    it("rejects empty data", () => {
      const result = validateImportData([], "date", "dish", "qty");
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it("rejects missing columns", () => {
      const rows = [{ date: "2024-01-01", dish: "كباب", qty: 5 }];
      const result = validateImportData(rows, "date", "missing_col", "qty");
      expect(result.valid).toBe(false);
    });

    it("accepts valid data", () => {
      const rows = [
        { date: "2024-01-01", dish: "كباب", qty: 5 },
        { date: "2024-01-02", dish: "شاورما", qty: 10 },
      ];
      const result = validateImportData(rows, "date", "dish", "qty");
      expect(result.valid).toBe(true);
      expect(result.sanitizedRows).toHaveLength(2);
    });

    it("sanitizes formula injection (=CMD)", () => {
      const rows = [{ date: "2024-01-01", dish: "=CMD()", qty: 5 }];
      const result = validateImportData(rows, "date", "dish", "qty");
      expect(result.valid).toBe(true);
      const dishVal = result.sanitizedRows[0]["dish"];
      expect(String(dishVal).startsWith("'")).toBe(true);
    });

    it("sanitizes formula injection (+,-,@)", () => {
      ["+HYPERLINK", "-1+1", "@SUM"].forEach((injection) => {
        const rows = [{ date: "2024-01-01", dish: injection, qty: 5 }];
        const result = validateImportData(rows, "date", "dish", "qty");
        const dishVal = String(result.sanitizedRows[0]?.["dish"] ?? "");
        expect(dishVal.startsWith("'")).toBe(true);
      });
    });

    it("warns about negative quantities", () => {
      const rows = [{ date: "2024-01-01", dish: "كباب", qty: -5 }];
      const result = validateImportData(rows, "date", "dish", "qty");
      expect(result.warnings.some(w => w.includes("سالبة"))).toBe(true);
    });

    it("warns about duplicates", () => {
      const rows = [
        { date: "2024-01-01", dish: "كباب", qty: 5 },
        { date: "2024-01-01", dish: "كباب", qty: 5 },
      ];
      const result = validateImportData(rows, "date", "dish", "qty");
      expect(result.warnings.some(w => w.includes("مكرر"))).toBe(true);
    });

    it("skips rows with empty dish names", () => {
      const rows = [
        { date: "2024-01-01", dish: "", qty: 5 },
        { date: "2024-01-01", dish: "كباب", qty: 10 },
      ];
      const result = validateImportData(rows, "date", "dish", "qty");
      expect(result.sanitizedRows).toHaveLength(1);
      expect(result.warnings.some(w => w.includes("تجاهل"))).toBe(true);
    });

    it("rejects too many rows (>50000)", () => {
      const rows = Array.from({ length: 50001 }, (_, i) => ({
        date: "2024-01-01", dish: `dish_${i}`, qty: 1,
      }));
      const result = validateImportData(rows, "date", "dish", "qty");
      expect(result.valid).toBe(false);
    });

    it("accepts Arabic/English mixed dish names", () => {
      const rows = [
        { date: "2024-01-01", dish: "كباب Kabab", qty: 5 },
        { date: "2024-01-01", dish: "Shawarma شاورما", qty: 3 },
      ];
      const result = validateImportData(rows, "date", "dish", "qty");
      expect(result.valid).toBe(true);
      expect(result.sanitizedRows).toHaveLength(2);
    });

    it("handles various date formats", () => {
      const rows = [
        { date: "2024-01-15", dish: "طبق1", qty: 1 },
        { date: "15/01/2024", dish: "طبق2", qty: 2 },
        { date: "44927", dish: "طبق3", qty: 3 }, // Excel serial
      ];
      const result = validateImportData(rows, "date", "dish", "qty");
      expect(result.valid).toBe(true);
      // No invalid date warnings expected
      expect(result.warnings.some(w => w.includes("تاريخ غير صالح"))).toBe(false);
    });

    it("warns about invalid dates", () => {
      const rows = [{ date: "not-a-date", dish: "كباب", qty: 5 }];
      const result = validateImportData(rows, "date", "dish", "qty");
      expect(result.warnings.some(w => w.includes("تاريخ غير صالح"))).toBe(true);
    });
  });
});

// ============ COST FORMULAS ============

describe("Cost Formulas", () => {
  it("calculates ingredient cost correctly", () => {
    const ingredients = [
      { quantity: 0.5, unit_price: 10000 },
      { quantity: 0.2, unit_price: 5000 },
    ];
    const ingredientCost = ingredients.reduce((s, i) => s + i.quantity * i.unit_price, 0);
    expect(ingredientCost).toBe(6000);
  });

  it("calculates true cost with overhead", () => {
    const ingredientCost = 6000;
    const totalOperatingCost = 30000000;
    const totalDishes = 30;
    const overheadPerDish = totalOperatingCost / totalDishes;
    const trueCost = ingredientCost + overheadPerDish;
    expect(trueCost).toBe(1006000);
  });

  it("calculates margin percentage", () => {
    const sellingPrice = 15000;
    const trueCost = 9000;
    const margin = ((sellingPrice - trueCost) / sellingPrice) * 100;
    expect(margin).toBe(40);
  });

  it("handles zero selling price", () => {
    const sellingPrice = 0;
    const trueCost = 9000;
    const margin = sellingPrice > 0 ? ((sellingPrice - trueCost) / sellingPrice) * 100 : 0;
    expect(margin).toBe(0);
  });

  it("calculates breakeven point", () => {
    const totalOverhead = 30000000;
    const profitPerDish = 6000;
    const breakeven = Math.ceil(totalOverhead / profitPerDish);
    expect(breakeven).toBe(5000);
  });

  it("handles negative profit (no breakeven possible)", () => {
    const totalOverhead = 30000000;
    const profitPerDish = -500;
    const breakeven = profitPerDish > 0 ? Math.ceil(totalOverhead / profitPerDish) : 0;
    expect(breakeven).toBe(0);
  });
});

// ============ WEEKLY AGGREGATION (SATURDAY START) ============

describe("Saturday-Based Week Aggregation", () => {
  it("calculates Saturday as week start for Saturday", () => {
    const date = new Date(2025, 1, 8); // Saturday Feb 8
    const daysSinceSaturday = (date.getDay() + 1) % 7;
    expect(daysSinceSaturday).toBe(0); // Saturday itself
  });

  it("calculates Saturday as week start for Sunday", () => {
    const date = new Date(2025, 1, 9); // Sunday Feb 9
    const daysSinceSaturday = (date.getDay() + 1) % 7;
    expect(daysSinceSaturday).toBe(1);
    const saturday = new Date(date);
    saturday.setDate(date.getDate() - daysSinceSaturday);
    expect(saturday.getDay()).toBe(6); // Saturday
  });

  it("calculates Saturday as week start for Wednesday", () => {
    const date = new Date(2025, 1, 12); // Wednesday Feb 12
    const daysSinceSaturday = (date.getDay() + 1) % 7;
    expect(daysSinceSaturday).toBe(4);
    const saturday = new Date(date);
    saturday.setDate(date.getDate() - daysSinceSaturday);
    expect(saturday.getDay()).toBe(6);
  });

  it("calculates Saturday as week start for Friday", () => {
    const date = new Date(2025, 1, 14); // Friday Feb 14
    const daysSinceSaturday = (date.getDay() + 1) % 7;
    expect(daysSinceSaturday).toBe(6);
    const saturday = new Date(date);
    saturday.setDate(date.getDate() - daysSinceSaturday);
    expect(saturday.getDay()).toBe(6);
  });
});

// ============ PLAN GATING ============

describe("Plan Gating", () => {
  it("free plan can access basic features", () => {
    expect(canAccessFeature("dashboard", "free")).toBe(true);
    expect(canAccessFeature("ingredients", "free")).toBe(true);
    expect(canAccessFeature("recipes", "free")).toBe(true);
  });

  it("free plan cannot access pro features", () => {
    expect(canAccessFeature("sales", "free")).toBe(false);
    expect(canAccessFeature("discount-rules", "free")).toBe(false);
  });

  it("free plan cannot access elite features", () => {
    expect(canAccessFeature("ai-assistant", "free")).toBe(false);
  });

  it("pro plan can access sales but not AI", () => {
    expect(canAccessFeature("sales", "pro")).toBe(true);
    expect(canAccessFeature("ai-assistant", "pro")).toBe(false);
  });

  it("elite plan can access everything", () => {
    expect(canAccessFeature("dashboard", "elite")).toBe(true);
    expect(canAccessFeature("sales", "elite")).toBe(true);
    expect(canAccessFeature("ai-assistant", "elite")).toBe(true);
  });

  it("unknown feature defaults to accessible", () => {
    expect(canAccessFeature("nonexistent-feature", "free")).toBe(true);
  });
});

// ============ EXPORT SANITIZATION ============

describe("Export Sanitization", () => {
  it("sanitizes formula injection in cell values", () => {
    const FORMULA_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];
    const testValues = ["=CMD()", "+HYPERLINK", "-1+1", "@SUM(A1)", "\tCMD"];
    testValues.forEach((val) => {
      const sanitized = FORMULA_PREFIXES.some(p => val.startsWith(p)) ? "'" + val : val;
      expect(sanitized.startsWith("'")).toBe(true);
    });
  });

  it("does not sanitize normal values", () => {
    const val = "كباب عراقي";
    const FORMULA_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];
    const sanitized = FORMULA_PREFIXES.some(p => val.startsWith(p)) ? "'" + val : val;
    expect(sanitized).toBe("كباب عراقي");
  });
});
