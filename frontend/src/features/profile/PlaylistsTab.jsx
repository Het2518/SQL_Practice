import React from 'react';
import { Folder, Play, Clock, Share2, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

const MOCK_PLAYLISTS = [
  {
    id: 1,
    title: 'Hard Window Functions',
    description: 'My collection of difficult window functions to review before interviews.',
    count: 12,
    lastUpdated: '2 days ago',
    isPublic: true
  },
  {
    id: 2,
    title: 'PostgreSQL CTE Tricks',
    description: 'Advanced recursive CTEs and performance optimizations.',
    count: 5,
    lastUpdated: '1 week ago',
    isPublic: false
  }
];

export function PlaylistsTab() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between bg-surface px-6 py-5 rounded-2xl border border-border">
        <div>
          <h2 className="m-0 mb-1 text-xl text-text">My Playlists</h2>
          <p className="m-0 text-muted text-sm">
            Curate custom collections of SQL problems to practice or share.
          </p>
        </div>
        <Button onClick={() => alert('Backend integration coming soon!')}>
          <Plus size={16} /> New Playlist
        </Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
        {MOCK_PLAYLISTS.map(playlist => (
          <div key={playlist.id} className="bg-surface border border-border rounded-xl p-5 flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <div className="bg-primary-muted text-primary p-2.5 rounded-lg">
                <Folder size={20} />
              </div>
              {playlist.isPublic && (
                <span className="text-[11px] bg-surface-2 px-2 py-1 rounded text-muted">
                  Public
                </span>
              )}
            </div>
            
            <h3 className="m-0 mb-2 text-base text-text">
              {playlist.title}
            </h3>
            <p className="m-0 mb-4 text-[13px] text-text-secondary leading-relaxed flex-1">
              {playlist.description}
            </p>
            
            <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
              <div className="flex items-center gap-3 text-muted text-xs">
                <span className="flex items-center gap-1"><Play size={12} /> {playlist.count} Qs</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {playlist.lastUpdated}</span>
              </div>
              <button className="bg-transparent border-none text-text-secondary cursor-pointer hover:text-primary transition-colors" title="Share">
                <Share2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
