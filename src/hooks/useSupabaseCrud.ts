import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type TableName = "clients" | "leads" | "orders" | "quotations" | "payments" | "vendors" | "team_members" | "tasks" | "appointments" | "messages" | "portfolio_items" | "content_sections" | "chat_threads" | "chat_messages";

export function useSupabaseCrud<T extends { id: string }>(table: TableName, orderBy = "created_at") {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: rows, error } = await (supabase.from(table) as any).select("*").order(orderBy, { ascending: false });
    if (error) {
      toast.error(`Failed to load ${table}: ${error.message}`);
    } else {
      setData(rows || []);
    }
    setLoading(false);
  }, [table, orderBy]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (row: Partial<T>) => {
    const { error } = await (supabase.from(table) as any).insert(row);
    if (error) { toast.error(error.message); return false; }
    toast.success("Created successfully");
    fetch();
    return true;
  };

  const update = async (id: string, updates: Partial<T>) => {
    const { error } = await (supabase.from(table) as any).update(updates).eq("id", id);
    if (error) { toast.error(error.message); return false; }
    toast.success("Updated successfully");
    fetch();
    return true;
  };

  const remove = async (id: string) => {
    const { error } = await (supabase.from(table) as any).delete().eq("id", id);
    if (error) { toast.error(error.message); return false; }
    toast.success("Deleted successfully");
    fetch();
    return true;
  };

  return { data, loading, fetch, create, update, remove };
}
