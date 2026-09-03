import type { Metadata } from "next";
import { VielusosAdminLogin } from "@/components/vielusos-admin-login";
import { prisma } from "@/lib/prisma";
import { VIELUSOS_SUBDOMAIN, vielusosLogoUrl } from "@/lib/vielusos";

export const dynamic = "force-dynamic";

async function loadLogo() {
  const site = await prisma.site.findUnique({
    where: { subdomain: VIELUSOS_SUBDOMAIN },
    select: { header: true, footer: true },
  });
  return vielusosLogoUrl(site);
}

export async function generateMetadata(): Promise<Metadata> {
  const logoUrl = await loadLogo();
  return {
    title: { absolute: "VIELUSOS · Administration" },
    applicationName: "VIELUSOS",
    description: "Administration du site officiel VIELUSOS.",
    manifest: "/api/vielusos/manifest",
    icons: { icon: [{ url: logoUrl }], apple: [{ url: logoUrl }] },
    robots: { index: false, follow: false },
  };
}

export default async function VielusosAdminPage() {
  return <VielusosAdminLogin logoUrl={await loadLogo()} />;
}
