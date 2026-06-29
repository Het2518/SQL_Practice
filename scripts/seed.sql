-- Seed Companies
INSERT INTO public.companies (name, category, description) VALUES
  ('Google', 'MNC', 'Global tech giant known for rigorous algorithmic and deep SQL rounds.'),
  ('Amazon', 'MNC', 'E-commerce and cloud computing. Heavy focus on Window Functions and CTEs.'),
  ('Microsoft', 'MNC', 'Enterprise software and cloud. Mix of basic joins and complex aggregations.'),
  ('Stripe', 'FinTech', 'Payment processing platform. Expect financial scenario-based SQL.'),
  ('Airbnb', 'SaaS', 'Online marketplace for lodging. Focuses on temporal queries and reporting.')
ON CONFLICT (name) DO NOTHING;

-- Seed Topics
INSERT INTO public.topics (name, description) VALUES
  ('Joins', 'INNER, LEFT, RIGHT, FULL OUTER joins.'),
  ('Window Functions', 'ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG.'),
  ('CTEs', 'Common Table Expressions and Recursive CTEs.'),
  ('Aggregations', 'GROUP BY, HAVING, COUNT, SUM, AVG.'),
  ('Date Functions', 'DATE_TRUNC, EXTRACT, DATEDIFF.')
ON CONFLICT (name) DO NOTHING;
