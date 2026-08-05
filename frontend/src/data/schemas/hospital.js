export const hospitalInfo = {

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

};
