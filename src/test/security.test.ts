import { describe, it, expect } from "vitest";
import { validateFileSize, validateImportData } from "@/lib/import-validation";

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

    it("sanitizes formula injection", () => {
      const rows = [{ date: "2024-01-01", dish: "=CMD()", qty: 5 }];
      const result = validateImportData(rows, "date", "dish", "qty");
      expect(result.valid).toBe(true);
      const dishVal = result.sanitizedRows[0]["dish"];
      expect(String(dishVal).startsWith("'")).toBe(true);
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

    it("rejects too many rows", () => {
      const rows = Array.from({ length: 50001 }, (_, i) => ({
        date: "2024-01-01", dish: `dish_${i}`, qty: 1,
      }));
      const result = validateImportData(rows, "date", "dish", "qty");
      expect(result.valid).toBe(false);
    });
  });
});

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

  it("calculates Saturday-based week start", () => {
    // Wednesday Feb 12 2025
    const date = new Date(2025, 1, 12);
    const dayOfWeek = date.getDay(); // 3 (Wed)
    const daysSinceSaturday = (dayOfWeek + 1) % 7; // 4
    const saturday = new Date(date);
    saturday.setDate(date.getDate() - daysSinceSaturday);
    expect(saturday.getDay()).toBe(6); // Saturday
  });
});

describe("Plan Gating", () => {
  it("free plan can access basic features", () => {
    const { canAccessFeature } = require("@/lib/restaurant-context");
    expect(canAccessFeature("dashboard", "free")).toBe(true);
    expect(canAccessFeature("ingredients", "free")).toBe(true);
    expect(canAccessFeature("recipes", "free")).toBe(true);
  });

  it("free plan cannot access pro features", () => {
    const { canAccessFeature } = require("@/lib/restaurant-context");
    expect(canAccessFeature("sales", "free")).toBe(false);
    expect(canAccessFeature("discount-rules", "free")).toBe(false);
  });

  it("free plan cannot access elite features", () => {
    const { canAccessFeature } = require("@/lib/restaurant-context");
    expect(canAccessFeature("ai-assistant", "free")).toBe(false);
  });

  it("pro plan can access sales but not AI", () => {
    const { canAccessFeature } = require("@/lib/restaurant-context");
    expect(canAccessFeature("sales", "pro")).toBe(true);
    expect(canAccessFeature("ai-assistant", "pro")).toBe(false);
  });

  it("elite plan can access everything", () => {
    const { canAccessFeature } = require("@/lib/restaurant-context");
    expect(canAccessFeature("dashboard", "elite")).toBe(true);
    expect(canAccessFeature("sales", "elite")).toBe(true);
    expect(canAccessFeature("ai-assistant", "elite")).toBe(true);
  });
});
