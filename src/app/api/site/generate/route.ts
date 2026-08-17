import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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
    const previousProfile = (ctx.org.profile as Record<string, any>) || {};
    const requestedSlogan = typeof b.slogan === 'string' && b.slogan.trim() ? b.slogan.trim() : (previousProfile.slogan || '');
    const generateLegal = b.generateCgv !== false;

    if (b.name && b.name.trim() && b.name.trim() !== ctx.org.name) {
      await prisma.organization.update({ where: { id: ctx.org.id }, data: { name: b.name.trim() } });
    }

    const input: GenerateInput = {
      name,
      language: b.language === 'en' ? 'en' : 'fr',
      slogan: requestedSlogan || undefined,
      generateCgv: generateLegal,
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
    const donation = {
      locale: input.language, title: input.language === 'en' ? 'Support our causes' : 'Soutenir nos causes',
      intro: input.language === 'en' ? 'Your donation directly supports all our work.' : 'Votre don soutient directement l’ensemble de nos actions.',
      cardEnabled: b.donationCardEnabled ?? previousProfile.donationCardEnabled ?? false,
      stripeUrl: b.donationStripeUrl ?? previousProfile.donationStripeUrl ?? '', helloAssoUrl: b.donationHelloAssoUrl ?? previousProfile.donationHelloAssoUrl ?? '',
      helloAssoEnabled: b.donationHelloAssoEnabled ?? previousProfile.donationHelloAssoEnabled ?? !!(b.donationHelloAssoUrl || previousProfile.donationHelloAssoUrl),
      transferEnabled: b.donationTransferEnabled ?? previousProfile.donationTransferEnabled ?? false,
      iban: b.donationIban ?? previousProfile.donationIban ?? '', bic: b.donationBic ?? previousProfile.donationBic ?? '',
      accountHolder: b.donationAccountHolder ?? previousProfile.donationAccountHolder ?? '', bankName: b.donationBankName ?? previousProfile.donationBankName ?? '',
      chequeEnabled: b.donationChequeEnabled ?? previousProfile.donationChequeEnabled ?? false,
      chequePayable: b.donationChequePayable ?? previousProfile.donationChequePayable ?? '', chequeAddress: b.donationChequeAddress ?? previousProfile.donationChequeAddress ?? '',
    };
    const leetchi = {
      locale: input.language,
      title: input.language === 'en' ? 'Our Leetchi money pot' : 'Notre cagnotte Leetchi',
      intro: input.language === 'en' ? 'Follow the campaign progress and contribute securely on Leetchi.' : 'Suivez l’avancement de la collecte et participez en toute sécurité sur Leetchi.',
      url: b.leetchiUrl ?? previousProfile.leetchiUrl ?? '',
      embedUrl: b.leetchiEmbedUrl ?? previousProfile.leetchiEmbedUrl ?? '',
      embedCode: b.leetchiEmbedCode ?? previousProfile.leetchiEmbedCode ?? '',
      collectedEuros: b.leetchiCollectedEuros ?? previousProfile.leetchiCollectedEuros ?? '',
      goalEuros: b.leetchiGoalEuros ?? previousProfile.leetchiGoalEuros ?? '',
      buttonText: input.language === 'en' ? 'Contribute on Leetchi' : 'Participer à la cagnotte',
    };
    const isDonationText = (value = '') => /\bfaire[-\s]*un[-\s]*don\b|\bdon\b|donat|soutenir|support|donate/i.test(value);
    let donationPage = generated.pages.find((page: any) => isDonationText(`${page.slug} ${page.title}`));
    if (!donationPage) {
      donationPage = { title: input.language === 'en' ? 'Donate' : 'Faire un don', slug: input.language === 'en' ? 'donate' : 'don', isHome: false, showInNav: true, blocks: [] };
      generated.pages.push(donationPage);
    }
    const donationHref = `/${donationPage.slug}`;
    const fixDonationButton = (button: any) => {
      if (!button) return button;
      const label = String(button.text || '');
      const href = String(button.href || '');
      if (isDonationText(label) || href === '/don' || href === '/donate' || href === '#don') return { ...button, href: donationHref };
      return button;
    };
    generated.header = { ...(generated.header as any), cta: fixDonationButton((generated.header as any)?.cta) };
    generated.footer = {
      ...(generated.footer as any),
      columns: (((generated.footer as any)?.columns || []) as any[]).map((column) => ({
        ...column,
        links: (column.links || []).map((link: any) => isDonationText(`${link.label || ''} ${link.href || ''}`) ? { ...link, href: donationHref } : link),
      })),
    };
    if (donationPage) {
      donationPage.blocks = donationPage.blocks.filter((block: any) => block.type !== 'html' && !(block.type === 'text' && /collez ici|stripe|helloasso|configur/i.test(block.content?.text || '')));
      donationPage.blocks.push({ type: 'donation', order: donationPage.blocks.length, content: donation, style: defaultStyleFor('donation') });
      if ((b.leetchiEnabled ?? previousProfile.leetchiEnabled ?? !!leetchi.url) && leetchi.url) {
        donationPage.blocks.push({ type: 'leetchi', order: donationPage.blocks.length, content: leetchi, style: defaultStyleFor('leetchi') });
      }
      donationPage.blocks.forEach((block: any, order: number) => { block.order = order; });
    }
    for (const page of generated.pages) {
      for (const block of page.blocks || []) {
        if (block.content?.button) block.content.button = fixDonationButton(block.content.button);
      }
    }

    const site = await prisma.site.findUniqueOrThrow({ where: { organizationId: ctx.org.id } });
    await applyTemplateToSite(site.id, generated, name);
    const profile = previousProfile;
    const legal = legalDocuments({ ...profile, email: input.email || profile.email, language: input.language }, name);
    const updatedSite = await prisma.site.update({
      where: { id: site.id },
      data: {
        name,
        published: true,
        footer: { ...(generated.footer as any), text: requestedSlogan || (input.language === 'en' ? 'Together, we make a difference.' : 'Ensemble, faisons la différence.'), showCgv: generateLegal, showMentions: generateLegal, cgvContent: generateLegal ? legal.cgv : '', mentionsContent: generateLegal ? legal.details : '' },
      },
    });
    await prisma.organization.update({ where: { id: ctx.org.id }, data: { profile: { ...profile, language: input.language, slogan: requestedSlogan, generateCgv: generateLegal, year: input.year || profile.year || '', mission: input.mission || profile.mission || '', functioning: input.functioning || profile.functioning || '', actions: input.actions || profile.actions || '', beneficiaries: input.beneficiaries || profile.beneficiaries || '', goodToKnow: input.goodToKnow || profile.goodToKnow || '', city: input.city || profile.city || '', email: input.email || profile.email || '', category: input.category || profile.category || '', donationCardEnabled: donation.cardEnabled, donationStripeUrl: donation.stripeUrl, donationHelloAssoEnabled: donation.helloAssoEnabled, donationHelloAssoUrl: donation.helloAssoUrl, donationTransferEnabled: donation.transferEnabled, donationIban: donation.iban, donationBic: donation.bic, donationAccountHolder: donation.accountHolder, donationBankName: donation.bankName, donationChequeEnabled: donation.chequeEnabled, donationChequePayable: donation.chequePayable, donationChequeAddress: donation.chequeAddress, leetchiEnabled: b.leetchiEnabled ?? profile.leetchiEnabled ?? !!leetchi.url, leetchiUrl: leetchi.url, leetchiEmbedUrl: leetchi.embedUrl, leetchiEmbedCode: leetchi.embedCode, leetchiCollectedEuros: leetchi.collectedEuros, leetchiGoalEuros: leetchi.goalEuros } } });
    revalidatePath('/dashboard/editor');
    revalidatePath('/dashboard/generate');
    revalidatePath(`/s/${site.subdomain}`);
    for (const page of generated.pages) revalidatePath(`/s/${site.subdomain}/${page.slug}`);
    return NextResponse.json({ ok: true, siteVersion: updatedSite.updatedAt.toISOString() });
  } catch (e) { return handleApiError(e); }
}
