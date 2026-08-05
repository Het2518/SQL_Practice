export const hrInfo = {

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

};
