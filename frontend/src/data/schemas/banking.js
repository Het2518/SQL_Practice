export const bankingInfo = {

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

};
