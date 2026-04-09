import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = "https://my-portfolio-blog-eight.vercel.app";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
  </url>
  <url>
    <loc>${baseUrl}/projects</loc>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
  </url>
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
    },
  });
}