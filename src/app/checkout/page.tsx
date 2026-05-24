"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useCart } from "@/components/cart/CartProvider";
import { requestMemberCheckoutRedirect } from "@/lib/memberCheckout";

function formatRm(value: number) {
  return `RM${value.toFixed(2)}`;
}

export default function CheckoutPage() {
  const { items, subtotalRm } = useCart();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const handlePayInMemberApp = async () => {
    if (items.length === 0 || paying) return;
    setPayError(null);
    setPaying(true);
    try {
      const redirectUrl = await requestMemberCheckoutRedirect(
        items,
        window.location.href,
      );
      window.location.href = redirectUrl;
    } catch (err) {
      setPayError(
        err instanceof Error ? err.message : "Could not open member checkout",
      );
      setPaying(false);
    }
  };

  return (
    <div className="min-h-full">
      <div className="border-b border-slate-900/10 bg-white/50">
        <div className="mx-auto max-w-6xl px-4 py-2 text-center text-xs tracking-wide text-slate-700 sm:text-sm">
          Website is under construction / Price may not be accurate

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
              Confirm your details, then complete payment in the Moja Member app.
            </p>
          </div>
          <Link
            href="/cart"
            className="rounded-full border border-slate-900/10 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
          >
            Back to cart
          </Link>
        </div>

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
            <section className="lg:col-span-7 space-y-4">
              <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-6">
                <div className="text-sm font-semibold text-slate-900">
                  Member benefits
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Before you pay, consider signing up as a{" "}
                  <span className="font-semibold text-slate-900">
                    Moja Maison member
                  </span>{" "}
                  to unlock extra discounts and perks.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>- Member-only discounts & promo codes</li>
                  <li>- Faster checkout for repeat orders</li>
                  <li>- Order tracking and saved delivery details</li>
                </ul>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="#"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#62a6ff] to-[#57f0ff] px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_12px_32px_rgba(98,166,255,0.22)] transition hover:brightness-110"
                  >
                    Sign up & get benefits
                  </Link>
                  <Link
                    href="#"
                    className="inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-white/60 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
                  >
                    Log in
                  </Link>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-white/60 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
                    onClick={() => {
                      // placeholder: continue as guest
                      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                    }}
                  >
                    Continue as guest
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-6">
                <div className="text-sm font-semibold text-slate-900">
                  Delivery / Pickup
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <select className="w-full rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-sm text-slate-700">
                    <option>Delivery</option>
                    <option>Pickup</option>
                  </select>
                  <select className="w-full rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-sm text-slate-700">
                    <option>(optional) Preferred time</option>
                    <option>11am - 1pm (Mon - Sat)</option>
                    <option>2pm - 4pm (Mon - Sat)</option>
                    <option>4pm - 6pm (Mon - Sat)</option>
                    <option>10am - 12:30pm (Sun)</option>
                  </select>
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  This is a UI preview; payment + real delivery pricing can be
                  connected later.
                </div>
              </div>
            </section>

            <aside className="lg:col-span-5">
              <div className="rounded-3xl border border-slate-900/10 bg-white/70 p-6">
                <div className="text-sm font-semibold text-slate-900">
                  Payment summary
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-700">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    {formatRm(subtotalRm)}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Payment runs through the Moja Member app (Touch &apos;n Go, FPX,
                  cards, and more).
                </div>

                {payError ? (
                  <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {payError}
                  </p>
                ) : null}

                <button
                  type="button"
                  disabled={paying}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900/90 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => void handlePayInMemberApp()}
                >
                  {paying ? "Opening member checkout…" : "Pay in Moja Member app"}
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

