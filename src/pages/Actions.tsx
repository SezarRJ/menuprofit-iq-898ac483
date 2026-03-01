import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockActions } from "@/lib/mock-data";
import { ClipboardList, Calendar, User } from "lucide-react";

const statusCols = ["new", "approved", "in_progress", "done", "cancelled"] as const;
const statusLabels: Record<string, Record<string, string>> = {
  ar: { new: "جديد", approved: "مُعتمد", in_progress: "قيد التنفيذ", done: "مكتمل", cancelled: "ملغي" },
  en: { new: "New", approved: "Approved", in_progress: "In Progress", done: "Done", cancelled: "Cancelled" },
};
const priorityColors: Record<string, string> = { high: "bg-destructive/15 text-destructive", medium: "bg-warning/15 text-warning", low: "bg-muted text-muted-foreground" };
const colColors: Record<string, string> = { new: "border-primary/30", approved: "border-success/30", in_progress: "border-warning/30", done: "border-success/50", cancelled: "border-muted" };

export default function Actions() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <AppLayout>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2"><ClipboardList className="w-5 h-5" />{t("actions")}</h3>
        <div className="grid grid-cols-5 gap-3 overflow-x-auto">
          {statusCols.map(col => (
            <div key={col} className="min-w-[220px]">
              <div className={`text-sm font-medium mb-3 pb-2 border-b-2 ${colColors[col]}`}>
                {statusLabels[lang]?.[col] || col} <Badge variant="secondary" className="ms-1 text-[10px]">{mockActions.filter(a => a.status === col).length}</Badge>
              </div>
              <div className="space-y-2">
                {mockActions.filter(a => a.status === col).map(action => (
                  <Card key={action.id} className="cursor-pointer hover:shadow-card-hover transition-shadow">
                    <CardContent className="pt-3 pb-3 space-y-2">
                      <p className="text-sm font-medium leading-snug">{action.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] ${priorityColors[action.priority]}`}>{action.priority}</Badge>
                        <Badge variant="outline" className="text-[10px]">{action.type}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{action.dueDate}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{action.assignee}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
