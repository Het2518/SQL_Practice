export const moviesInfo = {

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

};
