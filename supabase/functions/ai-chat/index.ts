import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MONTHLY_TOKEN_CAP = 100000; // Elite plan monthly cap
const MAX_INPUT_LENGTH = 4000;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // ========== AUTH VERIFICATION ==========
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "غير مصرح" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "جلسة غير صالحة" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    const { messages, restaurantId } = await req.json();

    if (!restaurantId) {
      return new Response(JSON.stringify({ error: "معرف المطعم مطلوب" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service role client for privileged operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ========== TENANT VERIFICATION ==========
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id, name, city, default_currency, target_margin_pct, owner_id")
      .eq("id", restaurantId)
      .single();

    if (!restaurant || restaurant.owner_id !== userId) {
      return new Response(JSON.stringify({ error: "غير مصرح بالوصول لهذا المطعم" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========== PLAN VERIFICATION (Elite only) ==========
    const { data: planData } = await supabase.rpc("get_restaurant_plan", { _restaurant_id: restaurantId });
    const plan = planData ?? "free";

    if (plan !== "elite") {
      return new Response(JSON.stringify({ error: "المساعد الذكي متاح فقط لمشتركي الباقة المميزة (Elite). قم بترقية اشتراكك للوصول." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========== MONTHLY CAP CHECK ==========
    const { data: monthlyTokens } = await supabase.rpc("get_monthly_ai_tokens", { _restaurant_id: restaurantId });
    if ((monthlyTokens ?? 0) >= MONTHLY_TOKEN_CAP) {
      return new Response(JSON.stringify({ error: "تم تجاوز الحد الشهري لاستخدام المساعد الذكي. يتجدد الحد في بداية الشهر القادم." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========== TRUNCATE INPUT ==========
    const sanitizedMessages = (messages ?? []).map((m: any) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: typeof m.content === "string" ? m.content.slice(0, MAX_INPUT_LENGTH) : "",
    }));

    // ========== FETCH CONTEXT ==========
    const { data: recipes } = await supabase
      .from("recipes")
      .select("name, category, selling_price, recipe_ingredients(quantity, ingredients(name, unit_price, unit))")
      .eq("restaurant_id", restaurantId);

    const { data: costs } = await supabase
      .from("operating_costs")
      .select("name, cost_type, monthly_amount")
      .eq("restaurant_id", restaurantId);

    const totalOpCost = costs?.reduce((s, c) => s + Number(c.monthly_amount), 0) ?? 0;
    const totalRecipes = recipes?.length ?? 1;
    const overheadPerDish = totalOpCost / totalRecipes;
    const currency = restaurant.default_currency === "USD" ? "$" : "د.ع";

    const recipeSummaries = (recipes ?? []).map(r => {
      const ingCost = r.recipe_ingredients?.reduce(
        (s: number, ri: any) => s + Number(ri.quantity) * Number(ri.ingredients?.unit_price ?? 0), 0
      ) ?? 0;
      const trueCost = ingCost + overheadPerDish;
      const margin = Number(r.selling_price) > 0 ? ((Number(r.selling_price) - trueCost) / Number(r.selling_price)) * 100 : 0;
      return `- ${r.name} (${r.category}): تكلفة=${ingCost.toFixed(0)}${currency}, حقيقية=${trueCost.toFixed(0)}${currency}, بيع=${r.selling_price}${currency}, هامش=${margin.toFixed(0)}%`;
    }).join("\n");

    const costSummaries = (costs ?? []).map(c =>
      `- ${c.name} (${c.cost_type === "fixed" ? "ثابت" : "متغير"}): ${c.monthly_amount}${currency}/شهر`
    ).join("\n");

    const contextData = `
بيانات المطعم:
- الاسم: ${restaurant.name}
- المدينة: ${restaurant.city}
- العملة: ${currency}
- هامش الربح المستهدف: ${restaurant.target_margin_pct}%

المصاريف (إجمالي: ${totalOpCost.toLocaleString()}${currency}):
${costSummaries || "لا توجد مصاريف"}

الأطباق:
${recipeSummaries || "لا توجد أطباق"}
`;

    const systemPrompt = `أنت مساعد ذكي متخصص في تحليل تكاليف المطاعم وتسعير الأطباق. تتحدث بالعربية.

مهامك:
1. تحليل تكاليف الأطباق واقتراح تحسينات
2. اقتراح أسعار بيع مناسبة بناءً على التكلفة الحقيقية وهامش الربح المستهدف
3. تحديد الأطباق ذات الهوامش المنخفضة واقتراح حلول
4. تقديم نصائح لتقليل التكاليف وزيادة الربحية

قواعد مهمة:
- استخدم البيانات الفعلية في تحليلاتك
- قدم أرقاماً محددة وواضحة
- اقترح حلولاً عملية
- أجب بإيجاز ووضوح
- كل اقتراح هو "توصية فقط" ولا يُطبق تلقائياً
- اذكر دائماً البيانات المستخدمة في تحليلك

${contextData}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...sanitizedMessages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى إضافة رصيد للاستمرار في استخدام المساعد الذكي." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "خطأ في خدمة الذكاء الاصطناعي" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========== LOG TOKEN USAGE (estimate from response) ==========
    // Log a base estimate; actual tokens counted from stream would require buffering
    const estimatedTokens = sanitizedMessages.reduce((s: number, m: any) => s + (m.content?.length ?? 0) / 4, 0) + 500;

    await supabase.from("ai_usage_logs").insert({
      restaurant_id: restaurantId,
      user_id: userId,
      tokens_used: Math.ceil(estimatedTokens),
      model: "google/gemini-3-flash-preview",
    });

    // ========== LOG AUDIT ==========
    await supabase.from("audit_logs").insert({
      actor_id: userId,
      action: "ai_chat",
      entity_type: "restaurant",
      entity_id: restaurantId,
      metadata: { message_count: sanitizedMessages.length },
    });

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
