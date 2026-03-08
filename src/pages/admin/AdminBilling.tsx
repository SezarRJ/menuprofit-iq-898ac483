import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";

export default function AdminBilling() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Billing</h1>
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-gray-500" />
            <CardTitle className="text-sm text-gray-400">Stripe Integration</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">
            Billing integration with Stripe is configured via webhook. 
            Plan changes, subscription management, and invoice tracking will appear here once Stripe is fully connected.
          </p>
          <div className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-gray-400">Webhook Status</span>
              <span className="text-emerald-400">Active</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-gray-400">Processed Events</span>
              <span>—</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Monthly Revenue</span>
              <span>—</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
