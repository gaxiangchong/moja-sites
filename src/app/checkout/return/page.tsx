import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

type Props = {
  searchParams: Promise<{ orderId?: string; status?: string }>;
};

export default async function CheckoutReturnPage({ searchParams }: Props) {
  const q = await searchParams;
  const success = q.status === "success";
  const cancelled = q.status === "cancel";

  return (
    <div className="min-h-full">
      <div className="border-b border-slate-900/10 bg-white/50">
        <div className="mx-auto max-w-6xl px-4 py-2 text-center text-xs tracking-wide text-slate-700 sm:text-sm">
          ORDER BEFORE 1PM FOR NEXT DAY PICK UP{" "}
          <span className="text-slate-400">•</span>{" "}
          <span className="font-semibold text-slate-800">EXCEPT TUESDAY</span>
        </div>
      </div>

      <SiteHeader ctaHref="/shop" ctaLabel="Back to shop" />

      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        {success ? (
          <>
            <div className="text-3xl font-semibold tracking-tight text-slate-900">
              Thank you
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Your payment is being confirmed. You will receive a confirmation
              message once it is finalised. If you have questions, reach us via
              the Contact page.
            </p>
            {q.orderId ? (
              <p className="mt-3 text-xs text-slate-500">
                Reference:{" "}
                <span className="font-mono text-slate-700">{q.orderId}</span>
              </p>
            ) : null}
          </>
        ) : cancelled ? (
          <>
            <div className="text-3xl font-semibold tracking-tight text-slate-900">
              Payment cancelled
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              No charge was made. You can return to your cart and try again when
              you are ready.
            </p>
          </>
        ) : (
          <>
            <div className="text-3xl font-semibold tracking-tight text-slate-900">
              Checkout update
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Something went wrong or the payment was interrupted. Check your
              email for a receipt, or contact us if you are unsure.
            </p>
          </>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#62a6ff] to-[#57f0ff] px-6 py-3 text-sm font-semibold text-slate-900 shadow-[0_12px_32px_rgba(98,166,255,0.22)] transition hover:brightness-110"
          >
            Continue shopping
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
          >
            Contact us
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
