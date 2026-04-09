import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = "https://yeowon.dev";

  const body = `User-agent: *
Allow: /

Disallow: /admin
Disallow: /admin/login

Sitemap: ${baseUrl}/sitemap.xml
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
    },
  });
}