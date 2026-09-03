import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  VIELUSOS_BRAND,
  VIELUSOS_SUBDOMAIN,
  vielusosStoredLogoUrl,
} from "@/lib/vielusos";

export const dynamic = "force-dynamic";

function imageResponse(dataUrl: string) {
  const match =
    /^data:(image\/(?:png|webp|jpeg|svg\+xml));base64,([a-z0-9+/=]+)$/i.exec(
      dataUrl,
    );
  if (!match) return null;
  const body = Buffer.from(match[2], "base64");
  if (!body.length || body.length > 4_000_000) return null;
  return new NextResponse(body, {
    headers: {
      "Content-Type": match[1],
      "Cache-Control": "private, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(request: Request) {
  const site = await prisma.site.findUnique({
    where: { subdomain: VIELUSOS_SUBDOMAIN },
    select: { header: true, footer: true },
  });
  const logoUrl = vielusosStoredLogoUrl(site);
  const embedded = imageResponse(logoUrl);
  if (embedded) return embedded;

  const fallback =
    logoUrl === "/api/vielusos/logo" || logoUrl.startsWith("data:")
      ? VIELUSOS_BRAND.logoUrl
      : logoUrl;
  return NextResponse.redirect(new URL(fallback, request.url), 307);
}
