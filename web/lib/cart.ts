export type CartItem = {
  slug: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number | null;
  qty: number;
};

const KEY = "sg_cart";

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(item: Omit<CartItem, "qty">) {
  const items = loadCart();
  const idx = items.findIndex((i) => i.slug === item.slug);
  if (idx >= 0) {
    items[idx].qty += 1;
  } else {
    items.push({ ...item, qty: 1 });
  }
  saveCart(items);
}

export function updateQty(slug: string, qty: number) {
  const items = loadCart();
  const idx = items.findIndex((i) => i.slug === slug);
  if (idx < 0) return;
  if (qty <= 0) items.splice(idx, 1);
  else items[idx].qty = qty;
  saveCart(items);
}

export function removeFromCart(slug: string) {
  saveCart(loadCart().filter((i) => i.slug !== slug));
}

export function clearCart() {
  saveCart([]);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + (i.salePrice ?? i.price) * i.qty, 0);
}
