import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FactIcon } from "@/components/b2b/FactIcon";
import { getB2bConfig } from "@/lib/b2bConfig";
import {
  getB2bContactTargets,
  mailtoHref,
  productEnquiryMessage,
  whatsAppHref,
} from "@/lib/b2bEnquiry";
import { buildB2bMenu } from "@/lib/b2bMenu";
import { getShopSections } from "@/lib/products";

export const metadata: Metadata = {
  title: "Wholesale & corporate orders — Moja Maison",
  description:
    "Moja Maison supplies cafés, hotels, offices and retail partners with small-batch cakes, loaves and cookie jars. Request the wholesale price list over WhatsApp or email.",
};

export const revalidate = 300;

const PRIMARY_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#62a6ff] to-[#57f0ff] px-7 py-3.5 text-sm font-semibold text-[#050a14] shadow-[0_16px_48px_rgba(98,166,255,0.3)] transition hover:brightness-110";

const SECONDARY_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-full border border-slate-900/15 bg-white px-7 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-900/25 hover:bg-slate-50";

function WhatsAppIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

/** WhatsApp + email pair, used in the hero and the closing CTA. */
function EnquiryActions({
  whatsapp,
  email,
  whatsappLabel,
  emailLabel,
  variant = "light",
}: {
  whatsapp: string | null;
  email: string | null;
  whatsappLabel: string;
  emailLabel: string;
  variant?: "light" | "dark";
}) {
  const secondary =
    variant === "dark"
      ? "inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
      : SECONDARY_BUTTON;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {whatsapp ? (
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={PRIMARY_BUTTON}>
          <WhatsAppIcon />
          {whatsappLabel}
        </a>
      ) : null}
      {email ? (
        <a href={email} className={whatsapp ? secondary : PRIMARY_BUTTON}>
          <MailIcon />
          {emailLabel}
        </a>
      ) : null}
    </div>
  );
}

