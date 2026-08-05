export const universityInfo = {

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

};
