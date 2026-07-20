import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, User, Sun, Moon, Settings as SettingsIcon, LogIn, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

export function Header({ 
  leftContent,
  navLinks,
  user, 
  settings, 
  onShowAuth, 
  onShowSettings, 
  onToggleDark 
}) {
  const navigate = useNavigate();

  return (
    <header style={{
      height: 60,
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* ── LEFT: Logo & Navigation ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div 
          onClick={() => navigate('/')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <Database size={18} color="var(--primary)" strokeWidth={2.5} />
          <span style={{ 
            fontSize: 16, 
            fontWeight: 800, 
            color: 'var(--text)', 
            letterSpacing: '-0.3px' 
          }}>
            DataDesk
          </span>
        </div>

        {leftContent && (
          <>
            <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
            {leftContent}
          </>
        )}

        {navLinks && (
          <>
            <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {navLinks.map((link, i) => (
                <span
                  key={i}
                  onClick={link.onClick}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: link.primary ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = link.primary ? 'var(--primary-hover)' : 'var(--text)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = link.primary ? 'var(--primary)' : 'var(--text-secondary)'}
                >
                  {link.label}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── RIGHT: Actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {onToggleDark && settings && (
          <Button 
            variant="ghost" 
            size="md" 
            icon={settings.darkMode ? Sun : Moon}
            onClick={onToggleDark}
            style={{ padding: '8px', color: 'var(--text-secondary)' }}
            title="Toggle Dark Mode"
          />
        )}
        
        {onShowSettings && (
          <Button 
            variant="ghost" 
            size="md" 
            icon={SettingsIcon}
            onClick={onShowSettings}
            style={{ padding: '8px', color: 'var(--text-secondary)' }}
            title="Settings"
          />
        )}

        <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 4px' }} />

        {user ? (
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => navigate('/profile')}
            style={{ borderRadius: 99, padding: '6px 16px', gap: 6 }}
          >
            <User size={13} strokeWidth={2.5} /> Profile
          </Button>
        ) : (
          <Button 
            variant="primary" 
            size="sm" 
            onClick={onShowAuth}
            style={{ borderRadius: 99, padding: '6px 16px', gap: 6 }}
          >
            <LogIn size={13} strokeWidth={2.5} /> Sign In
          </Button>
        )}
      </div>
    </header>
  );
}

// Helper for breadcrumbs in leftContent
export function HeaderBreadcrumbs({ items }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {item.onClick ? (
            <span 
              onClick={item.onClick}
              style={{ color: 'var(--muted)', cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
            >
              {item.label}
            </span>
          ) : (
            <span style={{ color: 'var(--text)' }}>
              {item.label}
            </span>
          )}
          
          {i < items.length - 1 && (
            <ChevronRight size={14} color="var(--border)" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
