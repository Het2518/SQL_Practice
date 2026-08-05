export const airlinesInfo = {

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

};
