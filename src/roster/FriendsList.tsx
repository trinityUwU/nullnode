import type { Presence } from './types'
import type { RosterState } from './use-roster'

const PRESENCE_COLOR: Record<Presence, string> = {
  online: 'var(--accent)',
  away: 'var(--warn)',
  offline: 'var(--text-lo)',
  unknown: 'var(--text-lo)',
}

/** Roster list — each friend with presence, trust badge, verify + remove controls. */
export function FriendsList({ roster }: { roster: RosterState }): React.ReactElement {
  if (roster.friends.length === 0) {
    return <span className="text-[10px]" style={{ color: 'var(--text-lo)' }}>no peers in roster — add one above.</span>
  }
  return (
    <div className="flex flex-col gap-1 overflow-auto pr-1" style={{ maxHeight: '34vh' }}>
      {roster.friends.map((f) => (
        <div
          key={f.id}
          className="group flex items-center gap-3 rounded border border-transparent px-2 py-2 transition-colors hover:border-[var(--line)]"
        >
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: PRESENCE_COLOR[f.presence] }} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[12px]" style={{ color: 'var(--text-hi)' }}>{f.alias}</span>
            <span className="text-[9px]" style={{ color: 'var(--text-lo)' }}>{f.callsign} · {f.presence}</span>
          </div>
          <button
            onClick={() => roster.toggleVerified(f.id)}
            title={f.verified ? 'verified' : 'mark verified (compare fingerprints)'}
            className="text-[11px]"
            style={{ color: f.verified ? 'var(--accent)' : 'var(--text-lo)' }}
          >{f.verified ? '🛡' : '○'}</button>
          <button
            onClick={() => roster.removeFriend(f.id)}
            className="text-[11px] opacity-0 transition-opacity group-hover:opacity-100"
            style={{ color: 'var(--danger)' }}
          >✕</button>
        </div>
      ))}
    </div>
  )
}
