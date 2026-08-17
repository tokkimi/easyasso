import { prisma } from './prisma';
import type { BuiltTemplate } from './templates';

// Replaces a site's pages/blocks and theme/header/footer with a template.
// Preserves the association's own logo text/image if already set.
export async function applyTemplateToSite(siteId: string, template: BuiltTemplate, orgName: string) {
  const site = await prisma.site.findUniqueOrThrow({ where: { id: siteId } });
  const prevHeader = (site.header as any) || {};
  const prevFooter = (site.footer as any) || {};

  // Prefer a logo supplied by the template (e.g. the magic generator), else
  // keep the association's existing logo.
  const header = {
    ...template.header,
    logoText: orgName,
    logoUrl: template.header.logoUrl || prevHeader.logoUrl || undefined,
  };
  const footer = {
    ...template.footer,
    logoText: orgName,
    logoUrl: template.footer.logoUrl || prevFooter.logoUrl || undefined,
    allRightsText: `© ${new Date().getFullYear()} ${orgName}. Tous droits réservés.`,
  };

  await prisma.$transaction([
    prisma.page.deleteMany({ where: { siteId } }),
    prisma.site.update({
      where: { id: siteId },
      data: { theme: template.theme as any, header: header as any, footer: footer as any },
    }),
  ]);

  // Recreate pages + blocks
  for (let p = 0; p < template.pages.length; p++) {
    const page = template.pages[p];
    const created = await prisma.page.create({
      data: {
        siteId,
        title: page.title,
        slug: page.slug,
        order: p,
        isHome: page.isHome,
        showInNav: page.showInNav,
      },
    });
    if (page.blocks.length) {
      await prisma.block.createMany({
        data: page.blocks.map((b: any) => ({
          pageId: created.id,
          type: b.type,
          order: b.order,
          content: b.content,
          style: b.style,
        })),
      });
    }
  }
}
