"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useCart } from "@/components/cart/CartProvider";
import type { PickupSlotId } from "@/lib/pickupSlots";

function formatRm(value: number) {
  return `RM${value.toFixed(2)}`;
}

function tomorrowYmd(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function CheckoutFlow() {
  const { items, subtotalRm } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pickupDate, setPickupDate] = useState(tomorrowYmd);
  const [pickupSlot, setPickupSlot] = useState<PickupSlotId>("12-14");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lines = useMemo(
    () => items.map((i) => ({ slug: i.slug, qty: i.qty })),
    [items],
  );

  const weekday = useMemo(() => {
    const [y, m, d] = pickupDate.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay();
  }, [pickupDate]);

  const slotOptions = useMemo(() => {
    if (weekday === 0) {
      return [{ id: "sun-10-1230" as const, label: "10:00 – 12:30 (Sun)" }];
    }
    return [
      { id: "12-14" as const, label: "12:00 – 14:00" },
      { id: "14-16" as const, label: "14:00 – 16:00" },
      { id: "16-18" as const, label: "16:00 – 18:00" },
    ];
  }, [weekday]);

  useEffect(() => {
    if (weekday === null) return;
    if (weekday === 0) {
      setPickupSlot((s) => (s === "sun-10-1230" ? s : "sun-10-1230"));
    } else {
      setPickupSlot((s) => (s === "sun-10-1230" ? "12-14" : s));
    }
  }, [weekday]);

  async function pay() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/checkout/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          customerName: name,
          customerPhone: phone,
          customerEmail: email.trim() || undefined,
          pickupDate,
          pickupSlot,
          pickupNotes: notes.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string; redirectUrl?: string };
      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status})`);
        return;
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      setError("No redirect URL returned");
    } catch {
      setError("Network error — try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {items.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-slate-900/10 bg-white/70 p-8 text-center">
          <div className="text-sm font-semibold text-slate-900">
            Your cart is empty
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Add items before checkout.
          </div>
          <div className="mt-6">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#62a6ff] to-[#57f0ff] px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_12px_32px_rgba(98,166,255,0.22)] transition hover:brightness-110"
            >
              Go to shop
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <section className="space-y-4 lg:col-span-7">
            <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-6">
              <div className="text-sm font-semibold text-slate-900">
                Your details
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-xs font-medium text-slate-600">
                    Full name
                  </span>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-sm text-slate-800"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">
                    Mobile (Malaysia)
                  </span>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-sm text-slate-800"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01… or +60…"
                    autoComplete="tel"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">
                    Email (optional)
                  </span>
                  <input
                    type="email"
                    className="mt-1 w-full rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-sm text-slate-800"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-6">
              <div className="text-sm font-semibold text-slate-900">Pickup</div>
              <p className="mt-2 text-xs text-slate-500">
                Pickup slots follow our usual bakery hours (Mon–Sat windows;
                Sunday morning slot only on Sundays).
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Date</span>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-sm text-slate-800"
                    value={pickupDate}
                    min={tomorrowYmd()}
                    onChange={(e) => setPickupDate(e.target.value)}
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">
                    Time window
                  </span>
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-sm text-slate-800"
                    value={pickupSlot}
                    onChange={(e) =>
                      setPickupSlot(e.target.value as PickupSlotId)
                    }
                  >
                    {slotOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-medium text-slate-600">
                    Notes (optional)
                  </span>
                  <textarea
                    className="mt-1 w-full rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-sm text-slate-800"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Allergies, greeting card text, etc."
                  />
                </label>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-6">
              <div className="text-sm font-semibold text-slate-900">
                Order summary
              </div>
              <ul className="mt-4 space-y-2 border-b border-slate-900/10 pb-4 text-sm text-slate-700">
                {items.map((i) => (
                  <li key={i.slug} className="flex justify-between gap-2">
                    <span>
                      {i.name}{" "}
                      <span className="text-slate-500">×{i.qty}</span>
                    </span>
                    <span className="shrink-0 font-medium text-slate-900">
                      {formatRm(i.unitPriceRm * i.qty)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-700">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  {formatRm(subtotalRm)}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Prices are confirmed on the server. You will pay securely on
                Xendit&apos;s checkout page (cards, online banking, and other
                channels enabled for our account).
              </p>

              {error ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                  {error}
                </div>
              ) : null}

              <button
                type="button"
                disabled={busy || !name.trim() || !phone.trim()}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900/90 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => void pay()}
              >
                {busy ? "Starting payment…" : "Pay with Xendit"}
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-full">
      <div className="border-b border-slate-900/10 bg-white/50">
        <div className="mx-auto max-w-6xl px-4 py-2 text-center text-xs tracking-wide text-slate-700 sm:text-sm">
          ORDER BEFORE 1PM FOR NEXT DAY PICK UP{" "}
          <span className="text-slate-400">•</span>{" "}
          <span className="font-semibold text-slate-800">EXCEPT TUESDAY</span>
        </div>
      </div>

      <SiteHeader ctaHref="/cart" ctaLabel="Back to cart" />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Checkout
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Enter your details, then pay securely on Xendit.
            </p>
          </div>
          <Link
            href="/cart"
            className="rounded-full border border-slate-900/10 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
          >
            Back to cart
          </Link>
        </div>

        <CheckoutFlow />
      </main>

      <SiteFooter />
    </div>
  );
}
