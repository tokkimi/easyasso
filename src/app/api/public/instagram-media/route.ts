import { NextRequest, NextResponse } from 'next/server';

type InstagramNode = {
  is_video?: boolean;
  display_url?: string;
  video_url?: string;
  dimensions?: { width?: number; height?: number };
  edge_sidecar_to_children?: { edges?: Array<{ node?: InstagramNode }> };
};

function allowedMediaUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === 'https:' && (host.endsWith('.cdninstagram.com') || host.endsWith('.fbcdn.net')) ? url.toString() : '';
  } catch {
    return '';
  }
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code') || '';
  if (!/^[A-Za-z0-9_-]{5,30}$/.test(code)) return NextResponse.json({ media: [] }, { status: 400 });

  try {
    const response = await fetch(`https://www.instagram.com/p/${code}/embed`, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'fr-FR,fr;q=0.9' },
      next: { revalidate: 1800 },
    });
    if (!response.ok) throw new Error(`Instagram returned ${response.status}`);
    const html = await response.text();
    const match = html.match(/"contextJSON":"((?:\\.|[^"\\])*)"/);
    if (!match) throw new Error('Instagram media payload missing');
    const context = JSON.parse(JSON.parse(`"${match[1]}"`));
    const root: InstagramNode | undefined = context?.gql_data?.shortcode_media;
    const sidecarNodes = root?.edge_sidecar_to_children?.edges?.map((edge) => edge.node).filter((node): node is InstagramNode => Boolean(node));
    const nodes: InstagramNode[] = sidecarNodes?.length ? sidecarNodes : (root ? [root] : []);
    const media = nodes.map((node) => ({
      type: node.is_video && allowedMediaUrl(node.video_url) ? 'video' : 'image',
      src: node.is_video ? allowedMediaUrl(node.video_url) : allowedMediaUrl(node.display_url),
      poster: allowedMediaUrl(node.display_url),
      width: Number(node.dimensions?.width) || 1,
      height: Number(node.dimensions?.height) || 1,
    })).filter((item) => item.src);
    if (!media.length) throw new Error('Instagram media empty');
    return NextResponse.json({ media }, { headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400' } });
  } catch {
    return NextResponse.json({ media: [] }, { status: 502 });
  }
}
