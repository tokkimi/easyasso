import { prisma } from './prisma';
import type { BuiltTemplate } from './templates';

// Replaces a site's pages/blocks and theme/header/footer with a template.
// Generation is a clean replacement. Nothing from the previous site's
// header, footer, pages or blocks is reused.
export async function applyTemplateToSite(siteId: string, template: BuiltTemplate, orgName: string) {
  const header = {
    ...template.header,
    logoText: orgName,
    logoUrl: template.header.logoUrl || undefined,
  };
  const footer = {
    ...template.footer,
    logoText: orgName,
    logoUrl: template.footer.logoUrl || undefined,
    allRightsText: `© ${new Date().getFullYear()} ${orgName}. Tous droits réservés.`,
  };

  await prisma.$transaction(async (tx) => {
    await tx.page.deleteMany({ where: { siteId } });
    await tx.site.update({ where: { id: siteId }, data: { theme: template.theme as any, header: header as any, footer: footer as any } });
    for (let p = 0; p < template.pages.length; p++) {
      const page = template.pages[p];
      await tx.page.create({
        data: {
          siteId, title: page.title, slug: page.slug, order: p,
          isHome: page.isHome, showInNav: page.showInNav,
          blocks: { create: page.blocks.map((b: any) => ({ type: b.type, order: b.order, content: b.content, style: b.style })) },
        },
      });
    }
  });
}
