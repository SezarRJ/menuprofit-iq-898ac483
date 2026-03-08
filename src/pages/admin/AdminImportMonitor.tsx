import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function AdminImportMonitor() {
  const [imports, setImports] = useState<any[]>([]);
  const [tenantMap, setTenantMap] = useState<Map<string, string>>(new Map());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [impRes, tRes] = await Promise.all([
        supabase.from("sales_imports").select("*").order("uploaded_at", { ascending: false }).limit(100),
        supabase.from("restaurants").select("id, name"),
      ]);
      setImports(impRes.data || []);
      setTenantMap(new Map((tRes.data || []).map(t => [t.id, t.name])));
      setLoading(false);
    };
    load();
  }, []);

  const filtered = imports.filter(i =>
    i.file_name.toLowerCase().includes(search.toLowerCase()) ||
    (tenantMap.get(i.restaurant_id) || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Import Monitor</h1>
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white/5 border-white/10 text-gray-100 placeholder:text-gray-500" />
        </div>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-gray-400">Tenant</TableHead>
                <TableHead className="text-gray-400">File</TableHead>
                <TableHead className="text-gray-400">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={3} className="text-center text-gray-500 py-12">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center text-gray-500 py-12">No imports found.</TableCell></TableRow>
              ) : filtered.map(i => (
                <TableRow key={i.id} className="border-white/5">
                  <TableCell>{tenantMap.get(i.restaurant_id) || i.restaurant_id.slice(0, 8)}</TableCell>
                  <TableCell className="text-sm">{i.file_name}</TableCell>
                  <TableCell className="text-xs text-gray-500">{new Date(i.uploaded_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
