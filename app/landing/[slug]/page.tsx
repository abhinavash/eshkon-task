import { getContentfulClient, QUERIES } from "../../../lib/contentful";
import Hero from "../../../components/blocks/Hero";
import TwoColumnRow from "../../../components/blocks/TwoColumnRow";
import ImageGrid2x2 from "../../../components/blocks/ImageGrid2x2";
import { Metadata } from "next";

export const dynamicParams = false;
export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const client = getContentfulClient(false);
    const data = await client.request<any>(QUERIES.pageSlugs);
    const slugs = (data.pageCollection?.items ?? [])
      .map((i: any) => i.slug)
      .filter(Boolean);
    if (slugs.length) return slugs.map((slug: string) => ({ slug }));
  } catch {}
  return [{ slug: "page-1" }, { slug: "page-2" }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Landing: ${slug}`,
    description: `Landing page ${slug}`,
  };
}

async function getData(slug: string) {
  try {
    const client = getContentfulClient(false);
    const data = await client.request<any>(QUERIES.pageBySlug, { slug });
    const page = data.pageCollection?.items?.[0];
    const blocks = (page?.layoutConfig ?? []) as any[];
    // Optionally resolve linked entries per block if entryId exists
    const resolved = await Promise.all(
      blocks.map(async (b: any) => {
        if (!b.entryId) return b;
        const res = await client.request<any>(QUERIES.blockById, { id: b.entryId });
        return { ...b, data: res.hero || res.twoCol || res.asset };
      })
    );
    return { page, blocks: resolved };
  } catch (e) {
    return { page: { title: slug }, blocks: [] } as any;
  }
}

export default async function LandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { page, blocks } = await getData(slug);

  return (
    <main>
      <nav className="nav">
        <a href="/landing/page-1">Page 1</a> | <a href="/landing/page-2">Page 2</a>
      </nav>
      {blocks.map((b: any, i: number) => {
        if (b.type === "hero") {
          const d = b.data || {};
          if (!d.heading && !d.backgroundImage?.url && !d.subtitle && !d.ctaLabel) return null;
          return <Hero key={i} heading={d.heading ?? ""} subtitle={d.subtitle} ctaLabel={d.ctaLabel} ctaHref={d.ctaHref} backgroundUrl={d.backgroundImage?.url} />;
        }
        if (b.type === "twoColumn") {
          const d = b.data || {};
          if (!d.leftHeading && !d.leftSubtitle && !d.leftCtaLabel && !d.rightImage?.url) return null;
          return <TwoColumnRow key={i} leftHeading={d.leftHeading ?? ""} leftSubtitle={d.leftSubtitle} leftCtaLabel={d.leftCtaLabel} leftCtaHref={d.leftCtaHref} rightImageUrl={d.rightImage?.url} />;
        }
        if (b.type === "imageGrid") {
          const imgs = (b.data?.images as any[])?.filter((it: any) => it?.url) || [];
          if (!imgs.length) return null;
          return <ImageGrid2x2 key={i} images={imgs} />;
        }
        return null;
      })}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: page?.title ?? slug,
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "/" },
            { "@type": "ListItem", position: 2, name: page?.title ?? slug, item: `/landing/${slug}` },
          ]
        }
      }) }} />
    </main>
  );
}
