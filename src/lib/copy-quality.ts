import type { BuiltTemplate } from './templates';

type Lang = 'fr' | 'en';

function normalizeCopy(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(value: string) {
  return new Set(normalizeCopy(value).split(' ').filter((word) => word.length > 3));
}

function similarity(a: string, b: string) {
  const ta = tokens(a);
  const tb = tokens(b);
  if (!ta.size || !tb.size) return 0;
  let common = 0;
  for (const word of ta) if (tb.has(word)) common += 1;
  return common / Math.min(ta.size, tb.size);
}

function isDuplicate(a: string, b: string) {
  const na = normalizeCopy(a);
  const nb = normalizeCopy(b);
  if (na.length < 90 || nb.length < 90) return false;
  return na === nb || similarity(a, b) >= 0.82;
}

function paragraphs(value = '') {
  return value
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function joinParagraphs(parts: string[]) {
  return parts.join('\n\n');
}

function replacementText(language: Lang, pageTitle: string, order: number) {
  const en = language === 'en';
  const lower = normalizeCopy(pageTitle);
  if (lower.includes('impact')) {
    return en
      ? 'This section focuses on what changes for the people supported by the association: clearer information, more accessible help and a stronger link between volunteers, members and local partners. The goal is to make each action useful, understandable and easy to follow over time.'
      : 'Cette partie met en avant ce qui change concrètement pour les personnes accompagnées : une information plus claire, une aide plus accessible et un lien plus solide entre bénévoles, adhérents et partenaires. L’objectif est de rendre chaque action utile, compréhensible et suivie dans la durée.';
  }
  if (lower.includes('action') || lower.includes('work')) {
    return en
      ? 'The association turns its mission into practical activities: welcoming people, organising initiatives, coordinating volunteers and adapting each project to real needs. This method keeps the work concrete, readable and open to anyone who wants to contribute.'
      : 'L’association transforme sa mission en actions concrètes : accueillir, organiser des initiatives, coordonner les bénévoles et adapter chaque projet aux besoins réels. Cette méthode permet de garder un fonctionnement lisible, utile et ouvert à toutes les personnes qui souhaitent contribuer.';
  }
  if (lower.includes('engag') || lower.includes('involv') || lower.includes('benevol')) {
    return en
      ? 'Getting involved can take many forms: giving time, sharing skills, supporting a campaign, becoming a member or spreading the word. The association makes participation simple so every contribution can find its right place.'
      : 'S’engager peut prendre plusieurs formes : donner du temps, partager une compétence, soutenir une campagne, adhérer ou relayer les actions. L’association facilite la participation pour que chaque contribution trouve sa juste place.';
  }
  const options = en
    ? [
        'The association presents a clear and accessible project, built around people, useful action and long-term commitment. Each page is designed to help visitors understand the mission, identify ways to help and contact the team easily.',
        'Beyond the first presentation, this section explains how the project becomes concrete: a shared method, people involved on the ground and simple ways for supporters to take part.',
      ]
    : [
        'L’association présente un projet clair et accessible, construit autour des personnes, de l’action utile et de l’engagement dans la durée. Chaque page aide les visiteurs à comprendre la mission, identifier les façons d’aider et contacter l’équipe facilement.',
        'Au-delà de la présentation générale, cette partie explique comment le projet devient concret : une méthode partagée, des personnes mobilisées sur le terrain et des moyens simples de participer.',
      ];
  return options[order % options.length];
}

function dedupeText(value: string, seenParagraphs: string[]) {
  const kept: string[] = [];
  for (const paragraph of paragraphs(value)) {
    if (!seenParagraphs.some((seen) => isDuplicate(paragraph, seen))) {
      kept.push(paragraph);
      if (normalizeCopy(paragraph).length >= 90) seenParagraphs.push(paragraph);
    }
  }
  return joinParagraphs(kept);
}

export function removeGeneratedCopyDuplicates(template: BuiltTemplate, language: Lang = 'fr') {
  for (const page of template.pages || []) {
    const seenParagraphs: string[] = [];
    const seenBlocks: string[] = [];
    const nextBlocks: any[] = [];

    for (const block of page.blocks || []) {
      const content = block.content || {};
      const textValue = typeof content.text === 'string' ? content.text : '';

      if (textValue) {
        let nextText = dedupeText(textValue, seenParagraphs);
        const duplicateBlock = seenBlocks.some((seen) => isDuplicate(nextText, seen));

        if (!nextText || duplicateBlock) {
          if (block.type === 'text') continue;
          nextText = replacementText(language, page.title || page.slug || '', nextBlocks.length);
        }

        content.text = nextText;
        const normalized = normalizeCopy(nextText);
        if (normalized.length >= 90) seenBlocks.push(nextText);
      }

      if (Array.isArray(content.items)) {
        content.items = content.items.map((item: any, index: number) => {
          if (typeof item.text !== 'string') return item;
          const cleaned = dedupeText(item.text, seenParagraphs);
          return { ...item, text: cleaned || replacementText(language, page.title || page.slug || '', index) };
        });
      }

      nextBlocks.push({ ...block, content });
    }

    page.blocks = nextBlocks.map((block, order) => ({ ...block, order }));
  }
  return template;
}
