import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireApiPermission, handleApiError, ApiError } from "@/lib/api";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { isVielusosSite, VIELUSOS_BRAND } from "@/lib/vielusos";

function cleanLogoUrl(value: unknown) {
  const url = String(value || "").trim();
  if (!url) return VIELUSOS_BRAND.logoUrl;
  if (url.length > 4_000_000)
    throw new ApiError(
      413,
      "Le logo est trop lourd. Choisissez une image plus légère.",
    );
  if (
    /^data:image\/(png|webp|jpeg|svg\+xml);/i.test(url) ||
    /^https:\/\//i.test(url) ||
    /^\/[a-z0-9/_\-.]+$/i.test(url)
  )
    return url;
  throw new ApiError(400, "Format de logo non accepté.");
}

function revalidateVielusos(site: {
  subdomain: string;
  customDomain: string | null;
}) {
  revalidatePath(`/s/${site.subdomain}`);
  revalidatePath(`/s/${site.subdomain}/boutique`);
  revalidatePath("/vielusos-admin");
  revalidatePath("/dashboard");
  if (site.customDomain) {
    revalidatePath(`/domain/${site.customDomain}`);
    revalidatePath(`/domain/${site.customDomain}/boutique`);
  }
}

export async function PATCH(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.ORG_SETTINGS);
    const site = await prisma.site.findUniqueOrThrow({
      where: { organizationId: ctx.org.id },
    });
    if (!isVielusosSite(site))
      throw new ApiError(404, "Réglage réservé à VIELUSOS.");
    const body = await req.json().catch(() => ({}));
    const logoUrl = cleanLogoUrl(body.logoUrl);
    const updated = await prisma.site.update({
      where: { id: site.id },
      data: {
        header: {
          ...((site.header as any) || {}),
          logoUrl,
          vielusosLogoUrl: logoUrl,
        },
        footer: {
          ...((site.footer as any) || {}),
          logoUrl,
          vielusosLogoUrl: logoUrl,
        },
      },
    });
    revalidateVielusos(site);
    return NextResponse.json({
      ok: true,
      logoUrl,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
