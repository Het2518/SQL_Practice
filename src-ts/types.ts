// ============================================================
// SQL Practice Platform — Shared Types
// ============================================================

export type DatabaseName =
  | 'hospital'
  | 'ecommerce'
  | 'university'
  | 'airlines'
  | 'banking'
  | 'hr'
  | 'movies'
  | 'library'
  | 'sports'
  | 'music';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type KeywordTag =
  | 'Select'
  | 'Where'
  | 'Order By'
  | 'Group By'
  | 'Having'
  | 'Join'
  | 'Left Join'
  | 'Subquery'
  | 'CTE'
  | 'Recursive CTE'
  | 'Window Function'
  | 'Rank'
  | 'Row Number'
  | 'Lag'
  | 'Lead'
  | 'Case'
  | 'Union'
  | 'Insert'
  | 'Update'
  | 'Delete'
  | 'Date Function'
  | 'String Function'
  | 'Null Handling';

export type CompletionStatus = 'complete' | 'attempted' | 'incomplete';

export interface Question {
  id: number;
  db: DatabaseName;
  difficulty: Difficulty;
  keywords: KeywordTag[];
  prompt: string;
  hint1: string;
  hint2: string;
  hint3: string;
  solutionSQL: string;
  verificationSQL?: string; // For DML questions: run this SELECT after DML to verify
  expectedResult: {
    columns: string[];
    rows: (string | number | null)[][];
  };
}

export interface DatabaseInfo {
  name: DatabaseName;
  label: string;
  description: string;
  icon: string;
  tableCount: number;
  questionCount: number;
  concepts: string[];
  tables: TableInfo[];
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  rowCount: number;
}

export interface ColumnInfo {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  references?: string;
  isNullable?: boolean;
}

export interface QueryResult {
  columns: string[];
  rows: (string | number | null)[][];
  error?: string;
  affectedRows?: number;
}

export interface ValidationResult {
  isCorrect: boolean;
  message: string;
  mismatchedRows?: number[];
  mismatchedColumns?: string[];
}

export interface ProgressStore {
  [questionId: string]: CompletionStatus;
}

