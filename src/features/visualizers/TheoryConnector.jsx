import React, { useState, useEffect } from 'react';
import { CONCEPTS, CONCEPT_TRIGGERS } from '@/data/concepts';
import { BookOpen, GraduationCap, AlertOctagon, Lightbulb, CheckCircle2, Database, Calculator, Link, LayoutList, TerminalSquare, AlertTriangle, Zap } from 'lucide-react';

const DYNAMIC_TOPICS = {
  'Basic SQL': {
    title: 'Basic SQL Fundamentals',
    tldr: 'The foundation of relational databases. Mastering the fundamental SELECT statement allows you to retrieve, filter, and sort data efficiently.',
    sections: [
      {
        title: 'Core Mechanics',
        icon: Database,
        points: [
          'SELECT determines exactly which columns are returned to the client.',
          'WHERE filters out rows before any calculations are made.',
          'ORDER BY is the only way to guarantee the sort order of your results.'
        ]
      },
      {
        title: 'Pro Tips',
        icon: CheckCircle2,
        points: [
          'Avoid using SELECT * in production code to prevent unexpected data transfer.',
          'Remember that SQL strings must use single quotes (\'text\'), not double quotes.'
        ]
      }
    ],
    interviewQuestion: 'What is the logical order of execution of a simple SELECT statement with a WHERE and ORDER BY clause?'
  },
  'Aggregate Functions': {
    title: 'Aggregate Functions',
    tldr: 'Aggregations allow you to summarize massive datasets by performing calculations across multiple rows to return a single output value.',
    sections: [
      {
        title: 'Standard Aggregators',
        icon: Calculator,
        points: [
          'COUNT() returns the number of rows matching the query.',
          'SUM() and AVG() perform mathematical operations on numeric columns.',
          'MAX() and MIN() find the highest or lowest value in a set.'
        ]
      },
      {
        title: 'Null Handling Gotchas',
        icon: AlertTriangle,
        points: [
          'Most aggregate functions silently ignore NULL values.',
          'COUNT(*) counts every row, while COUNT(column) only counts rows where the column is NOT NULL.'
        ]
      }
    ],
    interviewQuestion: 'Why might AVG(salary) return a different number than SUM(salary)/COUNT(*)?'
  },
  'Joins': {
    title: 'Relational JOINs',
    tldr: 'JOIN operations are the beating heart of relational databases, allowing you to combine data distributed across normalized tables.',
    sections: [
      {
        title: 'Join Mechanics',
        icon: Link,
        points: [
          'INNER JOIN restricts the result to only rows that have a match in both tables.',
          'LEFT JOIN preserves all rows from the primary (left) table, filling in NULLs where the right table has no match.',
          'Joining without an ON condition creates a Cartesian product (CROSS JOIN).'
        ]
      },
      {
        title: 'Performance Considerations',
        icon: Zap,
        points: [
          'Always join tables on indexed columns (like Foreign Keys) to prevent full table scans.',
          'Filtering in the ON clause vs the WHERE clause behaves differently in OUTER JOINs.'
        ]
      }
    ],
    interviewQuestion: 'What happens to rows in a LEFT JOIN if there are multiple matching records in the right table?'
  },
  'Database Design': {
    title: 'Database Design',
    tldr: 'Proper database design ensures data integrity, reduces redundancy, and optimizes for the specific read/write patterns of your application.',
    sections: [
      {
        title: 'Design Principles',
        icon: LayoutList,
        points: [
          'Each table should represent a single logical entity (e.g., Users, Orders).',
          'Use Primary Keys to uniquely identify rows.',
          'Use Foreign Keys to strictly enforce relationships between tables.'
        ]
      },
      {
        title: 'Common Mistakes',
        icon: AlertOctagon,
        points: [
          'Storing comma-separated lists in a single column instead of creating a junction table.',
          'Failing to define constraints (NOT NULL, UNIQUE) at the schema level.'
        ]
      }
    ],
    interviewQuestion: 'How would you design the schema for a ride-sharing application like Uber?'
  },
  'Keys & Constraints': {
    title: 'Keys & Constraints',
    tldr: 'Constraints are the database\'s immune system. They actively reject bad data before it can corrupt your application state.',
    sections: [
      {
        title: 'Core Constraints',
        icon: CheckCircle2,
        points: [
          'PRIMARY KEY: Guarantees uniqueness and non-nullability for a row identifier.',
          'FOREIGN KEY: Ensures a value must exist in another table before it can be inserted.',
          'UNIQUE: Ensures no duplicate values exist in a specific column.'
        ]
      },
      {
        title: 'Best Practices',
        icon: AlertTriangle,
        points: [
          'Always name your constraints explicitly so error messages are readable.',
          'Enforce business logic at the DB level via CHECK constraints when possible.'
        ]
      }
    ],
    interviewQuestion: 'What is the difference between a Primary Key and a Unique Constraint?'
  }
};

