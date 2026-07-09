import React from 'react';
import { useNavigate } from 'react-router-dom';

export function CompanyGrid({ companies, onSelect, onClose }) {
  const navigate = useNavigate();

  const handleCompanyClick = (company) => {
    const slug = company.name.toLowerCase().replace(/\s+/g, '-');
    // Close the modal immediately for a seamless transition
    if (onClose) onClose();
    // Then navigate to the full prep page
    navigate(`/company/${slug}`);
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
          className="company-card"
          onClick={() => handleCompanyClick(company)}
        >
          {company.logo_url ? (
            <img src={company.logo_url} alt={`${company.name} logo`} className="company-logo" />
          ) : (
            <div className="company-logo-placeholder">
              {company.name.charAt(0)}
            </div>
          )}

          <div className="company-card-content">
            <div className="company-card-header">
              <h3 className="company-name">{company.name}</h3>
              <span className="company-category-badge">{company.category}</span>
            </div>
            <p className="company-desc">{company.description}</p>
            <div className="company-card-footer">
              <span className="view-btn">Full Prep Guide →</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
