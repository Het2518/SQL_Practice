import React, { useState, useEffect } from 'react';
import { Search, Building2, Briefcase, Code, Cloud, Server, Database, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { CompanyGrid } from './CompanyGrid';
import { CompanyFilterPanel } from './CompanyFilterPanel';

const CATEGORIES = ['All', 'MNC', 'Startup', 'SaaS', 'FinTech', 'Cloud', 'Data', 'E-commerce', 'Social', 'Security', 'HealthTech'];
const ITEMS_PER_PAGE = 24;

export function InterviewDashboard({ onClose }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const { data, error: sbError } = await supabase.from('companies').select('*').order('name');
        if (sbError) throw sbError;
        setCompanies(data || []);
      } catch (err) {
        console.error("Supabase Error:", err);
        setError("Failed to load companies. Did you run the SQL seed script in Supabase?");
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  const filteredCompanies = companies.filter(c => {
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div 
      style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', 
        zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', 
        padding: '20px' 
      }}
    >
      <div 
        style={{ 
          width: '100%', maxWidth: '1100px', background: 'var(--bg-2)', 
          borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)', height: '90vh' 
        }}
      >
        {/* Header matching SettingsModal style */}
        <div style={{ padding: '20px 24px 20px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>💼</span>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                Company-wise Interview Preparation
              </h2>
            </div>
            <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ borderRadius: '50%', padding: '6px' }}>
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div style={{ overflowY: 'auto', flex: 1, background: 'var(--bg)' }}>
          {selectedCompany ? (
            <div style={{ padding: '24px' }}>
              <CompanyFilterPanel company={selectedCompany} onBack={() => setSelectedCompany(null)} onClose={onClose} />
            </div>
          ) : (
              <div className="company-selection-view fade-in">
                {/* Search and Filters */}
                <div className="interview-toolbar">
                  <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search 100+ companies (e.g., Google, Stripe)..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="interview-search-input"
                    />
                  </div>
                  
                  <div className="category-pills">
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat} 
                        className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid */}
                <div className="interview-content">
                  {error ? (
                    <div className="error-state">
                      <Database size={32} style={{ marginBottom: 16, opacity: 0.5 }} />
                      <p style={{ color: 'var(--error)' }}>{error}</p>
                      <p style={{ fontSize: 13, marginTop: 8 }}>Please click "Run without RLS" in your Supabase SQL editor to load the companies.</p>
                    </div>
                  ) : loading ? (
                    <div className="loading-state">Loading companies...</div>
                  ) : (
                    <>
                      <CompanyGrid 
                        companies={paginatedCompanies} 
                        onSelect={setSelectedCompany} 
                      />
                      
                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="pagination-container">
                          <button 
                            className="page-btn" 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                          >
                            <ChevronLeft size={16} />
                          </button>
                          
                          <div className="page-numbers">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <button
                                key={page}
                                className={`page-number ${currentPage === page ? 'active' : ''}`}
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </button>
                            ))}
                          </div>
                          
                          <button 
                            className="page-btn" 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
