// Music blocks. The implementation lives in MusicBlocksBase.
// - IMPACT's "Lecteurs officiels" block: a release list; clicking a release
//   opens the choice of platforms.
// - A "Lecteurs officiels" block titled like "Prochaines dates" / "Next shows"
//   shows event posters in a horizontal swipe with a "Book your show" button.
import { OfficialPlayers as EmbeddedOfficialPlayers } from './MusicBlocksBase';
import { ImpactReleaseRail } from './ImpactReleaseRail';
import { ImpactShows } from './ImpactShows';

export * from './MusicBlocksBase';

const SHOWS_TITLE = /(prochaines?\s+dates?|next\s+shows?|upcoming|agenda|tourn[ée]e|^\s*(dates?|shows?|bookings?|concerts?|[ée]v[ée]nements?)\s*$)/i;

export function OfficialPlayers({ content }: { content: any }) {
  if (SHOWS_TITLE.test(String(content?.title || ''))) return <ImpactShows content={content} />;
  if (content?.variant === 'impact') return <ImpactReleaseRail content={content} />;
  return <EmbeddedOfficialPlayers content={content} />;
}
