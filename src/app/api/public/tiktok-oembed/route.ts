import { NextResponse } from 'next/server';

const TIKTOK_POST = /^\/@[^/]+\/(?:video|photo)\/\d+\/?$/i;

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get('url') || '';
  let postUrl: URL;

  try {
    postUrl = new URL(raw);
  } catch {
    return NextResponse.json({ error: 'Lien TikTok invalide' }, { status: 400 });
  }

  if (postUrl.protocol !== 'https:' || !['tiktok.com', 'www.tiktok.com'].includes(postUrl.hostname.toLowerCase()) || !TIKTOK_POST.test(postUrl.pathname)) {
    return NextResponse.json({ error: 'Lien TikTok non autorisé' }, { status: 400 });
  }

  try {
    const endpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(postUrl.toString())}`;
    const response = await fetch(endpoint, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IMPACT/1.0)' },
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error(`TikTok oEmbed ${response.status}`);
    const data = await response.json();
    return NextResponse.json({
      title: typeof data.title === 'string' ? data.title : '',
      authorName: typeof data.author_name === 'string' ? data.author_name : '',
      authorUrl: typeof data.author_url === 'string' ? data.author_url : '',
      thumbnailUrl: typeof data.thumbnail_url === 'string' ? data.thumbnail_url : '',
    }, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } });
  } catch {
    return NextResponse.json({ title: '', authorName: '', authorUrl: '', thumbnailUrl: '' }, { status: 200 });
  }
}