export default async function BusinessPage() {
  const cfg = getB2bConfig();
  const { whatsappUrl, emailAddress } = getB2bContactTargets();
  const menuGroups = buildB2bMenu(await getShopSections());

  const heroWhatsapp = whatsAppHref(whatsappUrl, cfg.enquiry.whatsappMessage);
  const heroEmail = mailtoHref(emailAddress, cfg.enquiry.emailSubject, cfg.enquiry.emailBody);
  const priceListWhatsapp = whatsAppHref(whatsappUrl, cfg.enquiry.priceListMessage);
  const priceListHref = priceListWhatsapp ?? heroEmail;

  // Keep the header CTA on the enquiry path rather than the consumer app.
  const headerCta = heroWhatsapp ?? heroEmail ?? "#enquire";

  return (
    <div className="flex flex-col flex-1">
      <div className="border-b border-slate-900/10 bg-slate-900 text-center text-[11px] font-medium tracking-wide text-white sm:text-xs">
        <div className="mx-auto max-w-6xl px-4 py-2.5">
          <span className="text-[#9edcff]">For business</span> — wholesale, corporate gifting
          &amp; events
          {cfg.enquiry.responseNote ? (
            <>
              <span className="mx-2 text-slate-400">·</span>
              {cfg.enquiry.responseNote}
            </>
          ) : null}
        </div>
      </div>

      <SiteHeader ctaHref={headerCta} ctaLabel="Talk to us" />

      <main className="flex-1">
        {/* Hero — split layout keeps this reading as a business page rather
            than the consumer storefront. */}
        <section className="mx-auto max-w-6xl px-4 pt-10 pb-6 sm:pt-14">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/80 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#1a5f9e]">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#62a6ff]" aria-hidden />
                {cfg.eyebrow}
              </div>

              <h1 className="font-display mt-5 text-balance text-4xl font-medium leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
                {cfg.headline}
              </h1>
              <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
                {cfg.subheadline}
              </p>

              {cfg.heroHighlights.length > 0 ? (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {cfg.heroHighlights.map((point) => (
                    <li
                      key={point}
                      className="rounded-full border border-slate-900/10 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-slate-700"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-8">
                <EnquiryActions
                  whatsapp={heroWhatsapp}
                  email={heroEmail}
                  whatsappLabel="Enquire on WhatsApp"
                  emailLabel="Email us"
                />
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Prefer to look first?{" "}
                <Link href="#products" className="font-semibold text-[#1a5f9e] hover:text-slate-900">
                  See the range
                </Link>
                <span className="mx-2 text-slate-300">·</span>
                <Link href="/shop" className="font-semibold text-[#1a5f9e] hover:text-slate-900">
                  Browse the retail shop
                </Link>
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-900/10 bg-slate-100 shadow-[0_24px_80px_rgba(11,18,32,0.12)]">
                <Image
                  src={cfg.heroImage}
                  alt={cfg.heroImageAlt}
                  fill
                  className="object-cover object-center"
                  sizes="(min-width: 1024px) 560px, 100vw"
                  priority
                  fetchPriority="high"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Commercial terms up front — B2B buyers screen on these first. */}
        {cfg.facts.length > 0 ? (
          <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="at-a-glance">
            <div className="rounded-3xl border border-slate-900/10 bg-white/85 p-6 sm:p-8">
              <h2
                id="at-a-glance"
                className="font-display text-2xl font-medium tracking-tight text-slate-900"
              >
                {cfg.factsTitle}
              </h2>
              <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {cfg.facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="flex gap-4 rounded-2xl border border-slate-900/8 bg-gradient-to-br from-[#f7fbff] to-white p-4"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#62a6ff]/20 to-[#57f0ff]/15 text-[#1a5f9e]">
                      <FactIcon name={fact.icon} className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-[#1a5f9e]">
                        {fact.label}
                      </dt>
                      <dd className="mt-1.5 text-sm leading-relaxed text-slate-700">
                        {fact.value}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
              {cfg.factsNote ? <p className="mt-5 text-sm text-slate-500">{cfg.factsNote}</p> : null}
            </div>
          </section>
        ) : null}

        {cfg.segments.length > 0 ? (
          <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="segments">
            <div className="max-w-2xl">
              <h2
                id="segments"
                className="font-display text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl"
              >
                {cfg.segmentsTitle}
              </h2>
              {cfg.segmentsIntro ? (
                <p className="mt-3 text-base leading-relaxed text-slate-600">{cfg.segmentsIntro}</p>
              ) : null}
            </div>

            {/* Two columns only from lg: between 640 and 1024 the photo rail
                leaves too little width for the copy beside it. */}
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {cfg.segments.map((segment) => (
                <article
                  key={segment.title}
                  className="group flex overflow-hidden rounded-3xl border border-slate-900/10 bg-white/90 shadow-sm shadow-slate-900/[0.04] transition hover:-translate-y-0.5 hover:border-slate-900/15 hover:shadow-md"
                >
                  {segment.image ? (
                    // Fixed-width rail so every card lines up regardless of
                    // how much copy it carries.
                    <div className="relative w-28 shrink-0 self-stretch bg-slate-100 sm:w-36 lg:w-40">
                      <Image
                        src={segment.image}
                        alt={segment.imageAlt}
                        fill
                        // The rail is a tall, narrow crop, so a photo whose
                        // subject sits off-centre needs its own focal point.
                        style={{ objectPosition: segment.imagePosition }}
                        className="object-cover transition duration-500 group-hover:scale-[1.04]"
                        sizes="(min-width: 1024px) 160px, 144px"
                      />
                    </div>
                  ) : null}

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="text-lg font-semibold text-slate-900">{segment.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                      {segment.body}
                    </p>
                    {segment.examples.length > 0 ? (
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {segment.examples.map((example) => (
                          <li
                            key={example}
                            className="rounded-full bg-slate-900/[0.04] px-3 py-1 text-xs font-medium text-slate-600"
                          >
                            {example}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {cfg.potential.length > 0 ? (
          <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="potential">
            <div className="overflow-hidden rounded-3xl border border-slate-900/10 bg-gradient-to-br from-[#f7fbff] via-white to-[#f0f7ff]">
              <div className="p-6 sm:p-10">
                <div className="max-w-2xl">
                  <h2
                    id="potential"
                    className="font-display text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl"
                  >
                    {cfg.potentialTitle}
                  </h2>
                  {cfg.potentialIntro ? (
                    <p className="mt-3 text-base leading-relaxed text-slate-600">
                      {cfg.potentialIntro}
                    </p>
                  ) : null}
                </div>

                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {cfg.potential.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-slate-900/10 bg-white/85 p-5"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#62a6ff]/20 to-[#57f0ff]/15">
                        <span
                          className="h-2 w-2 rounded-full bg-gradient-to-br from-[#62a6ff] to-[#57f0ff]"
                          aria-hidden
                        />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* The range — the real catalogue, grouped the way the shop groups it. */}
        <section id="products" className="mx-auto max-w-6xl px-4 py-10 scroll-mt-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
                {cfg.productsTitle}
              </h2>
              {cfg.productsIntro ? (
                <p className="mt-3 text-base leading-relaxed text-slate-600">{cfg.productsIntro}</p>
              ) : null}
            </div>
            {priceListHref ? (
              <a
                href={priceListHref}
                {...(priceListWhatsapp
                  ? { target: "_blank" as const, rel: "noopener noreferrer" as const }
                  : {})}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-slate-900/15 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-900/25 hover:bg-slate-50"
              >
                {cfg.productsCtaLabel}
              </a>
            ) : null}
          </div>

          <div className="mt-10 space-y-12">
            {menuGroups.map((group) => (
              <div key={group.id}>
                <div className="flex flex-col gap-1 border-b border-slate-900/10 pb-4">
                  <h3 className="font-display text-2xl font-medium tracking-tight text-slate-900">
                    {group.title}
                  </h3>
                  {group.description ? (
                    <p className="text-sm leading-relaxed text-slate-600">{group.description}</p>
                  ) : null}
                </div>

                {/* Menu-style list, no photography: the shop already carries
                    the product imagery, and a buyer scanning a range wants
                    names they can tick off, not another gallery. */}
                <ul className="mt-2 grid sm:grid-cols-2 sm:gap-x-10">
                  {group.items.map((product) => {
                    const message = productEnquiryMessage(
                      cfg.enquiry.productMessageTemplate,
                      product.name,
                    );
                    const enquiryHref =
                      whatsAppHref(whatsappUrl, message) ??
                      mailtoHref(
                        emailAddress,
                        `${cfg.enquiry.emailSubject} — ${product.name}`,
                        message,
                      );

                    const label = (
                      <>
                        <span className="truncate text-[15px] font-medium text-slate-800 transition group-hover/item:text-[#1a5f9e]">
                          {product.name}
                        </span>
                        {product.badge ? (
                          <span className="shrink-0 rounded-full bg-slate-900/[0.05] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            {product.badge}
                          </span>
                        ) : null}
                      </>
                    );

                    return (
                      <li
                        key={product.key}
                        className="flex items-center justify-between gap-4 border-b border-slate-900/[0.07] py-3"
                      >
                        {product.slug ? (
                          <Link
                            href={`/product/${product.slug}`}
                            className="group/item flex min-w-0 items-center gap-2"
                          >
                            {label}
                          </Link>
                        ) : (
                          // Not in the catalog yet, so there is no page to
                          // link to — the name and the enquiry link still are
                          // the two things a trade buyer needs.
                          <span className="flex min-w-0 items-center gap-2">{label}</span>
                        )}

                        {enquiryHref ? (
                          <a
                            href={enquiryHref}
                            {...(enquiryHref.startsWith("http")
                              ? { target: "_blank" as const, rel: "noopener noreferrer" as const }
                              : {})}
                            className="shrink-0 text-xs font-semibold text-[#1a5f9e] transition hover:text-slate-900"
                          >
                            Enquire <span aria-hidden>→</span>
                          </a>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {cfg.process.length > 0 ? (
          <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="process">
            <div className="max-w-2xl">
              <h2
                id="process"
                className="font-display text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl"
              >
                {cfg.processTitle}
              </h2>
              {cfg.processIntro ? (
                <p className="mt-3 text-base leading-relaxed text-slate-600">{cfg.processIntro}</p>
              ) : null}
            </div>

            <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {cfg.process.map((step, idx) => (
                <li key={step.title} className="rounded-3xl border border-slate-900/10 bg-white/90 p-5">
                  <span className="font-display inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {idx + 1}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {cfg.faqs.length > 0 ? (
          <section id="faq" className="mx-auto max-w-6xl px-4 py-10 scroll-mt-24" aria-labelledby="faq-title">
            <h2
              id="faq-title"
              className="font-display text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl"
            >
              {cfg.faqTitle}
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {cfg.faqs.map((faq) => (
                <div key={faq.q} className="rounded-3xl border border-slate-900/10 bg-white/85 p-5">
                  <h3 className="text-sm font-semibold text-slate-900">{faq.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Closing CTA — the checklist raises the quality of inbound leads. */}
        <section id="enquire" className="mx-auto max-w-6xl px-4 py-12 scroll-mt-24">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b1220] shadow-[0_32px_90px_rgba(11,18,32,0.35)]">
            <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <h2 className="font-display text-3xl font-medium tracking-tight text-white sm:text-4xl">
                  {cfg.ctaTitle}
                </h2>
                {cfg.ctaBody ? (
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
                    {cfg.ctaBody}
                  </p>
                ) : null}

                <div className="mt-8">
                  <EnquiryActions
                    whatsapp={heroWhatsapp}
                    email={heroEmail}
                    whatsappLabel="Message us on WhatsApp"
                    emailLabel={emailAddress ?? "Email us"}
                    variant="dark"
                  />
                </div>

                {cfg.enquiry.responseNote ? (
                  <p className="mt-4 text-sm text-slate-400">{cfg.enquiry.responseNote}</p>
                ) : null}
              </div>

              {cfg.ctaChecklist.length > 0 ? (
                <div className="lg:col-span-5">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[#9edcff]">
                      Include in your message
                    </div>
                    <ul className="mt-4 space-y-2.5">
                      {cfg.ctaChecklist.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm text-slate-200">
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#57f0ff]"
                            aria-hidden
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Looking for a single cake instead?{" "}
            <Link href="/shop" className="font-semibold text-[#1a5f9e] hover:text-slate-900">
              Browse the retail shop
            </Link>
            <span className="mx-2 text-slate-300">·</span>
            <Link href="/contact" className="font-semibold text-[#1a5f9e] hover:text-slate-900">
              All contact channels
            </Link>
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
