/**
 * SMARTMENU — Smart Kitchen Cost Engine
 * True Cost = Direct + Kitchen Load + Packaging + Washing + Waste + Overhead
 */

export interface TrueCostInputs {
  directIngredientCost: number;
  kitchenProfile: "light" | "medium" | "heavy";
  packagingChannel: "dine-in" | "takeaway" | "delivery";
  // Restaurant-level settings
  kitchenProfiles: Record<string, { energy: number; labor: number; equipment: number }>;
  packagingCosts: Record<string, number>;
  washingPerPlate: number;
  monthlyWasteBudget: number;
  baselinePlates: number;
  overheadPerPlate: number;
}

export interface TrueCostBreakdown {
  direct: number;
  kitchenLoad: number;
  packaging: number;
  washing: number;
  waste: number;
  overhead: number;
  trueCost: number;
}

export function calculateTrueCost(inputs: TrueCostInputs): TrueCostBreakdown {
  const profile = inputs.kitchenProfiles[inputs.kitchenProfile] || inputs.kitchenProfiles.medium || { energy: 500, labor: 600, equipment: 250 };
  const kitchenLoad = profile.energy + profile.labor + profile.equipment;
  const packaging = inputs.packagingCosts[inputs.packagingChannel] || 0;
  const washing = inputs.washingPerPlate;
  const waste = inputs.baselinePlates > 0 ? inputs.monthlyWasteBudget / inputs.baselinePlates : 0;
  const overhead = inputs.overheadPerPlate;

  return {
    direct: inputs.directIngredientCost,
    kitchenLoad,
    packaging,
    washing,
    waste,
    overhead,
    trueCost: inputs.directIngredientCost + kitchenLoad + packaging + washing + waste + overhead,
  };
}

export function getMarginStrength(margin: number): "strong" | "moderate" | "weak" {
  if (margin >= 40) return "strong";
  if (margin >= 20) return "moderate";
  return "weak";
}

export function formatCurrency(amount: number, currency: string): string {
  if (currency === "USD") return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return `${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} د.ع`;
}

export const DEFAULT_KITCHEN_PROFILES = {
  light: { energy: 200, labor: 300, equipment: 100 },
  medium: { energy: 500, labor: 600, equipment: 250 },
  heavy: { energy: 1000, labor: 1000, equipment: 500 },
};
