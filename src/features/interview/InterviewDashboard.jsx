import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Search } from 'lucide-react';
import { Header, HeaderBreadcrumbs } from '@/shared/ui/Header';
import { Button } from '@/shared/ui/Button';
import { CompanyGrid } from './CompanyGrid';

const CATEGORIES = [
  'All',
  'MNC',
  'Startup',
  'SaaS',
  'FinTech',
  'Cloud',
  'Data',
  'E-commerce',
  'Social',
  'Security',
  'HealthTech',
];
const ITEMS_PER_PAGE = 24;

export function InterviewPage({ user, onShowAuth, onShowSettings }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: companies = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase.from('companies').select('*').order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const error = queryError ? 'Failed to load companies.' : null;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  const filtered = companies.filter((c) => {
    const matchCat = activeCategory === 'All' || c.category === activeCategory;
    const matchQ = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQ;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Global Header ── */}
      <Header
        user={user}
        onShowAuth={onShowAuth}
        onShowSettings={onShowSettings}
        leftContent={
          <HeaderBreadcrumbs
            items={[{ label: 'Home', onClick: () => navigate('/') }, { label: 'Interview Prep' }]}
          />
        }
      />

      {/* ── Premium Hero ── */}
      <div
        style={{
          padding: '64px 32px',
          background: 'linear-gradient(180deg, var(--primary-muted) 0%, var(--bg) 100%)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            padding: '4px 16px',
            borderRadius: 99,
            background: 'var(--surface)',
            border: '1px solid var(--primary-light)',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--primary)',
            letterSpacing: '0.05em',
            marginBottom: 20,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          SQL INTERVIEW PREP
        </div>
        <h1
          style={{
            fontSize: 42,
            fontWeight: 900,
            color: 'var(--text)',
            letterSpacing: '-1px',
            margin: '0 0 16px',
            lineHeight: 1.1,
          }}
        >
          Ace your interviews
          <br />
          <span style={{ color: 'var(--primary)' }}>at top tech companies</span>
        </h1>
        <p
          style={{
            fontSize: 16,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: '0 0 40px',
            maxWidth: 600,
          }}
        >
          Master company-specific SQL questions, study real candidate experiences, and follow guided
          roadmaps to land your dream role.
        </p>

        {/* Floating Search Bar */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 540,
            marginBottom: 24,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            borderRadius: 16,
          }}
        >
          <input
            type="text"
            placeholder="Search companies (e.g., Affirm, Meta)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 20px 16px 52px',
              border: '1px solid var(--border)',
              borderRadius: 16,
              background: 'var(--surface)',
              color: 'var(--text)',
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              fontWeight: 500,
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
          <Search
            size={18}
            color="var(--muted)"
            style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>

        {/* Modern Category Chips */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 4,
            maxWidth: '100%',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: 99,
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-sans)',
                background: activeCategory === cat ? 'var(--text)' : 'var(--surface)',
                color: activeCategory === cat ? 'var(--bg)' : 'var(--text-secondary)',
                boxShadow:
                  activeCategory === cat
                    ? '0 4px 12px rgba(0,0,0,0.1)'
                    : 'inset 0 0 0 1px var(--border)',
                transition: 'all 0.15s ease',
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
          {loading
            ? 'Loading...'
            : `${filtered.length} companies${searchQuery ? ` matching "${searchQuery}"` : ''}`}
        </div>

        {error ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--error)', marginBottom: 8 }}>
              Failed to load companies
            </div>
            <div style={{ fontSize: 13 }}>{error}</div>
          </div>
        ) : loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
            Loading companies...
          </div>
        ) : (
          <>
            <CompanyGrid
              companies={paginated}
              onSelect={(c) => navigate(`/company/${c.name?.toLowerCase().replace(/\s+/g, '-')}`)}
              onClose={() => navigate('/')}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 32,
                  alignItems: 'center',
                }}
              >
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  style={{
                    padding: '6px 14px',
                    border: '1px solid var(--border)',
                    borderRadius: 7,
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    cursor: currentPage === 1 ? 'default' : 'pointer',
                    opacity: currentPage === 1 ? 0.4 : 1,
                    fontFamily: 'var(--font-sans)',
                    fontSize: 13,
                  }}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 7,
                      border: '1px solid',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
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
                  onClick={() => setCurrentPage((p) => p + 1)}
                  style={{
                    padding: '6px 14px',
                    border: '1px solid var(--border)',
                    borderRadius: 7,
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    cursor: currentPage === totalPages ? 'default' : 'pointer',
                    opacity: currentPage === totalPages ? 0.4 : 1,
                    fontFamily: 'var(--font-sans)',
                    fontSize: 13,
                  }}
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
  useEffect(() => {
    navigate('/interview');
    onClose?.();
  }, []);
  return null;
}
