import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError, assertPageInOrg } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { defaultContentFor, defaultStyleFor, type BlockType } from '@/lib/blocks';

// Create block: { pageId, type }
export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const { pageId, type } = await req.json();
    await assertPageInOrg(pageId, ctx.org.id);
    const count = await prisma.block.count({ where: { pageId } });
    const content: any = defaultContentFor(type as BlockType);
    if (type === 'contact') {
      const profile = (ctx.org.profile as Record<string, string>) || {};
      const english = profile.language === 'en';
      content.locale = english ? 'en' : 'fr';
      if (english) Object.assign(content, { title: 'Contact us', intro: 'Have a question, a proposal or want to get involved? Send us a message.', buttonText: 'Send message', successText: 'Thank you, your message has been sent.' });
      content.email = profile.email || '';
      content.phone = profile.phone || '';
      content.address = profile.legalAddress || profile.city || '';
    }
    const block = await prisma.block.create({
      data: {
        pageId,
        type,
        order: count,
        content,
        style: defaultStyleFor(type as BlockType) as any,
      },
    });
    return NextResponse.json(block);
  } catch (e) {
    return handleApiError(e);
  }
}

// Reorder blocks: { pageId, ids: string[] }
export async function PATCH(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const { pageId, ids } = await req.json();
    await assertPageInOrg(pageId, ctx.org.id);
    await prisma.$transaction(
      (ids as string[]).map((id, order) =>
        prisma.block.updateMany({ where: { id, pageId }, data: { order } })
      )
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
