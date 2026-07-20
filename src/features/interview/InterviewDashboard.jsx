import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { CompanyGrid } from './CompanyGrid';

const CATEGORIES = ['All', 'MNC', 'Startup', 'SaaS', 'FinTech', 'Cloud', 'Data', 'E-commerce', 'Social', 'Security', 'HealthTech'];
const ITEMS_PER_PAGE = 24;

export function InterviewPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    supabase.from('companies').select('*').order('name')
      .then(({ data, error: sbError }) => {
        if (sbError) setError('Failed to load companies.');
        else setCompanies(data || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => { setCurrentPage(1); }, [activeCategory, searchQuery]);

  const filtered = companies.filter(c => {
    const matchCat = activeCategory === 'All' || c.category === activeCategory;
    const matchQ   = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQ;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <header style={{
        height: 56, padding: '0 32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', background: 'var(--surface)',
        borderBottom: '1px solid var(--border)', flexShrink: 0, position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)', padding: 0 }}
          >
            ← Home
          </button>
          <span style={{ width: 1, height: 16, background: 'var(--border)' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Interview Preparation</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          {companies.length} companies · Company-wise SQL tracks
        </div>
      </header>

      {/* ── Hero ── */}
      <div style={{
        padding: '48px 32px 40px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 680 }}>
          <div style={{
            display: 'inline-block', marginBottom: 16,
            padding: '3px 12px', borderRadius: 99,
            background: 'var(--primary-muted)', border: '1px solid var(--primary-light)',
            fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em',
          }}>
            SQL INTERVIEW PREP
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--text)', letterSpacing: '-1px', margin: '0 0 14px', lineHeight: 1.1 }}>
            Prepare for SQL interviews<br />
            <span style={{ color: 'var(--primary)' }}>at top companies</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 28px', maxWidth: 560 }}>
            Browse company-specific question banks, understand interview patterns,
            read real candidate experiences and build a focused preparation roadmap.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Companies', value: companies.length || '100+' },
              { label: 'Question Tracks', value: '50+' },
              { label: 'Interview Rounds Covered', value: '3–6' },
              { label: 'Topics', value: '20+' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.5px' }}>{s.value}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ padding: '20px 32px 0', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 400, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 36px',
              border: '1px solid var(--border)', borderRadius: 8,
              background: 'var(--surface)', color: 'var(--text)',
              fontFamily: 'var(--font-sans)', fontSize: 13,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 13 }}>
            ⌕
          </span>
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 0 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                border: '1px solid', cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: 'var(--font-sans)',
                background: activeCategory === cat ? 'var(--primary)' : 'var(--surface)',
                color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
                borderColor: activeCategory === cat ? 'var(--primary)' : 'var(--border)',
                transition: 'all 0.12s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, padding: '24px 32px 64px' }}>
        {/* Results count */}
        <div style={{ marginBottom: 16, fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
          {loading ? 'Loading...' : `${filtered.length} companies${searchQuery ? ` matching "${searchQuery}"` : ''}`}
        </div>

        {error ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--error)', marginBottom: 8 }}>Failed to load companies</div>
            <div style={{ fontSize: 13 }}>{error}</div>
          </div>
        ) : loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Loading companies...</div>
        ) : (
          <>
            <CompanyGrid
              companies={paginated}
              onSelect={c => navigate(`/company/${c.name?.toLowerCase().replace(/\s+/g, '-')}`)}
              onClose={() => navigate('/')}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32, alignItems: 'center' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  style={{ padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--surface)', color: 'var(--text)', cursor: currentPage === 1 ? 'default' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1, fontFamily: 'var(--font-sans)', fontSize: 13 }}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      width: 34, height: 34, borderRadius: 7, border: '1px solid',
                      fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      background: currentPage === page ? 'var(--primary)' : 'var(--surface)',
                      color: currentPage === page ? '#fff' : 'var(--text-secondary)',
                      borderColor: currentPage === page ? 'var(--primary)' : 'var(--border)',
                    }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  style={{ padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--surface)', color: 'var(--text)', cursor: currentPage === totalPages ? 'default' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1, fontFamily: 'var(--font-sans)', fontSize: 13 }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Keep backward-compat export for modal usage (now unused but kept to not break imports)
export function InterviewDashboard({ onClose }) {
  const navigate = useNavigate();
  useEffect(() => { navigate('/interview'); onClose?.(); }, []);
  return null;
}
