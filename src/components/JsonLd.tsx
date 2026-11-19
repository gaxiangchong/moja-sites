/**
 * Renders a schema.org JSON-LD block.
 *
 * `<` is escaped to its unicode form so a product name or description coming
 * from the catalog API can never close the script tag (XSS via structured
 * data), per the Next.js JSON-LD guidance.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
