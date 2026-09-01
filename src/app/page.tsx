import Image from "next/image";
import Link from "next/link";
import { OrderInAppButton } from "@/components/OrderInAppButton";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getHomeFeaturedProducts } from "@/lib/products";

const HERO_IMAGE = "/images/hero-chef-burnt-cheesecake.png";

export const revalidate = 300;

export default async function Home() {
  const featuredProducts = await getHomeFeaturedProducts();

  return (
    <div className="flex flex-col flex-1">
      <div className="border-b border-slate-900/10 bg-slate-900 text-center text-[11px] font-medium tracking-wide text-white sm:text-xs">
        <div className="mx-auto max-w-6xl px-4 py-2.5">
          <span className="text-[#9edcff]">Freshly baked</span> in small batches
          <span className="mx-2 text-slate-400">·</span>
          Order via the{" "}
          <span className="font-semibold text-white">Moja app</span>
          <span className="mx-2 text-slate-400">·</span>
          Pickup &amp; delivery slots available
        </div>
      </div>

      <SiteHeader />

      <main className="flex-1">
        {/* Full-bleed hero: image-first for immediate visual hook */}
        <section className="relative isolate w-full overflow-hidden bg-[#050a14]">
          <div className="absolute inset-0">
            <div className="hero-image-drift absolute inset-[-8%] min-h-[120%] min-w-[120%]">
              <Image
                src={HERO_IMAGE}
                alt="Pastry chef finishing a burnt Basque cheesecake, highlighting the caramelized top and careful craftsmanship"
                fill
                className="object-cover object-center"
                sizes="100vw"
                priority
                fetchPriority="high"
              />
            </div>
            {/* No directional overlay — full photo stays even; copy uses the glass panel + shadows */}
          </div>

          <div className="relative mx-auto flex w-full min-h-[min(52vh,500px)] max-w-6xl flex-col justify-start gap-6 px-4 pb-10 pt-5 sm:min-h-[min(48vh,470px)] sm:pb-11 sm:pt-6 lg:min-h-[min(46vh,440px)] lg:pb-12 lg:pt-8">
            <div className="ml-auto w-full max-w-xl text-left lg:max-w-2xl rounded-[2rem] border border-white/[0.14] bg-slate-950/20 px-5 py-7 shadow-[0_28px_90px_rgba(0,0,0,0.38)] backdrop-blur-md sm:px-7 sm:py-8 lg:bg-slate-950/18 lg:backdrop-blur-lg">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#c8e8ff] backdrop-blur-md">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#57f0ff] shadow-[0_0_12px_rgba(87,240,255,0.9)]"
                  aria-hidden
                />
                Baked fresh · Halal-friendly
              </div>

              <h1 className="font-display mt-6 text-balance text-4xl font-medium leading-[1.06] tracking-[-0.03em] text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.45),0_1px_2px_rgba(0,0,0,0.6)] sm:text-5xl lg:text-[4.1rem]">
                Cakes for the moments that matter.
              </h1>
              <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-slate-100/90 [text-shadow:0_1px_16px_rgba(0,0,0,0.35)] sm:text-lg">
                Less-sweet, texture-forward recipes guests remember — from
                celebration cakes to everyday favourites worth sharing.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#62a6ff] to-[#57f0ff] px-7 py-3.5 text-sm font-semibold text-[#050a14] shadow-[0_16px_48px_rgba(98,166,255,0.35)] transition hover:brightness-110"
                >
                  Explore the collection
                </Link>
                <OrderInAppButton
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/8 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/12"
                  label="Visit app"
                />
              </div>

              {/* <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-100/90 [text-shadow:0_1px_10px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-2">
                  <span className="text-amber-300" aria-hidden>
                    ★★★★★
                  </span>
                  <span className="font-medium text-white">Loved for taste &amp; texture</span>
                </div>
                <span className="hidden h-4 w-px bg-white/20 sm:block" aria-hidden />
                <div>
                  <span className="font-semibold text-[#9edcff]">
                    Order before 1PM
                  </span>{" "}
                  Mon–Sat for same / next-day
                </div>
              </div> */}
            </div>
          </div>
        </section>

        {/* Quick trust + urgency strip */}
        <section
          className="border-b border-slate-900/10 bg-white/90 backdrop-blur-sm"
          aria-label="Why Moja Maison"
        >
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-5 sm:grid-cols-3">
            {[
              {
                title: "Fresh from our kitchen",
                body: "Made after you order — not sitting on a shelf.",
              },
              {
                title: "Clear pickup & delivery windows",
                body: "Choose a slot that fits your day.",
              },
              {
                title: "Gifting-ready presentation",
                body: "Impress at birthdays, raya, and “just because”.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-3 rounded-2xl border border-slate-900/8 bg-white/80 px-4 py-3"
              >
                <span
                  className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-[#62a6ff] to-[#57f0ff]"
                  aria-hidden
                />
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </div>
                  <div className="mt-0.5 text-sm text-slate-600">{item.body}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-12 pb-6 sm:pt-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1a5f9e]">
                Thoughtful baking
              </p>
              <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl lg:text-[3.3rem]">
                A quieter kind of luxury: better ingredients, better texture, better moments.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                We create cakes and bakes that feel considered and memorable — a little more refined, a little more personal, and made to be shared.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Explore the collection
                </Link>
                <OrderInAppButton
                  className="inline-flex items-center justify-center rounded-full border border-slate-900/15 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  label="Visit app"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Freshly baked",
                  desc: "Made after your order is placed.",
                },
                {
                  title: "Clear pickup windows",
                  desc: "Select a slot that suits your day.",
                },
                {
                  title: "Halal-friendly",
                  desc: "Thoughtful ingredients and preparation.",
                },
                {
                  title: "Gift-ready",
                  desc: "Beautiful for birthdays, celebrations, and moments that matter.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-[1.5rem] border border-slate-900/10 bg-white/80 p-4 shadow-[0_20px_44px_rgba(15,23,42,0.03)]"
                >
                  <div className="text-sm font-semibold text-slate-900">
                    {f.title}
                  </div>
                  <div className="mt-1 text-sm leading-relaxed text-slate-600">
                    {f.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="shop" className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1a5f9e]">
                Signature collection
              </p>
              <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
                Curated favourites, designed to be discovered.
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-900/15 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-900/25 hover:bg-slate-50"
            >
              View all products
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((p, idx) => (
              <article
                key={p.slug}
                className="group flex flex-col overflow-hidden rounded-[1.8rem] border border-slate-900/10 bg-white/90 shadow-[0_18px_52px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:border-slate-900/15 hover:shadow-[0_26px_70px_rgba(15,23,42,0.08)]"
              >
                <Link
                  href={`/product/${p.slug}`}
                  className="relative block aspect-[4/3] overflow-hidden bg-slate-100"
                >
                  <div
                    className="absolute inset-0 opacity-90 transition group-hover:opacity-100"
                    style={{
                      background:
                        idx % 2 === 0
                          ? "radial-gradient(420px 240px at 15% 15%, rgba(98,166,255,0.28), transparent 55%)"
                          : "radial-gradient(420px 240px at 85% 15%, rgba(87,240,255,0.22), transparent 55%)",
                    }}
                    aria-hidden
                  />
                  <Image
                    src={p.images[0]?.src ?? "/images/demo/shop/display-case.jpg"}
                    alt={p.images[0]?.alt ?? p.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                  />
                  {p.badge ? (
                    <div className="absolute left-3 top-3 rounded-full border border-slate-900/10 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur">
                      {p.badge}
                    </div>
                  ) : null}
                </Link>

                <div className="flex flex-1 flex-col p-5">
                  <Link href={`/product/${p.slug}`}>
                    <h3 className="text-xl font-semibold text-slate-900 transition group-hover:text-[#1a5f9e]">
                      {p.name}
                    </h3>
                  </Link>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                    {p.shortDescription ?? p.summary}
                  </p>

                  <div className="mt-5">
                    <Link
                      href={`/product/${p.slug}`}
                      className="inline-flex w-full items-center justify-center rounded-full border border-slate-900/10 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-white hover:shadow-sm"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="overflow-hidden rounded-[2rem] border border-slate-900/10 bg-[radial-gradient(circle_at_top_left,_rgba(98,166,255,0.18),_transparent_38%),linear-gradient(135deg,_#fefdfb_0%,_#ffffff_35%,_#edf7ff_100%)] shadow-[0_28px_90px_rgba(17,24,39,0.05)]">
            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
              <div className="flex flex-col justify-center">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1a5f9e]">
                  Muffins collection
                </p>
                <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
                  Soft, comforting, and easy to love.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
                  A delicious everyday bite for slow mornings, coffee dates, and thoughtful little gifts.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    "Classic flavours",
                    "Freshly baked",
                    "Perfect for gifting",
                    "Small-batch daily",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-900/10 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  href="/shop"
                  className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Explore muffins
                  <span aria-hidden>→</span>
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: "Classic muffin",
                    note: "Soft crumb and golden finish.",
                    tint: "from-[#f8d8ae] to-[#f3b15b]",
                  },
                  {
                    title: "Seasonal picks",
                    note: "Flavours that change with the season.",
                    tint: "from-[#d9e6ff] to-[#8bb8ff]",
                  },
                  {
                    title: "Gift-friendly",
                    note: "Easy to share and easy to enjoy.",
                    tint: "from-[#f6d4dc] to-[#e29ab3]",
                  },
                  {
                    title: "Daily fresh",
                    note: "Made in small batches each day.",
                    tint: "from-[#d8f5e7] to-[#7cd0a8]",
                  },
                ].map((item, index) => (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-slate-900/10 bg-white/80 p-4 shadow-sm shadow-slate-900/[0.03]"
                  >
                    <div
                      className={`mb-4 flex h-20 items-center justify-center rounded-[1.15rem] bg-gradient-to-br ${item.tint}`}
                    >
                      <span className="text-3xl" aria-hidden>
                        {index === 0 ? "◌" : index === 1 ? "✦" : index === 2 ? "❋" : "✧"}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </div>
                    <div className="mt-1 text-xs leading-relaxed text-slate-600">
                      {item.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-[2rem] border border-slate-900/10 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.03)] sm:p-8">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1a5f9e]">
                  The Moja difference
                </p>
                <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
                  Crafted with restraint, richness, and intention.
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  We believe the best bakes are balanced — indulgent but not heavy, elegant but never fussy.
                </p>
              </div>

              <div className="lg:col-span-7">
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { value: "Daily", label: "Made in small batches" },
                    { value: "1PM", label: "Order cut-off for selected slots" },
                    { value: "Mon–Sat", label: "Fresh-bake schedule" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-[1.5rem] border border-slate-900/10 bg-[#f9fbff] p-5 shadow-sm shadow-slate-900/[0.02]"
                    >
                      <div className="text-3xl font-semibold text-slate-900">
                        {stat.value}
                      </div>
                      <div className="mt-2 text-sm leading-relaxed text-slate-600">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="rounded-3xl border border-slate-900/10 bg-gradient-to-br from-white via-white to-[#f0f7ff] p-6 sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-display text-2xl font-medium tracking-tight text-slate-900 sm:text-3xl">
                  Real reviews from real celebrations
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                  Social proof reduces hesitation — here&apos;s what customers
                  say about freshness, delivery, and flavor balance.
                </p>
              </div>
              <OrderInAppButton label="Visit app" />
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {[
                {
                  name: "Rain Prince",
                  text: "Sweet and light, with surprising layers. Would order again — would love more small-size options.",
                  meta: "10 Mar 26",
                },
                {
                  name: "Jaslene K",
                  text: "Fresh, moist, full of texture. Customer service was prompt and delivery was on time.",
                  meta: "03 Mar 26",
                },
                {
                  name: "Norhayati",
                  text: "Fast delivery and great balance of sweet/sour. Perfect size — no leftovers.",
                  meta: "04 Feb 26",
                },
              ].map((r) => (
                <blockquote
                  key={r.name}
                  className="rounded-3xl border border-slate-900/10 bg-white/90 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-slate-900">{r.name}</div>
                    <div className="text-xs text-slate-400">{r.meta}</div>
                  </div>
                  <p
                    className="mt-2 text-amber-500"
                    aria-label="5 out of 5 stars"
                  >
                    ★★★★★
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    “{r.text}”
                  </p>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-6xl px-4 pb-16">
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-slate-900/10 bg-white/85 p-6">
                <div className="text-sm font-semibold text-slate-900">
                  Follow us on Instagram
                </div>
                <div className="mt-2 text-sm leading-relaxed text-slate-600">
                  New drops, behind-the-scenes, and limited editions — follow
                  before they sell out.
                </div>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800">
                  @mojamaison
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-slate-900/10 bg-white/85 p-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Operation hours
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                      <div>Web - Mon: 11:00 AM - 8:00 PM</div>
                      <div>Tue: OFF</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Connect
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                      <div>
                        Email:{" "}
                        <a
                          className="font-medium text-slate-800 hover:text-slate-900"
                          href="#"
                        >
                          admin@mojamaison.com
                        </a>
                      </div>
                      <div>
                        Phone:{" "}
                        <a
                          className="font-medium text-slate-800 hover:text-slate-900"
                          href="#"
                        >
                          +60 11-3933 1134
                        </a>
                      </div>
                      <div className="mt-3">
                        <Link
                          href="/contact"
                          className="text-sm font-semibold text-[#1a5f9e] hover:text-slate-900"
                        >
                          WhatsApp, email &amp; social →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="faq" className="mt-6 border-t border-slate-900/10 pt-6">
                  <div className="text-sm font-semibold text-slate-900">FAQ</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        q: "Can I get same-day delivery?",
                        a: "Selected items only. Order before 1PM (Mon–Sat).",
                      },
                      {
                        q: "Do you bake upon order?",
                        a: "Yes — preorder required for freshness and quality.",
                      },
                    ].map((x) => (
                      <div
                        key={x.q}
                        className="rounded-2xl border border-slate-900/10 bg-white/70 p-4"
                      >
                        <div className="text-sm font-semibold text-slate-900">
                          {x.q}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">{x.a}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
