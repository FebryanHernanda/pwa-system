import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Product, type CartItem } from "./db/schema";
import {
  ShoppingCart,
  Package,
  Search,
  Trash2,
  CheckCircle2,
} from "lucide-react";

export default function App() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [search, setSearch] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderId] = useState(() => Math.floor(Math.random() * 9000) + 1000);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  const products = useLiveQuery(
    () =>
      db.products
        .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
        .toArray(),
    [search],
  );

  const addToCart = (product: Product, isWholesale: boolean) => {
    const ratio = isWholesale ? product.conversionRatio : 1;
    const price = isWholesale ? product.basePrice * 0.85 : product.basePrice;
    const total = Math.round(price * ratio);

    setCart((prev) => {
      const idx = prev.findIndex(
        (i) => i.id === product.id && i.isWholesale === isWholesale,
      );
      if (idx > -1) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          displayQty: next[idx].displayQty + 1,
          finalQty: next[idx].finalQty + ratio,
          totalPrice: next[idx].totalPrice + total,
        };
        return next;
      }
      return [
        ...prev,
        {
          ...product,
          isWholesale,
          displayQty: 1,
          finalQty: ratio,
          totalPrice: total,
          unitLabel: isWholesale ? product.wholesaleUnit : product.unitName,
        },
      ];
    });
  };

  const checkout = async () => {
    if (!cart.length) return;
    await db.transaction("rw", db.products, db.sales, async () => {
      await db.sales.add({
        items: cart,
        totalPrice: cart.reduce((a, b) => a + b.totalPrice, 0),
        timestamp: Date.now(),
        synced: false,
      });
      for (const item of cart) {
        const p = await db.products.get(item.id!);
        if (p)
          await db.products.update(item.id!, {
            stockInBaseUnit: p.stockInBaseUnit - item.finalQty,
          });
      }
    });
    setCart([]);
    alert("Payment Confirmed.");
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Mini Nav - Dark for Contrast */}
      <nav className="w-16 bg-slate-950 flex flex-col items-center py-6 gap-8">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
          SJ
        </div>
        <div className="flex flex-col gap-4">
          <div className="p-3 bg-slate-800 rounded-lg text-white">
            <ShoppingCart size={20} />
          </div>
          <div className="p-3 text-slate-500 hover:text-white">
            <Package size={20} />
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col">
        {/* Clean Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="relative w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by product name..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-blue-500 text-sm"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border ${isOnline ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}
            />
            {isOnline ? "LIVE ACCESS" : "LOCAL ONLY"}
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Inventory Grid - White Cards on Gray BG */}
          <section className="flex-1 p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
            {products?.map((p) => (
              <div
                key={p.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors"
              >
                <div className="mb-4">
                  <h3 className="font-semibold text-slate-800 leading-tight">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">
                    Available: {p.stockInBaseUnit / 1000}kg
                  </p>
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-50">
                  <button
                    onClick={() => addToCart(p, false)}
                    className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 rounded-md border border-slate-200 transition-colors"
                  >
                    Retail
                  </button>
                  <button
                    onClick={() => addToCart(p, true)}
                    className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-700 rounded-md shadow-sm transition-colors"
                  >
                    Wholesale
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* Checkout Panel - Distinct Separator */}
          <section className="w-95 bg-white border-l border-slate-200 flex flex-col shadow-[-4px_0_12px_rgba(0,0,0,0.02)]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Current Cart
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                #{orderId}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <ShoppingCart size={32} strokeWidth={1} className="mb-2" />
                  <p className="text-xs font-medium">Cart is empty</p>
                </div>
              )}
              {cart.map((item, i) => (
                <div
                  key={`${item.id}-${item.isWholesale}`}
                  className="flex items-center justify-between group"
                >
                  <div className="flex-1 pr-4">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-blue-500 font-bold mt-0.5">
                      {item.displayQty} × {item.unitLabel}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-bold text-slate-900">
                      Rp{item.totalPrice.toLocaleString()}
                    </p>
                    <button
                      onClick={() =>
                        setCart(cart.filter((_, idx) => idx !== i))
                      }
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  Subtotal
                </span>
                <span className="text-2xl font-bold text-slate-900 tabular-nums tracking-tighter">
                  Rp
                  {cart.reduce((a, b) => a + b.totalPrice, 0).toLocaleString()}
                </span>
              </div>
              <button
                onClick={checkout}
                disabled={!cart.length}
                className="w-full bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white py-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-md active:scale-[0.98]"
              >
                <CheckCircle2 size={16} /> Complete Checkout
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
