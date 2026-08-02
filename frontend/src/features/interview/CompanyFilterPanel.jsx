import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, BarChart, Tag, Play, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

function extractSqlTopics(sql) {
  if (!sql) return ['Basic Queries'];
  const t = sql.toUpperCase();
  const topics = [];
  if (t.includes('JOIN')) topics.push('Joins');
  if (t.includes('OVER') && t.includes('PARTITION')) topics.push('Window Functions');
  if (t.includes('GROUP BY')) topics.push('Aggregations');
  if (t.includes('WITH ')) topics.push('CTEs');
  if (t.includes('CASE')) topics.push('CASE Statements');
  if (t.includes('HAVING')) topics.push('HAVING Clause');
  if (t.includes('UNION')) topics.push('Set Operations');
  if (t.match(/IN\s*\(/) || t.match(/EXISTS\s*\(/)) topics.push('Subqueries');
  if (topics.length === 0) topics.push('Basic Queries');
  return topics;
}

export function CompanyFilterPanel({ company, onBack, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const { data } = await api.questions.getByCompany(company._id || company.id);
        setQuestions(data?.data?.questions || []);
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to load questions.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchQuestions();
  }, [company.id]);

  return (
    <div className="company-panel fade-in">
      <div className="company-panel-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
        </button>
        <div className="company-info-banner">
          <div className="company-logo-placeholder large">
            {company.name.charAt(0)}
          </div>
          <div>
            <h1>{company.name} Interview Questions</h1>
            <p>{company.description}</p>
          </div>
        </div>
      </div>

      <div className="filter-panel-card">
        <h3 className="section-title">Frequently Asked Topics</h3>
        <div className="topic-tags">
          {questions.length > 0 ? (
            [...new Set(questions.flatMap(q => extractSqlTopics(q.solution_sql)))].slice(0, 10).map(topic => (
              <span key={topic} className="topic-tag highlight">
                {topic}
              </span>
            ))
          ) : (
            <span className="topic-tag">Analysis</span>
          )}
        </div>

        <h3 className="section-title">Question Bank</h3>
        {loading ? (
          <div className="loading-state">Loading questions...</div>
        ) : error ? (
          <div className="error-state">
            <Database size={32} className="mb-4 opacity-50" />
            <p className="text-error">{error}</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="empty-state">
            <BarChart size={48} className="mb-4 opacity-20" />
            <h3>No data available</h3>
            <p>We are currently updating our database with {company.name} questions.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="question-table">
              <thead>
                <tr>
                  <th className="w-[40%]">Title</th>
                  <th>Key Topics</th>
                  <th>Difficulty</th>
                  <th>Time</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {questions.map(q => {
                  const topics = extractSqlTopics(q.solution_sql);
                  return (
                    <tr key={q.id}>
                      <td>
                        <span className="table-title">{q.title}</span>
                      </td>
                      <td>
                        <div className="flex gap-1 flex-wrap">
                          {topics.slice(0, 2).map(t => (
                            <span key={t} className="company-category-badge px-1.5 py-0.5 text-[10px]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`diff-badge ${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                      </td>
                      <td>
                        <span className="meta-item"><Clock size={14} /> {q.estimated_time_minutes}m</span>
                      </td>
                      <td className="text-right">
                        <a 
                          className="solve-link"
                          onClick={() => {
                            if (onClose) onClose();
                            navigate(`/practice/${q.schema_name}`);
                          }}
                        >
                          Solve <Play size={14} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
