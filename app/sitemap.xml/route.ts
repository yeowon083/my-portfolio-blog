import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const baseUrl = "https://my-portfolio-blog-eight.vercel.app";
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("slug, created_at, updated_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const staticUrls = [
    `${baseUrl}/`,
    `${baseUrl}/about`,
    `${baseUrl}/projects`,
    `${baseUrl}/blog`,
  ];

  const staticXml = staticUrls
    .map(
      (url) => `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`
    )
    .join("");

  const postXml = (posts ?? [])
    .map((post) => {
      const lastModified = new Date(
        post.updated_at ?? post.created_at
      ).toISOString();

      return `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastModified}</lastmod>
  </url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticXml}${postXml}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
    },
  });
}