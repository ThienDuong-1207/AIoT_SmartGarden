"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import type { CartItem } from "@/lib/cart";

type Props = {
  item: Omit<CartItem, "qty">;
  buyNow?: boolean;
  className?: string;
};

export default function AddToCartButton({ item, buyNow = false, className }: Props) {
  const { add } = useCart();
  const router   = useRouter();
  const [added, setAdded] = useState(false);

  function handle() {
    add(item);
    if (buyNow) {
      router.push("/cart");
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  if (buyNow) {
    return (
      <button onClick={handle} className={className ?? "btn-emerald gap-2.5 px-6 py-3"}>
        <ShoppingCart size={15} />
        Mua ngay
      </button>
    );
  }

  return (
    <button
      onClick={handle}
      className={className ?? "btn-emerald gap-2.5 px-6 py-3"}
      style={added ? { background: "rgba(34,197,94,0.20)", color: "var(--emerald-400)" } : undefined}
    >
      {added ? <Check size={15} /> : <ShoppingCart size={15} />}
      {added ? "Đã thêm vào giỏ!" : "Thêm vào giỏ hàng"}
    </button>
  );
}
