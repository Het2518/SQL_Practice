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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface)',
        padding: '20px 24px',
        borderRadius: 16,
        border: '1px solid var(--border)'
      }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 20, color: 'var(--text)' }}>My Playlists</h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
            Curate custom collections of SQL problems to practice or share.
          </p>
        </div>
        <Button onClick={() => alert('Backend integration coming soon!')}>
          <Plus size={16} /> New Playlist
        </Button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 20
      }}>
        {MOCK_PLAYLISTS.map(playlist => (
          <div key={playlist.id} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 20,
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{
                background: 'var(--primary-muted)',
                color: 'var(--primary)',
                padding: 10,
                borderRadius: 10
              }}>
                <Folder size={20} />
              </div>
              {playlist.isPublic && (
                <span style={{ fontSize: 11, background: 'var(--surface-2)', padding: '4px 8px', borderRadius: 4, color: 'var(--muted)' }}>
                  Public
                </span>
              )}
            </div>
            
            <h3 style={{ margin: '0 0 8px', fontSize: 16, color: 'var(--text)' }}>
              {playlist.title}
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>
              {playlist.description}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--muted)', fontSize: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Play size={12} /> {playlist.count} Qs</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {playlist.lastUpdated}</span>
              </div>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} title="Share">
                <Share2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
