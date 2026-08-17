import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { buildGeneratedSite, type GenerateInput } from '@/lib/generate';
import { aiGenerateSite } from '@/lib/ai';
import { applyTemplateToSite } from '@/lib/apply-template';
import { legalDocuments } from '@/lib/legal';
import { defaultStyleFor } from '@/lib/blocks';

// AI copywriting can take 20-40s; allow up to 60s.
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const b = await req.json();
    const name = (b.name || '').trim() || ctx.org.name;

    if (b.name && b.name.trim() && b.name.trim() !== ctx.org.name) {
      await prisma.organization.update({ where: { id: ctx.org.id }, data: { name: b.name.trim() } });
    }

    const input: GenerateInput = {
      name,
      language: b.language === 'en' ? 'en' : 'fr',
      slogan: b.slogan || undefined,
      generateCgv: b.generateCgv !== false,
      year: b.year || undefined,
      mission: b.mission || b.description || undefined,
      functioning: b.functioning || undefined,
      goodToKnow: b.goodToKnow || undefined,
      beneficiaries: b.beneficiaries || undefined,
      actions: b.actions || undefined,
      news: b.news || undefined,
      city: b.city || undefined,
      email: b.email || undefined,
      category: b.category || undefined,
      logoUrl: b.logoUrl || undefined,
      photos: Array.isArray(b.photos) ? b.photos.slice(0, 8) : [],
    };

    // Try AI generation first (rich, all pages); fall back to the deterministic
    // builder if no API key or the model call fails.
    const generated = (await aiGenerateSite(input)) || buildGeneratedSite(input);
    const previousProfile = (ctx.org.profile as Record<string, any>) || {};
    const donation = {
      locale: input.language, title: input.language === 'en' ? 'Support our causes' : 'Soutenir nos causes',
      intro: input.language === 'en' ? 'Your donation directly supports all our work.' : 'Votre don soutient directement l’ensemble de nos actions.',
      cardEnabled: b.donationCardEnabled ?? previousProfile.donationCardEnabled ?? false,
      stripeUrl: b.donationStripeUrl ?? previousProfile.donationStripeUrl ?? '', helloAssoUrl: b.donationHelloAssoUrl ?? previousProfile.donationHelloAssoUrl ?? '',
      transferEnabled: b.donationTransferEnabled ?? previousProfile.donationTransferEnabled ?? false,
      iban: b.donationIban ?? previousProfile.donationIban ?? '', bic: b.donationBic ?? previousProfile.donationBic ?? '',
      accountHolder: b.donationAccountHolder ?? previousProfile.donationAccountHolder ?? '', bankName: b.donationBankName ?? previousProfile.donationBankName ?? '',
      chequeEnabled: b.donationChequeEnabled ?? previousProfile.donationChequeEnabled ?? false,
      chequePayable: b.donationChequePayable ?? previousProfile.donationChequePayable ?? '', chequeAddress: b.donationChequeAddress ?? previousProfile.donationChequeAddress ?? '',
    };
    const donationPage = generated.pages.find((page: any) => /(^don$|donat|soutenir|support)/i.test(`${page.slug} ${page.title}`));
    if (donationPage) {
      donationPage.blocks = donationPage.blocks.filter((block: any) => block.type !== 'html' && !(block.type === 'text' && /collez ici|stripe|helloasso|configur/i.test(block.content?.text || '')));
      donationPage.blocks.push({ type: 'donation', order: donationPage.blocks.length, content: donation, style: defaultStyleFor('donation') });
      donationPage.blocks.forEach((block: any, order: number) => { block.order = order; });
    }

    const site = await prisma.site.findUniqueOrThrow({ where: { organizationId: ctx.org.id } });
    await applyTemplateToSite(site.id, generated, name);
    const profile = previousProfile;
    const legal = legalDocuments({ ...profile, email: input.email || profile.email, language: input.language }, name);
    await prisma.site.update({
      where: { id: site.id },
      data: {
        name,
        published: true,
        footer: { ...(generated.footer as any), text: input.slogan || (generated.footer as any).text, showCgv: input.generateCgv !== false, showMentions: true, cgvContent: input.generateCgv !== false ? legal.cgv : '', mentionsContent: legal.details },
      },
    });
    await prisma.organization.update({ where: { id: ctx.org.id }, data: { profile: { ...profile, language: input.language, donationCardEnabled: donation.cardEnabled, donationStripeUrl: donation.stripeUrl, donationHelloAssoUrl: donation.helloAssoUrl, donationTransferEnabled: donation.transferEnabled, donationIban: donation.iban, donationBic: donation.bic, donationAccountHolder: donation.accountHolder, donationBankName: donation.bankName, donationChequeEnabled: donation.chequeEnabled, donationChequePayable: donation.chequePayable, donationChequeAddress: donation.chequeAddress } } });
    return NextResponse.json({ ok: true });
  } catch (e) { return handleApiError(e); }
}