const detectConcept = (sql) => {
  const upperSql = sql.toUpperCase();
  for (const [pattern, conceptId] of Object.entries(CONCEPT_TRIGGERS)) {
    if (new RegExp(`\\b${pattern}\\b`, 'i').test(sql) || new RegExp(pattern, 'i').test(sql)) {
      return conceptId;
    }
  }
  return null;
};

export const TheoryConnector = ({ sql, question }) => {
  const [activeConceptId, setActiveConceptId] = useState(null);

  useEffect(() => {
    if (!sql) return;
    const detected = detectConcept(sql);
    setActiveConceptId(detected);
  }, [sql]);

  let activeConcept = activeConceptId ? CONCEPTS[activeConceptId] : null;

  // Transform legacy concepts into the new DYNAMIC_TOPICS format if matched
  if (activeConcept && !activeConcept.sections) {
    activeConcept = {
      title: activeConcept.title,
      tldr: activeConcept.tldr,
      sections: [
        {
          title: 'Engine Architecture',
          icon: CheckCircle2,
          points: activeConcept.keyPoints || []
        },
        {
          title: 'Common Pitfalls',
          icon: AlertOctagon,
          points: activeConcept.commonMistakes || []
        }
      ],
      interviewQuestion: activeConcept.interviewQuestion
    };
  }

  if (!activeConcept && question && question.keywords) {
    const topicKeyword = question.keywords.find(k => k.startsWith('topic:'));
    if (topicKeyword) {
      const topicName = topicKeyword.split(':')[1];
      if (DYNAMIC_TOPICS[topicName]) {
        activeConcept = DYNAMIC_TOPICS[topicName];
      } else {
        activeConcept = {
          title: topicName,
          tldr: `Mastering ${topicName} is a key milestone in your SQL learning track.`,
          sections: [
            {
              title: 'Core Concepts',
              icon: GraduationCap,
              points: [
                `Understand the syntax and execution flow of ${topicName}.`,
                `Identify how ${topicName} interacts with other SQL clauses.`
              ]
            }
          ],
          interviewQuestion: `How would you explain the core mechanics of ${topicName} in a technical interview?`
        };
      }
    }
  }

  if (!activeConcept) {
    return (
      <div style={{ padding: '48px 32px', textAlign: 'center', color: 'var(--muted)', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
        <TerminalSquare size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
        <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text)' }}>No active learning track detected.</div>
        <div style={{ marginTop: 8, fontSize: 14 }}>Write SQL keywords or open a specific question to load relevant curriculum.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 32 }}>
        <div style={{ background: 'var(--primary)', padding: 12, borderRadius: 12, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' }}>
          <GraduationCap size={24} color="#fff" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
            {activeConcept.title}
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 800 }}>
            {activeConcept.tldr}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {activeConcept.sections.map((section, idx) => {
          const IconComponent = section.icon;
          return (
            <div key={idx} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 16px', fontSize: 14, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                <IconComponent size={18} color="var(--primary)" /> {section.title}
              </h3>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {section.points.map((pt, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', marginTop: 6, flexShrink: 0 }} />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Interview Prep */}
      {activeConcept.interviewQuestion && (
        <div style={{ marginTop: 24, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 12, padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ background: 'var(--primary)', borderRadius: '50%', padding: 8, display: 'flex' }}>
            <Lightbulb size={18} color="#fff" />
          </div>
          <div>
            <h4 style={{ margin: '0 0 8px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', fontWeight: 700 }}>
              Interview Question
            </h4>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}>
              {activeConcept.interviewQuestion}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
