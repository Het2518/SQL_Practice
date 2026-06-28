import React, { useState, useRef } from 'react';
import { generateSqlFromCSV } from '../utils/csvParser';

export function CustomDatasetModal({ onClose, onDatasetReady }) {
  const [file, setFile] = useState(null);
  const [tableName, setTableName] = useState('custom_table');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith('.csv')) {
      setFile(selected);
      // Auto-suggest table name from file name
      setTableName(selected.name.replace('.csv', '').replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase());
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid .csv file.');
    }
  };

  const handleProcess = () => {
    if (!file) return;
    if (!tableName.trim()) {
      setError('Table name cannot be empty.');
      return;
    }
    
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvString = e.target.result;
        const result = generateSqlFromCSV(tableName, csvString);
        
        // Pass the generated SQL back to App.jsx to initialize the database
        onDatasetReady({
          id: 'custom_db',
          name: 'Custom Dataset',
          initSql: result.createTableSQL + '\n' + result.insertStatements,
          schema: [result.schema]
        });
      } catch (err) {
        setError(err.message || 'Failed to parse CSV.');
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file.');
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 style={{ marginBottom: 12, fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Upload Custom Dataset</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          Upload your own CSV file to practice SQL queries against your own data. The database is generated instantly in your browser.
        </p>

        <div 
          style={{
            border: '2px dashed var(--border)',
            borderRadius: 12,
            padding: 32,
            textAlign: 'center',
            marginBottom: 20,
            background: 'var(--surface-2)',
            cursor: 'pointer'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          {file ? (
            <div>
              <span style={{ fontSize: 32 }}>📄</span>
              <div style={{ fontWeight: 600, marginTop: 8 }}>{file.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                {(file.size / 1024).toFixed(1)} KB
              </div>
            </div>
          ) : (
            <div>
              <span style={{ fontSize: 32 }}>📁</span>
              <div style={{ fontWeight: 600, marginTop: 8, color: 'var(--primary)' }}>Click to select a CSV file</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Maximum recommended size: 5MB</div>
            </div>
          )}
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />
        </div>

        {file && (
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Target Table Name
            </label>
            <input 
              type="text" 
              className="modal-input" 
              style={{ width: '100%' }}
              value={tableName}
              onChange={e => setTableName(e.target.value)}
            />
          </div>
        )}

        {error && <div style={{ color: 'var(--error)', padding: '12px', background: 'var(--error-muted)', borderRadius: 8, marginBottom: 24, fontSize: 14 }}>{error}</div>}

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', padding: 14, fontSize: 16 }}
          onClick={handleProcess}
          disabled={!file || isLoading}
        >
          {isLoading ? 'Generating Database...' : 'Start Practicing ▶'}
        </button>
      </div>
    </div>
  );
}
