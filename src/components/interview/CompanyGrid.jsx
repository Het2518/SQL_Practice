import React from 'react';

export function CompanyGrid({ companies, onSelect }) {
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
          onClick={() => onSelect(company)}
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
              <span className="view-btn">View Questions &rarr;</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
