// ============================================================
// DataDesk — Shared Types
// ============================================================

export const DB_INFO = {
  hospital: {
    name: 'hospital',
    label: 'Hospital',
    description: 'Patient admissions, doctors, departments, diagnoses, and medications. Master date arithmetic, multi-join queries, and aggregation.',
    icon: '🏥',
    tableCount: 7,
    questionCount: 60,
    concepts: ['Date Arithmetic', 'Multi-Join', 'Aggregation', 'NULL Handling', 'Window Functions'],
    tables: [
      {
        "name": "province_names",
        "rowCount": 15,
        "columns": [
          {
            "name": "province_id",
            "type": "TEXT",
            "isPrimaryKey": true
          },
          {
            "name": "province_name",
            "type": "TEXT"
          },
          {
            "name": "country",
            "type": "TEXT"
          }
        ]
      },
      {
        "name": "patients",
        "rowCount": 100,
        "columns": [
          {
            "name": "patient_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "first_name",
            "type": "TEXT"
          },
          {
            "name": "last_name",
            "type": "TEXT"
          },
          {
            "name": "birth_date",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "gender",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "weight",
            "type": "REAL",
            "isNullable": true
          },
          {
            "name": "height",
            "type": "REAL",
            "isNullable": true
          },
          {
            "name": "allergies",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "city",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "province_id",
            "type": "TEXT",
            "isForeignKey": true,
            "references": "province_names",
            "isNullable": true
          }
        ]
      },
      {
        "name": "departments",
        "rowCount": 8,
        "columns": [
          {
            "name": "department_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "department_name",
            "type": "TEXT"
          },
          {
            "name": "head_doctor_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "doctors",
            "isNullable": true
          }
        ]
      },
      {
        "name": "doctors",
        "rowCount": 20,
        "columns": [
          {
            "name": "doctor_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "first_name",
            "type": "TEXT"
          },
          {
            "name": "last_name",
            "type": "TEXT"
          },
          {
            "name": "specialty",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "department_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "departments",
            "isNullable": true
          }
        ]
      },
      {
        "name": "admissions",
        "rowCount": 120,
        "columns": [
          {
            "name": "admission_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "patient_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "patients"
          },
          {
            "name": "admission_date",
            "type": "DATE"
          },
          {
            "name": "discharge_date",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "diagnosis",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "attending_doctor_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "doctors",
            "isNullable": true
          }
        ]
      },
      {
        "name": "diagnoses",
        "rowCount": 150,
        "columns": [
          {
            "name": "diagnosis_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "admission_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "admissions"
          },
          {
            "name": "icd_code",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "description",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "severity",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "medications",
        "rowCount": 100,
        "columns": [
          {
            "name": "medication_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "admission_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "admissions"
          },
          {
            "name": "drug_name",
            "type": "TEXT"
          },
          {
            "name": "dosage",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "start_date",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "end_date",
            "type": "DATE",
            "isNullable": true
          }
        ]
      }
    ]
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
      {
        "name": "categories",
        "rowCount": 15,
        "columns": [
          {
            "name": "category_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "name",
            "type": "TEXT"
          },
          {
            "name": "parent_category_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "categories",
            "isNullable": true
          }
        ]
      },
      {
        "name": "customers",
        "rowCount": 100,
        "columns": [
          {
            "name": "customer_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "first_name",
            "type": "TEXT"
          },
          {
            "name": "last_name",
            "type": "TEXT"
          },
          {
            "name": "email",
            "type": "TEXT"
          },
          {
            "name": "phone",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "city",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "country",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "registered_at",
            "type": "DATE",
            "isNullable": true
          }
        ]
      },
      {
        "name": "suppliers",
        "rowCount": 0,
        "columns": [
          {
            "name": "supplier_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "company_name",
            "type": "TEXT"
          },
          {
            "name": "contact_email",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "country",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "products",
        "rowCount": 80,
        "columns": [
          {
            "name": "product_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "name",
            "type": "TEXT"
          },
          {
            "name": "description",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "price",
            "type": "REAL"
          },
          {
            "name": "stock_qty",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "category_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "categories",
            "isNullable": true
          },
          {
            "name": "supplier_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "suppliers",
            "isNullable": true
          }
        ]
      },
      {
        "name": "orders",
        "rowCount": 150,
        "columns": [
          {
            "name": "order_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "customer_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "customers"
          },
          {
            "name": "order_date",
            "type": "DATE"
          },
          {
            "name": "status",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "shipping_address",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "order_items",
        "rowCount": 350,
        "columns": [
          {
            "name": "item_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "order_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "orders"
          },
          {
            "name": "product_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "products"
          },
          {
            "name": "quantity",
            "type": "INTEGER"
          },
          {
            "name": "unit_price",
            "type": "REAL"
          }
        ]
      },
      {
        "name": "payments",
        "rowCount": 130,
        "columns": [
          {
            "name": "payment_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "order_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "orders"
          },
          {
            "name": "amount",
            "type": "REAL"
          },
          {
            "name": "method",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "paid_at",
            "type": "DATETIME",
            "isNullable": true
          },
          {
            "name": "status",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "reviews",
        "rowCount": 120,
        "columns": [
          {
            "name": "review_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "product_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "products"
          },
          {
            "name": "customer_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "customers"
          },
          {
            "name": "rating",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "body",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "reviewed_at",
            "type": "DATE",
            "isNullable": true
          }
        ]
      },
      {
        "name": "shipping",
        "rowCount": 130,
        "columns": [
          {
            "name": "shipment_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "order_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "orders"
          },
          {
            "name": "carrier",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "tracking_no",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "shipped_at",
            "type": "DATETIME",
            "isNullable": true
          },
          {
            "name": "delivered_at",
            "type": "DATETIME",
            "isNullable": true
          }
        ]
      }
    ]
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
      {
        "name": "departments",
        "rowCount": 8,
        "columns": [
          {
            "name": "department_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "name",
            "type": "TEXT"
          },
          {
            "name": "building",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "head_professor_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "professors",
            "isNullable": true
          }
        ]
      },
      {
        "name": "professors",
        "rowCount": 25,
        "columns": [
          {
            "name": "professor_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "first_name",
            "type": "TEXT"
          },
          {
            "name": "last_name",
            "type": "TEXT"
          },
          {
            "name": "email",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "department_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "departments",
            "isNullable": true
          },
          {
            "name": "tenure",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "hired_at",
            "type": "DATE",
            "isNullable": true
          }
        ]
      },
      {
        "name": "students",
        "rowCount": 100,
        "columns": [
          {
            "name": "student_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "first_name",
            "type": "TEXT"
          },
          {
            "name": "last_name",
            "type": "TEXT"
          },
          {
            "name": "email",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "dob",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "major",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "advisor_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "professors",
            "isNullable": true
          },
          {
            "name": "enrolled_since",
            "type": "DATE",
            "isNullable": true
          }
        ]
      },
      {
        "name": "semesters",
        "rowCount": 6,
        "columns": [
          {
            "name": "semester_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "name",
            "type": "TEXT"
          },
          {
            "name": "start_date",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "end_date",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "is_current",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      },
      {
        "name": "courses",
        "rowCount": 40,
        "columns": [
          {
            "name": "course_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "title",
            "type": "TEXT"
          },
          {
            "name": "credit_hours",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "department_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "departments",
            "isNullable": true
          },
          {
            "name": "prereq_course_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "courses",
            "isNullable": true
          }
        ]
      },
      {
        "name": "classrooms",
        "rowCount": 20,
        "columns": [
          {
            "name": "classroom_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "building",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "room_number",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "capacity",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "has_projector",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "department_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "departments",
            "isNullable": true
          }
        ]
      },
      {
        "name": "enrollments",
        "rowCount": 250,
        "columns": [
          {
            "name": "enrollment_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "student_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "students"
          },
          {
            "name": "course_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "courses"
          },
          {
            "name": "semester_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "semesters"
          },
          {
            "name": "section",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "grades",
        "rowCount": 220,
        "columns": [
          {
            "name": "grade_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "enrollment_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "enrollments"
          },
          {
            "name": "midterm_score",
            "type": "REAL",
            "isNullable": true
          },
          {
            "name": "final_score",
            "type": "REAL",
            "isNullable": true
          },
          {
            "name": "letter_grade",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      }
    ]
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
      {
        "name": "airports",
        "rowCount": 30,
        "columns": [
          {
            "name": "airport_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "iata_code",
            "type": "TEXT"
          },
          {
            "name": "name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "city",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "country",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "latitude",
            "type": "REAL",
            "isNullable": true
          },
          {
            "name": "longitude",
            "type": "REAL",
            "isNullable": true
          }
        ]
      },
      {
        "name": "aircraft",
        "rowCount": 20,
        "columns": [
          {
            "name": "aircraft_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "model",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "manufacturer",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "seating_capacity",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "year_manufactured",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      },
      {
        "name": "flights",
        "rowCount": 150,
        "columns": [
          {
            "name": "flight_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "flight_no",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "aircraft_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "aircraft",
            "isNullable": true
          },
          {
            "name": "origin_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "airports",
            "isNullable": true
          },
          {
            "name": "destination_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "airports",
            "isNullable": true
          },
          {
            "name": "scheduled_dep",
            "type": "DATETIME",
            "isNullable": true
          },
          {
            "name": "scheduled_arr",
            "type": "DATETIME",
            "isNullable": true
          },
          {
            "name": "actual_dep",
            "type": "DATETIME",
            "isNullable": true
          },
          {
            "name": "actual_arr",
            "type": "DATETIME",
            "isNullable": true
          },
          {
            "name": "status",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "passengers",
        "rowCount": 200,
        "columns": [
          {
            "name": "passenger_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "first_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "last_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "passport_no",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "nationality",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "dob",
            "type": "DATE",
            "isNullable": true
          }
        ]
      },
      {
        "name": "bookings",
        "rowCount": 400,
        "columns": [
          {
            "name": "booking_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "passenger_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "passengers",
            "isNullable": true
          },
          {
            "name": "flight_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "flights",
            "isNullable": true
          },
          {
            "name": "seat_no",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "cabin_class",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "price",
            "type": "REAL",
            "isNullable": true
          },
          {
            "name": "booked_at",
            "type": "DATETIME",
            "isNullable": true
          }
        ]
      },
      {
        "name": "employees",
        "rowCount": 0,
        "columns": [
          {
            "name": "employee_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "first_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "last_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "role",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "crew",
        "rowCount": 100,
        "columns": [
          {
            "name": "crew_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "flight_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "flights",
            "isNullable": true
          },
          {
            "name": "employee_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "employees",
            "isNullable": true
          },
          {
            "name": "role",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "routes",
        "rowCount": 50,
        "columns": [
          {
            "name": "route_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "origin_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "airports",
            "isNullable": true
          },
          {
            "name": "destination_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "airports",
            "isNullable": true
          },
          {
            "name": "distance_km",
            "type": "REAL",
            "isNullable": true
          },
          {
            "name": "avg_duration_mins",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      }
    ]
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
      {
        "name": "branches",
        "rowCount": 10,
        "columns": [
          {
            "name": "branch_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "city",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "country",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "manager_employee_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "employees",
            "isNullable": true
          }
        ]
      },
      {
        "name": "customers",
        "rowCount": 100,
        "columns": [
          {
            "name": "customer_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "first_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "last_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "email",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "phone",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "dob",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "national_id",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "employees",
        "rowCount": 40,
        "columns": [
          {
            "name": "employee_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "branch_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "branches",
            "isNullable": true
          },
          {
            "name": "first_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "last_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "role",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "salary",
            "type": "REAL",
            "isNullable": true
          },
          {
            "name": "hired_at",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "manager_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "employees",
            "isNullable": true
          }
        ]
      },
      {
        "name": "interest_rates",
        "rowCount": 20,
        "columns": [
          {
            "name": "rate_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "account_type",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "annual_rate",
            "type": "REAL",
            "isNullable": true
          },
          {
            "name": "effective_from",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "effective_to",
            "type": "DATE",
            "isNullable": true
          }
        ]
      },
      {
        "name": "accounts",
        "rowCount": 120,
        "columns": [
          {
            "name": "account_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "customer_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "customers",
            "isNullable": true
          },
          {
            "name": "branch_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "branches",
            "isNullable": true
          },
          {
            "name": "type",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "balance",
            "type": "REAL",
            "isNullable": true
          },
          {
            "name": "opened_at",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "overdraft_limit",
            "type": "REAL",
            "isNullable": true
          },
          {
            "name": "is_active",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "rate_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "interest_rates",
            "isNullable": true
          }
        ]
      },
      {
        "name": "transactions",
        "rowCount": 500,
        "columns": [
          {
            "name": "txn_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "account_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "accounts",
            "isNullable": true
          },
          {
            "name": "type",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "amount",
            "type": "REAL",
            "isNullable": true
          },
          {
            "name": "description",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "txn_date",
            "type": "DATETIME",
            "isNullable": true
          },
          {
            "name": "processed_by",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      },
      {
        "name": "loans",
        "rowCount": 60,
        "columns": [
          {
            "name": "loan_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "customer_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "customers",
            "isNullable": true
          },
          {
            "name": "branch_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "branches",
            "isNullable": true
          },
          {
            "name": "principal",
            "type": "REAL",
            "isNullable": true
          },
          {
            "name": "interest_rate",
            "type": "REAL",
            "isNullable": true
          },
          {
            "name": "term_months",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "disbursed_at",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "status",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "loan_payments",
        "rowCount": 200,
        "columns": [
          {
            "name": "payment_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "loan_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "loans",
            "isNullable": true
          },
          {
            "name": "amount",
            "type": "REAL",
            "isNullable": true
          },
          {
            "name": "paid_at",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "method",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "is_late",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      }
    ]
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
      {
        "name": "departments",
        "rowCount": 10,
        "columns": [
          {
            "name": "department_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "location",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "budget",
            "type": "REAL",
            "isNullable": true
          }
        ]
      },
      {
        "name": "employees",
        "rowCount": 100,
        "columns": [
          {
            "name": "employee_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "first_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "last_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "email",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "department_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "departments",
            "isNullable": true
          },
          {
            "name": "job_title",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "salary",
            "type": "REAL",
            "isNullable": true
          },
          {
            "name": "hire_date",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "manager_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "employees",
            "isNullable": true
          }
        ]
      },
      {
        "name": "salaries",
        "rowCount": 200,
        "columns": [
          {
            "name": "salary_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "employee_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "employees",
            "isNullable": true
          },
          {
            "name": "amount",
            "type": "REAL",
            "isNullable": true
          },
          {
            "name": "effective_from",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "effective_to",
            "type": "DATE",
            "isNullable": true
          }
        ]
      },
      {
        "name": "performance_reviews",
        "rowCount": 150,
        "columns": [
          {
            "name": "review_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "employee_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "employees",
            "isNullable": true
          },
          {
            "name": "review_date",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "score",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "reviewer_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "employees",
            "isNullable": true
          }
        ]
      },
      {
        "name": "leaves",
        "rowCount": 80,
        "columns": [
          {
            "name": "leave_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "employee_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "employees",
            "isNullable": true
          },
          {
            "name": "type",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "start_date",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "end_date",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "approved",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      },
      {
        "name": "job_history",
        "rowCount": 120,
        "columns": [
          {
            "name": "history_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "employee_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "employees",
            "isNullable": true
          },
          {
            "name": "department_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "departments",
            "isNullable": true
          },
          {
            "name": "job_title",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "start_date",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "end_date",
            "type": "DATE",
            "isNullable": true
          }
        ]
      }
    ]
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
      {
        "name": "directors",
        "rowCount": 30,
        "columns": [
          {
            "name": "director_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "first_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "last_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "nationality",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "birth_year",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      },
      {
        "name": "genres",
        "rowCount": 15,
        "columns": [
          {
            "name": "genre_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "name",
            "type": "TEXT"
          }
        ]
      },
      {
        "name": "movies",
        "rowCount": 100,
        "columns": [
          {
            "name": "movie_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "title",
            "type": "TEXT"
          },
          {
            "name": "release_year",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "duration_mins",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "budget",
            "type": "REAL",
            "isNullable": true
          },
          {
            "name": "box_office",
            "type": "REAL",
            "isNullable": true
          },
          {
            "name": "rating",
            "type": "REAL",
            "isNullable": true
          },
          {
            "name": "director_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "directors",
            "isNullable": true
          }
        ]
      },
      {
        "name": "actors",
        "rowCount": 100,
        "columns": [
          {
            "name": "actor_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "first_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "last_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "birth_year",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "nationality",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "movie_actors",
        "rowCount": 300,
        "columns": [
          {
            "name": "id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "movie_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "movies",
            "isNullable": true
          },
          {
            "name": "actor_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "actors",
            "isNullable": true
          },
          {
            "name": "role",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "movie_genres",
        "rowCount": 200,
        "columns": [
          {
            "name": "id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "movie_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "movies",
            "isNullable": true
          },
          {
            "name": "genre_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "genres",
            "isNullable": true
          }
        ]
      }
    ]
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
      {
        "name": "branches",
        "rowCount": 5,
        "columns": [
          {
            "name": "branch_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "location",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "authors",
        "rowCount": 40,
        "columns": [
          {
            "name": "author_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "first_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "last_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "nationality",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "birth_year",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      },
      {
        "name": "books",
        "rowCount": 100,
        "columns": [
          {
            "name": "book_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "title",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "author_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "authors",
            "isNullable": true
          },
          {
            "name": "isbn",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "genre",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "published_year",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "pages",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      },
      {
        "name": "members",
        "rowCount": 80,
        "columns": [
          {
            "name": "member_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "first_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "last_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "email",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "joined_date",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "branch_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "branches",
            "isNullable": true
          }
        ]
      },
      {
        "name": "loans",
        "rowCount": 200,
        "columns": [
          {
            "name": "loan_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "book_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "books",
            "isNullable": true
          },
          {
            "name": "member_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "members",
            "isNullable": true
          },
          {
            "name": "loan_date",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "due_date",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "return_date",
            "type": "DATE",
            "isNullable": true
          }
        ]
      },
      {
        "name": "fines",
        "rowCount": 80,
        "columns": [
          {
            "name": "fine_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "loan_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "loans",
            "isNullable": true
          },
          {
            "name": "amount",
            "type": "REAL",
            "isNullable": true
          },
          {
            "name": "paid_date",
            "type": "DATE",
            "isNullable": true
          }
        ]
      }
    ]
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
      {
        "name": "seasons",
        "rowCount": 5,
        "columns": [
          {
            "name": "season_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "start_date",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "end_date",
            "type": "DATE",
            "isNullable": true
          }
        ]
      },
      {
        "name": "teams",
        "rowCount": 20,
        "columns": [
          {
            "name": "team_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "city",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "founded_year",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "division",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "players",
        "rowCount": 200,
        "columns": [
          {
            "name": "player_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "first_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "last_name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "team_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "teams",
            "isNullable": true
          },
          {
            "name": "position",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "dob",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "nationality",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "matches",
        "rowCount": 150,
        "columns": [
          {
            "name": "match_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "home_team_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "teams",
            "isNullable": true
          },
          {
            "name": "away_team_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "teams",
            "isNullable": true
          },
          {
            "name": "match_date",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "season_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "seasons",
            "isNullable": true
          },
          {
            "name": "home_score",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "away_score",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "matchday",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      },
      {
        "name": "goals",
        "rowCount": 400,
        "columns": [
          {
            "name": "goal_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "match_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "matches",
            "isNullable": true
          },
          {
            "name": "player_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "players",
            "isNullable": true
          },
          {
            "name": "minute",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "is_own_goal",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      },
      {
        "name": "standings",
        "rowCount": 100,
        "columns": [
          {
            "name": "standing_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "season_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "seasons",
            "isNullable": true
          },
          {
            "name": "team_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "teams",
            "isNullable": true
          },
          {
            "name": "played",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "won",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "drawn",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "lost",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "points",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      }
    ]
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
      {
        "name": "artists",
        "rowCount": 50,
        "columns": [
          {
            "name": "artist_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "genre",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "country",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "formed_year",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      },
      {
        "name": "albums",
        "rowCount": 100,
        "columns": [
          {
            "name": "album_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "title",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "artist_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "artists",
            "isNullable": true
          },
          {
            "name": "release_year",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "genre",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "tracks",
        "rowCount": 400,
        "columns": [
          {
            "name": "track_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "title",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "album_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "albums",
            "isNullable": true
          },
          {
            "name": "duration_secs",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "bpm",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "track_number",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      },
      {
        "name": "users",
        "rowCount": 100,
        "columns": [
          {
            "name": "user_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "username",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "email",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "country",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "joined_at",
            "type": "DATE",
            "isNullable": true
          }
        ]
      },
      {
        "name": "plays",
        "rowCount": 2000,
        "columns": [
          {
            "name": "play_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "user_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "users",
            "isNullable": true
          },
          {
            "name": "track_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "tracks",
            "isNullable": true
          },
          {
            "name": "played_at",
            "type": "DATETIME",
            "isNullable": true
          },
          {
            "name": "play_duration_secs",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      },
      {
        "name": "playlists",
        "rowCount": 80,
        "columns": [
          {
            "name": "playlist_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "name",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "user_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "users",
            "isNullable": true
          },
          {
            "name": "created_at",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "is_public",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      },
      {
        "name": "playlist_tracks",
        "rowCount": 500,
        "columns": [
          {
            "name": "id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "playlist_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "playlists",
            "isNullable": true
          },
          {
            "name": "track_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "tracks",
            "isNullable": true
          },
          {
            "name": "added_at",
            "type": "DATE",
            "isNullable": true
          },
          {
            "name": "position",
            "type": "INTEGER",
            "isNullable": true
          }
        ]
      }
    ]
  }
};