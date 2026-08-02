import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export function CompanyGrid({ companies, onSelect, onClose }) {
  const navigate = useNavigate();

  const handlePracticeClick = (e, company) => {
    e.stopPropagation();
    const slug = company.name.toLowerCase().replace(/\s+/g, '-');
    if (onClose) onClose();
    navigate(`/company/${slug}`);
  };

  const handleMockClick = (e, company) => {
    e.stopPropagation();
    const slug = company.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/interview/preflight/${slug}`);
  };

  if (companies.length === 0) {
    return (
      <div className="empty-state">
        <p>No companies found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="company-grid">
      {companies.map(company => (
        <div
          key={company.id}
          className="company-card group relative"
        >
          {company.logo_url ? (
            <img src={company.logo_url} alt={`${company.name} logo`} className="company-logo" />
          ) : (
            <div className="company-logo-placeholder">
              {company.name.charAt(0)}
            </div>
          )}

          <div className="company-card-content flex flex-col h-full">
            <div className="company-card-header">
              <h3 className="company-name">{company.name}</h3>
              <span className="company-category-badge">{company.category}</span>
            </div>
            <p className="company-desc flex-1">{company.description}</p>
            
            <div className="flex flex-col gap-2 mt-4">
              <button 
                onClick={(e) => handlePracticeClick(e, company)}
                className="w-full py-2 bg-surface-2 hover:bg-surface-3 border border-border rounded-lg text-sm font-semibold transition-colors text-text"
              >
                Practice Questions
              </button>
              <button 
                onClick={(e) => handleMockClick(e, company)}
                className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <ShieldAlert size={14} /> Start Mock Interview
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
