// Music blocks. The implementation lives in MusicBlocksBase; IMPACT's
// "Lecteurs officiels" block is shown as one rail of covers that open the
// external link set in the editor, instead of embedded players per platform.
import { OfficialPlayers as EmbeddedOfficialPlayers } from './MusicBlocksBase';
import { ImpactReleaseRail } from './ImpactReleaseRail';

export * from './MusicBlocksBase';

export function OfficialPlayers({ content }: { content: any }) {
  if (content?.variant === 'impact') return <ImpactReleaseRail content={content} />;
  return <EmbeddedOfficialPlayers content={content} />;
}
