"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { CartItem, loadCart, addToCart as addFn, updateQty, removeFromCart, clearCart, cartTotal } from "@/lib/cart";

type CartCtx = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "qty">) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx>({
  items: [], count: 0, total: 0,
  add: () => {}, setQty: () => {}, remove: () => {}, clear: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const sync = useCallback(() => setItems(loadCart()), []);

  useEffect(() => {
    sync();
    window.addEventListener("cart-updated", sync);
    return () => window.removeEventListener("cart-updated", sync);
  }, [sync]);

  return (
    <Ctx.Provider value={{
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      total: cartTotal(items),
      add: (item) => { addFn(item); sync(); },
      setQty: (slug, qty) => { updateQty(slug, qty); sync(); },
      remove: (slug) => { removeFromCart(slug); sync(); },
      clear: () => { clearCart(); sync(); },
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  return useContext(Ctx);
}