export const DB_INFO: Record<DatabaseName, DatabaseInfo> = {
  hospital: {
    name: 'hospital',
    label: 'Hospital',
    description: 'Patient admissions, doctors, departments, diagnoses, and medications. Master date arithmetic, multi-join queries, and aggregation.',
    icon: '🏥',
    tableCount: 7,
    questionCount: 60,
    concepts: ['Date Arithmetic', 'Multi-Join', 'Aggregation', 'NULL Handling', 'Window Functions'],
    tables: [
      { name: 'patients', rowCount: 100, columns: [
        { name: 'patient_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'first_name', type: 'TEXT' },
        { name: 'last_name', type: 'TEXT' },
        { name: 'birth_date', type: 'DATE', isNullable: true },
        { name: 'gender', type: 'TEXT' },
        { name: 'weight', type: 'REAL', isNullable: true },
        { name: 'height', type: 'REAL', isNullable: true },
        { name: 'allergies', type: 'TEXT', isNullable: true },
        { name: 'city', type: 'TEXT', isNullable: true },
        { name: 'province_id', type: 'TEXT', isForeignKey: true, references: 'province_names' },
      ]},
      { name: 'admissions', rowCount: 120, columns: [
        { name: 'admission_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'patient_id', type: 'INTEGER', isForeignKey: true, references: 'patients' },
        { name: 'admission_date', type: 'DATE' },
        { name: 'discharge_date', type: 'DATE', isNullable: true },
        { name: 'diagnosis', type: 'TEXT' },
        { name: 'attending_doctor_id', type: 'INTEGER', isForeignKey: true, references: 'doctors' },
      ]},
      { name: 'doctors', rowCount: 20, columns: [
        { name: 'doctor_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'first_name', type: 'TEXT' },
        { name: 'last_name', type: 'TEXT' },
        { name: 'specialty', type: 'TEXT' },
        { name: 'department_id', type: 'INTEGER', isForeignKey: true, references: 'departments' },
      ]},
      { name: 'departments', rowCount: 8, columns: [
        { name: 'department_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'department_name', type: 'TEXT' },
        { name: 'head_doctor_id', type: 'INTEGER', isForeignKey: true, references: 'doctors', isNullable: true },
      ]},
      { name: 'diagnoses', rowCount: 150, columns: [
        { name: 'diagnosis_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'admission_id', type: 'INTEGER', isForeignKey: true, references: 'admissions' },
        { name: 'icd_code', type: 'TEXT' },
        { name: 'description', type: 'TEXT' },
        { name: 'severity', type: 'TEXT' },
      ]},
      { name: 'medications', rowCount: 100, columns: [
        { name: 'medication_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'admission_id', type: 'INTEGER', isForeignKey: true, references: 'admissions' },
        { name: 'drug_name', type: 'TEXT' },
        { name: 'dosage', type: 'TEXT' },
        { name: 'start_date', type: 'DATE' },
        { name: 'end_date', type: 'DATE', isNullable: true },
      ]},
      { name: 'province_names', rowCount: 15, columns: [
        { name: 'province_id', type: 'TEXT', isPrimaryKey: true },
        { name: 'province_name', type: 'TEXT' },
        { name: 'country', type: 'TEXT' },
      ]},
    ],
  },
  ecommerce: {
    name: 'ecommerce',
    label: 'E-Commerce',
    description: 'Customers, products, orders, payments, reviews, and shipping. Perfect for revenue analysis, funnels, and product hierarchies.',
    icon: '🛒',
    tableCount: 8,
    questionCount: 60,
    concepts: ['Revenue Analysis', 'Funnel Queries', 'CTEs', 'Product Hierarchies'],
    tables: [
      { name: 'customers', rowCount: 100, columns: [
        { name: 'customer_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'first_name', type: 'TEXT' },
        { name: 'last_name', type: 'TEXT' },
        { name: 'email', type: 'TEXT' },
        { name: 'phone', type: 'TEXT', isNullable: true },
        { name: 'city', type: 'TEXT' },
        { name: 'country', type: 'TEXT' },
        { name: 'registered_at', type: 'DATE' },
      ]},
      { name: 'products', rowCount: 80, columns: [
        { name: 'product_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'name', type: 'TEXT' },
        { name: 'description', type: 'TEXT', isNullable: true },
        { name: 'price', type: 'REAL' },
        { name: 'stock_qty', type: 'INTEGER' },
        { name: 'category_id', type: 'INTEGER', isForeignKey: true, references: 'categories' },
        { name: 'supplier_id', type: 'INTEGER', isNullable: true },
      ]},
      { name: 'categories', rowCount: 15, columns: [
        { name: 'category_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'name', type: 'TEXT' },
        { name: 'parent_category_id', type: 'INTEGER', isForeignKey: true, references: 'categories', isNullable: true },
      ]},
      { name: 'orders', rowCount: 150, columns: [
        { name: 'order_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'customer_id', type: 'INTEGER', isForeignKey: true, references: 'customers' },
        { name: 'order_date', type: 'DATE' },
        { name: 'status', type: 'TEXT' },
        { name: 'shipping_address', type: 'TEXT' },
      ]},
      { name: 'order_items', rowCount: 350, columns: [
        { name: 'item_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'order_id', type: 'INTEGER', isForeignKey: true, references: 'orders' },
        { name: 'product_id', type: 'INTEGER', isForeignKey: true, references: 'products' },
        { name: 'quantity', type: 'INTEGER' },
        { name: 'unit_price', type: 'REAL' },
      ]},
      { name: 'payments', rowCount: 130, columns: [
        { name: 'payment_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'order_id', type: 'INTEGER', isForeignKey: true, references: 'orders' },
        { name: 'amount', type: 'REAL' },
        { name: 'method', type: 'TEXT' },
        { name: 'paid_at', type: 'DATETIME' },
        { name: 'status', type: 'TEXT' },
      ]},
      { name: 'reviews', rowCount: 120, columns: [
        { name: 'review_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'product_id', type: 'INTEGER', isForeignKey: true, references: 'products' },
        { name: 'customer_id', type: 'INTEGER', isForeignKey: true, references: 'customers' },
        { name: 'rating', type: 'INTEGER' },
        { name: 'body', type: 'TEXT', isNullable: true },
        { name: 'reviewed_at', type: 'DATE' },
      ]},
      { name: 'shipping', rowCount: 130, columns: [
        { name: 'shipment_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'order_id', type: 'INTEGER', isForeignKey: true, references: 'orders' },
        { name: 'carrier', type: 'TEXT' },
        { name: 'tracking_no', type: 'TEXT', isNullable: true },
        { name: 'shipped_at', type: 'DATETIME', isNullable: true },
        { name: 'delivered_at', type: 'DATETIME', isNullable: true },
      ]},
    ],
  },
  university: {
    name: 'university',
    label: 'University',
    description: 'Students, professors, departments, courses, enrollments, and grades. Great for GPA calculation and recursive prerequisite chains.',
    icon: '🎓',
    tableCount: 8,
    questionCount: 60,
    concepts: ['GPA Calculation', 'Recursive CTEs', 'Ranking Functions'],
    tables: [
      { name: 'students', rowCount: 100, columns: [
        { name: 'student_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'first_name', type: 'TEXT' },
        { name: 'last_name', type: 'TEXT' },
        { name: 'email', type: 'TEXT' },
        { name: 'dob', type: 'DATE', isNullable: true },
        { name: 'major', type: 'TEXT' },
        { name: 'advisor_id', type: 'INTEGER', isForeignKey: true, references: 'professors', isNullable: true },
        { name: 'enrolled_since', type: 'DATE' },
      ]},
      { name: 'professors', rowCount: 25, columns: [
        { name: 'professor_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'first_name', type: 'TEXT' },
        { name: 'last_name', type: 'TEXT' },
        { name: 'email', type: 'TEXT' },
        { name: 'department_id', type: 'INTEGER', isForeignKey: true, references: 'departments' },
        { name: 'tenure', type: 'INTEGER' },
        { name: 'hired_at', type: 'DATE' },
      ]},
      { name: 'departments', rowCount: 8, columns: [
        { name: 'department_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'name', type: 'TEXT' },
        { name: 'building', type: 'TEXT' },
        { name: 'head_professor_id', type: 'INTEGER', isForeignKey: true, references: 'professors', isNullable: true },
      ]},
      { name: 'courses', rowCount: 40, columns: [
        { name: 'course_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'title', type: 'TEXT' },
        { name: 'credit_hours', type: 'INTEGER' },
        { name: 'department_id', type: 'INTEGER', isForeignKey: true, references: 'departments' },
        { name: 'prereq_course_id', type: 'INTEGER', isForeignKey: true, references: 'courses', isNullable: true },
      ]},
      { name: 'enrollments', rowCount: 250, columns: [
        { name: 'enrollment_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'student_id', type: 'INTEGER', isForeignKey: true, references: 'students' },
        { name: 'course_id', type: 'INTEGER', isForeignKey: true, references: 'courses' },
        { name: 'semester_id', type: 'INTEGER', isForeignKey: true, references: 'semesters' },
        { name: 'section', type: 'TEXT' },
      ]},
      { name: 'grades', rowCount: 220, columns: [
        { name: 'grade_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'enrollment_id', type: 'INTEGER', isForeignKey: true, references: 'enrollments' },
        { name: 'midterm_score', type: 'REAL', isNullable: true },
        { name: 'final_score', type: 'REAL', isNullable: true },
        { name: 'letter_grade', type: 'TEXT', isNullable: true },
      ]},
      { name: 'semesters', rowCount: 6, columns: [
        { name: 'semester_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'name', type: 'TEXT' },
        { name: 'start_date', type: 'DATE' },
        { name: 'end_date', type: 'DATE' },
        { name: 'is_current', type: 'INTEGER' },
      ]},
      { name: 'classrooms', rowCount: 20, columns: [
        { name: 'classroom_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'building', type: 'TEXT' },
        { name: 'room_number', type: 'TEXT' },
        { name: 'capacity', type: 'INTEGER' },
        { name: 'has_projector', type: 'INTEGER' },
      ]},
    ],
  },
  airlines: {
    name: 'airlines',
    label: 'Airlines',
    description: 'Airports, flights, aircraft, passengers, bookings, crew, and routes. Perfect for load factor, delay analysis, and window functions.',
    icon: '✈️',
    tableCount: 7,
    questionCount: 60,
    concepts: ['Load Factor', 'Delay Analysis', 'Route Analysis', 'Window Functions'],
    tables: [
      { name: 'airports', rowCount: 30, columns: [
        { name: 'airport_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'iata_code', type: 'TEXT' },
        { name: 'name', type: 'TEXT' },
        { name: 'city', type: 'TEXT' },
        { name: 'country', type: 'TEXT' },
        { name: 'latitude', type: 'REAL' },
        { name: 'longitude', type: 'REAL' },
      ]},
      { name: 'flights', rowCount: 150, columns: [
        { name: 'flight_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'flight_no', type: 'TEXT' },
        { name: 'aircraft_id', type: 'INTEGER', isForeignKey: true, references: 'aircraft' },
        { name: 'origin_id', type: 'INTEGER', isForeignKey: true, references: 'airports' },
        { name: 'destination_id', type: 'INTEGER', isForeignKey: true, references: 'airports' },
        { name: 'scheduled_dep', type: 'DATETIME' },
        { name: 'scheduled_arr', type: 'DATETIME' },
        { name: 'actual_dep', type: 'DATETIME', isNullable: true },
        { name: 'actual_arr', type: 'DATETIME', isNullable: true },
        { name: 'status', type: 'TEXT' },
      ]},
      { name: 'aircraft', rowCount: 20, columns: [
        { name: 'aircraft_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'model', type: 'TEXT' },
        { name: 'manufacturer', type: 'TEXT' },
        { name: 'seating_capacity', type: 'INTEGER' },
        { name: 'year_manufactured', type: 'INTEGER' },
      ]},
      { name: 'passengers', rowCount: 200, columns: [
        { name: 'passenger_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'first_name', type: 'TEXT' },
        { name: 'last_name', type: 'TEXT' },
        { name: 'passport_no', type: 'TEXT' },
        { name: 'nationality', type: 'TEXT' },
        { name: 'dob', type: 'DATE', isNullable: true },
      ]},
      { name: 'bookings', rowCount: 400, columns: [
        { name: 'booking_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'passenger_id', type: 'INTEGER', isForeignKey: true, references: 'passengers' },
        { name: 'flight_id', type: 'INTEGER', isForeignKey: true, references: 'flights' },
        { name: 'seat_no', type: 'TEXT', isNullable: true },
        { name: 'cabin_class', type: 'TEXT' },
        { name: 'price', type: 'REAL' },
        { name: 'booked_at', type: 'DATETIME' },
        { name: 'checked_in', type: 'INTEGER' },
      ]},
      { name: 'crew', rowCount: 100, columns: [
        { name: 'crew_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'flight_id', type: 'INTEGER', isForeignKey: true, references: 'flights' },
        { name: 'employee_id', type: 'INTEGER' },
        { name: 'role', type: 'TEXT' },
      ]},
      { name: 'routes', rowCount: 50, columns: [
        { name: 'route_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'origin_id', type: 'INTEGER', isForeignKey: true, references: 'airports' },
        { name: 'destination_id', type: 'INTEGER', isForeignKey: true, references: 'airports' },
        { name: 'distance_km', type: 'REAL' },
        { name: 'avg_duration_mins', type: 'INTEGER' },
      ]},
    ],
  },
  banking: {
    name: 'banking',
    label: 'Banking',
    description: 'Branches, customers, accounts, transactions, loans, and employees. Master running balances, fraud detection, and loan tracking.',
    icon: '🏦',
    tableCount: 8,
    questionCount: 60,
    concepts: ['Running Balances', 'Fraud Detection', 'Loan Tracking', 'Window Functions'],
    tables: [
      { name: 'branches', rowCount: 10, columns: [
        { name: 'branch_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'name', type: 'TEXT' },
        { name: 'city', type: 'TEXT' },
        { name: 'country', type: 'TEXT' },
        { name: 'manager_employee_id', type: 'INTEGER', isForeignKey: true, references: 'employees', isNullable: true },
      ]},
      { name: 'customers', rowCount: 100, columns: [
        { name: 'customer_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'first_name', type: 'TEXT' },
        { name: 'last_name', type: 'TEXT' },
        { name: 'email', type: 'TEXT' },
        { name: 'phone', type: 'TEXT', isNullable: true },
        { name: 'dob', type: 'DATE', isNullable: true },
        { name: 'national_id', type: 'TEXT' },
      ]},
      { name: 'accounts', rowCount: 120, columns: [
        { name: 'account_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'customer_id', type: 'INTEGER', isForeignKey: true, references: 'customers' },
        { name: 'branch_id', type: 'INTEGER', isForeignKey: true, references: 'branches' },
        { name: 'type', type: 'TEXT' },
        { name: 'balance', type: 'REAL' },
        { name: 'opened_at', type: 'DATE' },
        { name: 'overdraft_limit', type: 'REAL' },
        { name: 'is_active', type: 'INTEGER' },
      ]},
      { name: 'transactions', rowCount: 500, columns: [
        { name: 'txn_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'account_id', type: 'INTEGER', isForeignKey: true, references: 'accounts' },
        { name: 'type', type: 'TEXT' },
        { name: 'amount', type: 'REAL' },
        { name: 'description', type: 'TEXT', isNullable: true },
        { name: 'txn_date', type: 'DATETIME' },
        { name: 'processed_by', type: 'INTEGER', isNullable: true },
      ]},
      { name: 'loans', rowCount: 60, columns: [
        { name: 'loan_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'customer_id', type: 'INTEGER', isForeignKey: true, references: 'customers' },
        { name: 'branch_id', type: 'INTEGER', isForeignKey: true, references: 'branches' },
        { name: 'principal', type: 'REAL' },
        { name: 'interest_rate', type: 'REAL' },
        { name: 'term_months', type: 'INTEGER' },
        { name: 'disbursed_at', type: 'DATE' },
        { name: 'status', type: 'TEXT' },
      ]},
      { name: 'loan_payments', rowCount: 200, columns: [
        { name: 'payment_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'loan_id', type: 'INTEGER', isForeignKey: true, references: 'loans' },
        { name: 'amount', type: 'REAL' },
        { name: 'paid_at', type: 'DATE', isNullable: true },
        { name: 'method', type: 'TEXT' },
        { name: 'is_late', type: 'INTEGER' },
      ]},
      { name: 'employees', rowCount: 40, columns: [
        { name: 'employee_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'branch_id', type: 'INTEGER', isForeignKey: true, references: 'branches' },
        { name: 'first_name', type: 'TEXT' },
        { name: 'last_name', type: 'TEXT' },
        { name: 'role', type: 'TEXT' },
        { name: 'salary', type: 'REAL' },
        { name: 'hired_at', type: 'DATE' },
        { name: 'manager_id', type: 'INTEGER', isForeignKey: true, references: 'employees', isNullable: true },
      ]},
      { name: 'interest_rates', rowCount: 20, columns: [
        { name: 'rate_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'account_type', type: 'TEXT' },
        { name: 'annual_rate', type: 'REAL' },
        { name: 'effective_from', type: 'DATE' },
        { name: 'effective_to', type: 'DATE', isNullable: true },
      ]},
    ],
  },
  hr: {
    name: 'hr',
    label: 'HR / Employees',
    description: 'Employees, departments, salaries, and org hierarchy. Learn self-referencing manager chains, salary bands, and recursive org charts.',
    icon: '👔',
    tableCount: 6,
    questionCount: 60,
    concepts: ['Self-Join', 'Salary Analysis', 'Org Hierarchy', 'Recursive CTE'],
    tables: [
      { name: 'employees', rowCount: 100, columns: [
        { name: 'employee_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'first_name', type: 'TEXT' },
        { name: 'last_name', type: 'TEXT' },
        { name: 'email', type: 'TEXT' },
        { name: 'department_id', type: 'INTEGER', isForeignKey: true, references: 'departments' },
        { name: 'job_title', type: 'TEXT' },
        { name: 'salary', type: 'REAL' },
        { name: 'hire_date', type: 'DATE' },
        { name: 'manager_id', type: 'INTEGER', isForeignKey: true, references: 'employees', isNullable: true },
      ]},
      { name: 'departments', rowCount: 10, columns: [
        { name: 'department_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'name', type: 'TEXT' },
        { name: 'location', type: 'TEXT' },
        { name: 'budget', type: 'REAL' },
      ]},
      { name: 'salaries', rowCount: 200, columns: [
        { name: 'salary_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'employee_id', type: 'INTEGER', isForeignKey: true, references: 'employees' },
        { name: 'amount', type: 'REAL' },
        { name: 'effective_from', type: 'DATE' },
        { name: 'effective_to', type: 'DATE', isNullable: true },
      ]},
      { name: 'performance_reviews', rowCount: 150, columns: [
        { name: 'review_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'employee_id', type: 'INTEGER', isForeignKey: true, references: 'employees' },
        { name: 'review_date', type: 'DATE' },
        { name: 'score', type: 'INTEGER' },
        { name: 'reviewer_id', type: 'INTEGER', isForeignKey: true, references: 'employees' },
      ]},
      { name: 'leaves', rowCount: 80, columns: [
        { name: 'leave_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'employee_id', type: 'INTEGER', isForeignKey: true, references: 'employees' },
        { name: 'type', type: 'TEXT' },
        { name: 'start_date', type: 'DATE' },
        { name: 'end_date', type: 'DATE' },
        { name: 'approved', type: 'INTEGER' },
      ]},
      { name: 'job_history', rowCount: 120, columns: [
        { name: 'history_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'employee_id', type: 'INTEGER', isForeignKey: true, references: 'employees' },
        { name: 'department_id', type: 'INTEGER', isForeignKey: true, references: 'departments' },
        { name: 'job_title', type: 'TEXT' },
        { name: 'start_date', type: 'DATE' },
        { name: 'end_date', type: 'DATE', isNullable: true },
      ]},
    ],
  },
  movies: {
    name: 'movies',
    label: 'Movies / IMDb',
    description: 'Films, actors, directors, genres, and ratings. Analyze filmographies, ratings by decade, and actor co-star networks.',
    icon: '🎬',
    tableCount: 6,
    questionCount: 60,
    concepts: ['Filmographies', 'Genre Analysis', 'Rating Trends', 'Co-Actor Networks'],
    tables: [
      { name: 'movies', rowCount: 100, columns: [
        { name: 'movie_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'title', type: 'TEXT' },
        { name: 'release_year', type: 'INTEGER' },
        { name: 'duration_mins', type: 'INTEGER', isNullable: true },
        { name: 'budget', type: 'REAL', isNullable: true },
        { name: 'box_office', type: 'REAL', isNullable: true },
        { name: 'rating', type: 'REAL', isNullable: true },
        { name: 'director_id', type: 'INTEGER', isForeignKey: true, references: 'directors' },
      ]},
      { name: 'directors', rowCount: 30, columns: [
        { name: 'director_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'first_name', type: 'TEXT' },
        { name: 'last_name', type: 'TEXT' },
        { name: 'nationality', type: 'TEXT', isNullable: true },
        { name: 'birth_year', type: 'INTEGER', isNullable: true },
      ]},
      { name: 'actors', rowCount: 100, columns: [
        { name: 'actor_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'first_name', type: 'TEXT' },
        { name: 'last_name', type: 'TEXT' },
        { name: 'birth_year', type: 'INTEGER', isNullable: true },
        { name: 'nationality', type: 'TEXT', isNullable: true },
      ]},
      { name: 'movie_actors', rowCount: 300, columns: [
        { name: 'id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'movie_id', type: 'INTEGER', isForeignKey: true, references: 'movies' },
        { name: 'actor_id', type: 'INTEGER', isForeignKey: true, references: 'actors' },
        { name: 'role', type: 'TEXT', isNullable: true },
      ]},
      { name: 'genres', rowCount: 15, columns: [
        { name: 'genre_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'name', type: 'TEXT' },
      ]},
      { name: 'movie_genres', rowCount: 200, columns: [
        { name: 'id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'movie_id', type: 'INTEGER', isForeignKey: true, references: 'movies' },
        { name: 'genre_id', type: 'INTEGER', isForeignKey: true, references: 'genres' },
      ]},
    ],
  },
  library: {
    name: 'library',
    label: 'Library',
    description: 'Books, authors, members, loans, and fines. Practice overdue logic, fine calculation, and member engagement scoring.',
    icon: '📚',
    tableCount: 6,
    questionCount: 60,
    concepts: ['Overdue Logic', 'Fine Calculation', 'Member Engagement'],
    tables: [
      { name: 'books', rowCount: 100, columns: [
        { name: 'book_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'title', type: 'TEXT' },
        { name: 'author_id', type: 'INTEGER', isForeignKey: true, references: 'authors' },
        { name: 'isbn', type: 'TEXT' },
        { name: 'genre', type: 'TEXT' },
        { name: 'published_year', type: 'INTEGER' },
        { name: 'pages', type: 'INTEGER', isNullable: true },
      ]},
      { name: 'authors', rowCount: 40, columns: [
        { name: 'author_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'first_name', type: 'TEXT' },
        { name: 'last_name', type: 'TEXT' },
        { name: 'nationality', type: 'TEXT', isNullable: true },
        { name: 'birth_year', type: 'INTEGER', isNullable: true },
      ]},
      { name: 'members', rowCount: 80, columns: [
        { name: 'member_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'first_name', type: 'TEXT' },
        { name: 'last_name', type: 'TEXT' },
        { name: 'email', type: 'TEXT' },
        { name: 'joined_date', type: 'DATE' },
        { name: 'branch_id', type: 'INTEGER', isNullable: true },
      ]},
      { name: 'loans', rowCount: 200, columns: [
        { name: 'loan_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'book_id', type: 'INTEGER', isForeignKey: true, references: 'books' },
        { name: 'member_id', type: 'INTEGER', isForeignKey: true, references: 'members' },
        { name: 'loan_date', type: 'DATE' },
        { name: 'due_date', type: 'DATE' },
        { name: 'return_date', type: 'DATE', isNullable: true },
      ]},
      { name: 'fines', rowCount: 80, columns: [
        { name: 'fine_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'loan_id', type: 'INTEGER', isForeignKey: true, references: 'loans' },
        { name: 'amount', type: 'REAL' },
        { name: 'paid_date', type: 'DATE', isNullable: true },
      ]},
      { name: 'branches', rowCount: 5, columns: [
        { name: 'branch_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'name', type: 'TEXT' },
        { name: 'location', type: 'TEXT' },
      ]},
    ],
  },
  sports: {
    name: 'sports',
    label: 'Sports League',
    description: 'Teams, players, matches, goals, seasons, and standings. Build dynamic league tables, form tables, and rolling stats.',
    icon: '⚽',
    tableCount: 6,
    questionCount: 60,
    concepts: ['League Table', 'Top Scorers', 'Form Table', 'Rolling Stats'],
    tables: [
      { name: 'teams', rowCount: 20, columns: [
        { name: 'team_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'name', type: 'TEXT' },
        { name: 'city', type: 'TEXT' },
        { name: 'founded_year', type: 'INTEGER' },
        { name: 'division', type: 'TEXT' },
      ]},
      { name: 'players', rowCount: 200, columns: [
        { name: 'player_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'first_name', type: 'TEXT' },
        { name: 'last_name', type: 'TEXT' },
        { name: 'team_id', type: 'INTEGER', isForeignKey: true, references: 'teams' },
        { name: 'position', type: 'TEXT' },
        { name: 'dob', type: 'DATE', isNullable: true },
        { name: 'nationality', type: 'TEXT' },
      ]},
      { name: 'matches', rowCount: 150, columns: [
        { name: 'match_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'home_team_id', type: 'INTEGER', isForeignKey: true, references: 'teams' },
        { name: 'away_team_id', type: 'INTEGER', isForeignKey: true, references: 'teams' },
        { name: 'match_date', type: 'DATE' },
        { name: 'season_id', type: 'INTEGER', isForeignKey: true, references: 'seasons' },
        { name: 'home_score', type: 'INTEGER' },
        { name: 'away_score', type: 'INTEGER' },
        { name: 'matchday', type: 'INTEGER' },
      ]},
      { name: 'goals', rowCount: 400, columns: [
        { name: 'goal_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'match_id', type: 'INTEGER', isForeignKey: true, references: 'matches' },
        { name: 'player_id', type: 'INTEGER', isForeignKey: true, references: 'players' },
        { name: 'minute', type: 'INTEGER' },
        { name: 'is_own_goal', type: 'INTEGER' },
      ]},
      { name: 'seasons', rowCount: 5, columns: [
        { name: 'season_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'name', type: 'TEXT' },
        { name: 'start_date', type: 'DATE' },
        { name: 'end_date', type: 'DATE' },
      ]},
      { name: 'standings', rowCount: 100, columns: [
        { name: 'standing_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'season_id', type: 'INTEGER', isForeignKey: true, references: 'seasons' },
        { name: 'team_id', type: 'INTEGER', isForeignKey: true, references: 'teams' },
        { name: 'played', type: 'INTEGER' },
        { name: 'won', type: 'INTEGER' },
        { name: 'drawn', type: 'INTEGER' },
        { name: 'lost', type: 'INTEGER' },
        { name: 'points', type: 'INTEGER' },
      ]},
    ],
  },
  music: {
    name: 'music',
    label: 'Music Streaming',
    description: 'Artists, albums, tracks, users, playlists, and play counts. Analyze rolling plays, churn detection, and collaborative filtering.',
    icon: '🎵',
    tableCount: 7,
    questionCount: 60,
    concepts: ['Rolling Play Counts', 'Churn Detection', 'Collaborative Filtering'],
    tables: [
      { name: 'artists', rowCount: 50, columns: [
        { name: 'artist_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'name', type: 'TEXT' },
        { name: 'genre', type: 'TEXT', isNullable: true },
        { name: 'country', type: 'TEXT', isNullable: true },
        { name: 'formed_year', type: 'INTEGER', isNullable: true },
      ]},
      { name: 'albums', rowCount: 100, columns: [
        { name: 'album_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'title', type: 'TEXT' },
        { name: 'artist_id', type: 'INTEGER', isForeignKey: true, references: 'artists' },
        { name: 'release_year', type: 'INTEGER' },
        { name: 'genre', type: 'TEXT', isNullable: true },
      ]},
      { name: 'tracks', rowCount: 400, columns: [
        { name: 'track_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'title', type: 'TEXT' },
        { name: 'album_id', type: 'INTEGER', isForeignKey: true, references: 'albums' },
        { name: 'duration_secs', type: 'INTEGER' },
        { name: 'bpm', type: 'INTEGER', isNullable: true },
        { name: 'track_number', type: 'INTEGER' },
      ]},
      { name: 'users', rowCount: 100, columns: [
        { name: 'user_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'username', type: 'TEXT' },
        { name: 'email', type: 'TEXT' },
        { name: 'country', type: 'TEXT', isNullable: true },
        { name: 'joined_at', type: 'DATE' },
      ]},
      { name: 'plays', rowCount: 2000, columns: [
        { name: 'play_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'user_id', type: 'INTEGER', isForeignKey: true, references: 'users' },
        { name: 'track_id', type: 'INTEGER', isForeignKey: true, references: 'tracks' },
        { name: 'played_at', type: 'DATETIME' },
        { name: 'play_duration_secs', type: 'INTEGER', isNullable: true },
      ]},
      { name: 'playlists', rowCount: 80, columns: [
        { name: 'playlist_id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'name', type: 'TEXT' },
        { name: 'user_id', type: 'INTEGER', isForeignKey: true, references: 'users' },
        { name: 'created_at', type: 'DATE' },
        { name: 'is_public', type: 'INTEGER' },
      ]},
      { name: 'playlist_tracks', rowCount: 500, columns: [
        { name: 'id', type: 'INTEGER', isPrimaryKey: true },
        { name: 'playlist_id', type: 'INTEGER', isForeignKey: true, references: 'playlists' },
        { name: 'track_id', type: 'INTEGER', isForeignKey: true, references: 'tracks' },
        { name: 'added_at', type: 'DATE' },
        { name: 'position', type: 'INTEGER' },
      ]},
    ],
  },
};
