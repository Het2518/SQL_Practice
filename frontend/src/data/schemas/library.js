export const libraryInfo = {

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

};
