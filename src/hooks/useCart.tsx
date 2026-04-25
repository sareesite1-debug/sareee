import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: { id: string; name: string; price: number; image_url: string | null; stock: number | null };
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  updateQty: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) { setItems([]); return; }
    setLoading(true);
    const { data, error } = await (supabase
      .from("cart_items") as any)
      .select("id, product_id, quantity, product:products(id, name, price, image_url, stock)")
      .eq("user_id", userId);
    if (!error) setItems(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUserId(session?.user?.id ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addToCart = async (productId: string, quantity = 1) => {
    if (!userId) { toast.error("Please sign in to add items to cart."); return false; }
    // Upsert: if exists increment, else insert
    const existing = items.find(i => i.product_id === productId);
    if (existing) {
      const { error } = await (supabase.from("cart_items") as any).update({ quantity: existing.quantity + quantity }).eq("id", existing.id);
      if (error) { toast.error(error.message); return false; }
    } else {
      const { error } = await (supabase.from("cart_items") as any).insert({ user_id: userId, product_id: productId, quantity });
      if (error) { toast.error(error.message); return false; }
    }
    toast.success("Added to cart");
    await refresh();
    return true;
  };

  const updateQty = async (itemId: string, quantity: number) => {
    if (quantity <= 0) return removeItem(itemId);
    await (supabase.from("cart_items") as any).update({ quantity }).eq("id", itemId);
    refresh();
  };

  const removeItem = async (itemId: string) => {
    await (supabase.from("cart_items") as any).delete().eq("id", itemId);
    refresh();
  };

  const clearCart = async () => {
    if (!userId) return;
    await (supabase.from("cart_items") as any).delete().eq("user_id", userId);
    setItems([]);
  };

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + (Number(i.product?.price) || 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, total, loading, addToCart, updateQty, removeItem, clearCart, refresh }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
