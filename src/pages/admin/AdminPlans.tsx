import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

const plans = [
  {
    name: "Free", color: "text-gray-300",
    limits: { ingredients: 30, recipes: 20, inventory: 0, ai_quota: 0, imports: 5 },
    features: {
      "Basic Ingredients": true, "Basic Recipes": true, "Limited Imports": true,
      "Pricing Engine": false, "Advanced Promotions": false, "Loyalty": false,
      "Competitor Tracking": false, "Supplier Management": false, "Inventory": false,
    },
  },
  {
    name: "Pro", color: "text-indigo-300",
    limits: { ingredients: 999, recipes: 999, inventory: 50, ai_quota: 50000, imports: 999 },
    features: {
      "Basic Ingredients": true, "Basic Recipes": true, "Limited Imports": true,
      "Pricing Engine": true, "Advanced Promotions": false, "Loyalty": true,
      "Competitor Tracking": false, "Supplier Management": true, "Inventory": true,
    },
  },
  {
    name: "Elite", color: "text-amber-300",
    limits: { ingredients: 999, recipes: 999, inventory: 999, ai_quota: 200000, imports: 999 },
    features: {
      "Basic Ingredients": true, "Basic Recipes": true, "Limited Imports": true,
      "Pricing Engine": true, "Advanced Promotions": true, "Loyalty": true,
      "Competitor Tracking": true, "Supplier Management": true, "Inventory": true,
    },
  },
];

export default function AdminPlans() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Plan Definitions</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <Card key={plan.name} className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className={plan.color}>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-2">Limits</p>
                {Object.entries(plan.limits).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm py-1 border-b border-white/5">
                    <span className="text-gray-400">{k.replace(/_/g, " ")}</span>
                    <span className="font-mono">{v >= 999 ? "∞" : v}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Features</p>
                {Object.entries(plan.features).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 text-sm py-1">
                    {v ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-gray-600" />}
                    <span className={v ? "text-gray-200" : "text-gray-600"}>{k}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-6">Plan enforcement is server-side via RLS + Edge Functions. Tenant-specific overrides can be set in Tenant Details → Plan & Limits.</p>
    </AdminLayout>
  );
}
